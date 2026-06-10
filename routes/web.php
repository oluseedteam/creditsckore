<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'MyScoreNova API',
        'status' => 'ok',
        'health' => url('/up'),
        'login' => url('/api/login'),
    ]);
});

// Never serve the Blade welcome page on the API host.
Route::permanentRedirect('/welcome', '/');
