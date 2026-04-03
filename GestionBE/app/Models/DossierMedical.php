<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DossierMedical extends Model
{
    use HasFactory;

    protected $fillable = [
        'employe_id',
        'numero_dossier',
        'groupe_sanguin',
        'antecedents_personnels',
        'antecedents_familiaux',
        'allergies',
        'vaccinations',
        'notes',
    ];

    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }
}
