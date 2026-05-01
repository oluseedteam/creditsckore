<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CbtTestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CreditScoreController;
use App\Http\Controllers\AttendanceController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/users', [AuthController::class, 'allUsers']);
    
    Route::post('/credit-scores', [CreditScoreController::class, 'store']);
    Route::post('/attendances', [AttendanceController::class, 'update']);
});

Route::apiResource('cbt-tests', CbtTestController::class);
