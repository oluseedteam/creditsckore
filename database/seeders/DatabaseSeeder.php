<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin user for testing
        if (!User::where('email', 'admin@pto.com')->exists()) {
            User::create([
                'name' => 'Admin Boss',
                'email' => 'admin@pto.com',
                'password' => 'admin123',
                'role' => 'admin',
            ]);
        }
    }
}
