<?php

namespace App\Http\Controllers;

use App\Models\CbtResult;
use App\Models\CbtTest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class CbtResultController extends Controller
{
    /**
     * [Admin] View all CBT results with full test questions for deep analysis.
     * Route is protected by the 'admin' middleware at the router level.
     */
    public function index()
    {
        return response()->json(
            CbtResult::with(['test.questions', 'user'])->latest()->get()
        );
    }

    /**
     * [Participant] Submit answers for a CBT test and record the result.
     *
     * - Prevents duplicate submissions for the same test.
     * - Sends a confirmation email to the participant.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cbt_test_id'     => 'required|exists:cbt_tests,id',
            'score'           => 'required|integer|min:0',
            'total_questions' => 'required|integer|min:1',
            'answers'         => 'required|array',
        ]);

        // Prevent re-submission for the same test
        $existingResult = CbtResult::where('cbt_test_id', $validated['cbt_test_id'])
                                   ->where('user_id', Auth::id())
                                   ->first();

        if ($existingResult) {
            return response()->json(['message' => 'You have already taken this exam.'], 403);
        }

        $result = CbtResult::create([
            'cbt_test_id'     => $validated['cbt_test_id'],
            'user_id'         => Auth::id(),
            'score'           => $validated['score'],
            'total_questions' => $validated['total_questions'],
            'answers'         => $validated['answers'],
        ]);

        // Send result confirmation email
        $user = Auth::user();
        $test = CbtTest::find($validated['cbt_test_id']);

        if ($user && $test) {
            $course = $test->course;
            $score  = $validated['score'];
            $total  = $validated['total_questions'];
            $pct    = $total > 0 ? round(($score / $total) * 100) : 0;

            try {
                Mail::raw(
                    "Hello {$user->name},\n\n"
                    . "You have successfully completed the CBT Test for '{$course}'.\n\n"
                    . "Your Result: {$score}/{$total} ({$pct}%).\n\n"
                    . "You can review your performance in your dashboard.\n\n"
                    . "Best,\nMyScoreNova Team",
                    function ($m) use ($user, $course) {
                        $m->to($user->email)->subject("MyScoreNova – CBT Result: {$course}");
                    }
                );
            } catch (\Exception $e) {
                // Silently ignore email failure when SMTP is not configured
            }
        }

        return response()->json([
            'message' => 'Test result saved successfully',
            'result'  => $result,
        ], 201);
    }

    /**
     * [Participant] View the authenticated user's own CBT results.
     */
    public function userResults()
    {
        return response()->json(
            CbtResult::with('test')->where('user_id', Auth::id())->latest()->get()
        );
    }
}
