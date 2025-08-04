<?php

namespace App\Actions\Shows;

use App\Models\Person;

class UpdatePersonAction
{
    public static function handle(Person $person, array $data): Person
    {
        $person->update($data);
        return $person;
    }
}
