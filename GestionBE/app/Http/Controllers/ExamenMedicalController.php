<?php

namespace App\Http\Controllers;

use App\Models\ExamenMedical;
use App\Models\Employe;
use App\Models\Visite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ExamenMedicalController extends Controller
{
    private static ?array $columns = null;

    private function getColumns(): array
    {
        if (self::$columns === null) {
            self::$columns = Schema::getColumnListing('examen_medicals');
        }

        return self::$columns;
    }

    private function onlyExistingColumns(array $data): array
    {
        $columns = array_flip($this->getColumns());
        return array_filter(
            $data,
            fn ($value, $key) => isset($columns[$key]),
            ARRAY_FILTER_USE_BOTH
        );
    }

    private function normalizePayload(Request $request): array
    {
        $payload = $request->all();
        $biometrics = $payload['biometrics'] ?? [];
        $soap = $payload['soap'] ?? [];
        $decisionDetails = $payload['decisionDetails'] ?? [];

        return [
            'visite_id' => $payload['visite_id'] ?? $payload['visit_id'] ?? null,
            'employe_id' => $payload['employe_id'] ?? $payload['employee_id'] ?? null,
            'date_examen' => $payload['date_examen'] ?? now(),
            'motif' => $payload['motif'] ?? ($payload['type'] ?? null),

            'poids' => $payload['poids'] ?? ($biometrics['weight'] ?? null),
            'taille' => $payload['taille'] ?? ($biometrics['height'] ?? null),
            'imc' => $payload['imc'] ?? ($biometrics['bmi'] ?? null),
            'ta_systolique' => $payload['ta_systolique'] ?? ($biometrics['bp_systolic'] ?? null),
            'ta_diastolique' => $payload['ta_diastolique'] ?? ($biometrics['bp_diastolic'] ?? null),
            'pouls' => $payload['pouls'] ?? ($biometrics['pulse'] ?? null),
            'temperature' => $payload['temperature'] ?? ($biometrics['temp'] ?? null),
            'glycemie' => $payload['glycemie'] ?? ($biometrics['glycemia'] ?? null),
            'spo2' => $payload['spo2'] ?? ($biometrics['spo2'] ?? null),
            'vision_droite' => $payload['vision_droite'] ?? ($biometrics['vision_right'] ?? null),
            'vision_gauche' => $payload['vision_gauche'] ?? ($biometrics['vision_left'] ?? null),
            'audition_droite' => $payload['audition_droite'] ?? ($biometrics['hearing_right'] ?? null),
            'audition_gauche' => $payload['audition_gauche'] ?? ($biometrics['hearing_left'] ?? null),
            'tour_taille' => $payload['tour_taille'] ?? ($biometrics['waist'] ?? null),

            'notes_subjectives' => $payload['notes_subjectives'] ?? ($soap['subjective'] ?? null),
            'notes_objectives' => $payload['notes_objectives'] ?? ($soap['objective'] ?? null),
            'evaluation' => $payload['evaluation'] ?? ($soap['assessment'] ?? null),
            'plan' => $payload['plan'] ?? ($soap['plan'] ?? null),

            'aptitude' => $payload['aptitude'] ?? null,
            'date_prochaine_visite' => $payload['date_prochaine_visite'] ?? null,
            'doctor_name' => $payload['doctor_name'] ?? $payload['doctor'] ?? null,
            'decision_details' => !empty($decisionDetails) ? json_encode($decisionDetails, JSON_UNESCAPED_UNICODE) : null,
        ];
    }

    private function formatExam(ExamenMedical $exam): array
    {
        return [
            'id' => $exam->id,
            'visite_id' => $exam->visite_id,
            'employe_id' => $exam->employe_id,
            'date_examen' => $exam->date_examen,
            'motif' => $exam->motif,

            'poids' => $exam->poids,
            'taille' => $exam->taille,
            'imc' => $exam->imc,
            'ta_systolique' => $exam->ta_systolique,
            'ta_diastolique' => $exam->ta_diastolique,
            'pouls' => $exam->pouls,
            'temperature' => $exam->temperature,
            'glycemie' => $exam->glycemie,
            'spo2' => $exam->spo2,
            'vision_droite' => $exam->vision_droite,
            'vision_gauche' => $exam->vision_gauche,
            'audition_droite' => $exam->audition_droite,
            'audition_gauche' => $exam->audition_gauche,
            'tour_taille' => $exam->tour_taille,

            'notes_subjectives' => $exam->notes_subjectives,
            'notes_objectives' => $exam->notes_objectives,
            'evaluation' => $exam->evaluation,
            'plan' => $exam->plan,
            'aptitude' => $exam->aptitude,
            'date_prochaine_visite' => $exam->date_prochaine_visite,
            'doctor_name' => $exam->doctor_name,

            'biometrics' => [
                'weight' => $exam->poids,
                'height' => $exam->taille,
                'bmi' => $exam->imc,
                'bp_systolic' => $exam->ta_systolique,
                'bp_diastolic' => $exam->ta_diastolique,
                'pulse' => $exam->pouls,
                'temp' => $exam->temperature,
                'glycemia' => $exam->glycemie,
                'spo2' => $exam->spo2,
                'vision_right' => $exam->vision_droite,
                'vision_left' => $exam->vision_gauche,
                'hearing_right' => $exam->audition_droite,
                'hearing_left' => $exam->audition_gauche,
                'waist' => $exam->tour_taille,
            ],
            'soap' => [
                'subjective' => $exam->notes_subjectives,
                'objective' => $exam->notes_objectives,
                'assessment' => $exam->evaluation,
                'plan' => $exam->plan,
            ],

            'employe' => $exam->employe,
            'visite' => $exam->visite,
            'created_at' => $exam->created_at,
            'updated_at' => $exam->updated_at,
        ];
    }

    private function formatVisitFallback(Visite $visit, int $employeId): array
    {
        return [
            'id' => 'visit-' . $visit->id,
            'visite_id' => $visit->id,
            'employe_id' => $employeId,
            'date_examen' => $visit->date ? ($visit->date . ' ' . ($visit->time ?? '00:00:00')) : null,
            'motif' => $visit->type ?: 'Périodique',
            'poids' => null,
            'taille' => null,
            'imc' => null,
            'ta_systolique' => null,
            'ta_diastolique' => null,
            'pouls' => null,
            'temperature' => null,
            'glycemie' => null,
            'spo2' => null,
            'vision_droite' => null,
            'vision_gauche' => null,
            'audition_droite' => null,
            'audition_gauche' => null,
            'tour_taille' => null,
            'notes_subjectives' => $visit->notes,
            'notes_objectives' => null,
            'evaluation' => $visit->notes,
            'plan' => null,
            'aptitude' => null,
            'date_prochaine_visite' => null,
            'doctor_name' => $visit->doctor ?: ($visit->medecin_nom ?: null),
            'biometrics' => [
                'weight' => null,
                'height' => null,
                'bmi' => null,
                'bp_systolic' => null,
                'bp_diastolic' => null,
                'pulse' => null,
                'temp' => null,
                'glycemia' => null,
                'spo2' => null,
                'vision_right' => null,
                'vision_left' => null,
                'hearing_right' => null,
                'hearing_left' => null,
                'waist' => null,
            ],
            'soap' => [
                'subjective' => $visit->notes,
                'objective' => null,
                'assessment' => $visit->notes,
                'plan' => null,
            ],
            'is_fallback_from_visit' => true,
            'employe' => null,
            'visite' => [
                'id' => $visit->id,
                'date' => $visit->date,
                'time' => $visit->time,
                'type' => $visit->type,
                'doctor' => $visit->doctor,
                'medecin_nom' => $visit->medecin_nom,
                'lieu' => $visit->lieu,
            ],
            'created_at' => $visit->created_at,
            'updated_at' => $visit->updated_at,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $items = ExamenMedical::with(['employe', 'visite'])
            ->orderBy('date_examen', 'desc')
            ->get()
            ->map(fn (ExamenMedical $exam) => $this->formatExam($exam));

        return response()->json($items);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $normalized = $this->normalizePayload($request);

        $validated = validator($normalized, [
            'visite_id' => 'nullable|exists:visites,id',
            'employe_id' => 'required|exists:employes,id',
            'date_examen' => 'nullable|date',
            'motif' => 'nullable|string',
            'poids' => 'nullable|numeric',
            'taille' => 'nullable|numeric',
            'imc' => 'nullable|numeric',
            'ta_systolique' => 'nullable|numeric',
            'ta_diastolique' => 'nullable|numeric',
            'pouls' => 'nullable|numeric',
            'temperature' => 'nullable|numeric',
            'glycemie' => 'nullable|numeric',
            'spo2' => 'nullable|numeric',
            'vision_droite' => 'nullable|string',
            'vision_gauche' => 'nullable|string',
            'audition_droite' => 'nullable|string',
            'audition_gauche' => 'nullable|string',
            'tour_taille' => 'nullable|numeric',
            'notes_subjectives' => 'nullable|string',
            'notes_objectives' => 'nullable|string',
            'evaluation' => 'nullable|string',
            'plan' => 'nullable|string',
            'aptitude' => 'nullable|string',
            'date_prochaine_visite' => 'nullable|date',
            'doctor_name' => 'nullable|string',
            'decision_details' => 'nullable|string',
        ])->validate();

        if (empty($validated['date_examen'])) {
            $validated['date_examen'] = now();
        }

        $examen = ExamenMedical::create($this->onlyExistingColumns($validated));
        $examen->load(['employe', 'visite']);

        return response()->json($this->formatExam($examen), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $exam = ExamenMedical::with(['employe', 'visite', 'restrictions', 'documents'])->findOrFail($id);
        return response()->json($this->formatExam($exam));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $examen = ExamenMedical::findOrFail($id);

        $normalized = array_filter($this->normalizePayload($request), fn ($v) => !is_null($v));

        $validated = validator($normalized, [
            'visite_id' => 'nullable|exists:visites,id',
            'employe_id' => 'nullable|exists:employes,id',
            'date_examen' => 'nullable|date',
            'motif' => 'nullable|string',
            'poids' => 'nullable|numeric',
            'taille' => 'nullable|numeric',
            'imc' => 'nullable|numeric',
            'ta_systolique' => 'nullable|numeric',
            'ta_diastolique' => 'nullable|numeric',
            'pouls' => 'nullable|numeric',
            'temperature' => 'nullable|numeric',
            'glycemie' => 'nullable|numeric',
            'spo2' => 'nullable|numeric',
            'vision_droite' => 'nullable|string',
            'vision_gauche' => 'nullable|string',
            'audition_droite' => 'nullable|string',
            'audition_gauche' => 'nullable|string',
            'tour_taille' => 'nullable|numeric',
            'notes_subjectives' => 'nullable|string',
            'notes_objectives' => 'nullable|string',
            'evaluation' => 'nullable|string',
            'plan' => 'nullable|string',
            'aptitude' => 'nullable|string',
            'date_prochaine_visite' => 'nullable|date',
            'doctor_name' => 'nullable|string',
            'decision_details' => 'nullable|string',
        ])->validate();

        $examen->update($this->onlyExistingColumns($validated));
        $examen->load(['employe', 'visite']);

        return response()->json($this->formatExam($examen));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $examen = ExamenMedical::findOrFail($id);
        $examen->delete();
        return response()->json(null, 204);
    }

    public function getByEmploye($employeId)
    {
        $items = ExamenMedical::with(['visite'])
            ->where('employe_id', $employeId)
            ->orderBy('date_examen', 'desc')
            ->get()
            ->map(fn (ExamenMedical $exam) => $this->formatExam($exam));

        if ($items->isEmpty()) {
            $visitFallback = Visite::query()
                ->whereHas('employes', fn ($query) => $query->where('employes.id', $employeId))
                ->orderBy('date', 'desc')
                ->orderBy('time', 'desc')
                ->get()
                ->map(fn (Visite $visit) => $this->formatVisitFallback($visit, (int) $employeId));

            return response()->json($visitFallback);
        }

        return response()->json($items);
    }
}
