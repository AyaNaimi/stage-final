<?php

namespace App\Http\Controllers;

use App\Models\SSTPractitioner;
use App\Models\CorpsMedical;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

class SSTPractitionerController extends Controller
{
    private static ?bool $hasContractTypeColumn = null;
    private static ?bool $hasRemunerationAmountColumn = null;
    private static ?bool $hasRemunerationTypeColumn = null;
    private static ?bool $hasServiceColumn = null;

    private function supportsFinancialColumns(): bool
    {
        if (self::$hasContractTypeColumn === null) {
            self::$hasContractTypeColumn = Schema::hasColumn('sst_practitioners', 'contract_type');
        }
        if (self::$hasRemunerationAmountColumn === null) {
            self::$hasRemunerationAmountColumn = Schema::hasColumn('sst_practitioners', 'remuneration_amount');
        }
        if (self::$hasRemunerationTypeColumn === null) {
            self::$hasRemunerationTypeColumn = Schema::hasColumn('sst_practitioners', 'remuneration_type');
        }
        if (self::$hasServiceColumn === null) {
            self::$hasServiceColumn = Schema::hasColumn('sst_practitioners', 'service');
        }

        return self::$hasContractTypeColumn
            && self::$hasRemunerationAmountColumn
            && self::$hasRemunerationTypeColumn
            && self::$hasServiceColumn;
    }

    private function toPublicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // Return a proxy URL that points to our controller method
        $cleanPath = ltrim($path, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        // Use url() to generate an absolute link to the proxy route
        return url('api/sst-practitioners/file?path=' . $cleanPath);
    }

