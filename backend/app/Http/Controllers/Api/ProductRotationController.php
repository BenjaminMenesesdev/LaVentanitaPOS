<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProductRotationService;
use Illuminate\Http\Request;

class ProductRotationController extends Controller
{
    public function __construct(private ProductRotationService $rotationService)
    {
    }

    public function staleProducts(Request $request)
    {
        $days = (int) $request->query('days', 30);
        return response()->json($this->rotationService->findStaleProducts($days));
    }
}
