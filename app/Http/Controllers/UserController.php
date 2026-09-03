<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of system users.
     */
    public function index(Request $request): Response
    {
        if ($request->user() && ! $request->user()->hasPermission('manage_users')) {
            abort(403, 'Unauthorized. Permission manage_users required.');
        }

        $users = User::with('role')->latest()->get();
        $roles = Role::select('id', 'name', 'display_name')->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user() && ! $request->user()->hasPermission('manage_users')) {
            abort(403, 'Unauthorized. Permission manage_users required.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', Password::defaults()],
            'role_id' => ['required', 'exists:roles,id'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('users.index')->with('success', 'User account created successfully.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        if ($request->user() && ! $request->user()->hasPermission('manage_users')) {
            abort(403, 'Unauthorized. Permission manage_users required.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'role_id' => ['required', 'exists:roles,id'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        $user->update($validated);

        return redirect()->route('users.index')->with('success', 'User details updated successfully.');
    }

    /**
     * Toggle active state of a user.
     */
    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        if ($request->user() && ! $request->user()->hasPermission('manage_users')) {
            abort(403, 'Unauthorized. Permission manage_users required.');
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        $statusStr = $user->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "User account has been {$statusStr}.");
    }
}
