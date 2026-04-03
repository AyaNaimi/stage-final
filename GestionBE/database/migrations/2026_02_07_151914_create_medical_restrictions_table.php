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
        Schema::create('medical_restrictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employe_id')->constrained('employes')->onDelete('cascade');
            $table->foreignId('examen_medical_id')->nullable()->constrained('examen_medicals')->onDelete('set null');
            $table->text('description');
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->boolean('est_permanent')->default(false);
            $table->string('statut')->default('active'); // active, inactive
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_restrictions');
    }
};
