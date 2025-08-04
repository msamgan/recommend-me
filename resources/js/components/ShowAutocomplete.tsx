import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ExternalLink, Globe, Info, MessageCircle, Star, Tv, Users, X } from "lucide-react";
import axios from "axios";

export type Cast = {
    name: string;
    character: string;
    image_medium: string | null;
};

export type Show = {
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
    // Added new fields for recommendations
    match_score?: number;
    criteria_scores?: Record<string, number>;
    recommendation_reasons?: string[];
};

interface ShowAutocompleteProps {
    value: Show | null;
    onChange: (show: Show | null) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    index?: number;
}

export default function ShowAutocomplete({
    value,
    onChange,
    placeholder = "Search for a show...",
    required = false,
    disabled = false,
    index,
}: ShowAutocompleteProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Show[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const searchShows = useCallback(
        async (searchQuery: string) => {
            if (searchQuery.length < 2) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await axios.get(route("api.shows.search", {
                    query: searchQuery,
                }));
                setResults(response.data);
            } catch (error) {
                console.error("Error searching shows:", error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        },
        []
    );

    // Format date to a more readable format
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Format schedule days into a readable string
    const formatScheduleDays = (days?: string[]) => {
        if (!days || days.length === 0) return "Not specified";
        if (days.length === 7) return "Every day";
        return days.join(", ");
    };

    // Strip HTML tags from summary
    const stripHtml = (html?: string) => {
        if (!html) return "";
        return html.replace(/<[^>]*>/g, "");
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            searchShows(query);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [query, searchShows]);

    const handleSelect = (show: Show) => {
        onChange(show);
        setQuery("");
        setResults([]);
        setIsFocused(false);
    };

    const handleClear = () => {
        onChange(null);
    };

    const toggleShowDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDetails(!showDetails);
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                {value ? (
                    <div className="flex items-center gap-2 rounded-md border border-[#3E3E3A] bg-white p-2 dark:bg-[#161615]">
                        {value.image_medium && (
                            <img
                                src={value.image_medium}
                                alt={value.name}
                                className="h-12 w-8 rounded object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{value.name}</p>
                                {value.status && (
                                    <Badge
                                        className={`text-xs ${value.status === 'Running' ? 'bg-emerald-600' : 'bg-gray-500'}`}
                                    >
                                        {value.status}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                <span>{value.type}</span>
                                {value.premiered && (
                                    <span className="flex items-center">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {new Date(value.premiered).getFullYear()}
                                    </span>
                                )}
                                {value.runtime && (
                                    <span className="flex items-center">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {value.runtime} min
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={toggleShowDetails}
                                className="h-7 w-7 shrink-0 text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                            >
                                <Info className="h-3.5 w-3.5" />
                                <span className="sr-only">Show details</span>
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleClear}
                                className="h-7 w-7 shrink-0 text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove show</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder={placeholder}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                // Delay hiding the results to allow for clicks
                                setTimeout(() => setIsFocused(false), 200);
                            }}
                            required={required}
                            disabled={disabled}
                            className="w-full"
                            aria-label={`Favorite show ${index ? index + 1 : ""}`}
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f53003] border-t-transparent dark:border-[#FF4433]"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isFocused && results.length > 0 && !value && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[#e3e3e0] bg-white py-1 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]">
                    {results.map((show) => (
                        <div
                            key={show.id}
                            className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#FDFDFC] dark:hover:bg-[#0a0a0a]"
                            onMouseDown={() => handleSelect(show)}
                        >
                            {show.image_medium ? (
                                <img
                                    src={show.image_medium}
                                    alt={show.name}
                                    className="h-12 w-8 rounded object-cover"
                                />
                            ) : (
                                <div className="h-12 w-8 rounded bg-[#e3e3e0] dark:bg-[#3E3E3A] flex items-center justify-center">
                                    <Tv className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{show.name}</p>
                                    {show.status && (
                                        <Badge
                                            className={`text-xs ${show.status === 'Running' ? 'bg-emerald-600' : 'bg-gray-500'}`}
                                        >
                                            {show.status}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                    <span>{show.type}</span>
                                    {show.language && <span>• {show.language}</span>}
                                    {show.premiered && (
                                        <span className="flex items-center">
                                            • <Calendar className="mx-1 h-3 w-3" />
                                            {new Date(show.premiered).getFullYear()}
                                        </span>
                                    )}
                                    {show.runtime && (
                                        <span className="flex items-center">
                                            • <Clock className="mx-1 h-3 w-3" />
                                            {show.runtime} min
                                        </span>
                                    )}
                                </div>
                                {show.genres && show.genres.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {show.genres.slice(0, 3).map((genre, i) => (
                                            <Badge key={i} variant="outline" className="text-[10px] px-1 py-0 h-4 border-[#e3e3e0] dark:border-[#3E3E3A]">
                                                {genre}
                                            </Badge>
                                        ))}
                                        {show.genres.length > 3 && (
                                            <span className="text-[10px] text-[#706f6c] dark:text-[#A1A09A]">
                                                +{show.genres.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            {show.rating && typeof show.rating === 'number' && (
                                <div className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                                    <span className="text-xs font-medium">
                                        {show.rating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Show Details Dialog */}
            {value && showDetails && (
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#161615] rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                            <div className="p-4 border-b border-[#e3e3e0] dark:border-[#3E3E3A] flex justify-between">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    {value.name}
                                    {value.status && (
                                        <Badge
                                            className={`${value.status === 'Running' ? 'bg-emerald-600' : 'bg-gray-500'}`}
                                        >
                                            {value.status}
                                        </Badge>
                                    )}
                                </h2>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowDetails(false)}
                                    className="h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Left column with image and core details */}
                                    <div className="w-full md:w-1/3">
                                        <div className="mb-4 flex justify-center md:block">
                                            {value.image_original ? (
                                                <img
                                                    src={value.image_original ?? value.image_medium ?? undefined}
                                                    alt={value.name}
                                                    className="rounded-md w-full max-w-[240px] object-cover shadow-md"
                                                />
                                            ) : (
                                                <div className="rounded-md h-72 w-48 bg-[#e3e3e0] dark:bg-[#3E3E3A] flex items-center justify-center">
                                                    <Tv className="h-16 w-16 text-[#706f6c] dark:text-[#A1A09A]" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 space-y-2 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-amber-500" />
                                                <span>
                                                    {value.rating && typeof value.rating === 'number'
                                                        ? `${value.rating.toFixed(1)}/10`
                                                        : 'Not rated'}
                                                </span>
                                            </div>

                                            {value.premiered && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />
                                                    <span>{formatDate(value.premiered)}</span>
                                                </div>
                                            )}

                                            {value.runtime && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />
                                                    <span>{value.runtime} minutes</span>
                                                </div>
                                            )}

                                            {value.language && (
                                                <div className="flex items-center gap-1">
                                                    <Globe className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" />
                                                    <span>{value.language}</span>
                                                </div>
                                            )}

                                            {value.official_site && (
                                                <div>
                                                    <a
                                                        href={value.official_site}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[#f53003] hover:underline dark:text-[#FF4433]"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        Official Website
                                                    </a>
                                                </div>
                                            )}

                                            {value.externals_imdb && (
                                                <div>
                                                    <a
                                                        href={`https://www.imdb.com/title/${value.externals_imdb}/`}
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
                                    <div className="w-full md:w-2/3 space-y-6">
                                        {/* Summary */}
                                        {value.summary && (
                                            <div className="space-y-2">
                                                <h3 className="font-medium flex items-center gap-1">
                                                    <MessageCircle className="h-4 w-4" /> Summary
                                                </h3>
                                                <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                    {stripHtml(value.summary)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Genres */}
                                        {value.genres && value.genres.length > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="font-medium">Genres</h3>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {value.genres.map((genre, i) => (
                                                        <Badge key={i} className="bg-[#f5f5f3] text-[#1b1b18] dark:bg-[#252524] dark:text-[#EDEDEC] border border-[#e3e3e0] dark:border-[#3E3E3A]">
                                                            {genre}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Network & Schedule */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <h3 className="font-medium">Network & Channel</h3>
                                                <div className="text-sm space-y-1 text-[#1b1b18] dark:text-[#EDEDEC]">
                                                    <p><span className="text-[#706f6c] dark:text-[#A1A09A]">Network:</span> {value.network || 'N/A'}</p>
                                                    {value.network_country && (
                                                        <p><span className="text-[#706f6c] dark:text-[#A1A09A]">Country:</span> {value.network_country}</p>
                                                    )}
                                                    {value.web_channel && (
                                                        <p><span className="text-[#706f6c] dark:text-[#A1A09A]">Web Channel:</span> {value.web_channel}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-medium">Schedule</h3>
                                                <div className="text-sm space-y-1 text-[#1b1b18] dark:text-[#EDEDEC]">
                                                    <p>
                                                        <span className="text-[#706f6c] dark:text-[#A1A09A]">Days:</span> {formatScheduleDays(value.schedule_days)}
                                                    </p>
                                                    <p>
                                                        <span className="text-[#706f6c] dark:text-[#A1A09A]">Time:</span> {value.schedule_time || 'Not specified'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cast */}
                                        {value.cast && value.cast.length > 0 && (
                                            <div className="space-y-3">
                                                <h3 className="font-medium flex items-center gap-1">
                                                    <Users className="h-4 w-4" /> Cast
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {value.cast.map((person, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            {person.image_medium ? (
                                                                <img
                                                                    src={person.image_medium}
                                                                    alt={person.name}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-[#e3e3e0] dark:bg-[#3E3E3A] flex items-center justify-center">
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
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
}
