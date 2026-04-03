<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SSTPractitioner extends Model
{
    use HasFactory;

    // Explicit table name to match migration (avoid Eloquent s_s_t_* pluralization)
    protected $table = 'sst_practitioners';

    protected $fillable = [
        'name',
        'first_name',
        'specialty',
        'type',
        'phone',
        'email',
        'photo',
        'diplome',
        'other_docs',
        'status',
        'contract_type',
        'remuneration_amount',
        'remuneration_type',
        'service',
    ];

    public function payments()
    {
        return $this->hasMany(SSTPayment::class, 'practitioner_id');
    }

    public function visits()
    {
        return $this->hasMany(Visite::class, 'practitioner_id');
    }

    protected $casts = [
        'other_docs' => 'array',
    ];
}
