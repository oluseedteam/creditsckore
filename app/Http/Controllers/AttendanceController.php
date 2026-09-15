<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\DailyAttendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * [Participant] Manually sync the aggregate attendance totals for the
     * authenticated user (used when the front-end recalculates totals).
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'total'    => 'required|integer|min:0',
            'attended' => 'required|integer|min:0',
        ]);

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['total' => $validated['total'], 'attended' => $validated['attended']]
        );

        return response()->json($attendance);
    }

    /**
     * [Admin] Mark a daily attendance entry for any user.
     *
     * - Creates or updates the DailyAttendance record for the given date.
     * - Keeps the aggregate Attendance record in sync:
     *     • 'total'    increments on every NEW daily record (first mark for that date).
     *     • 'attended' increments when the status is 'present'; decrements when
     *       an existing 'present' record is changed to 'absent'.
     */
    public function markDaily(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date'    => 'required|date',
            'status'  => 'required|in:present,absent',
        ]);

        // Fetch the existing daily record (if any) before upserting
        $existing = DailyAttendance::where('user_id', $validated['user_id'])
                                   ->where('date',    $validated['date'])
                                   ->first();

        $isNew         = $existing === null;
        $previousStatus = $existing?->status;

        // Upsert the daily record
        $dailyAttendance = DailyAttendance::updateOrCreate(
            ['user_id' => $validated['user_id'], 'date' => $validated['date']],
            ['status'  => $validated['status']]
        );

        // Sync the aggregate record
        $agg = Attendance::firstOrCreate(
            ['user_id' => $validated['user_id']],
            ['total'   => 0, 'attended' => 0]
        );

        if ($isNew) {
            // Brand-new daily record — always increment total
            $agg->increment('total');

            if ($validated['status'] === 'present') {
                $agg->increment('attended');
            }
        } else {
            // Existing record — only adjust 'attended' when status actually changed
            if ($previousStatus !== $validated['status']) {
                if ($validated['status'] === 'present') {
                    $agg->increment('attended');   // absent → present
                } else {
                    $agg->decrement('attended');   // present → absent
                }
            }
        }

        return response()->json($dailyAttendance);
    }
}