    public function serveFile(Request $request)
    {
        $path = $request->query('path');
        if (!$path) {
            return response()->json(['error' => 'No path provided'], 400);
        }

        // Security: ensure the path doesn't try to go outside storage
        if (str_contains($path, '..')) {
            return response()->json(['error' => 'Invalid path'], 403);
        }

        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['error' => 'File not found at ' . $path], 404);
        }

        return response()->file(Storage::disk('public')->path($path));
    }

    private function formatPractitioner(SSTPractitioner $practitioner): array
    {
        $otherDocs = is_array($practitioner->other_docs) ? $practitioner->other_docs : [];

        return [
            'id' => $practitioner->id,
            'name' => $practitioner->name,
            'first_name' => $practitioner->first_name,
            'firstName' => $practitioner->first_name,
            'nom' => $practitioner->name,
            'prenom' => $practitioner->first_name,
            'specialty' => $practitioner->specialty,
            'specialite' => $practitioner->specialty,
            'type' => $practitioner->type,
            'phone' => $practitioner->phone,
            'telephone' => $practitioner->phone,
            'email' => $practitioner->email,
            'photo' => $this->toPublicUrl($practitioner->photo),
            'diplome' => $this->toPublicUrl($practitioner->diplome),
            'other_docs' => array_map(fn ($doc) => $this->toPublicUrl($doc), $otherDocs),
            'otherDocs' => array_map(fn ($doc) => $this->toPublicUrl($doc), $otherDocs),
            'status' => $practitioner->status,
            'statut' => $practitioner->status,
            'contract_type' => $practitioner->contract_type,
            'remuneration_amount' => $practitioner->remuneration_amount,
            'remuneration_type' => $practitioner->remuneration_type,
            'service' => $practitioner->service,
            'created_at' => $practitioner->created_at,
            'updated_at' => $practitioner->updated_at,
        ];
    }

    private function formatCorpsMedicalAsPractitioner(CorpsMedical $doctor): array
    {
        $otherDocs = is_array($doctor->autres_documents) ? $doctor->autres_documents : [];

        return [
            'id' => $doctor->id,
            'name' => $doctor->nom,
            'first_name' => $doctor->prenom,
            'firstName' => $doctor->prenom,
            'nom' => $doctor->nom,
            'prenom' => $doctor->prenom,
            'specialty' => $doctor->specialite,
            'specialite' => $doctor->specialite,
            'type' => $doctor->type,
            'phone' => $doctor->telephone,
            'telephone' => $doctor->telephone,
            'email' => $doctor->email,
            'photo' => $this->toPublicUrl($doctor->photo),
            'diplome' => $this->toPublicUrl($doctor->diplome),
            'other_docs' => array_map(fn ($doc) => $this->toPublicUrl($doc), $otherDocs),
            'otherDocs' => array_map(fn ($doc) => $this->toPublicUrl($doc), $otherDocs),
            'status' => $doctor->statut,
            'statut' => $doctor->statut,
            'contract_type' => null,
            'remuneration_amount' => null,
            'remuneration_type' => 'fixed',
            'service' => null,
            'created_at' => $doctor->created_at,
            'updated_at' => $doctor->updated_at,
        ];
    }

    public function index()
    {
        $practitioners = SSTPractitioner::all()->map(fn (SSTPractitioner $item) => $this->formatPractitioner($item));
        $fallback = CorpsMedical::all()->map(fn (CorpsMedical $item) => $this->formatCorpsMedicalAsPractitioner($item));

        // Merge both lists; SSTPractitioner first, then fallback
        return response()->json($practitioners->merge($fallback));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'firstName' => 'required|string',
            'specialty' => 'required|string',
            'type' => 'required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'diplome' => 'nullable|file|mimes:pdf,jpg,jpeg,png,docx,doc|max:10240',
            'otherDocs' => 'nullable|array',
            'otherDocs.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,docx,doc|max:10240',
        ]);

        $data = [
            'name' => $validated['name'],
            'first_name' => $validated['firstName'],
            'specialty' => $validated['specialty'],
            'type' => $validated['type'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'status' => 'Actif',
        ];

        if ($this->supportsFinancialColumns()) {
            $data['contract_type'] = $request->contract_type;
            $data['remuneration_amount'] = $request->remuneration_amount;
            $data['remuneration_type'] = $request->remuneration_type ?? 'fixed';
            $data['service'] = $request->service;
        }

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('sst-practitioners/photos', 'public');
        }

        if ($request->hasFile('diplome')) {
            $data['diplome'] = $request->file('diplome')->store('sst-practitioners/diplomes', 'public');
        }

        $otherDocsFiles = $request->file('otherDocs') ?? [];
        if (!is_array($otherDocsFiles) && $otherDocsFiles) {
            $otherDocsFiles = [$otherDocsFiles];
        }

        if (!empty($otherDocsFiles)) {
            $docs = [];
            foreach ($otherDocsFiles as $file) {
                $docs[] = $file->store('sst-practitioners/documents', 'public');
            }
            $data['other_docs'] = $docs;
        }

        $practitioner = SSTPractitioner::create($data);

        return response()->json($this->formatPractitioner($practitioner), 201);
    }

    public function show($id)
    {
        $practitioner = SSTPractitioner::findOrFail($id);
        return response()->json($this->formatPractitioner($practitioner));
    }

    public function update(Request $request, $id)
    {
        $practitioner = SSTPractitioner::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'firstName' => 'sometimes|required|string',
            'specialty' => 'sometimes|required|string',
            'type' => 'sometimes|required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'status' => 'nullable|string',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'diplome' => 'nullable|file|mimes:pdf,jpg,jpeg,png,docx,doc|max:10240',
            'otherDocs' => 'nullable|array',
            'otherDocs.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,docx,doc|max:10240',
        ]);

        $data = [];
        if (isset($validated['name'])) $data['name'] = $validated['name'];
        if (isset($validated['firstName'])) $data['first_name'] = $validated['firstName'];
        if (isset($validated['specialty'])) $data['specialty'] = $validated['specialty'];
        if (isset($validated['type'])) $data['type'] = $validated['type'];
        if (isset($validated['phone'])) $data['phone'] = $validated['phone'];
        if (isset($validated['email'])) $data['email'] = $validated['email'];
        if (isset($validated['status'])) $data['status'] = $validated['status'];
        if ($this->supportsFinancialColumns()) {
            if ($request->has('contract_type')) $data['contract_type'] = $request->contract_type;
            if ($request->has('remuneration_amount')) $data['remuneration_amount'] = $request->remuneration_amount;
            if ($request->has('remuneration_type')) $data['remuneration_type'] = $request->remuneration_type;
            if ($request->has('service')) $data['service'] = $request->service;
        }

        if ($request->hasFile('photo')) {
            if ($practitioner->photo) {
                Storage::disk('public')->delete($practitioner->photo);
            }
            $data['photo'] = $request->file('photo')->store('sst-practitioners/photos', 'public');
        }

        if ($request->hasFile('diplome')) {
            if ($practitioner->diplome) {
                Storage::disk('public')->delete($practitioner->diplome);
            }
            $data['diplome'] = $request->file('diplome')->store('sst-practitioners/diplomes', 'public');
        }

        $otherDocsFiles = $request->file('otherDocs') ?? [];
        if (!is_array($otherDocsFiles) && $otherDocsFiles) {
            $otherDocsFiles = [$otherDocsFiles];
        }

        if (!empty($otherDocsFiles)) {
            $currentDocs = is_array($practitioner->other_docs) ? $practitioner->other_docs : [];
            $newDocs = [];
            foreach ($otherDocsFiles as $file) {
                $newDocs[] = $file->store('sst-practitioners/documents', 'public');
            }
            $data['other_docs'] = array_merge($currentDocs, $newDocs);
        }

        $practitioner->update($data);
        $practitioner->refresh();

        return response()->json($this->formatPractitioner($practitioner));
    }

    public function destroy($id)
    {
        $practitioner = SSTPractitioner::findOrFail($id);

        if ($practitioner->photo) {
            Storage::disk('public')->delete($practitioner->photo);
        }
        if ($practitioner->diplome) {
            Storage::disk('public')->delete($practitioner->diplome);
        }
        if ($practitioner->other_docs) {
             foreach ($practitioner->other_docs as $doc) {
                 Storage::disk('public')->delete($doc);
             }
        }

        $practitioner->delete();

        return response()->json(null, 204);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:sst_practitioners,id',
        ]);

        $practitioners = SSTPractitioner::whereIn('id', $validated['ids'])->get();

        foreach ($practitioners as $practitioner) {
            if ($practitioner->photo) {
                Storage::disk('public')->delete($practitioner->photo);
            }
            if ($practitioner->diplome) {
                Storage::disk('public')->delete($practitioner->diplome);
            }
            if ($practitioner->other_docs) {
                foreach ($practitioner->other_docs as $doc) {
                    Storage::disk('public')->delete($doc);
                }
            }
            $practitioner->delete();
        }

        return response()->json(['message' => 'Items deleted successfully']);
    }
}
