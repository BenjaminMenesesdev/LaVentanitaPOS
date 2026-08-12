<?php

return [
    'auth' => [
        'url' => env('AUTH_SERVICE_URL', 'http://auth:8000/api'),
    ],
    'products' => [
        'url' => env('PRODUCTS_SERVICE_URL', 'http://products:8000/api'),
    ],
    'sales' => [
        'url' => env('SALES_SERVICE_URL', 'http://sales:8000/api'),
    ],
    'inventory' => [
        'url' => env('INVENTORY_SERVICE_URL', 'http://inventory:8000/api'),
    ],
];
