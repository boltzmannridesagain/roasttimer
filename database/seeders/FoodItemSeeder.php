<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FoodItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $foodItems = [
            ['name' => 'Chicken', 'description' => 'Whole chicken for roasting', 'is_default' => true],
            ['name' => 'Beef', 'description' => 'Beef joint for roasting', 'is_default' => true],
            ['name' => 'Lamb', 'description' => 'Lamb leg or shoulder for roasting', 'is_default' => true],
            ['name' => 'Pork', 'description' => 'Pork joint for roasting', 'is_default' => true],
            ['name' => 'Potatoes', 'description' => 'Roast potatoes', 'is_default' => true],
            ['name' => 'Carrots', 'description' => 'Roasted or boiled carrots', 'is_default' => true],
            ['name' => 'Broccoli', 'description' => 'Steamed or boiled broccoli', 'is_default' => true],
            ['name' => 'Brussels Sprouts', 'description' => 'Roasted or boiled Brussels sprouts', 'is_default' => true],
            ['name' => 'Cauliflower', 'description' => 'Cauliflower cheese or roasted', 'is_default' => true],
            ['name' => 'Yorkshire Pudding', 'description' => 'Traditional Yorkshire pudding', 'is_default' => true],
            ['name' => 'Gravy', 'description' => 'Meat gravy', 'is_default' => true],
            ['name' => 'Stuffing', 'description' => 'Bread stuffing', 'is_default' => true],
        ];

        DB::table('food_items')->insert($foodItems);
    }
}
