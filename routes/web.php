<?php

use Illuminate\Support\Facades\Route;

// SPA catch-all route for frontend (excluding API & health routes)
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|up).*$');
