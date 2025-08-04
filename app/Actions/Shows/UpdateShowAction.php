<?php

declare(strict_types=1);

namespace App\Actions\Shows;

use App\Models\Show;

final class UpdateShowAction
{
    public static function handle(Show $show, array $data): Show
    {
        $show->update($data);

        return $show;
    }
}
