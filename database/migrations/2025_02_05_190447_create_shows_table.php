<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shows', function (Blueprint $table) {
            $table->id();
            $table->string('source')->nullable()->default('tvmaze');
            $table->string('on_source_id')->unique();
            $table->string('name');
            $table->string('type')->nullable();
            $table->string('language')->nullable();
            $table->string('status')->nullable();
            $table->string('runtime')->nullable();
            $table->date('premiered')->nullable();
            $table->string('official_site')->nullable();
            $table->time('schedule_time')->nullable();
            $table->json('schedule_days')->nullable();
            $table->string('rating')->nullable();
            $table->string('weight')->nullable();
            $table->string('network')->nullable();
            $table->string('network_country')->nullable();
            $table->string('web_channel')->nullable();
            $table->string('externals_imdb')->nullable();
            $table->string('externals_thetvdb')->nullable();
            $table->string('externals_tvrage')->nullable();
            $table->string('image_medium')->nullable();
            $table->string('image_original')->nullable();
            $table->text('summary')->nullable();
            $table->date('on_source_updated')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shows');
    }
};
