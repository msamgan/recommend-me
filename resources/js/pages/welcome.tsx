import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import ShowAutocomplete, { Show } from '@/components/ShowAutocomplete';
import ShowRecommendation from '@/components/ShowRecommendation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [favoriteShows, setFavoriteShows] = useState<(Show | null)[]>([null, null, null]);
    const [recommendations, setRecommendations] = useState<Show[]>([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreRecommendations, setHasMoreRecommendations] = useState(false);

    const { data, setData, reset, errors } = useForm({
        shows: [] as number[],
    });

    const updateShow = (index: number, show: Show | null) => {
        const newFavoriteShows = [...favoriteShows];
        newFavoriteShows[index] = show;
        setFavoriteShows(newFavoriteShows);

        // Update the form data with show IDs
        const showIds = newFavoriteShows
            .filter((show): show is Show => show !== null)
            .map(show => show.id);
        setData('shows', showIds);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (data.shows.length === 0) {
            return;
        }

        setLoading(true);
        setCurrentPage(1);

        try {
            const response = await axios.post(route('api.shows.recommendations'), {
                ...data,
                page: 1,
                limit: 6
            });
            setRecommendations(response.data.shows);
            setHasMoreRecommendations(response.data.hasMore);
            setShowRecommendations(true);
        } catch (error) {
            console.error('Error getting recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreRecommendations = async () => {
        if (loadingMore || !hasMoreRecommendations) return;

        setLoadingMore(true);
        const nextPage = currentPage + 1;

        try {
            const response = await axios.post(route('api.shows.recommendations'), {
                ...data,
                page: nextPage,
                limit: 6
            });

            setRecommendations([...recommendations, ...response.data.shows]);
            setHasMoreRecommendations(response.data.hasMore);
            setCurrentPage(nextPage);
        } catch (error) {
            console.error('Error loading more recommendations:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const resetForm = () => {
        setFavoriteShows([null, null, null]);
        setRecommendations([]);
        setShowRecommendations(false);
        setCurrentPage(1);
        setHasMoreRecommendations(false);
        reset('shows');
    };

    const atLeastOneShowSelected = favoriteShows.some(show => show !== null);

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Header */}
                <header className="w-full border-b border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                    <div className="mx-auto flex max-w-6xl items-center justify-between">
                        <div className="text-xl font-semibold">Recommend Me</div>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-md border border-[#19140035] px-4 py-1.5 text-sm transition-colors hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-md px-4 py-1.5 text-sm transition-colors hover:bg-[#f5f5f3] dark:hover:bg-[#161615]"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-md border border-[#19140035] px-4 py-1.5 text-sm transition-colors hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex flex-1 items-center justify-center p-6">
                    <div className={`w-full ${showRecommendations ? 'max-w-6xl' : 'max-w-2xl'}`}>
                        <div className={`flex flex-col ${showRecommendations ? 'md:flex-row' : ''} gap-6`}>
                            {/* Form section - Made sticky */}
                            <div className={`${showRecommendations ? 'md:w-2/5' : 'w-full'} ${showRecommendations ? 'md:sticky md:top-6 md:self-start' : ''}`}>
                                <Card className="overflow-hidden border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                    <div className="border-b border-[#e3e3e0] bg-[#f9f9f8] p-6 dark:border-[#3E3E3A] dark:bg-[#1c1c1b]">
                                        <h1 className="text-2xl font-semibold">Tell us what you like</h1>
                                        <p className="mt-2 text-[#706f6c] dark:text-[#A1A09A]">
                                            Help us recommend shows you'll love by sharing some of your favorites.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-6">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Your favorite show <span className="text-[#f53003]">*</span>
                                                </label>
                                                <ShowAutocomplete
                                                    value={favoriteShows[0]}
                                                    onChange={(show) => updateShow(0, show)}
                                                    required
                                                    index={0}
                                                />
                                                {errors.shows && <p className="mt-1 text-sm text-[#f53003]">{errors.shows}</p>}
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Another show you enjoy (optional)
                                                </label>
                                                <ShowAutocomplete
                                                    value={favoriteShows[1]}
                                                    onChange={(show) => updateShow(1, show)}
                                                    index={1}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    One more show you like (optional)
                                                </label>
                                                <ShowAutocomplete
                                                    value={favoriteShows[2]}
                                                    onChange={(show) => updateShow(2, show)}
                                                    index={2}
                                                />
                                            </div>

                                            <div className="pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={!atLeastOneShowSelected || loading}
                                                    className="w-full bg-[#f53003] hover:bg-[#d62a02] text-white dark:bg-[#FF4433] dark:hover:bg-[#e53c2c]"
                                                >
                                                    {loading ? 'Processing...' : 'Get Recommendations'}
                                                </Button>

                                                {showRecommendations && (
                                                    <Button
                                                        type="button"
                                                        onClick={resetForm}
                                                        className="w-full mt-2 bg-transparent border border-[#3E3E3A] text-[#1b1b18] hover:bg-[#f5f5f3] dark:text-[#EDEDEC] dark:hover:bg-[#161615]"
                                                    >
                                                        Start Over
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </Card>

                                {!showRecommendations && (
                                    <p className="mt-4 text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        Our recommendations get better the more shows you add, but you only need one to start.
                                    </p>
                                )}
                            </div>

                            {/* Recommendations section */}
                            {showRecommendations && recommendations.length > 0 && (
                                <div className="md:w-3/5">
                                    <Card className="overflow-hidden border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                        <div className="border-b border-[#e3e3e0] bg-[#f9f9f8] p-6 dark:border-[#3E3E3A] dark:bg-[#1c1c1b]">
                                            <h2 className="text-2xl font-semibold">Your Recommendations</h2>
                                            <p className="mt-2 text-[#706f6c] dark:text-[#A1A09A]">
                                                Based on your selections, we think you'll enjoy these shows.
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid gap-3">
                                                {recommendations.map((show) => (
                                                    <ShowRecommendation key={show.id} show={show} />
                                                ))}
                                            </div>

                                            {/* Load More button */}
                                            {hasMoreRecommendations && (
                                                <div className="mt-6 text-center">
                                                    <Button
                                                        onClick={loadMoreRecommendations}
                                                        disabled={loadingMore}
                                                        className="bg-[#f9f9f8] hover:bg-[#efefe9] text-[#1b1b18] border border-[#e3e3e0] dark:bg-[#1c1c1b] dark:hover:bg-[#252522] dark:text-[#EDEDEC] dark:border-[#3E3E3A]"
                                                    >
                                                        {loadingMore ? 'Loading...' : 'Load More Recommendations'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* No recommendations found message */}
                            {showRecommendations && recommendations.length === 0 && !loading && (
                                <div className="md:w-3/5">
                                    <Card className="overflow-hidden border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                        <div className="p-6 text-center">
                                            <h2 className="text-xl font-semibold mb-2">No Recommendations Found</h2>
                                            <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                                We couldn't find any recommendations based on your selections. Try adding different shows.
                                            </p>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-[#e3e3e0] p-4 text-center text-xs text-[#706f6c] dark:border-[#3E3E3A] dark:text-[#A1A09A]">
                    <p>© {new Date().getFullYear()} Recommend Me. Find your next favorite show.</p>
                </footer>
            </div>
        </>
    );
}
