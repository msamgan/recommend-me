<?php

declare(strict_types=1);

namespace App\Actions\Shows;

use App\Models\Show;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

final class GetRecommendations
{
    /**
     * Generate recommendations based on user's favorite shows
     */
    public function execute(array $showIds, int $limit = 10, int $offset = 0): Collection
    {
        // Get the user's selected shows with their genres and people
        $selectedShows = Show::query()->with(['genres', 'people'])->whereIn('id', $showIds)->get();

        if ($selectedShows->isEmpty()) {
            return collect([]);
        }

        // Extract all genres from the selected shows
        $genres = $selectedShows->flatMap(fn ($show) => $show->genres->pluck('id'))->unique();

        // Extract key people (actors/crew) from the selected shows
        $people = $selectedShows->flatMap(fn ($show) => $show->people->pluck('id'))->unique();

        // If no genres or people are found, return an empty collection to avoid query errors
        if ($genres->isEmpty() && $people->isEmpty()) {
            return collect([]);
        }

        // Find shows with similar genres and/or people, excluding the user's selected shows
        $recommendedShowsQuery = Show::query()->with(['genres', 'people'])->whereNotIn('id', $showIds);

        if ($genres->isNotEmpty() || $people->isNotEmpty()) {
            $recommendedShowsQuery->where(function ($query) use ($genres, $people) {
                if ($genres->isNotEmpty()) {
                    $query->whereHas('genres', function ($subQuery) use ($genres) {
                        $subQuery->whereIn('genres.id', $genres);
                    });
                }

                if ($people->isNotEmpty()) {
                    $method = $genres->isNotEmpty() ? 'orWhereHas' : 'whereHas';
                    $query->$method('people', function ($subQuery) use ($people) {
                        $subQuery->whereIn('people.id', $people);
                    });
                }
            });
        }

        $recommendedShows = $recommendedShowsQuery->orderByDesc('weight')->limit(1000)->get();

        // If no recommendations found, return an empty collection
        if ($recommendedShows->isEmpty()) {
            return new Collection();
        }

        // Calculate similarity scores and reasons for each recommended show
        $scoredShows = $recommendedShows->map(function ($show) use ($selectedShows, $genres, $people) {
            $result = $this->calculateSimilarityScore($show, $selectedShows, $genres, $people);

            return [
                'show' => $show,
                'score' => $result['score'],
                'reasons' => $result['reasons'],
                'display_score' => $result['display_score'],
                'criteria_scores' => $result['criteria_scores'],
            ];
        });

        // Sort by score (descending), apply offset and take the specified number of results
        $topRecommendations = $scoredShows
            ->sortByDesc('score')
            ->skip($offset)
            ->take($limit);

        // Add the reasons to each show as a property
        $topRecommendations->each(function ($item) {
            $item['show']->recommendation_reasons = $item['reasons'];
            $item['show']->match_score = $item['display_score'];
            $item['show']->criteria_scores = $item['criteria_scores'];
        });

        return $topRecommendations->pluck('show');
    }

