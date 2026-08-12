<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SucursalSeeder extends Seeder
{
    public function run()
    {
        DB::table('sucursales')->insert([
            ['nombre' => 'Sucursal Central', 'direccion' => 'Av. Principal 123', 'activo' => true],
        ]);
    }
}
