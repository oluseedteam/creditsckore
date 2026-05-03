<?php

namespace App\Http\Controllers;

use App\Models\CreditScore;
use Illuminate\Http\Request;

class CreditScoreController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|string',
            'score' => 'required|integer',
            'note' => 'nullable|string',
        ]);

        $score = CreditScore::updateOrCreate(
            ['user_id' => $request->user()->id, 'month' => $validated['month']],
            ['score' => $validated['score'], 'note' => $validated['note']]
        );

        return response()->json($score);
    }
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'score' => 'required|integer',
            'note' => 'nullable|string',
        ]);

        $score = CreditScore::where('user_id', $request->user()->id)->findOrFail($id);
        $score->update($validated);
        return response()->json($score);
    }

    public function destroy(Request $request, $id)
    {
        $score = CreditScore::where('user_id', $request->user()->id)->findOrFail($id);
        $score->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
