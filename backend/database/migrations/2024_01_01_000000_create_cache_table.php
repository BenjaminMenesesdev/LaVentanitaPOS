<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Requerida por CACHE_STORE=database (.env.example) y config/cache.php ('database' driver).
// Sin esta tabla, CUALQUIER operacion que toque el cache (incluido el RateLimiter usado por
// el limiter 'api' registrado en AppServiceProvider, y por ende TODA request autenticada)
// fallaba con 500: "SQLSTATE[42P01]: Undefined table: relation \"cache\" does not exist".
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }
};
