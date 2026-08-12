<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@laventanita.com',
            'password' => Hash::make('Admin123!'),
            'sucursal_id' => 1,
            'role' => 'admin',
            'active' => true,
        ]);

        User::create([
            'name' => 'Cajero',
            'email' => 'cajero@laventanita.com',
            'password' => Hash::make('Cajero123!'),
            'sucursal_id' => 1,
            'role' => 'cajero',
            'active' => true,
        ]);
    }
}
