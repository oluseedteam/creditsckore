<?php

namespace App\Http\Controllers;

use App\Models\CbtResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\CbtTest;

class CbtResultController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cbt_test_id' => 'required|exists:cbt_tests,id',
            'score' => 'required|integer',
            'total_questions' => 'required|integer',
            'answers' => 'required|array',
        ]);

        $existingResult = CbtResult::where('cbt_test_id', $validated['cbt_test_id'])
            ->where('user_id', Auth::id())
            ->first();

        if ($existingResult) {
            return response()->json(['message' => 'You have already taken this exam.'], 403);
        }

        $result = CbtResult::create([
            'cbt_test_id' => $validated['cbt_test_id'],
            'user_id' => Auth::id(),
            'score' => $validated['score'],
            'total_questions' => $validated['total_questions'],
            'answers' => $validated['answers'],
        ]);

        $user = Auth::user();
        $test = CbtTest::find($validated['cbt_test_id']);
        
        if ($user && $test) {
            $course = $test->course;
            $score = $validated['score'];
            $total = $validated['total_questions'];
            $pct = round(($score / $total) * 100);
            
            try {
                Mail::raw("Hello {$user->name},\n\nYou have successfully completed the CBT Test for '{$course}'.\n\nYour Result: {$score}/{$total} ({$pct}%).\n\nYou can review your performance in your dashboard.\n\nBest,\nMyScoreNova Team", function($m) use ($user, $course) {
                    $m->to($user->email)->subject("MyScoreNova - CBT Result: {$course}");
                });
            } catch (\Exception $e) {
                // Ignore email failure
            }
        }

        return response()->json(['message' => 'Test result saved successfully', 'result' => $result], 201);
    }

    public function index()
    {
        // Admin view all results with questions for deep analysis
        return response()->json(CbtResult::with(['test.questions', 'user'])->latest()->get());
    }

    public function userResults()
    {
        return response()->json(CbtResult::with('test')->where('user_id', Auth::id())->latest()->get());
    }
}
