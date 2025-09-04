<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CookingPhaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cookingPhases = [
            ['name' => 'Washing', 'description' => 'Wash and clean ingredients', 'is_default' => true, 'device_required' => false],
            ['name' => 'Chopping', 'description' => 'Cut and prepare ingredients', 'is_default' => true, 'device_required' => false],
            ['name' => 'Peeling', 'description' => 'Peel vegetables and fruits', 'is_default' => true, 'device_required' => false],
            ['name' => 'Parboiling', 'description' => 'Partially boil before final cooking', 'is_default' => true, 'device_required' => true],
            ['name' => 'Roasting', 'description' => 'Cook in oven at high temperature', 'is_default' => true, 'device_required' => true],
            ['name' => 'Frying', 'description' => 'Cook in oil on hob', 'is_default' => true, 'device_required' => true],
            ['name' => 'Steaming', 'description' => 'Cook with steam', 'is_default' => true, 'device_required' => true],
            ['name' => 'Microwaving', 'description' => 'Cook in microwave oven', 'is_default' => true, 'device_required' => true],
            ['name' => 'Boiling', 'description' => 'Cook in boiling water', 'is_default' => true, 'device_required' => true],
            ['name' => 'Resting', 'description' => 'Allow to rest before serving', 'is_default' => true, 'device_required' => false],
            ['name' => 'Serving', 'description' => 'Plate and serve the dish', 'is_default' => true, 'device_required' => false],
        ];

        DB::table('cooking_phases')->insert($cookingPhases);
    }
}
