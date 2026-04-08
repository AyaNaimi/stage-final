<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use App\Models\Visite;
use App\Models\MedicalRestriction;
use App\Models\AbsencePrevisionnel;
use App\Models\ExamenMedical;
use App\Models\Departement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SSTDashboardController extends Controller
{
    private function toPublicUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) return $path;
        $cleanPath = ltrim($path, '/');
        if (str_starts_with($cleanPath, 'storage/')) $cleanPath = substr($cleanPath, 8);
        return url('api/sst-practitioners/file?path=' . $cleanPath);
    }

    public function getStats()
    {
        try {
            // 1. Compliance Data
            $totalEmployees = Employe::count();
            
            // Assume compliant if they have at least one visit in the last 12 months
            $oneYearAgo = Carbon::now()->subMonths(12)->toDateString();
            
            $compliantCount = Employe::whereHas('visites', function($query) use ($oneYearAgo) {
                $query->where('date', '>=', $oneYearAgo);
            })->count();

            // Refine overdue: if they have no visits, they are technically "pending" or "overdue"
            // Let's say pending is no visits at all, overdue is old visits.
            $pendingCount = Employe::doesntHave('visites')->count();
            $overdueCount = Employe::whereHas('visites', function($query) use ($oneYearAgo) {
                $query->where('date', '<', $oneYearAgo);
            })->count();

            // 1.1 Upcoming Visits (Projection 30j)
            $next30Days = Carbon::now()->addDays(30)->toDateString();
            $upcomingVisitsCount = Visite::whereBetween('date', [Carbon::now()->toDateString(), $next30Days])->count();
            
            // 1.2 Pending Payments
            $pendingPaymentsCount = Visite::where('payment_status', 'not like', '%payé%')
                ->where('payment_status', 'not like', '%paid%')
                ->where('total_cost', '>', 0)
                ->count();

            $complianceData = [
                'totalEmployees' => $totalEmployees,
                'compliant' => $compliantCount,
                'pending' => $pendingCount,
                'overdue' => $overdueCount,
                'upcoming' => $upcomingVisitsCount,
                'pendingPayments' => $pendingPaymentsCount
            ];

            // 2. Absence Stats
            $now = Carbon::now();
            $startOfMonth = $now->copy()->startOfMonth()->toDateString();
            $endOfMonth = $now->copy()->endOfMonth()->toDateString();

            $absencesThisMonth = AbsencePrevisionnel::whereBetween('date_depart', [$startOfMonth, $endOfMonth])->get();
            
            $maladieCount = AbsencePrevisionnel::whereBetween('date_depart', [$startOfMonth, $endOfMonth])
                ->where('absence', 'like', '%Maladie%')
                ->count();
            
            $accidentCount = AbsencePrevisionnel::whereBetween('date_depart', [$startOfMonth, $endOfMonth])
                ->where('absence', 'like', '%Accident%')
                ->count();

            $personnelCount = $absencesThisMonth->count() - $maladieCount - $accidentCount;

            $absenceStats = [
                'totalAbsences' => $absencesThisMonth->count(),
                'maladie' => $maladieCount,
                'accident' => $accidentCount,
                'personnel' => $personnelCount,
                'evolution' => 'Ce mois',
            ];

            // 3. Recent Absences
            $recentAbsences = AbsencePrevisionnel::with('employe.departements')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function($a) {
                    return [
                        'id' => $a->id,
                        'name' => ($a->employe->prenom ?? '') . ' ' . ($a->employe->nom ?? ''),
                        'photo' => $this->toPublicUrl($a->employe->url_img ?? null),
                        'dept' => optional($a->employe->departements->first())->nom ?? 'N/A',
                        'type' => $a->absence,
                        'from' => $a->date_depart,
                        'to' => $a->date_reprise ?? 'Non précisé',
                        'status' => (isset($a->date_reprise) && Carbon::parse($a->date_reprise)->isPast()) ? 'Terminé' : 'En cours'
                    ];
                });

            // 4. Active Restrictions
            $activeRestrictions = MedicalRestriction::with('employe')
                ->where(function($q) {
                    $q->where('date_fin', '>=', Carbon::now()->toDateString())
                      ->orWhere('est_permanent', 1);
                })
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function($r) {
                    return [
                        'id' => $r->id,
                        'name' => ($r->employe->prenom ?? '') . ' ' . ($r->employe->nom ?? ''),
                        'photo' => $this->toPublicUrl($r->employe->url_img ?? null),
                        'restriction' => $r->description,
                        'expiry' => $r->est_permanent ? 'Permanent' : ($r->date_fin ?? 'Non précisé'),
                        'status' => $r->est_permanent ? 'permanent' : 'temporaire'
                    ];
                });

            // 5. Recent Exams with Results
            $recentExams = ExamenMedical::with('employe')
                ->orderBy('date_examen', 'desc')
                ->limit(5)
                ->get()
                ->map(function($e) {
                    return [
                        'id' => $e->id,
                        'name' => ($e->employe->prenom ?? '') . ' ' . ($e->employe->nom ?? ''),
                        'photo' => $this->toPublicUrl($e->employe->url_img ?? null),
                        'examType' => $e->motif,
                        'date' => $e->date_examen,
                        'result' => $e->aptitude ?? 'N/A',
                        'status' => $e->aptitude ? (str_contains(strtolower($e->aptitude), 'fit') ? 'Normal' : 'Alerte') : 'En attente'
                    ];
                });

            // 6. Department Compliance
            $departmentCompliance = Departement::withCount(['employes as total'])
                ->get()
                ->map(function($dept) use ($oneYearAgo) {
                    $compliantInDept = Employe::whereHas('departements', function($q) use ($dept) {
                        $q->where('departement_id', $dept->id);
                    })->whereHas('visites', function($q) use ($oneYearAgo) {
                        $q->where('date', '>=', $oneYearAgo);
                    })->count();

                    $rate = $dept->total > 0 ? ($compliantInDept / $dept->total) * 100 : 100;
                    $risk = 'low';
                    if ($rate < 50) $risk = 'high';
                    elseif ($rate < 80) $risk = 'medium';

                    return [
                        'name' => $dept->nom,
                        'total' => $dept->total,
                        'compliant' => $compliantInDept,
                        'risk' => $risk
                    ];
                })
                ->filter(fn($d) => $d['total'] > 0)
                ->values();

            $topRiskDepartment = collect($departmentCompliance)->sortBy(function ($dept) {
                return match ($dept['risk']) {
                    'high' => 0,
                    'medium' => 1,
                    default => 2,
                };
            })->first();

            $insightSummary = [
                'riskDepartment' => $topRiskDepartment['name'] ?? null,
                'riskLevel' => $topRiskDepartment['risk'] ?? 'low',
                'overdueVisits' => $overdueCount,
                'upcomingVisits' => $upcomingVisitsCount,
                'pendingPayments' => $pendingPaymentsCount,
            ];

            return response()->json([
                'complianceData' => $complianceData,
                'absenceStats' => $absenceStats,
                'recentAbsences' => $recentAbsences,
                'activeRestrictions' => $activeRestrictions,
                'recentExams' => $recentExams,
                'departmentCompliance' => $departmentCompliance,
                'insightSummary' => $insightSummary,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
