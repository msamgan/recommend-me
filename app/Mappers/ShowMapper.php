<?php

namespace App\Mappers;

use Carbon\Carbon;

class ShowMapper
{
    public static function handle(array $apiData): array
    {
        return [
            'on_source_id' => $apiData['id'],
            'name' => $apiData['name'],
            'type' => strtolower($apiData['type']) ?? null,
            'language' => strtolower($apiData['language']) ?? null,
            'status' => strtolower($apiData['status']) ?? null,
            'runtime' => $apiData['runtime'] ?? null,
            'premiered' => Carbon::parse($apiData['premiered']) ?? null,
            'official_site' => $apiData['officialSite'] ?? null,
            'schedule_time' => $apiData['schedule']['time'] ?: null,
            'schedule_days' => count($apiData['schedule']['days']) ? $apiData['schedule']['days'] : null,
            'rating' => $apiData['rating']['average'] ?? null,
            'weight' => $apiData['weight'] ?? null,
            'network' => $apiData['network']['name'] ?? null,
            'network_country' => $apiData['network']['country']['code'] ?? null,
            'web_channel' => $apiData['webChannel']['name'] ?? null,
            'externals_imdb' => $apiData['externals']['imdb'] ?? null,
            'externals_thetvdb' => $apiData['externals']['thetvdb'] ?? null,
            'externals_tvrage' => $apiData['externals']['tvrage'] ?? null,
            'image_medium' => $apiData['image']['medium'] ?? null,
            'image_original' => $apiData['image']['original'] ?? null,
            'summary' => strip_tags($apiData['summary']) ?? null,
            'on_source_updated' => Carbon::parse($apiData['updated']) ?? null,
        ];
    }
}
