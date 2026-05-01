<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'participant',
        ]);

        // initialize attendance
        $user->attendance()->create(['total' => 0, 'attended' => 0]);

        // auto login
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('creditHistory', 'attendance'),
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('creditHistory', 'attendance'),
            'token' => $token
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('creditHistory', 'attendance')
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function allUsers()
    {
        $users = User::with(['creditHistory', 'attendance'])->where('role', 'participant')->get();
        return response()->json($users);
    }
}
