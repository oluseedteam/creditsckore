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
            'course' => 'required|string|max:255',
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
            'course' => $validated['course'],
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

    public function update(Request $request, $id)
    {
        $test = CbtTest::findOrFail($id);
        
        $validated = $request->validate([
            'course' => 'sometimes|string|max:255',
            'timeLapsMinutes' => 'sometimes|integer',
            'status' => 'sometimes|in:draft,published',
        ]);

        $test->update($validated);

        return response()->json(['message' => 'CBT Test updated', 'test' => $test]);
    }

    public function show($id)
    {
        $test = CbtTest::with('questions')->findOrFail($id);
        return response()->json($test);
    }

    public function addQuestion(Request $request, $id)
    {
        $test = CbtTest::findOrFail($id);

        $validated = $request->validate([
            'text' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_answer' => 'required|string|in:A,B,C,D',
        ]);

        $question = $test->questions()->create($validated);

        return response()->json(['message' => 'Question added successfully', 'question' => $question], 201);
    }

    public function updateQuestion(Request $request, $id, $questionId)
    {
        $test = CbtTest::findOrFail($id);
        $question = $test->questions()->findOrFail($questionId);

        $validated = $request->validate([
            'text' => 'sometimes|string',
            'option_a' => 'sometimes|string',
            'option_b' => 'sometimes|string',
            'option_c' => 'sometimes|string',
            'option_d' => 'sometimes|string',
            'correct_answer' => 'sometimes|string|in:A,B,C,D',
        ]);

        $question->update($validated);

        return response()->json(['message' => 'Question updated successfully', 'question' => $question]);
    }

    public function destroyQuestion($id, $questionId)
    {
        $test = CbtTest::findOrFail($id);
        $question = $test->questions()->findOrFail($questionId);
        $question->delete();

        return response()->json(['message' => 'Question deleted successfully']);
    }

    public function destroy($id)
    {
        $test = CbtTest::findOrFail($id);
        $test->delete();

        return response()->json(['message' => 'CBT Test deleted successfully']);
    }
}
