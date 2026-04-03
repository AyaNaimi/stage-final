<?php

namespace App\Http\Controllers;

use App\Models\MedicalRestriction;
use Illuminate\Http\Request;

class MedicalRestrictionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return MedicalRestriction::with('employe')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'examen_medical_id' => 'nullable|exists:examen_medicals,id',
            'description' => 'required|string',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date',
            'est_permanent' => 'boolean',
            'statut' => 'string|in:active,inactive',
        ]);

        $restriction = MedicalRestriction::create($validated);
        return response()->json($restriction, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return MedicalRestriction::with(['employe', 'examenMedical'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $restriction = MedicalRestriction::findOrFail($id);

        $validated = $request->validate([
            'description' => 'string',
            'date_debut' => 'date',
            'date_fin' => 'nullable|date',
            'est_permanent' => 'boolean',
            'statut' => 'string|in:active,inactive',
        ]);

        $restriction->update($validated);
        return response()->json($restriction);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $restriction = MedicalRestriction::findOrFail($id);
        $restriction->delete();
        return response()->json(null, 204);
    }

    public function getActiveByEmploye($employeId)
    {
        return MedicalRestriction::where('employe_id', $employeId)
            ->where('statut', 'active')
            ->where(function($query) {
                $query->whereNull('date_fin')
                      ->orWhere('date_fin', '>=', now());
            })
            ->get();
    }
}
