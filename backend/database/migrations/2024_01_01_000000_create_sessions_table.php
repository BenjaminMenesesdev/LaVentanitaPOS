<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Requerida porque config/session.php usa env('SESSION_DRIVER', 'database') como valor por
// defecto y .env.example no fija SESSION_DRIVER=file. Sin esta tabla, cualquier request que
// dispare el garbage collector de sesiones (aprox. 2% de las requests, lottery en
// config/session.php) fallaba con 500: relation "sessions" does not exist. Se detecto al
// probar /api/login end-to-end contra Postgres real (el suite de tests usa SESSION_DRIVER=array
// y nunca toco esta ruta de codigo).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
