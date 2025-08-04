<?php

namespace App\Actions\Shows;

use App\Models\Show;

class CreateShowAction
{
    public static function handle(array $data): Show
    {
        return Show::query()->create($data);
    }
}
