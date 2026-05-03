<?php

namespace App\Http\Controllers;

use App\Models\CurriculumFramework;
use Illuminate\Http\Request;

class CurriculumFrameworkController extends Controller
{
    public function index()
    {
        $curriculums = CurriculumFramework::with('cbtTest')->orderBy('week')->get();
        return response()->json($curriculums);
    }

    public function store(Request $request)
    {
        if ($request->has('topics') && is_string($request->topics)) {
            $request->merge(['topics' => json_decode($request->topics, true)]);
        }
        
        if ($request->cbt_test_id === '' || $request->cbt_test_id === 'null') {
            $request->merge(['cbt_test_id' => null]);
        }

        $validated = $request->validate([
            'week' => 'required|integer',
            'title' => 'required|string',
            'topics' => 'nullable|array',
            'cbt_test_id' => 'nullable|exists:cbt_tests,id',
            'content' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240'
        ]);

        $data = $validated;
        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('curriculum', 'public');
        }

        $curriculum = CurriculumFramework::create($data);
        return response()->json(['message' => 'Curriculum created successfully', 'curriculum' => $curriculum->load('cbtTest')], 201);
    }

    public function update(Request $request, $id)
    {
        $curriculum = CurriculumFramework::findOrFail($id);

        if ($request->has('topics') && is_string($request->topics)) {
            $request->merge(['topics' => json_decode($request->topics, true)]);
        }
        
        if ($request->cbt_test_id === '' || $request->cbt_test_id === 'null') {
            $request->merge(['cbt_test_id' => null]);
        }

        $validated = $request->validate([
            'week' => 'integer',
            'title' => 'string',
            'topics' => 'nullable|array',
            'cbt_test_id' => 'nullable|exists:cbt_tests,id',
            'content' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240'
        ]);

        $data = $validated;
        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('curriculum', 'public');
        }

        $curriculum->update($data);
        return response()->json(['message' => 'Curriculum updated successfully', 'curriculum' => $curriculum->load('cbtTest')]);
    }

    public function destroy($id)
    {
        $curriculum = CurriculumFramework::findOrFail($id);
        $curriculum->delete();
        return response()->json(['message' => 'Curriculum deleted successfully']);
    }
}
