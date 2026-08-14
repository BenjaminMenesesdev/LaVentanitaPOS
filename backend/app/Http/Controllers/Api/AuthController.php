<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterUserRequest;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $throttleKey = Str::lower($request->email).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json(['message' => "Demasiados intentos. Reintenta en {$seconds}s."], 429);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json(['message' => 'Credenciales inválidas.'], 401);
        }

        RateLimiter::clear($throttleKey);

        /** @var User $user */
        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'Cuenta desactivada. Contacta al administrador.'], 403);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        $abilities = $user->role === 'admin' ? ['*'] : ['pos:operate', 'stock:read'];
        $token = $user->createToken('auth_token', $abilities, now()->addHours(12));

        AuditService::log('auth.login', 'User', $user->id);

        return response()->json([
            'token' => $token->plainTextToken,
            'expires_at' => $token->accessToken->expires_at,
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ]);
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
        AuditService::log('auth.logout', 'User', $request->user()->id);

        return response()->json(['message' => 'Sesión cerrada.']);
    }
}
