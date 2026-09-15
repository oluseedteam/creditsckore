<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new participant.
     * Account starts as 'pending' — admin must approve before login is allowed.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'role'     => 'participant',
            'status'   => 'pending',
        ]);

        // Initialise an empty attendance record for this user
        $user->attendance()->create(['total' => 0, 'attended' => 0]);

        return response()->json([
            'message' => 'Registration successful. Your account is pending admin approval.'
        ], 201);
    }

    /**
     * Authenticate a user and return a Sanctum token.
     * Blocks pending and suspended accounts with clear error messages.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !$user->verifyPassword($validated['password'])) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // Re-hash legacy plain-text passwords transparently
        $user->rehashPasswordIfRequired($validated['password']);

        // Check status — pending before suspended so the user gets the most actionable message
        if ($user->status === 'pending') {
            throw ValidationException::withMessages([
                'email' => ['Your account is pending admin approval. Please wait for verification.'],
            ]);
        }

        if ($user->status === 'suspended') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended. Please contact support.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user->load('creditHistory', 'attendance', 'cbtResults.test', 'dailyAttendances'),
            'token' => $token,
        ]);
    }

    /**
     * Return the currently authenticated user's full profile.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if ($user->status === 'suspended') {
            return response()->json(['message' => 'Your account has been suspended.'], 403);
        }

        return response()->json([
            'user' => $user->load('creditHistory', 'attendance', 'cbtResults.test', 'dailyAttendances')
        ]);
    }

    /**
     * Update the authenticated user's own profile fields.
     */
    public function updateProfile(Request $request)
    {
        $user      = $request->user();
        $validated = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'about'           => 'nullable|string',
            'profile_picture' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user->load('creditHistory', 'attendance', 'cbtResults.test', 'dailyAttendances')
        ]);
    }

    /**
     * Revoke the current access token (logout).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * [Admin] List all users.
     * Supports optional ?status= filter (active | suspended | pending).
     * Defaults to returning ALL users (including pending) so admin can see who needs approval.
     */
    public function allUsers(Request $request)
    {
        $query = User::with(['creditHistory', 'attendance', 'cbtResults.test', 'dailyAttendances'])
                     ->where('role', 'participant');

        if ($request->filled('status')) {
            $request->validate(['status' => 'in:active,suspended,pending']);
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    /**
     * [Admin] Permanently delete a user account.
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * [Admin] Approve (active) or suspend a user account.
     * Allowed transitions: pending → active, active ↔ suspended.
     * Sends an approval email when status moves from 'pending' to 'active'.
     */
    public function updateUserStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:active,suspended',
        ]);

        $user      = User::findOrFail($id);
        $oldStatus = $user->status;
        $user->update(['status' => $validated['status']]);

        // Send approval email when admin activates a previously pending account
        if ($oldStatus === 'pending' && $validated['status'] === 'active') {
            try {
                Mail::to($user->email)->send(new \App\Mail\AccountVerified($user));
            } catch (\Exception $e) {
                // Silently ignore email errors when SMTP is not configured
            }
        }

        return response()->json(['message' => 'User status updated', 'user' => $user]);
    }
}
