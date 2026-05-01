<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]);
        }
    }
}
