<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Migrar filas existentes: 'cajero' -> 'operador' antes de tocar el enum/constraint.
        DB::table('users')->where('role', 'cajero')->update(['role' => 'operador']);

        $driver = DB::getDriverName();

        // El CHECK constraint + DEFAULT a nivel de BD son exclusivos de Postgres
        // (único motor usado en producción). En SQLite (tests/CI) se omiten: no
        // soporta ALTER TABLE ... CONSTRAINT y la validación de rol ya se aplica
        // a nivel de aplicación (FormRequests / enum casts).
        if ($driver === 'pgsql') {
            // El enum de 'role' se creo como VARCHAR + CHECK constraint via $table->enum() de Laravel.
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'operador', 'auditoria', 'super_admin'))");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'operador'");
        }
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'operador')->update(['role' => 'cajero']);
        DB::table('users')->where('role', 'auditoria')->update(['role' => 'cajero']);

        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'cajero', 'super_admin'))");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'cajero'");
        }
    }
};
