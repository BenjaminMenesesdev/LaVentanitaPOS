<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AuthProxyController extends Controller
{
    public function login(Request $request)
    {
        $response = Http::post(env('AUTH_SERVICE_URL') . '/login', $request->all());
        return $response->json();
    }

    public function refresh(Request $request)
    {
        $response = Http::post(env('AUTH_SERVICE_URL') . '/refresh', $request->all());
        return $response->json();
    }

    public function logout(Request $request)
    {
        $response = Http::withToken($request->bearerToken())
                        ->post(env('AUTH_SERVICE_URL') . '/logout');
        return $response->json();
    }
}