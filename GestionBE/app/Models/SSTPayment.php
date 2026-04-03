<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SSTPayment extends Model
{
    use HasFactory;

    protected $table = 'sst_payments';

    protected $fillable = [
        'practitioner_id',
        'amount',
        'reference',
        'status',
        'payment_date',
        'notes',
    ];

    public function practitioner()
    {
        return $this->belongsTo(SSTPractitioner::class, 'practitioner_id');
    }

    public function visits()
    {
        return $this->belongsToMany(Visite::class, 'sst_payment_visit', 'sst_payment_id', 'visite_id');
    }
}
