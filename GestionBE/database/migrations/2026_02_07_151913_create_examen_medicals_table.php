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
        Schema::create('examen_medicals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visite_id')->nullable()->constrained('visites')->onDelete('set null');
            $table->foreignId('employe_id')->constrained('employes')->onDelete('cascade');
            $table->dateTime('date_examen');
            $table->string('motif')->nullable();
            
            // Biometrics / Vitals
            $table->float('poids')->nullable();
            $table->float('taille')->nullable();
            $table->float('imc')->nullable();
            $table->integer('ta_systolique')->nullable();
            $table->integer('ta_diastolique')->nullable();
            $table->integer('pouls')->nullable();
            $table->float('temperature')->nullable();
            $table->float('glycemie')->nullable();
            $table->integer('spo2')->nullable();
            $table->string('vision_droite')->nullable();
            $table->string('vision_gauche')->nullable();
            $table->string('audition_droite')->nullable();
            $table->string('audition_gauche')->nullable();
            $table->float('tour_taille')->nullable();

            // Notes
            $table->text('notes_subjectives')->nullable();
            $table->text('notes_objectives')->nullable();
            $table->text('evaluation')->nullable();
            $table->text('plan')->nullable();

            // Conclusion
            $table->string('aptitude')->nullable(); // Apte, Inapte, etc.
            $table->date('date_prochaine_visite')->nullable();
            $table->string('doctor_name')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('examen_medicals');
    }
};
