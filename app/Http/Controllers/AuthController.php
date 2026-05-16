<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;

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
            'status' => 'pending',
        ]);

        // initialize attendance
        $user->attendance()->create(['total' => 0, 'attended' => 0]);

        // Do not auto-login, return pending status
        return response()->json([
            'message' => 'Verification pending. Please wait for admin approval.'
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

        if ($user->status === 'pending') {
            throw ValidationException::withMessages([
                'email' => ['Verification pending. Please wait for admin approval.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('creditHistory', 'attendance', 'cbtResults.test', 'dailyAttendances'),
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
            'user' => $user->load('creditHistory', 'attendance', 'cbtResults.test', 'dailyAttendances')
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'about' => 'nullable|string',
            'profile_picture' => 'nullable|string'
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('creditHistory', 'attendance', 'cbtResults.test', 'dailyAttendances')
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function allUsers()
    {
        $users = User::with(['creditHistory', 'attendance', 'cbtResults.test', 'dailyAttendances'])->where('role', 'participant')->get();
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
            'status' => 'required|string|in:active,suspended,pending'
        ]);

        $user = User::findOrFail($id);
        $oldStatus = $user->status;
        $user->update(['status' => $validated['status']]);

        if ($oldStatus === 'pending' && $validated['status'] === 'active') {
            try {
                Mail::raw("Congratulations {$user->name},\n\nYour account has been successfully verified! You can now log in to the portal and access your dashboard.\n\nBest Regards,\nMyScoreNova Team", function($m) use ($user) {
                    $m->to($user->email)->subject('MyScoreNova - Account Verified');
                });
            } catch (\Exception $e) {
                // Ignore email errors if smtp isn't configured
            }
        }

        return response()->json(['message' => 'User status updated', 'user' => $user]);
    }
}
