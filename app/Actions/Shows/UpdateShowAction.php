<?php

namespace App\Actions\Shows;

use App\Models\Show;

class UpdateShowAction
{
    public static function handle(Show $show, array $data): Show
    {
        $show->update($data);
        return $show;
    }
}
