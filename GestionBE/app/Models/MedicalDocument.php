<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'employe_id',
        'examen_medical_id',
        'nom',
        'type',
        'chemin_fichier',
        'date_document',
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
