<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Arakal Heavy Machinery Management dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Enforce authorization
        if ($user && ! $user->hasPermission('view_dashboard')) {
            abort(403, 'Unauthorized. You do not have permission to view the dashboard.');
        }

        return Inertia::render('Dashboard', [
            'metrics' => [
                'total_parts' => 14850,
                'low_stock_count' => 24,
                'active_orders' => 38,
                'monthly_turnover' => '$342,800',
            ],
            'recent_inquiries' => [
                [
                    'id' => 'INQ-9482',
                    'equipment' => 'Caterpillar 349D Excavator',
                    'part_name' => 'Main Hydraulic Control Valve (10R-7142)',
                    'requested_by' => 'Apex Mining Ltd',
                    'status' => 'Quote Sent',
                    'date' => 'Today 10:24 AM',
                ],
                [
                    'id' => 'INQ-9481',
                    'equipment' => 'Komatsu PC400-8',
                    'part_name' => 'Final Drive Planetary Gear Assy',
                    'requested_by' => 'Titan Earthmoving Co',
                    'status' => 'Pending Verification',
                    'date' => 'Today 09:12 AM',
                ],
                [
                    'id' => 'INQ-9480',
                    'equipment' => 'Volvo EC480D',
                    'part_name' => 'Common Rail Fuel Injector Kit (VOE21340611)',
                    'requested_by' => 'Sahara Quarry & Aggregates',
                    'status' => 'Awaiting Stock Confirmation',
                    'date' => 'Yesterday 04:45 PM',
                ],
            ],
        ]);
    }
}
