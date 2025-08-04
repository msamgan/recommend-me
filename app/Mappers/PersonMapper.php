<?php

namespace App\Mappers;

use Carbon\Carbon;

class PersonMapper
{
    public static function handle(array $apiData, bool $isCast = false): array
    {
        $dataArray = [
            'type' => $isCast ? 'cast' : strtolower($apiData['type']),
            'on_source_id' => $apiData['person']['id'],
            'name' => strtolower($apiData['person']['name']),
            'country' => $apiData['person']['country']['code'] ?? null,
            'birth_day' => Carbon::parse($apiData['person']['birthday']) ?? null,
            'death_day' => $apiData['person']['deathday'] ? Carbon::parse($apiData['person']['deathday']) : null,
            'gender' => strtolower($apiData['person']['gender']) ?? null,
            'image_medium' => $apiData['person']['image']['medium'] ?? null,
            'image_original' => $apiData['person']['image']['original'] ?? null,
            'on_source_updated' => Carbon::parse($apiData['person']['updated']) ?? null,
        ];

        if ($isCast) {
            $dataArray['character_name'] = strtolower($apiData['character']['name']);
        }

        return $dataArray;
    }
}
