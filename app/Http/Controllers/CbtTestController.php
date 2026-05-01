<?php

namespace App\Http\Controllers;

use App\Models\CbtTest;
use Illuminate\Http\Request;

class CbtTestController extends Controller
{
    public function index()
    {
        $tests = CbtTest::with('questions')->get();
        return response()->json($tests);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'timeLapsMinutes' => 'required|integer',
            'questions' => 'required|array',
            'questions.*.text' => 'required|string',
            'questions.*.options.A' => 'required|string',
            'questions.*.options.B' => 'required|string',
            'questions.*.options.C' => 'required|string',
            'questions.*.options.D' => 'required|string',
            'questions.*.correctAnswer' => 'required|string|in:A,B,C,D',
        ]);

        $test = CbtTest::create([
            'subject' => $validated['subject'],
            'timeLapsMinutes' => $validated['timeLapsMinutes'],
        ]);

        foreach ($validated['questions'] as $q) {
            $test->questions()->create([
                'text' => $q['text'],
                'option_a' => $q['options']['A'],
                'option_b' => $q['options']['B'],
                'option_c' => $q['options']['C'],
                'option_d' => $q['options']['D'],
                'correct_answer' => $q['correctAnswer'],
            ]);
        }

        return response()->json(['message' => 'CBT Test created successfully', 'test' => $test->load('questions')], 201);
    }

    public function show($id)
    {
        $test = CbtTest::with('questions')->findOrFail($id);
        
        // Randomize questions for the participant taking the test
        $questions = $test->questions->shuffle();
        $test->setRelation('questions', $questions);

        return response()->json($test);
    }
}
