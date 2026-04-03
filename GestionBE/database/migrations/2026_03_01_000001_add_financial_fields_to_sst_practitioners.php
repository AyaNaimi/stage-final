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
        Schema::table('sst_practitioners', function (Blueprint $table) {
            $table->string('contract_type')->nullable()->after('type'); // CDI, Prestation, etc.
            $table->decimal('remuneration_amount', 10, 2)->nullable()->after('contract_type');
            $table->string('remuneration_type')->default('fixed')->after('remuneration_amount'); // fixed, per_visit
            $table->string('service')->nullable()->after('specialty'); // Affectation
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sst_practitioners', function (Blueprint $table) {
            $table->dropColumn(['contract_type', 'remuneration_amount', 'remuneration_type', 'service']);
        });
    }
};
