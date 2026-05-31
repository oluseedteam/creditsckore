<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'total' => 'required|integer',
            'attended' => 'required|integer',
        ]);

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['total' => $validated['total'], 'attended' => $validated['attended']]
        );

        return response()->json($attendance);
    }

    public function markDaily(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent',
        ]);

        $attendanceDaily = \App\Models\DailyAttendance::updateOrCreate(
            ['user_id' => $validated['user_id'], 'date' => $validated['date']],
            ['status' => $validated['status']]
        );

        // Update aggregate attendance - increment 'attended' if status is present
        if ($validated['status'] === 'present') {
            $agg = \App\Models\Attendance::firstOrCreate(
                ['user_id' => $validated['user_id']],
                ['total' => 0, 'attended' => 0]
            );
            $agg->increment('attended');
        }

        return response()->json($attendanceDaily);
    }
}
