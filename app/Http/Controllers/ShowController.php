<?php

namespace App\Http\Controllers;

use App\Actions\Shows\GetRecommendations;
use App\Models\Show;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShowController extends Controller
{
    /**
     * Search for shows by name
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $search = $request->input('query');

        $shows = Show::query()->where('name', 'like', "%{$search}%")
            ->with(['people', 'genres'])
            ->orderBy('name')
            ->limit(12)
            ->get();

        // Transform the shows to include genres and cast as arrays of relevant data
        $transformedShows = $shows->map(function ($show) {
            $showArray = $show->toArray();

            // Use unique to ensure no duplicate genres
            $showArray['genres'] = $show->genres->pluck('name')->unique()->values()->toArray();

            // Get top cast members
            $showArray['cast'] = $show->people->map(function ($person) {
                return [
                    'name' => $person->name ?? 'Unknown',
                    'character' => $person->character_name ?? '', // With fallback to empty string
                    'image_medium' => $person->image_medium ?? null,
                ];
            })->take(10)->toArray();

            return $showArray;
        });

        return response()->json($transformedShows);
    }

    /**
     * Get recommendations based on selected shows
     *
     * @param Request $request
     * @param GetRecommendations $getRecommendations
     * @return JsonResponse
     */
    public function getRecommendations(Request $request, GetRecommendations $getRecommendations): JsonResponse
    {
        $request->validate([
            'shows' => 'required|array|min:1',
            'shows.*' => 'integer|exists:shows,id',
        ]);

        $showIds = $request->input('shows');
        $recommendations = $getRecommendations->execute($showIds, 12);

        // Transform the shows to include genres and cast as arrays of relevant data
        $transformedShows = $recommendations->map(function ($show) {
            $showArray = $show->toArray();

            // Use unique to ensure no duplicate genres
            $showArray['genres'] = $show->genres->pluck('name')->unique()->values()->toArray();

            // Get top cast members
            $showArray['cast'] = $show->people->map(function ($person) {
                return [
                    'name' => $person->name ?? 'Unknown',
                    'character' => $person->character_name ?? '', // With fallback to empty string
                    'image_medium' => $person->image_medium ?? null,
                ];
            })->take(10)->toArray();

            // Include recommendation reasons and scores
            $showArray['recommendation_reasons'] = $show->recommendation_reasons ?? [];
            $showArray['match_score'] = $show->match_score ?? 0;
            $showArray['criteria_scores'] = $show->criteria_scores ?? [];

            return $showArray;
        });

        return response()->json($transformedShows);
    }
}
