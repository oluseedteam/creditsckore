<?php

namespace App\Http\Controllers;

use App\Models\CreditScore;
use Illuminate\Http\Request;

class CreditScoreController extends Controller
{
    /**
     * Create or update a credit score entry.
     *
     * - Admin: may supply 'user_id' to set a score for any participant.
     * - Participant: score is always written to their own account.
     */
    public function store(Request $request)
    {
        $isAdmin = $request->user()->role === 'admin';

        $rules = [
            'month' => 'required|string',
            'score' => 'required|integer',
            'note'  => 'nullable|string',
        ];

        if ($isAdmin) {
            $rules['user_id'] = 'sometimes|exists:users,id';
        }

        $validated = $request->validate($rules);

        // Admin can target any user; participant always writes to themselves
        $userId = ($isAdmin && isset($validated['user_id']))
            ? $validated['user_id']
            : $request->user()->id;

        $score = CreditScore::updateOrCreate(
            ['user_id' => $userId, 'month' => $validated['month']],
            ['score'   => $validated['score'], 'note' => $validated['note'] ?? null]
        );

        return response()->json($score);
    }

    /**
     * Update an existing credit score entry.
     *
     * - Admin: can update any user's score by ID.
     * - Participant: can only update their own scores.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'score' => 'required|integer',
            'note'  => 'nullable|string',
        ]);

        $query = $request->user()->role === 'admin'
            ? CreditScore::query()
            : CreditScore::where('user_id', $request->user()->id);

        $score = $query->findOrFail($id);
        $score->update($validated);

        return response()->json($score);
    }

    /**
     * Delete a credit score entry.
     *
     * - Admin: can delete any user's score by ID.
     * - Participant: can only delete their own scores.
     */
    public function destroy(Request $request, $id)
    {
        $query = $request->user()->role === 'admin'
            ? CreditScore::query()
            : CreditScore::where('user_id', $request->user()->id);

        $score = $query->findOrFail($id);
        $score->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
