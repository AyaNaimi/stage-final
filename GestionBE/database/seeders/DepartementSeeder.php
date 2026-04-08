<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing departments
        DB::table('departements')->truncate();
        
        // Departments root
        DB::table('departements')->insert([
            ['nom' => 'INFO', 'parent_id' => null],
            ['nom' => 'Ressources Humaines', 'parent_id' => null],
            ['nom' => 'Finance', 'parent_id' => null],
            ['nom' => 'Marketing', 'parent_id' => null],
            ['nom' => 'Production', 'parent_id' => null],
        ]);

        // Get IDs
        $info = DB::table('departements')->where('nom', 'INFO')->first()->id;
        $rh = DB::table('departements')->where('nom', 'Ressources Humaines')->first()->id;
        $finance = DB::table('departements')->where('nom', 'Finance')->first()->id;
        $marketing = DB::table('departements')->where('nom', 'Marketing')->first()->id;
        $production = DB::table('departements')->where('nom', 'Production')->first()->id;

        // Sub-departments
        DB::table('departements')->insert([
            ['nom' => 'Développement', 'parent_id' => $info],
            ['nom' => 'Infrastructure', 'parent_id' => $info],
            ['nom' => 'Support', 'parent_id' => $info],
            ['nom' => 'Recrutement', 'parent_id' => $rh],
            ['nom' => 'Formation', 'parent_id' => $rh],
            ['nom' => 'Comptabilité', 'parent_id' => $finance],
            ['nom' => 'Contrôle de Gestion', 'parent_id' => $finance],
            ['nom' => 'Communication', 'parent_id' => $marketing],
            ['nom' => 'Ventes', 'parent_id' => $marketing],
            ['nom' => 'Fabrication', 'parent_id' => $production],
            ['nom' => 'Qualité', 'parent_id' => $production],
        ]);
        
        $this->command->info('Departments seeded successfully!');
    }
}
