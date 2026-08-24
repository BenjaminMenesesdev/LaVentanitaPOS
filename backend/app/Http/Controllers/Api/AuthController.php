<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterUserRequest;
use App\Models\RefreshToken;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Abilities de Sanctum por rol de negocio.
     * admin/super_admin: acceso total. operador: POS + lectura/compra de stock.
     * auditoria: solo lectura de dashboard/stock (sin operar POS ni ajustar inventario).
     */
    private const ROLE_ABILITIES = [
        'admin' => ['*'],
        'super_admin' => ['*'],
        'operador' => ['pos:operate', 'stock:read', 'stock:purchase'],
        'auditoria' => ['dashboard:read', 'stock:read'],
    ];

    public function login(LoginRequest $request)
    {
        $throttleKey = Str::lower($request->email).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return response()->json(['message' => "Demasiados intentos. Reintenta en {$seconds}s."], 429);
        }

        if (! Auth::attempt($request->only('email', 'password'))) {
            RateLimiter::hit($throttleKey, 60);

            return response()->json(['message' => 'Credenciales inválidas.'], 401);
        }

        RateLimiter::clear($throttleKey);

        /** @var User $user */
        $user = Auth::user();

        if (! $user->is_active) {
            Auth::logout();

            return response()->json(['message' => 'Cuenta desactivada. Contacta al administrador.'], 403);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        AuditService::log('auth.login', 'User', $user->id);

        return response()->json($this->issueTokenPair($user));
    }

    public function refresh(Request $request)
    {
        $validated = $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        $stored = RefreshToken::where('token', $validated['refresh_token'])->first();

        if (! $stored || ! $stored->isValid()) {
            return response()->json(['message' => 'Refresh token inválido o expirado.'], 401);
        }

        $user = $stored->user;
        $stored->update(['revoked_at' => now()]);

        return response()->json($this->issueTokenPair($user));
    }

    public function register(RegisterUserRequest $request)
    {
        $user = User::create($request->validated());

        AuditService::log('auth.register', 'User', $user->id, ['role' => $user->role]);

        return response()->json($user->only(['id', 'name', 'email', 'role']), 201);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->only(['id', 'name', 'email', 'role']));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        RefreshToken::where('user_id', $request->user()->id)->update(['revoked_at' => now()]);
        AuditService::log('auth.logout', 'User', $request->user()->id);

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    private function issueTokenPair(User $user): array
    {
        $abilities = self::ROLE_ABILITIES[$user->role] ?? ['stock:read'];
        $accessToken = $user->createToken('auth_token', $abilities, now()->addHours(12));

        $refreshTokenValue = Str::random(80);
        RefreshToken::create([
            'user_id' => $user->id,
            'token' => $refreshTokenValue,
            'expires_at' => now()->addDays(30),
        ]);

        return [
            'access_token' => $accessToken->plainTextToken,
            'refresh_token' => $refreshTokenValue,
            'expires_at' => $accessToken->accessToken->expires_at,
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ];
    }
}
