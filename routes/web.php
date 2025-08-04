<?php

declare(strict_types=1);

use App\Http\Controllers\ShowController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/api/shows/search', [ShowController::class, 'search'])->name('api.shows.search');
Route::post('/api/shows/recommendations', [ShowController::class, 'getRecommendations'])->name('api.shows.recommendations');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
