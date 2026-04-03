<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sst_payment_visit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sst_payment_id')->constrained('sst_payments')->onDelete('cascade');
            $table->foreignId('visite_id')->constrained('visites')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sst_payment_visit');
    }
};
