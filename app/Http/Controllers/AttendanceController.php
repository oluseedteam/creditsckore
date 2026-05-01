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
}
