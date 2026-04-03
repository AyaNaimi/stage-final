<?php

namespace App\Http\Controllers;

use App\Models\MedicalDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MedicalDocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return MedicalDocument::with('employe')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'examen_medical_id' => 'nullable|exists:examen_medicals,id',
            'nom' => 'required|string',
            'type' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'date_document' => 'required|date',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('medical_documents', 'public');
            $validated['chemin_fichier'] = $path;
        }

        $document = MedicalDocument::create($validated);
        return response()->json($document, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return MedicalDocument::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $document = MedicalDocument::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'string',
            'type' => 'nullable|string',
            'date_document' => 'date',
        ]);

        $document->update($validated);
        return response()->json($document);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $document = MedicalDocument::findOrFail($id);
        
        if ($document->chemin_fichier) {
            Storage::disk('public')->delete($document->chemin_fichier);
        }
        
        $document->delete();
        return response()->json(null, 204);
    }

    public function getByEmploye($employeId)
    {
        return MedicalDocument::where('employe_id', $employeId)->get();
    }
}
