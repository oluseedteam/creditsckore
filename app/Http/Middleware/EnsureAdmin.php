<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Only allow users with role = 'admin' to proceed.
     * Returns 403 for authenticated participants or guests.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden. Admin access required.'
            ], 403);
        }

        return $next($request);
    }
}
