<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    protected $fillable = [
        'type',
        'on_source_id',
        'name',
        'character_name',
        'country',
        'birth_day',
        'death_day',
        'gender',
        'image_medium',
        'image_original',
        'on_source_updated',
    ];

    protected $casts = [
        'birth_day' => 'date',
        'death_day' => 'date',
        'on_source_updated' => 'date',
    ];
}
