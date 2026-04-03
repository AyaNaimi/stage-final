<?php

namespace App\Http\Controllers;

use App\Models\CorpsMedical;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CorpsMedicalController extends Controller
{
    private function toPublicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return 'storage/' . ltrim($path, '/');
    }

    private function formatPractitioner(CorpsMedical $practitioner): array
    {
        $otherDocs = is_array($practitioner->autres_documents) ? $practitioner->autres_documents : [];

        return [
            'id' => $practitioner->id,
            'nom' => $practitioner->nom,
            'prenom' => $practitioner->prenom,
            'specialite' => $practitioner->specialite,
            'type' => $practitioner->type,
            'telephone' => $practitioner->telephone,
            'email' => $practitioner->email,
            'photo' => $this->toPublicUrl($practitioner->photo),
            'diplome' => $this->toPublicUrl($practitioner->diplome),
            'autres_documents' => array_map(fn ($doc) => $this->toPublicUrl($doc), $otherDocs),
            'statut' => $practitioner->statut,
            'name' => $practitioner->nom,
            'firstName' => $practitioner->prenom,
            'specialty' => $practitioner->specialite,
            'phone' => $practitioner->telephone,
            'otherDocs' => array_map(fn ($doc) => $this->toPublicUrl($doc), $otherDocs),
            'status' => $practitioner->statut,
            'created_at' => $practitioner->created_at,
            'updated_at' => $practitioner->updated_at,
        ];
    }

    public function index()
    {
        $items = CorpsMedical::all()->map(fn (CorpsMedical $item) => $this->formatPractitioner($item));
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required_without:name|string|nullable',
            'name' => 'required_without:nom|string|nullable',
            'prenom' => 'required_without:firstName|string|nullable',
            'firstName' => 'required_without:prenom|string|nullable',
            'specialite' => 'required_without:specialty|string|nullable',
            'specialty' => 'required_without:specialite|string|nullable',
            'type' => 'required|string',
            'telephone' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'photo' => 'nullable|image|max:2048',
            'diplome' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'autres_documents' => 'nullable|array',
            'autres_documents.*' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'otherDocs' => 'nullable|array',
            'otherDocs.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'statut' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $data = [
            'nom' => $validated['nom'] ?? $validated['name'] ?? null,
            'prenom' => $validated['prenom'] ?? $validated['firstName'] ?? null,
            'specialite' => $validated['specialite'] ?? $validated['specialty'] ?? null,
            'type' => $validated['type'],
            'telephone' => $validated['telephone'] ?? $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'statut' => $validated['statut'] ?? $validated['status'] ?? 'Actif',
        ];

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('corps-medical/photos', 'public');
            $data['photo'] = $path;
        }

        if ($request->hasFile('diplome')) {
            $path = $request->file('diplome')->store('corps-medical/diplomes', 'public');
            $data['diplome'] = $path;
        }

        $otherDocsFiles = $request->file('autres_documents') ?? $request->file('otherDocs') ?? [];
        if (!is_array($otherDocsFiles) && $otherDocsFiles) {
            $otherDocsFiles = [$otherDocsFiles];
        }

        if (!empty($otherDocsFiles)) {
            $docs = [];
            foreach ($otherDocsFiles as $file) {
                $docs[] = $file->store('corps-medical/documents', 'public');
            }
            $data['autres_documents'] = $docs;
        }

        $practitioner = CorpsMedical::create($data);
        return response()->json($this->formatPractitioner($practitioner), 201);
    }

    public function show($id)
    {
        $practitioner = CorpsMedical::findOrFail($id);
        return response()->json($this->formatPractitioner($practitioner));
    }

    public function update(Request $request, $id)
    {
        $practitioner = CorpsMedical::findOrFail($id);
        
        $validated = $request->validate([
            'nom' => 'sometimes|required_without:name|string|nullable',
            'name' => 'sometimes|required_without:nom|string|nullable',
            'prenom' => 'sometimes|required_without:firstName|string|nullable',
            'firstName' => 'sometimes|required_without:prenom|string|nullable',
            'specialite' => 'sometimes|required_without:specialty|string|nullable',
            'specialty' => 'sometimes|required_without:specialite|string|nullable',
            'type' => 'sometimes|required|string',
            'telephone' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'statut' => 'nullable|string',
            'status' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
            'diplome' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'autres_documents' => 'nullable|array',
            'autres_documents.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'otherDocs' => 'nullable|array',
            'otherDocs.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $data = [];
        if (array_key_exists('nom', $validated) || array_key_exists('name', $validated)) {
            $data['nom'] = $validated['nom'] ?? $validated['name'];
        }
        if (array_key_exists('prenom', $validated) || array_key_exists('firstName', $validated)) {
            $data['prenom'] = $validated['prenom'] ?? $validated['firstName'];
        }
        if (array_key_exists('specialite', $validated) || array_key_exists('specialty', $validated)) {
            $data['specialite'] = $validated['specialite'] ?? $validated['specialty'];
        }
        if (array_key_exists('type', $validated)) {
            $data['type'] = $validated['type'];
        }
        if (array_key_exists('telephone', $validated) || array_key_exists('phone', $validated)) {
            $data['telephone'] = $validated['telephone'] ?? $validated['phone'];
        }
        if (array_key_exists('email', $validated)) {
            $data['email'] = $validated['email'];
        }
        if (array_key_exists('statut', $validated) || array_key_exists('status', $validated)) {
            $data['statut'] = $validated['statut'] ?? $validated['status'];
        }

        if ($request->hasFile('photo')) {
            if ($practitioner->photo) {
                Storage::disk('public')->delete($practitioner->photo);
            }
            $path = $request->file('photo')->store('corps-medical/photos', 'public');
            $data['photo'] = $path;
        }

        if ($request->hasFile('diplome')) {
            if ($practitioner->diplome) {
                Storage::disk('public')->delete($practitioner->diplome);
            }
            $path = $request->file('diplome')->store('corps-medical/diplomes', 'public');
            $data['diplome'] = $path;
        }

        $otherDocsFiles = $request->file('autres_documents') ?? $request->file('otherDocs') ?? [];
        if (!is_array($otherDocsFiles) && $otherDocsFiles) {
            $otherDocsFiles = [$otherDocsFiles];
        }

        if (!empty($otherDocsFiles)) {
            $currentDocs = is_array($practitioner->autres_documents) ? $practitioner->autres_documents : [];
            $newDocs = [];
            foreach ($otherDocsFiles as $file) {
                $newDocs[] = $file->store('corps-medical/documents', 'public');
            }
            $data['autres_documents'] = array_merge($currentDocs, $newDocs);
        }

        $practitioner->update($data);
        $practitioner->refresh();

        return response()->json($this->formatPractitioner($practitioner));
    }

    public function destroy($id)
    {
        $practitioner = CorpsMedical::findOrFail($id);
        
        if ($practitioner->photo) {
            Storage::disk('public')->delete($practitioner->photo);
        }
        if ($practitioner->diplome) {
            Storage::disk('public')->delete($practitioner->diplome);
        }
        if ($practitioner->autres_documents) {
            foreach ($practitioner->autres_documents as $doc) {
                Storage::disk('public')->delete($doc);
            }
        }

        $practitioner->delete();
        return response()->json(null, 204);
    }
}
