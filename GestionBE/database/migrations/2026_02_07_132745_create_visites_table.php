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
        Schema::create('visites', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('type'); // Visite d'Embauche, Périodique, reprise, etc.
            $table->string('statut')->default('planifiée'); // planifiée, en_cours, terminée
            $table->string('emplacement')->nullable();
            $table->string('medecin_nom')->nullable(); // Store name as string since Medecin model is excluded
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visites');
    }
};
