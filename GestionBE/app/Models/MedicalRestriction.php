<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRestriction extends Model
{
    use HasFactory;

    protected $fillable = [
        'employe_id',
        'examen_medical_id',
        'description',
        'date_debut',
        'date_fin',
        'est_permanent',
        'statut',
    ];

    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }

    public function examenMedical()
    {
        return $this->belongsTo(ExamenMedical::class);
    }
}
