<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DirectMessage;
use Illuminate\Support\Facades\Mail;

class DirectMessageController extends Controller
{
    public function index()
    {
        $messages = DirectMessage::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string'
        ]);

        $user = $request->user();
        
        $msg = DirectMessage::create([
            'user_id' => $user->id ?? null,
            'name' => $user->name ?? 'Guest',
            'email' => $user->email ?? 'no-email',
            'message' => $validated['message'],
        ]);

        try {
            Mail::raw("New Inquiry from {$msg->name} ({$msg->email}):\n\n{$msg->message}", function($m) {
                $m->to('info@myscorenova.com')->subject('New Direct Concierge Inquiry');
            });
        } catch (\Exception $e) {
            // Ignore email errors if smtp isn't configured
        }

        return response()->json(['message' => 'Message sent successfully', 'data' => $msg], 201);
    }
}