    /**
     * Calculate a similarity score between a show and the user's selected shows
     */
    private function calculateSimilarityScore(
        Show $show,
        Collection $selectedShows,
        Collection $selectedGenres,
        Collection $selectedPeople
    ): array {
        $score = 0;
        $reasons = [];
        $criteriaScores = [];

        // Genre matching (25% of score) - reduced from 30% to accommodate release year
        $genreIds = $show->genres->pluck('id');
        $genreMatches = $genreIds->intersect($selectedGenres)->count();
        $genreScore = $genreMatches > 0 ?
            ($genreMatches / max($genreIds->count(), $selectedGenres->count())) * 25 : 0;
        $criteriaScores['genre'] = round($genreScore);

        if ($genreMatches > 0) {
            $commonGenres = $show->genres->whereIn('id', $selectedGenres)->pluck('name');
            if ($commonGenres->count() > 0) {
                $reasons[] = 'Matches '.$commonGenres->count().' '.($commonGenres->count() > 1 ? 'genres' : 'genre').
                    ' with your selections';
            }
        }

        // Cast/crew matching (25% of score)
        $peopleIds = $show->people->pluck('id');

        // Log for debugging - this helps identify if the show has people attached
        if ($peopleIds->isEmpty()) {
            Log::info('Show ID '.$show->id.' has no people');
        }

        $peopleMatches = $peopleIds->intersect($selectedPeople)->count();

        // Enhanced calculation that gives points even for a single match
        if ($peopleMatches > 0) {
            // Enhance the formula to give more weight to even a single match
            $peopleScore = min(25, (($peopleMatches * 5) + 10));
        } else {
            $peopleScore = 0;
        }

        $criteriaScores['cast'] = round($peopleScore);

        if ($peopleMatches > 0) {
            $commonPeople = $show->people->whereIn('id', $selectedPeople)
                ->sortByDesc(function ($person) {
                    // Prioritize lead actors in the explanation
                    return $person->pivot->main_cast ?? false ? 2 : 1;
                })
                ->take(2)
                ->pluck('name');

            if ($commonPeople->count() > 0) {
                $reasons[] = 'Features '.($commonPeople->count() > 1 ? 'actors' : 'actor').' '.$commonPeople->join(', ', ' and ');
            }
        }

        // Release year proximity (10% of score) - new criterion
        $releaseYearScore = 0;
        $criteriaScores['release_year'] = 0;

        if ($show->premiered) {
            $showYear = $show->premiered->year;
            $selectedYears = $selectedShows->map(function ($selectedShow) {
                return $selectedShow->premiered ? $selectedShow->premiered->year : null;
            })->filter()->values();

            if ($selectedYears->isNotEmpty() && $showYear) {
                $yearMatches = $selectedYears->filter(function ($year) use ($showYear) {
                    return abs($year - $showYear) <= 3; // +/- 3 years
                })->count();

                if ($yearMatches > 0) {
                    $releaseYearScore = ($yearMatches / $selectedYears->count()) * 10;
                    $criteriaScores['release_year'] = round($releaseYearScore);

                    // Check if the majority of selected shows are within the +/- 3 years window
                    if ($yearMatches / $selectedYears->count() >= 0.5) {
                        $reasons[] = 'Released within 3 years of shows you like';
                    }
                }
            }
        }

        // Rating similarity (10% of score)
        $ratingScore = 0;
        if ($show->rating && $selectedShows->avg('rating')) {
            $avgRating = $selectedShows->avg('rating');
            $ratingDiff = abs($show->rating - $avgRating);
            $ratingScore = max(0, 10 - ($ratingDiff * 2)); // Decreases as difference increases
            $criteriaScores['rating'] = round($ratingScore);

            if ($ratingDiff < 1) {
                $reasons[] = 'Has a similar rating to shows you like';
            }
        }

        // Type matching (8% of score) - reduced from 10%
        $typeScore = 0;
        $typeCount = $selectedShows->countBy('type');
        $dominantType = array_keys($typeCount->sortDesc()->toArray())[0] ?? null;
        if ($dominantType && $show->type === $dominantType) {
            $typeScore = 8;
            $criteriaScores['type'] = 8;
            $reasons[] = 'Matches the type of shows you prefer';
        } else {
            $criteriaScores['type'] = 0;
        }

        // Language matching (8% of score) - reduced from 10%
        $languageScore = 0;
        $langCount = $selectedShows->countBy('language');
        $dominantLang = array_keys($langCount->sortDesc()->toArray())[0] ?? null;
        if ($dominantLang && $show->language === $dominantLang) {
            $languageScore = 8;
            $criteriaScores['language'] = 8;
            $reasons[] = 'In your preferred language';
        } else {
            $criteriaScores['language'] = 0;
        }

        // Weight matching (5% of score) - shows with similar popularity
        $weightScore = 0;
        $avgWeight = $selectedShows->avg('weight');
        if ($show->weight && $avgWeight) {
            $weightDiff = abs($show->weight - $avgWeight);
            $weightScore = max(0, 5 - ($weightDiff / 20));
            $criteriaScores['popularity'] = round($weightScore);
        } else {
            $criteriaScores['popularity'] = 0;
        }

        // Run time matching (5% of score) - shows with similar duration
        $runtimeScore = 0;
        $avgRuntime = $selectedShows->avg('runtime');
        if ($show->runtime && $avgRuntime) {
            $runtimeDiff = abs($show->runtime - $avgRuntime);
            $runtimeScore = max(0, 5 - ($runtimeDiff / 10));
            $criteriaScores['runtime'] = round($runtimeScore);
        } else {
            $criteriaScores['runtime'] = 0;
        }

        // Status matching (4% of score) - reduced from 5%
        $statusScore = 0;
        $statusCount = $selectedShows->countBy('status');
        $dominantStatus = array_keys($statusCount->sortDesc()->toArray())[0] ?? null;
        if ($dominantStatus && $show->status === $dominantStatus) {
            $statusScore = 4;
            $criteriaScores['status'] = 4;
        } else {
            $criteriaScores['status'] = 0;
        }

        // Calculate final score (sum of all components)
        $finalScore = $genreScore + $peopleScore + $releaseYearScore + $ratingScore +
                     $typeScore + $languageScore + $weightScore + $runtimeScore + $statusScore;

        return [
            'score' => $finalScore,
            'display_score' => min(100, round($finalScore)),
            'reasons' => $reasons,
            'criteria_scores' => $criteriaScores,
        ];
    }
}
