<?php

namespace App\Http\Controllers;

use App\Models\DirectMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class DirectMessageController extends Controller
{
    /**
     * [Admin] List all direct messages ordered by newest first.
     */
    public function index()
    {
        $messages = DirectMessage::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($messages);
    }

    /**
     * [Authenticated user] Send a direct message / concierge inquiry.
     * The user is always authenticated at this route, so nulls are not possible.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $user = $request->user();

        $msg = DirectMessage::create([
            'user_id' => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'message' => $validated['message'],
        ]);

        try {
            Mail::raw(
                "New Inquiry from {$msg->name} ({$msg->email}):\n\n{$msg->message}",
                function ($m) {
                    $m->to('info@myscorenova.com')->subject('New Direct Concierge Inquiry');
                }
            );
        } catch (\Exception $e) {
            // Silently ignore email errors when SMTP is not configured
        }

        return response()->json([
            'message' => 'Message sent successfully',
            'data'    => $msg,
        ], 201);
    }
}
