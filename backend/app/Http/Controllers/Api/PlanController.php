<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;

class PlanController extends Controller
{
    public function index()
    {
        return response()->json(Plan::where('is_active', true)->orderBy('price_monthly')->get());
    }
}
