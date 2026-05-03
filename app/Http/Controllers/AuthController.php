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
            'user' => $user->load('creditHistory', 'attendance', 'cbtResults.test'),
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

        if ($user->status === 'suspended') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended. Please contact support.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('creditHistory', 'attendance', 'cbtResults.test'),
            'token' => $token
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if ($user->status === 'suspended') {
            return response()->json(['message' => 'Account suspended'], 403);
        }
        return response()->json([
            'user' => $user->load('creditHistory', 'attendance', 'cbtResults.test')
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function allUsers()
    {
        $users = User::with(['creditHistory', 'attendance', 'cbtResults.test'])->where('role', 'participant')->get();
        return response()->json($users);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function updateUserStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:active,suspended'
        ]);

        $user = User::findOrFail($id);
        $user->update(['status' => $validated['status']]);

        return response()->json(['message' => 'User status updated', 'user' => $user]);
    }
}
