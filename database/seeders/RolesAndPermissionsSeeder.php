<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Roles
        $rolesData = [
            ['name' => 'admin', 'display_name' => 'System Administrator'],
            ['name' => 'manager', 'display_name' => 'Operations Manager'],
            ['name' => 'salesperson', 'display_name' => 'Sales Executive'],
            ['name' => 'storekeeper', 'display_name' => 'Storekeeper & Inventory Officer'],
            ['name' => 'accountant', 'display_name' => 'Finance & Accountant'],
        ];

        $roles = [];
        foreach ($rolesData as $role) {
            $roles[$role['name']] = Role::firstOrCreate(
                ['name' => $role['name']],
                ['display_name' => $role['display_name']]
            );
        }

        // 2. Seed Permissions
        $permissionsData = [
            ['name' => 'view_dashboard', 'group' => 'reports'],
            ['name' => 'manage_inventory', 'group' => 'inventory'],
            ['name' => 'manage_sales', 'group' => 'sales'],
            ['name' => 'manage_purchases', 'group' => 'purchases'],
            ['name' => 'manage_expenses', 'group' => 'reports'],
            ['name' => 'view_reports', 'group' => 'reports'],
            ['name' => 'manage_users', 'group' => 'users'],
        ];

        $permissions = [];
        foreach ($permissionsData as $perm) {
            $permissions[$perm['name']] = Permission::firstOrCreate(
                ['name' => $perm['name']],
                ['group' => $perm['group']]
            );
        }

        // 3. Attach ALL permissions to Admin
        $roles['admin']->permissions()->sync(
            collect($permissions)->pluck('id')->toArray()
        );

        // 4. Attach subset permissions to other roles
        $roles['manager']->permissions()->sync([
            $permissions['view_dashboard']->id,
            $permissions['manage_inventory']->id,
            $permissions['manage_sales']->id,
            $permissions['manage_purchases']->id,
            $permissions['manage_expenses']->id,
            $permissions['view_reports']->id,
        ]);

        $roles['salesperson']->permissions()->sync([
            $permissions['view_dashboard']->id,
            $permissions['manage_sales']->id,
        ]);

        $roles['storekeeper']->permissions()->sync([
            $permissions['view_dashboard']->id,
            $permissions['manage_inventory']->id,
            $permissions['manage_purchases']->id,
        ]);

        $roles['accountant']->permissions()->sync([
            $permissions['view_dashboard']->id,
            $permissions['manage_expenses']->id,
            $permissions['view_reports']->id,
        ]);

        // 5. Seed 1 default Admin user
        User::firstOrCreate(
            ['email' => 'admin@arakal.local'],
            [
                'name' => 'Arakal Administrator',
                'password' => Hash::make('password123'),
                'role_id' => $roles['admin']->id,
                'is_active' => true,
                'phone' => '+1 (800) 555-2725',
            ]
        );
    }
}
