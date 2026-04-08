<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\DossierMedical;
use App\Models\Employe;
use App\Models\Visite;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DossierMedicalController extends Controller
{
    private function resolveOrganizationHierarchy(Employe $employee): array
    {
        $node = $employee->departements->first();

        if (!$node && !empty($employee->departement_id)) {
            $node = Departement::with('parent.parent')->find($employee->departement_id);
        }

        if (!$node) {
            return [
                'department' => null,
                'service' => null,
            ];
        }

        $parent = $node->parent;
        $grandParent = $parent?->parent;

        if (!$parent) {
            return [
                'department' => $node->nom,
                'service' => null,
            ];
        }

        if (!$grandParent) {
            return [
                'department' => $parent->nom,
                'service' => $node->nom,
            ];
        }

        return [
            'department' => $grandParent->nom,
            'service' => $parent->nom,
        ];
    }

    private function toPublicUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) return $path;
        $cleanPath = ltrim($path, '/');
        if (str_starts_with($cleanPath, 'storage/')) $cleanPath = substr($cleanPath, 8);
        return url('api/sst-practitioners/file?path=' . $cleanPath);
    }

    private function formatDate($value, string $format = 'Y-m-d'): ?string
    {
        if (empty($value)) {
            return null;
        }

        if ($value instanceof Carbon) {
            return $value->format($format);
        }

        try {
            return Carbon::parse($value)->format($format);
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function buildVitals($exam): array
    {
        return [
            'weight' => $exam?->poids ?? '-',
            'height' => $exam?->taille ?? '-',
            'bmi' => $exam?->imc ?? '-',
            'bp' => ($exam?->ta_systolique || $exam?->ta_diastolique)
                ? trim(($exam?->ta_systolique ?? '-') . '/' . ($exam?->ta_diastolique ?? '-'))
                : '-',
            'pulse' => $exam?->pouls ?? '-',
            'temperature' => $exam?->temperature ?? '-',
            'spo2' => $exam?->spo2 ?? '-',
            'glycemia' => $exam?->glycemie ?? '-',
        ];
    }

    private function formatVisitHistoryItem(Visite $visit): array
    {
        $note = $visit->notes ?: 'Visite enregistrée';

        return [
            'id' => 'visit-' . $visit->id,
            'date' => $this->formatDate($visit->date),
            'type' => $visit->type ?: 'Périodique',
            'doctor' => $visit->doctor ?: ($visit->medecin_nom ?: 'Non renseigné'),
            'note' => $note,
            'diagnosis' => $note,
            'aptitude' => null,
            'soap' => [
                'subjective' => null,
                'objective' => null,
                'assessment' => $note,
                'plan' => null,
            ],
        ];
    }

    private function buildHistory(Employe $employee)
    {
        $examHistory = $employee->medicalExams
            ? $employee->medicalExams
                ->sortByDesc(function ($exam) {
                    return $this->formatDate($exam->date_examen, 'Y-m-d H:i:s') ?? '';
                })
                ->values()
                ->map(fn ($exam) => $this->formatHistoryItem($exam))
            : collect();

        if ($examHistory->isNotEmpty()) {
            return $examHistory;
        }

        $visitHistory = $employee->visites
            ? $employee->visites
                ->sortByDesc(function ($visit) {
                    return $this->formatDate($visit->date, 'Y-m-d H:i:s') ?? '';
                })
                ->values()
                ->map(fn (Visite $visit) => $this->formatVisitHistoryItem($visit))
            : collect();

        return $visitHistory;
    }

    private function formatHistoryItem($exam): array
    {
        return [
            'id' => $exam->id,
            'date' => $this->formatDate($exam->date_examen),
            'type' => $exam->motif ?: 'Périodique',
            'doctor' => $exam->doctor_name ?: 'Non renseigné',
            'note' => $exam->evaluation ?: ($exam->notes_objectives ?: ''),
            'diagnosis' => $exam->evaluation ?: ($exam->notes_objectives ?: ($exam->notes_subjectives ?: 'Aucun diagnostic renseigné')),
            'aptitude' => $exam->aptitude,
            'soap' => [
                'subjective' => $exam->notes_subjectives,
                'objective' => $exam->notes_objectives,
                'assessment' => $exam->evaluation,
                'plan' => $exam->plan,
            ],
        ];
    }

    private function normalizeAptitude(?string $aptitude): string
    {
        if (!$aptitude) return 'En attente';

        $value = mb_strtolower(trim($aptitude));
        if (in_array($value, ['fit', 'apte'])) return 'Apte';
        if (in_array($value, ['unfit', 'inapte'])) return 'Inapte';
        if (in_array($value, ['restricted', 'apte (rés)', 'apte avec restrictions'])) return 'Apte (Rés)';
        if (in_array($value, ['referral', 'expertise'])) return 'Expertise';

        return $aptitude;
    }

    private function formatEmployeeRecord(Employe $employee, ?DossierMedical $dossier = null): array
    {
        $exams = $employee->medicalExams
            ? $employee->medicalExams->sortByDesc('date_examen')->values()
            : collect();
        $visites = $employee->visites
            ? $employee->visites->sortByDesc('date')->values()
            : collect();

        $latestExam = $exams->first();
        $latestVisite = $visites->first();
        $employeeDisplayId = (string) ($employee->matricule ?? $employee->id);
        $hierarchy = $this->resolveOrganizationHierarchy($employee);
        $department = $hierarchy['department'];
        $vitals = $this->buildVitals($latestExam);
        $history = $this->buildHistory($employee);
        $restrictions = $employee->relationLoaded('medicalRestrictions')
            ? $employee->medicalRestrictions->map(function ($restriction) {
                return [
                    'id' => $restriction->id,
                    'description' => $restriction->description,
                    'date_debut' => $this->formatDate($restriction->date_debut),
                    'date_fin' => $this->formatDate($restriction->date_fin),
                    'est_permanent' => (bool) $restriction->est_permanent,
                    'statut' => $restriction->statut,
                ];
            })->values()
            : collect();

        $documents = $employee->relationLoaded('medicalDocuments')
            ? $employee->medicalDocuments->map(function ($document) {
                return [
                    'id' => $document->id,
                    'nom' => $document->nom,
                    'type' => $document->type,
                    'chemin_fichier' => $this->toPublicUrl($document->chemin_fichier),
                    'date_document' => $this->formatDate($document->date_document),
                ];
            })->values()
            : collect();

        return [
            'id' => $employeeDisplayId,
            'record_id' => $dossier?->id,
            'employe_id' => $employee->id,
            'matricule' => $employee->matricule,
            'name' => trim(($employee->prenom ?? '') . ' ' . ($employee->nom ?? '')) ?: 'Employé',
            'photo' => $this->toPublicUrl($employee->url_img),
            'dept' => $department ?: 'Non affecté',
            'service' => $hierarchy['service'],
            'lastVisit' => $this->formatDate($latestExam?->date_examen) ?: $this->formatDate($latestVisite?->date),
            'status' => $this->normalizeAptitude($latestExam?->aptitude),
            'history' => $history,
            'vitals' => $vitals,
            'latest_exam' => $latestExam ? $this->formatHistoryItem($latestExam) : null,
            'latest_visit' => $latestVisite ? $this->formatVisitHistoryItem($latestVisite) : null,
            'history_count' => $history->count(),
            'restrictions' => $restrictions,
            'documents' => $documents,

            'numero_dossier' => $dossier?->numero_dossier,
            'groupe_sanguin' => $dossier?->groupe_sanguin,
            'antecedents_personnels' => $dossier?->antecedents_personnels,
            'antecedents_familiaux' => $dossier?->antecedents_familiaux,
            'allergies' => $dossier?->allergies,
            'vaccinations' => $dossier?->vaccinations,
            'notes' => $dossier?->notes,
            'dossier' => [
                'id' => $dossier?->id,
                'numero_dossier' => $dossier?->numero_dossier,
                'groupe_sanguin' => $dossier?->groupe_sanguin,
                'antecedents_personnels' => $dossier?->antecedents_personnels,
                'antecedents_familiaux' => $dossier?->antecedents_familiaux,
                'allergies' => $dossier?->allergies,
                'vaccinations' => $dossier?->vaccinations,
                'notes' => $dossier?->notes,
            ],
            'created_at' => $dossier?->created_at,
            'updated_at' => $dossier?->updated_at,
        ];
    }

    private function formatRecord(DossierMedical $dossier): array
    {
        return $this->formatEmployeeRecord($dossier->employe, $dossier);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $dossiers = DossierMedical::with([
            'employe.departements.parent.parent',
            'employe.medicalExams',
            'employe.visites',
            'employe.medicalRestrictions',
            'employe.medicalDocuments'
        ])->get();
        $dossiersByEmploye = $dossiers->keyBy('employe_id');

        $items = Employe::with(['departements.parent.parent', 'medicalExams', 'visites', 'medicalRestrictions', 'medicalDocuments'])
            ->get()
            ->map(function (Employe $employee) use ($dossiersByEmploye) {
                $dossier = $dossiersByEmploye->get($employee->id);
                return $dossier
                    ? $this->formatRecord($dossier)
                    : $this->formatEmployeeRecord($employee, null);
            });

        return response()->json($items);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employe_id' => 'required|exists:employes,id|unique:dossier_medicals,employe_id',
            'numero_dossier' => 'nullable|string|unique:dossier_medicals,numero_dossier',
            'groupe_sanguin' => 'nullable|string',
            'antecedents_personnels' => 'nullable|string',
            'antecedents_familiaux' => 'nullable|string',
            'allergies' => 'nullable|string',
            'vaccinations' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $dossier = DossierMedical::create($validated);
        $dossier->load(['employe.departements.parent.parent', 'employe.medicalExams']);

        return response()->json($this->formatRecord($dossier), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $dossier = DossierMedical::with(['employe.departements.parent.parent', 'employe.medicalExams', 'employe.visites', 'employe.medicalRestrictions', 'employe.medicalDocuments'])->find($id);
        
        if (!$dossier) {
            $employeeByIdentifier = Employe::with(['departements.parent.parent', 'medicalExams', 'visites', 'medicalRestrictions', 'medicalDocuments'])
                ->where('matricule', $id)
                ->orWhere('cin', $id)
                ->first();

            if ($employeeByIdentifier) {
                $dossierByEmployee = DossierMedical::with(['employe.departements.parent.parent', 'employe.medicalExams', 'employe.visites', 'employe.medicalRestrictions', 'employe.medicalDocuments'])
                    ->where('employe_id', $employeeByIdentifier->id)
                    ->first();

                return response()->json(
                    $dossierByEmployee
                        ? $this->formatRecord($dossierByEmployee)
                        : $this->formatEmployeeRecord($employeeByIdentifier, null)
                );
            }

            $dossier = DossierMedical::with(['employe.departements.parent.parent', 'employe.medicalExams', 'employe.visites', 'employe.medicalRestrictions', 'employe.medicalDocuments'])
                ->where('employe_id', $id)
                ->firstOrFail();
        }

        return response()->json($this->formatRecord($dossier));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $dossier = DossierMedical::findOrFail($id);

        $validated = $request->validate([
            'numero_dossier' => 'nullable|string|unique:dossier_medicals,numero_dossier,' . $dossier->id,
            'groupe_sanguin' => 'nullable|string',
            'antecedents_personnels' => 'nullable|string',
            'antecedents_familiaux' => 'nullable|string',
            'allergies' => 'nullable|string',
            'vaccinations' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $dossier->update($validated);
        $dossier->load(['employe.departements.parent.parent', 'employe.medicalExams']);

        return response()->json($this->formatRecord($dossier));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $dossier = DossierMedical::findOrFail($id);
        $dossier->delete();
        return response()->json(null, 204);
    }

    public function getByEmploye($employeId)
    {
        $employee = Employe::with(['departements.parent.parent', 'medicalExams', 'visites', 'medicalRestrictions', 'medicalDocuments'])
            ->where('id', $employeId)
            ->orWhere('matricule', $employeId)
            ->orWhere('cin', $employeId)
            ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employé non trouvé'], 404);
        }

        $dossier = DossierMedical::with(['employe.departements.parent.parent', 'employe.medicalExams', 'employe.visites'])
            ->where('employe_id', $employee->id)
            ->first();
        
        if (!$dossier) {
            return response()->json($this->formatEmployeeRecord($employee, null));
        }

        $dossier->load(['employe.medicalRestrictions', 'employe.medicalDocuments']);
        return response()->json($this->formatRecord($dossier));
    }
}
