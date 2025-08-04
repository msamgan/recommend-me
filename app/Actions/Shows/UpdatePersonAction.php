<?php

declare(strict_types=1);

namespace App\Actions\Shows;

use App\Models\Person;

final class UpdatePersonAction
{
    public static function handle(Person $person, array $data): Person
    {
        $person->update($data);

        return $person;
    }
}
