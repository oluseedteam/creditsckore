<?php

namespace App\Http\Controllers;

use App\Models\CurriculumFramework;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CurriculumFrameworkController extends Controller
{
    /**
     * [Public for authenticated users] List all curriculum weeks in order.
     */
    public function index()
    {
        $curriculums = CurriculumFramework::with('cbtTest')->orderBy('week')->get();
        return response()->json($curriculums);
    }

    /**
     * [Public for authenticated users] Show a single curriculum entry.
     */
    public function show($id)
    {
        $curriculum = CurriculumFramework::with('cbtTest')->findOrFail($id);
        return response()->json($curriculum);
    }

    /**
     * [Admin] Create a new curriculum framework entry.
     */
    public function store(Request $request)
    {
        // Decode JSON-encoded topics string (sent from multipart forms)
        if ($request->has('topics') && is_string($request->topics)) {
            $request->merge(['topics' => json_decode($request->topics, true)]);
        }

        // Treat empty/null string as actual null for the FK
        if ($request->cbt_test_id === '' || $request->cbt_test_id === 'null') {
            $request->merge(['cbt_test_id' => null]);
        }

        $validated = $request->validate([
            'week'       => 'required|integer',
            'title'      => 'required|string',
            'topics'     => 'nullable|array',
            'cbt_test_id'=> 'nullable|exists:cbt_tests,id',
            'content'    => 'nullable|string',
            'file'       => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $data = $validated;

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('curriculum', 'public');
        }

        $curriculum = CurriculumFramework::create($data);

        return response()->json([
            'message'    => 'Curriculum created successfully',
            'curriculum' => $curriculum->load('cbtTest'),
        ], 201);
    }

    /**
     * [Admin] Update an existing curriculum entry.
     * Deletes the previous uploaded file when a new one is supplied.
     */
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
            'week'        => 'sometimes|integer',
            'title'       => 'sometimes|string',
            'topics'      => 'nullable|array',
            'cbt_test_id' => 'nullable|exists:cbt_tests,id',
            'content'     => 'nullable|string',
            'file'        => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $data = $validated;

        if ($request->hasFile('file')) {
            // Delete the previous file to avoid orphaned storage entries
            if ($curriculum->file_path && Storage::disk('public')->exists($curriculum->file_path)) {
                Storage::disk('public')->delete($curriculum->file_path);
            }
            $data['file_path'] = $request->file('file')->store('curriculum', 'public');
        }

        $curriculum->update($data);

        return response()->json([
            'message'    => 'Curriculum updated successfully',
            'curriculum' => $curriculum->load('cbtTest'),
        ]);
    }

    /**
     * [Admin] Delete a curriculum entry and its associated uploaded file.
     */
    public function destroy($id)
    {
        $curriculum = CurriculumFramework::findOrFail($id);

        // Clean up stored file before deleting the record
        if ($curriculum->file_path && Storage::disk('public')->exists($curriculum->file_path)) {
            Storage::disk('public')->delete($curriculum->file_path);
        }

        $curriculum->delete();

        return response()->json(['message' => 'Curriculum deleted successfully']);
    }
}
