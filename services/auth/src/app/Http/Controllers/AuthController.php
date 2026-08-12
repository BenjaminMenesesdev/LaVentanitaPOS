<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'sucursal_id' => 'required|exists:sucursales,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'sucursal_id' => $request->sucursal_id,
        ]);

        $token = JWTAuth::fromUser($user);
        $refreshToken = $this->generateRefreshToken($user);

        return response()->json([
            'access_token' => $token,
            'refresh_token' => $refreshToken,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        $user = auth()->user();
        $refreshToken = $this->generateRefreshToken($user);

        return response()->json([
            'access_token' => $token,
            'refresh_token' => $refreshToken,
            'user' => $user,
        ]);
    }

    public function refresh(Request $request)
    {
        $refreshToken = $request->input('refresh_token');
        // Validar refresh token (almacenado en tabla refresh_tokens)
        // Por simplicidad, aquí solo se emite un nuevo access token
        $user = JWTAuth::setToken($refreshToken)->authenticate();
        if (!$user) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        }
        $newToken = JWTAuth::fromUser($user);
        return response()->json(['access_token' => $newToken]);
    }

    public function logout(Request $request)
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function me(Request $request)
    {
        return response()->json(auth()->user());
    }

    private function generateRefreshToken($user)
    {
        // En una implementación real, guardar en DB con expiración
        return JWTAuth::fromUser($user, ['exp' => now()->addDays(7)->timestamp]);
    }
}