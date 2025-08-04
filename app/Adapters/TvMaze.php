<?php

declare(strict_types=1);

namespace App\Adapters;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

final class TvMaze
{
    /**
     * @throws ConnectionException
     */
    public function getShows(int $page = 0): array
    {
        return Http::get('https://api.tvmaze.com/shows', [
            'page' => $page,
        ])->json();
    }

    /**
     * @throws ConnectionException
     */
    public function getShowCrew(int $showId): array
    {
        return Http::get("https://api.tvmaze.com/shows/{$showId}/crew")->json();
    }

    /**
     * @throws ConnectionException
     */
    public function getShowCast(int $showId): array
    {
        return Http::get("https://api.tvmaze.com/shows/{$showId}/cast")->json();
    }
}
