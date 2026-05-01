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
}
