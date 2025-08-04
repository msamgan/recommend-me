<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Show extends Model
{
    protected $fillable = [
        'on_source_id',
        'name',
        'type',
        'language',
        'status',
        'runtime',
        'premiered',
        'official_site',
        'schedule_time',
        'schedule_days',
        'rating',
        'weight',
        'network',
        'network_country',
        'web_channel',
        'externals_imdb',
        'externals_thetvdb',
        'externals_tvrage',
        'image_medium',
        'image_original',
        'summary',
        'on_source_updated',
    ];

    protected $casts = [
        'premiered' => 'date',
        'schedule_days' => 'array',
        'on_source_updated' => 'datetime',
    ];

    public function people(): BelongsToMany
    {
        return $this->belongsToMany(Person::class, 'shows_people', 'show_id', 'person_id');
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'shows_genres', 'show_id', 'genre_id');
    }
}
