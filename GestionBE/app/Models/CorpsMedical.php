<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorpsMedical extends Model
{
    use HasFactory;

    protected $table = 'corps_medicals';

    protected $fillable = [
        'nom',
        'prenom',
        'specialite',
        'type',
        'telephone',
        'email',
        'photo',
        'diplome',
        'autres_documents',
        'statut',
    ];

    protected $casts = [
        'autres_documents' => 'array',
    ];
}
