<?php

namespace App\Http\Controllers;

use App\Models\CbtResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        $result = CbtResult::create([
            'cbt_test_id' => $validated['cbt_test_id'],
            'user_id' => Auth::id(),
            'score' => $validated['score'],
            'total_questions' => $validated['total_questions'],
            'answers' => $validated['answers'],
        ]);

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
