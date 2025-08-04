<?php

declare(strict_types=1);

namespace App\Actions\Shows;

use App\Models\Show;

final class CreateShowAction
{
    public static function handle(array $data): Show
    {
        return Show::query()->create($data);
    }
}
