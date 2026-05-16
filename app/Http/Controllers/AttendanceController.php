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

        $attendance = \App\Models\DailyAttendance::updateOrCreate(
            ['user_id' => $validated['user_id'], 'date' => $validated['date']],
            ['status' => $validated['status']]
        );

        return response()->json($attendance);
    }
}
