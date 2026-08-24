<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'plan_id', 'billing_cycle', 'status',
        'trial_ends_at', 'current_period_ends_at', 'settings',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'current_period_ends_at' => 'datetime',
        'settings' => 'array',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['trial', 'active'], true);
    }

    public function hasFeature(string $key): bool
    {
        return $this->plan?->hasFeature($key) ?? false;
    }

    public function currentUserCount(): int
    {
        return $this->users()->count();
    }

    public function currentProductCount(): int
    {
        return $this->products()->count();
    }

    public function hasReachedUserLimit(): bool
    {
        $max = $this->plan?->max_users;

        return $max !== null && $this->currentUserCount() >= $max;
    }

    public function hasReachedProductLimit(): bool
    {
        $max = $this->plan?->max_products;

        return $max !== null && $this->currentProductCount() >= $max;
    }
}
