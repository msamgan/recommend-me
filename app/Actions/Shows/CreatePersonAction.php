<?php

declare(strict_types=1);

namespace App\Actions\Shows;

use App\Models\Person;

final class CreatePersonAction
{
    public static function handle(array $data): Person
    {
        return Person::query()->create($data);
    }
}
