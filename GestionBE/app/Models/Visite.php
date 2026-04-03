<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visite extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'time',
        'type',
        'statut',
        'emplacement', 
        'lieu',
        'medecin_nom',
        'doctor',
        'notes',
        'practitioner_id',
        'unit_cost',
        'total_cost',
        'payment_status',
    ];

    public function practitioner()
    {
        return $this->belongsTo(SSTPractitioner::class, 'practitioner_id');
    }

    public function payments()
    {
        return $this->belongsToMany(SSTPayment::class, 'sst_payment_visit');
    }

    public function employes()
    {
        return $this->belongsToMany(Employe::class, 'employe_visite')
                    ->withPivot('statut_individuel')
                    ->withTimestamps();
    }

    public function medicalExams()
    {
        return $this->hasMany(ExamenMedical::class);
    }
}
