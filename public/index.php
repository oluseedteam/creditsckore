<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Polyfill for mb_split if mbstring extension is disabled on host
if (!function_exists('mb_split')) {
    function mb_split(string $pattern, string $string, int $limit = -1)
    {
        $delimiter = '/';
        return preg_split($delimiter . str_replace($delimiter, '\\' . $delimiter, $pattern) . $delimiter . 'u', $string, $limit);
    }
}

// Normalize Authorization header across CGI / FastCGI / cPanel environments
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        if ($auth) {
            $_SERVER['HTTP_AUTHORIZATION'] = $auth;
        }
    }
}

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());

