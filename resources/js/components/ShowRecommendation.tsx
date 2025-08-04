import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
    BarChart,
    BarChart3,
    Calendar,
    Calendar as CalendarIcon,
    Clock,
    Clock as ClockIcon,
    ExternalLink,
    Film,
    Globe,
    Info,
    MessageCircle,
    Percent,
    Star,
    ThumbsUp,
    Tv,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

// Define the Cast type
interface Cast {
    name: string;
    character: string;
    image_medium: string | null;
}

// Define the extended Show type with recommendation fields
interface Show {
    id: number;
    name: string;
    image_medium: string | null;
    image_original: string | null;
    type: string;
    language?: string;
    status?: string;
    premiered?: string;
    runtime?: number;
    genres?: string[];
    rating?: number;
    network?: string;
    network_country?: string;
    web_channel?: string;
    official_site?: string;
    schedule_time?: string;
    schedule_days?: string[];
    weight?: number;
    summary?: string;
    externals_imdb?: string;
    externals_thetvdb?: string;
    cast?: Cast[];
    // Added fields for recommendations
    match_score?: number;
    criteria_scores?: Record<string, number>;
    recommendation_reasons?: string[];
}

interface ShowRecommendationProps {
    show: Show;
}

// Define the criteria label map for display purposes
const criteriaLabels: Record<string, string> = {
    genre: 'Genre Match',
    cast: 'Cast/Crew Match',
    release_year: 'Release Year Match',
    rating: 'Rating Similarity',
    type: 'Type Match',
    language: 'Language Match',
    popularity: 'Popularity Match',
    runtime: 'Runtime Similarity',
    status: 'Status Match',
};

// Define the criteria icon map
const criteriaIcons: Record<string, React.ReactNode> = {
    genre: <Film className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />,
    cast: <Users className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />,
    release_year: <CalendarIcon className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />,
    rating: <Star className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />,
    status: <Tv className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />,
    type: <Info className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />,
    language: <Globe className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />,
    runtime: <ClockIcon className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />,
    popularity: <BarChart className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />,
};

// Define max scores for criteria
const maxCriteriaScores: Record<string, number> = {
    genre: 25, // Updated from 30
    cast: 25,
    release_year: 10, // New criterion
    rating: 10,
    type: 8, // Updated from 10
    language: 8, // Updated from 10
    popularity: 5,
    runtime: 5,
    status: 4, // Updated from 5
};

