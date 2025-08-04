<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('people', function (Blueprint $table) {
            $table->id();
            $table->string('on_source_id');
            $table->string('type');
            $table->string('name');
            $table->string('character_name')->nullable();
            $table->string('country')->nullable();
            $table->date('birth_day')->nullable();
            $table->date('death_day')->nullable();
            $table->string('gender')->nullable();
            $table->string('image_medium')->nullable();
            $table->string('image_original')->nullable();
            $table->date('on_source_updated')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('people');
    }
};
