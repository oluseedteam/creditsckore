<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CbtTestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CreditScoreController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CurriculumFrameworkController;
use App\Http\Controllers\CbtResultController;
use App\Http\Controllers\DirectMessageController;

// ─────────────────────────────────────────────
// Public routes (no auth required)
// ─────────────────────────────────────────────
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Web-based migration endpoint for cPanel environments where CLI lacks DOM extension
Route::get('/run-migration', function (\Illuminate\Http\Request $request) {
    $secret = $request->query('secret');
    if ($secret !== 'myscorenova-migrate' && $secret !== env('APP_KEY')) {
        return response()->json(['error' => 'Unauthorized. Provide ?secret=myscorenova-migrate'], 403);
    }

    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        return response()->json([
            'status' => 'success',
            'output' => \Illuminate\Support\Facades\Artisan::output(),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

// ─────────────────────────────────────────────
// Authenticated routes (any active/valid user)
// ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth / profile
    Route::get('/me',              [AuthController::class, 'me']);
    Route::post('/logout',         [AuthController::class, 'logout']);
    Route::put('/user/profile',    [AuthController::class, 'updateProfile']);

    // Credit scores — store allows admin to specify user_id; update/delete are scoped per-controller
    Route::post('/credit-scores',       [CreditScoreController::class, 'store']);
    Route::put('/credit-scores/{id}',   [CreditScoreController::class, 'update']);
    Route::delete('/credit-scores/{id}',[CreditScoreController::class, 'destroy']);

    // Attendance — participant logs their own aggregate
    Route::post('/attendance/log', [AttendanceController::class, 'update']);

    // CBT Tests — read-only for participants
    Route::get('/cbt-tests',          [CbtTestController::class, 'index']);
    Route::get('/cbt-tests/{id}',     [CbtTestController::class, 'show']);

    // CBT Results — participant submits and views their own
    Route::post('/cbt-results',    [CbtResultController::class, 'store']);
    Route::get('/cbt-results/me',  [CbtResultController::class, 'userResults']);

    // Curriculum — read-only for participants
    Route::get('/curriculum-frameworks',      [CurriculumFrameworkController::class, 'index']);
    Route::get('/curriculum-frameworks/{id}', [CurriculumFrameworkController::class, 'show']);

    // Direct messages — authenticated user sends a message
    Route::get('/messages',  [DirectMessageController::class, 'index']);
    Route::post('/messages', [DirectMessageController::class, 'store']);

    // ─────────────────────────────────────────
    // Admin-only routes (auth:sanctum + admin)
    // ─────────────────────────────────────────
    Route::middleware('admin')->group(function () {

        // User management
        Route::get('/users',                 [AuthController::class, 'allUsers']);
        Route::delete('/users/{id}',         [AuthController::class, 'deleteUser']);
        Route::patch('/users/{id}/status',   [AuthController::class, 'updateUserStatus']);

        // Admin marks daily attendance for any user
        Route::post('/attendance/mark', [AttendanceController::class, 'markDaily']);

        // Admin views all CBT results
        Route::get('/cbt-results', [CbtResultController::class, 'index']);

        // CBT Tests — write operations
        Route::post('/cbt-tests',                                       [CbtTestController::class, 'store']);
        Route::put('/cbt-tests/{id}',                                   [CbtTestController::class, 'update']);
        Route::delete('/cbt-tests/{id}',                                [CbtTestController::class, 'destroy']);
        Route::post('/cbt-tests/{id}/questions',                        [CbtTestController::class, 'addQuestion']);
        Route::put('/cbt-tests/{id}/questions/{questionId}',            [CbtTestController::class, 'updateQuestion']);
        Route::delete('/cbt-tests/{id}/questions/{questionId}',         [CbtTestController::class, 'destroyQuestion']);

        // Curriculum — write operations
        Route::post('/curriculum-frameworks',       [CurriculumFrameworkController::class, 'store']);
        Route::put('/curriculum-frameworks/{id}',   [CurriculumFrameworkController::class, 'update']);
        Route::delete('/curriculum-frameworks/{id}',[CurriculumFrameworkController::class, 'destroy']);
    });
});