export default function ShowRecommendation({ show }: ShowRecommendationProps) {
    const [showDetails, setShowDetails] = useState(false);

    // Strip HTML tags from summary
    const stripHtml = (html?: string) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '');
    };

    // Format date to a more readable format
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Format schedule days into a readable string
    const formatScheduleDays = (days?: string[]) => {
        if (!days || days.length === 0) return 'Not specified';
        if (days.length === 7) return 'Every day';
        return days.join(', ');
    };

    return (
        <>
            <div className="flex items-center gap-2 rounded-md border border-[#3E3E3A] bg-white p-3 dark:bg-[#161615]">
                {show.image_medium && <img src={show.image_medium} alt={show.name} className="h-16 w-12 rounded object-cover" />}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-medium">{show.name}</p>
                        {show.status && (
                            <Badge className={`text-xs ${show.status === 'Running' ? 'bg-emerald-600' : 'bg-gray-500'}`}>{show.status}</Badge>
                        )}

                        {/* Match Score */}
                        {show.match_score && (
                            <Badge className="flex items-center gap-1 bg-[#f53003] text-xs dark:bg-[#FF4433]">
                                <Percent className="h-3 w-3" />
                                {show.match_score}% Match
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                        <span>{show.type}</span>
                        {show.premiered && (
                            <span className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(show.premiered).getFullYear()}
                            </span>
                        )}
                        {show.runtime && (
                            <span className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {show.runtime} min
                            </span>
                        )}
                    </div>
                    {/* Recommendation reasons */}
                    {show.recommendation_reasons && show.recommendation_reasons.length > 0 && (
                        <div className="mt-1 flex items-center text-xs text-[#f53003] dark:text-[#FF4433]">
                            <ThumbsUp className="mr-1 h-3 w-3" />
                            {show.recommendation_reasons[0]}
                        </div>
                    )}
                    {show.genres && show.genres.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                            {show.genres.slice(0, 3).map((genre) => (
                                <Badge key={genre} variant="outline" className="px-1.5 py-0 text-xs">
                                    {genre}
                                </Badge>
                            ))}
                            {show.genres.length > 3 && (
                                <Badge variant="outline" className="px-1.5 py-0 text-xs">
                                    +{show.genres.length - 3} more
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDetails(true)}
                    className="h-8 w-8 shrink-0 text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                >
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Show details</span>
                </Button>
            </div>

            {/* Show Details Dialog */}
            {showDetails && (
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="max-h-[90vh] w-full max-w-7xl overflow-auto rounded-lg bg-white shadow-lg dark:bg-[#161615]">
                            <div className="flex justify-between border-b border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                                <h2 className="flex items-center gap-2 text-xl font-semibold">
                                    {show.name}
                                    {show.status && (
                                        <Badge className={`${show.status === 'Running' ? 'bg-emerald-600' : 'bg-gray-500'}`}>{show.status}</Badge>
                                    )}
                                </h2>
                                <Button type="button" variant="ghost" size="icon" onClick={() => setShowDetails(false)} className="h-8 w-8">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-3">
                                <div className="flex flex-col gap-6 md:flex-row">
                                    {/* Left column with image, core details, criteria scores and recommendation reasons */}
                                    <div className="w-full space-y-6 md:w-2/12">
                                        <div className="flex justify-center md:block">
                                            {show.image_original ? (
                                                <img
                                                    src={show.image_original ?? show.image_medium ?? undefined}
                                                    alt={show.name}
                                                    className="w-full max-w-[240px] rounded-md object-cover shadow-md"
                                                />
                                            ) : (
                                                <div className="flex h-72 w-48 items-center justify-center rounded-md bg-[#e3e3e0] dark:bg-[#3E3E3A]">
                                                    <Tv className="h-16 w-16 text-[#706f6c] dark:text-[#A1A09A]" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-amber-500" />
                                                <span>
                                                    {show.rating && typeof show.rating === 'number' ? `${show.rating.toFixed(1)}/10` : 'Not rated'}
                                                </span>
                                            </div>

                                            {show.premiered && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />
                                                    <span>{formatDate(show.premiered)}</span>
                                                </div>
                                            )}

                                            {show.runtime && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />
                                                    <span>{show.runtime} minutes</span>
                                                </div>
                                            )}

                                            {show.language && (
                                                <div className="flex items-center gap-1">
                                                    <Globe className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />
                                                    <span>{show.language}</span>
                                                </div>
                                            )}

                                            {show.official_site && (
                                                <div>
                                                    <a
                                                        href={show.official_site}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[#f53003] hover:underline dark:text-[#FF4433]"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        Official Website
                                                    </a>
                                                </div>
                                            )}

                                            {show.externals_imdb && (
                                                <div>
                                                    <a
                                                        href={`https://www.imdb.com/title/${show.externals_imdb}/`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[#f53003] hover:underline dark:text-[#FF4433]"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        View on IMDb
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right column with details and cast */}
                                    <div className="w-full space-y-6 md:w-7/12">
                                        {/* Summary */}
                                        {show.summary && (
                                            <div className="space-y-2">
                                                <h3 className="flex items-center gap-1 font-medium">
                                                    <MessageCircle className="h-4 w-4" /> Summary
                                                </h3>
                                                <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{stripHtml(show.summary)}</p>
                                            </div>
                                        )}

                                        {/* Genres */}
                                        {show.genres && show.genres.length > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="font-medium">Genres</h3>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {show.genres.map((genre, i) => (
                                                        <Badge
                                                            key={i}
                                                            className="border border-[#e3e3e0] bg-[#f5f5f3] text-[#1b1b18] dark:border-[#3E3E3A] dark:bg-[#252524] dark:text-[#EDEDEC]"
                                                        >
                                                            {genre}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Network & Schedule */}
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <h3 className="font-medium">Network & Channel</h3>
                                                <div className="space-y-1 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                    <p>
                                                        <span className="text-[#706f6c] dark:text-[#A1A09A]">Network:</span> {show.network || 'N/A'}
                                                    </p>
                                                    {show.network_country && (
                                                        <p>
                                                            <span className="text-[#706f6c] dark:text-[#A1A09A]">Country:</span>{' '}
                                                            {show.network_country}
                                                        </p>
                                                    )}
                                                    {show.web_channel && (
                                                        <p>
                                                            <span className="text-[#706f6c] dark:text-[#A1A09A]">Web Channel:</span>{' '}
                                                            {show.web_channel}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-medium">Schedule</h3>
                                                <div className="space-y-1 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                    <p>
                                                        <span className="text-[#706f6c] dark:text-[#A1A09A]">Days:</span>{' '}
                                                        {formatScheduleDays(show.schedule_days)}
                                                    </p>
                                                    <p>
                                                        <span className="text-[#706f6c] dark:text-[#A1A09A]">Time:</span>{' '}
                                                        {show.schedule_time || 'Not specified'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cast */}
                                        {show.cast && show.cast.length > 0 && (
                                            <div className="space-y-3">
                                                <h3 className="flex items-center gap-1 font-medium">
                                                    <Users className="h-4 w-4" /> Cast
                                                </h3>
                                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                                    {show.cast.map((person, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            {person.image_medium ? (
                                                                <img
                                                                    src={person.image_medium}
                                                                    alt={person.name}
                                                                    className="h-8 w-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e3e3e0] dark:bg-[#3E3E3A]">
                                                                    <Users className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />
                                                                </div>
                                                            )}
                                                            <div className="text-xs">
                                                                <p className="font-medium">{person.name}</p>
                                                                <p className="text-[#706f6c] dark:text-[#A1A09A]">{person.character}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full space-y-2 md:w-3/12">
                                        {/* Why recommended - moved to left column */}
                                        {show.recommendation_reasons && show.recommendation_reasons.length > 0 && (
                                            <div className="rounded-md border border-[#e3e3e0] bg-[#f9f9f8] p-3 dark:border-[#3E3E3A] dark:bg-[#1c1c1b]">
                                                <h3 className="mb-2 flex items-center gap-1 font-medium">
                                                    <ThumbsUp className="h-4 w-4 text-[#f53003] dark:text-[#FF4433]" />
                                                    Why we recommend this
                                                </h3>
                                                <ul className="space-y-1 text-sm">
                                                    {show.recommendation_reasons.map((reason, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="mr-2 text-[#f53003] dark:text-[#FF4433]">•</span>
                                                            {reason}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Criteria Scores - moved to left column */}
                                        {show.criteria_scores && Object.keys(show.criteria_scores).length > 0 && (
                                            <div className="rounded-md border border-[#e3e3e0] bg-[#f9f9f8] p-3 dark:border-[#3E3E3A] dark:bg-[#1c1c1b]">
                                                <h3 className="mb-2 flex items-center gap-1 font-medium">
                                                    <BarChart3 className="h-4 w-4" /> Criteria Scores
                                                </h3>
                                                <div className="space-y-3">
                                                    {Object.keys(criteriaLabels).map((key) => (
                                                        <div key={key} className="flex items-center gap-2">
                                                            <div className="flex min-w-[120px] items-center gap-2">
                                                                {criteriaIcons[key]}
                                                                <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                                    {criteriaLabels[key]}
                                                                </span>
                                                            </div>
                                                            <div className="ml-auto flex items-center">
                                                                <span className="mr-2 font-medium text-[#f53003] dark:text-[#FF4433]">
                                                                    {Math.round(((show.criteria_scores?.[key] || 0) * 100) / maxCriteriaScores[key])}%
                                                                </span>
                                                                <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                                    ({show.criteria_scores?.[key] || 0}/{maxCriteriaScores[key]})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}
        </>
    );
}
