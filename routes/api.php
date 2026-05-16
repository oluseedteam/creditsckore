<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CbtTestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CreditScoreController;
use App\Http\Controllers\AttendanceController;

use App\Http\Controllers\CurriculumFrameworkController;
use App\Http\Controllers\CbtResultController;
use App\Http\Controllers\DirectMessageController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::get('/users', [AuthController::class, 'allUsers']);
    
    Route::post('/credit-scores', [CreditScoreController::class, 'store']);
    Route::put('/credit-scores/{id}', [CreditScoreController::class, 'update']);
    Route::delete('/credit-scores/{id}', [CreditScoreController::class, 'destroy']);
    Route::post('/attendances', [AttendanceController::class, 'update']);
    Route::post('/daily-attendances', [AttendanceController::class, 'markDaily']);
    Route::post('/cbt-results', [CbtResultController::class, 'store']);
    Route::get('/cbt-results', [CbtResultController::class, 'index']);
    Route::get('/cbt-results/me', [CbtResultController::class, 'userResults']);
    
    Route::get('/messages', [DirectMessageController::class, 'index']);
    Route::post('/messages', [DirectMessageController::class, 'store']);
    
    // User management
    Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
    Route::patch('/users/{id}/status', [AuthController::class, 'updateUserStatus']);
});

Route::apiResource('cbt-tests', CbtTestController::class);
Route::post('/cbt-tests/{id}/questions', [CbtTestController::class, 'addQuestion']);
Route::put('/cbt-tests/{id}/questions/{questionId}', [CbtTestController::class, 'updateQuestion']);
Route::delete('/cbt-tests/{id}/questions/{questionId}', [CbtTestController::class, 'destroyQuestion']);
Route::apiResource('curriculum-frameworks', CurriculumFrameworkController::class);
