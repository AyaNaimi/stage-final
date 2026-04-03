<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use App\Models\Visite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class VisiteController extends Controller
{
    private static ?array $visitesColumns = null;

    private function getVisitesColumns(): array
    {
        if (self::$visitesColumns === null) {
            self::$visitesColumns = Schema::getColumnListing('visites');
        }

        return self::$visitesColumns;
    }

    private function onlyExistingVisitesColumns(array $data): array
    {
        $columns = array_flip($this->getVisitesColumns());
        return array_filter(
            $data,
            fn ($value, $key) => isset($columns[$key]),
            ARRAY_FILTER_USE_BOTH
        );
    }

    private function formatEmployee(Employe $employee): array
    {
        $fullName = trim(($employee->prenom ?? '') . ' ' . ($employee->nom ?? ''));

        return [
            'id' => $employee->id,
            'name' => $fullName !== '' ? $fullName : ($employee->nom ?? 'Employé'),
            'department' => optional($employee->departements->first())->nom,
            'status' => $employee->pivot->statut_individuel ?? 'Inscrit',
            'lastVisitDate' => $employee->last_visit_date ?? null,
        ];
    }

    private function formatVisit(Visite $visit): array
    {
        $employees = $visit->employes->map(fn (Employe $employee) => $this->formatEmployee($employee))->values();
        $doctorName = $visit->doctor
            ?? $visit->medecin_nom
            ?? trim((optional($visit->practitioner)->first_name ?? '') . ' ' . (optional($visit->practitioner)->name ?? ''))
            ?: null;

        return [
            'id' => $visit->id,
            'date' => $visit->date,
            'time' => $visit->time,
            'type' => $visit->type,
            'statut' => $visit->statut,
            'status' => $visit->statut,
            'emplacement' => $visit->emplacement,
            'lieu' => $visit->lieu,
            'location' => $visit->lieu,
            'medecin_nom' => $visit->medecin_nom,
            'doctor' => $doctorName,
            'notes' => $visit->notes,
            'practitioner_id' => $visit->practitioner_id,
            'unit_cost' => $visit->unit_cost,
            'total_cost' => $visit->total_cost,
            'payment_status' => $visit->payment_status,
            'employees' => $employees,
            'employes' => $employees,
            'selectedEmployees' => $employees->pluck('id')->values(),
            'department' => $employees->pluck('department')->filter()->unique()->implode(', '),
            'created_at' => $visit->created_at,
            'updated_at' => $visit->updated_at,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $visits = Visite::with(['employes.departements', 'practitioner'])
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn (Visite $visit) => $this->formatVisit($visit));

        return response()->json($visits);
    }

    public function employeesCatalog()
    {
        $employees = Employe::query()
            ->select(['id', 'nom', 'prenom'])
            ->with('departements:id,nom')
            ->withMax('visites as last_visit_date', 'date')
            ->orderBy('nom')
            ->get()
            ->map(function (Employe $employee) {
                $fullName = trim(($employee->prenom ?? '') . ' ' . ($employee->nom ?? ''));

                return [
                    'id' => $employee->id,
                    'name' => $fullName !== '' ? $fullName : ($employee->nom ?? 'Employé'),
                    'department' => optional($employee->departements->first())->nom,
                    'lastVisitDate' => $employee->last_visit_date,
                ];
            })
            ->values();

        return response()->json($employees);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'nullable|string', // Or date_format:H:i
            'type' => 'required|string',
            'lieu' => 'nullable|string',
            'location' => 'nullable|string', // Frontend might send location
            'doctor' => 'nullable|string',
            'doctors' => 'nullable|array', // Frontend sends array
            'notes' => 'nullable|string',
            'selectedEmployees' => 'nullable|array',
            'selectedEmployees.*' => 'exists:employes,id',
            'employe_ids' => 'nullable|array',
            'employe_ids.*' => 'exists:employes,id',
            'practitioner_id' => 'nullable|exists:sst_practitioners,id',
            'unit_cost' => 'nullable|numeric',
            'total_cost' => 'nullable|numeric',
        ]);

        $employeeIds = $validated['selectedEmployees'] ?? ($validated['employe_ids'] ?? []);

        // Map frontend fields to DB fields
        $data = [
            'date' => $validated['date'],
            'time' => $validated['time'] ?? null,
            'type' => $validated['type'],
            'lieu' => $validated['lieu'] ?? ($validated['location'] ?? null),
            'notes' => $validated['notes'] ?? null,
            'statut' => 'planifiée', // default
            'practitioner_id' => $validated['practitioner_id'] ?? null,
            'unit_cost' => $validated['unit_cost'] ?? 0,
            'total_cost' => $validated['total_cost'] ?? 0,
        ];

        // Automatic total cost calculation if possible
        if (!$data['total_cost'] && $data['unit_cost'] && !empty($employeeIds)) {
            $data['total_cost'] = $data['unit_cost'] * count($employeeIds);
        }

        // Handle doctor (array or string)
        if (isset($validated['doctors']) && is_array($validated['doctors'])) {
            $data['doctor'] = implode(', ', $validated['doctors']);
        } elseif (isset($validated['doctor'])) {
              $data['doctor'] = $validated['doctor'];
        }

        $visite = Visite::create($this->onlyExistingVisitesColumns($data));

        // Handle employees attachment
        if (!empty($employeeIds)) {
            $syncData = collect($employeeIds)
                ->mapWithKeys(fn ($id) => [(int) $id => ['statut_individuel' => 'Inscrit']])
                ->all();
            $visite->employes()->sync($syncData);
        }

        $visite->load(['employes.departements', 'practitioner']);

        return response()->json($this->formatVisit($visite), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $visite = Visite::with(['employes.departements', 'practitioner'])->findOrFail($id);
        return response()->json($this->formatVisit($visite));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $visite = Visite::findOrFail($id);

        $validated = $request->validate([
            'date' => 'sometimes|required|date',
            'time' => 'nullable|string',
            'type' => 'sometimes|required|string',
            'lieu' => 'nullable|string',
            'location' => 'nullable|string',
            'doctor' => 'nullable|string',
            'doctors' => 'nullable|array',
            'notes' => 'nullable|string',
            'statut' => 'nullable|string',
            'selectedEmployees' => 'nullable|array',
            'selectedEmployees.*' => 'exists:employes,id',
            'employe_ids' => 'nullable|array',
            'employe_ids.*' => 'exists:employes,id',
            'practitioner_id' => 'nullable|exists:sst_practitioners,id',
            'unit_cost' => 'nullable|numeric',
            'total_cost' => 'nullable|numeric',
            'payment_status' => 'nullable|string',
        ]);

        $data = [];
        if (isset($validated['date'])) $data['date'] = $validated['date'];
        if (isset($validated['time'])) $data['time'] = $validated['time'];
        if (isset($validated['type'])) $data['type'] = $validated['type'];
        if (isset($validated['lieu'])) $data['lieu'] = $validated['lieu'];
        elseif (isset($validated['location'])) $data['lieu'] = $validated['location'];
        
        if (isset($validated['notes'])) $data['notes'] = $validated['notes'];
        if (isset($validated['statut'])) $data['statut'] = $validated['statut'];
        if (isset($validated['practitioner_id'])) $data['practitioner_id'] = $validated['practitioner_id'];
        if (isset($validated['unit_cost'])) $data['unit_cost'] = $validated['unit_cost'];
        if (isset($validated['total_cost'])) $data['total_cost'] = $validated['total_cost'];
        if (isset($validated['payment_status'])) $data['payment_status'] = $validated['payment_status'];

        if (isset($validated['doctors']) && is_array($validated['doctors'])) {
            $data['doctor'] = implode(', ', $validated['doctors']);
        } elseif (isset($validated['doctor'])) {
             $data['doctor'] = $validated['doctor'];
        }

        $employeeIds = $validated['selectedEmployees'] ?? ($validated['employe_ids'] ?? null);
        if (!array_key_exists('total_cost', $data) && isset($validated['unit_cost']) && is_array($employeeIds)) {
            $data['total_cost'] = $validated['unit_cost'] * count($employeeIds);
        }

        $visite->update($this->onlyExistingVisitesColumns($data));

        // Sync employees if provided
        if (is_array($employeeIds)) {
            $existingStatuses = $visite->employes()
                ->pluck('employe_visite.statut_individuel', 'employes.id')
                ->toArray();

            $syncData = collect($employeeIds)
                ->mapWithKeys(fn ($id) => [(int) $id => ['statut_individuel' => $existingStatuses[$id] ?? 'Inscrit']])
                ->all();

            $visite->employes()->sync($syncData);
        }

        $visite->load(['employes.departements', 'practitioner']);

        return response()->json($this->formatVisit($visite));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $visite = Visite::findOrFail($id);
        $visite->employes()->detach();
        $visite->delete();

        return response()->json(null, 204);
    }
}
