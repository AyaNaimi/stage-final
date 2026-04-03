<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamenMedical extends Model
{
    use HasFactory;

    protected $fillable = [
        'visite_id',
        'employe_id',
        'date_examen',
        'motif',
        'poids',
        'taille',
        'imc',
        'ta_systolique',
        'ta_diastolique',
        'pouls',
        'temperature',
        'glycemie',
        'spo2',
        'vision_droite',
        'vision_gauche',
        'audition_droite',
        'audition_gauche',
        'tour_taille',
        'notes_subjectives',
        'notes_objectives',
        'evaluation',
        'plan',
        'aptitude',
        'date_prochaine_visite',
        'doctor_name',
    ];

    protected $casts = [
        'date_examen' => 'datetime',
        'date_prochaine_visite' => 'date',
    ];

    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }

    public function visite()
    {
        return $this->belongsTo(Visite::class);
    }

    public function restrictions()
    {
        return $this->hasMany(MedicalRestriction::class);
    }

    public function documents()
    {
        return $this->hasMany(MedicalDocument::class);
    }
}
