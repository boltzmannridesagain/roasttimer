<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $devices = [
            ['name' => 'Fan Oven', 'description' => 'Electric fan-assisted oven', 'is_default' => true],
            ['name' => 'Conventional Oven', 'description' => 'Traditional electric or gas oven', 'is_default' => true],
            ['name' => 'Microwave', 'description' => 'Microwave oven', 'is_default' => true],
            ['name' => 'Hob Ring 1', 'description' => 'First hob ring for boiling/frying', 'is_default' => true],
            ['name' => 'Hob Ring 2', 'description' => 'Second hob ring for boiling/frying', 'is_default' => true],
            ['name' => 'Hob Ring 3', 'description' => 'Third hob ring for boiling/frying', 'is_default' => true],
            ['name' => 'Hob Ring 4', 'description' => 'Fourth hob ring for boiling/frying', 'is_default' => true],
        ];

        DB::table('devices')->insert($devices);
    }
}
