<?php

namespace App\Http\Controllers;

use App\Models\SSTPayment;
use App\Models\Visite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SSTPaymentController extends Controller
{
    public function index()
    {
        return response()->json(SSTPayment::with(['practitioner', 'visits'])->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'practitioner_id' => 'required|exists:sst_practitioners,id',
            'amount' => 'required|numeric',
            'reference' => 'nullable|string',
            'status' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'visit_ids' => 'nullable|array',
            'visit_ids.*' => 'exists:visites,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $payment = SSTPayment::create([
                'practitioner_id' => $validated['practitioner_id'],
                'amount' => $validated['amount'],
                'reference' => $validated['reference'] ?? null,
                'status' => $validated['status'] ?? 'Validé',
                'payment_date' => $validated['payment_date'] ?? now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            if (!empty($validated['visit_ids'])) {
                $payment->visits()->attach($validated['visit_ids']);
                
                // Update visit status to 'Payé'
                Visite::whereIn('id', $validated['visit_ids'])->update(['payment_status' => 'Payé']);
            }

            return response()->json($payment->load(['practitioner', 'visits']), 201);
        });
    }

    public function show($id)
    {
        return response()->json(SSTPayment::with(['practitioner', 'visits'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $payment = SSTPayment::findOrFail($id);
        
        $validated = $request->validate([
            'amount' => 'sometimes|required|numeric',
            'reference' => 'nullable|string',
            'status' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);
        return response()->json($payment);
    }

    public function destroy($id)
    {
        $payment = SSTPayment::findOrFail($id);
        
        // Before deleting, reset visit statuses?
        Visite::whereIn('id', $payment->visits->pluck('id'))->update(['payment_status' => 'Validé']);
        
        $payment->delete();
        return response()->json(null, 204);
    }
}
