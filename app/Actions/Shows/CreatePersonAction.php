<?php

namespace App\Actions\Shows;

use App\Models\Person;

class CreatePersonAction
{
    public static function handle(array $data): Person
    {
        return Person::query()->create($data);
    }
}
