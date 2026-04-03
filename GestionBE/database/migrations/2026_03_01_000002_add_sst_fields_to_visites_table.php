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
        Schema::table('visites', function (Blueprint $table) {
            $table->foreignId('practitioner_id')->nullable()->constrained('sst_practitioners')->onDelete('set null');
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->decimal('total_cost', 10, 2)->nullable();
            $table->string('payment_status')->default('En attente'); // En attente, Validé, Payé
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visites', function (Blueprint $table) {
            $table->dropForeign(['practitioner_id']);
            $table->dropColumn(['practitioner_id', 'unit_cost', 'total_cost', 'payment_status']);
        });
    }
};
