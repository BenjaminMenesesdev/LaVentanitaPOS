<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // El CHECK constraint a nivel de BD es una defensa adicional exclusiva
        // de Postgres (producción). En SQLite (usado solo en tests/CI) se omite
        // porque no soporta ALTER TABLE ... CONSTRAINT y la validación de rol
        // ya se aplica a nivel de aplicación (FormRequests / enum casts).
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'cajero', 'super_admin'))");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'cajero'))");
    }
};
