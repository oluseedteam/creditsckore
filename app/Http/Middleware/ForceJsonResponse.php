<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Ensure API routes always negotiate JSON (never HTML redirects/pages).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        if (!$request->headers->has('Authorization')) {
            $auth = $request->server('HTTP_AUTHORIZATION')
                ?? $request->server('REDIRECT_HTTP_AUTHORIZATION');

            if (!$auth && function_exists('apache_request_headers')) {
                $headers = apache_request_headers();
                $auth = $headers['Authorization'] ?? $headers['authorization'] ?? null;
            }

            if ($auth) {
                $request->headers->set('Authorization', $auth);
            }
        }

        return $next($request);
    }
}

