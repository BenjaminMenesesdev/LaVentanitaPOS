<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Listado de usuarios. Ruta protegida con role:admin en routes/api.php.
     */
    public function index(Request $request)
    {
        $users = User::query()
            ->select(['id', 'name', 'email', 'role', 'is_active', 'last_login_at', 'created_at'])
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

    public function show(User $user)
    {
        return response()->json($user->only(['id', 'name', 'email', 'role', 'is_active', 'last_login_at']));
    }

    /**
     * Alta de usuario. Reutiliza RegisterUserRequest (ya exige rol admin y valida
     * name/email/password/role con los mismos valores que /register).
     */
    public function store(RegisterUserRequest $request)
    {
        $data = $request->validated();
        $data['is_active'] = true;

        $user = User::create($data);

        AuditService::log('user.create', 'User', $user->id, ['role' => $user->role]);

        return response()->json($user->only(['id', 'name', 'email', 'role', 'is_active']), 201);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        AuditService::log('user.update', 'User', $user->id, ['role' => $user->role]);

        return response()->json($user->only(['id', 'name', 'email', 'role', 'is_active']));
    }

    /**
     * Elimina (soft delete) un usuario. El frontend ya exige doble confirmacion
     * antes de llamar a este endpoint (ver ConfirmDialog en UsersView.jsx).
     */
    public function destroy(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta.'], 422);
        }

        $user->delete();

        AuditService::log('user.delete', 'User', $user->id);

        return response()->json(['message' => 'Usuario eliminado.']);
    }
}
