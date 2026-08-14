<?php

namespace App\Services;

use App\Models\UnitConversion;
use InvalidArgumentException;

class UnitConversionService
{
    private const NATIVE_BASE_UNITS = ['ml', 'g', 'unidad'];

    public function toBaseUnit(string $unitName, float $quantity): array
    {
        if (in_array($unitName, self::NATIVE_BASE_UNITS, true)) {
            return ['base_unit' => $unitName, 'quantity_base_unit' => $quantity];
        }

        $conversion = UnitConversion::where('unit_name', $unitName)->first();
        if (!$conversion) {
            throw new InvalidArgumentException("Unidad de conversión no registrada: {$unitName}");
        }

        return [
            'base_unit' => $conversion->base_unit,
            'quantity_base_unit' => round($quantity * (float) $conversion->factor_to_base, 4),
        ];
    }

    public function fromBaseUnit(string $unitName, float $quantityBaseUnit): float
    {
        if (in_array($unitName, self::NATIVE_BASE_UNITS, true)) {
            return $quantityBaseUnit;
        }

        $conversion = UnitConversion::where('unit_name', $unitName)->first();
        if (!$conversion) {
            throw new InvalidArgumentException("Unidad de conversión no registrada: {$unitName}");
        }

        return round($quantityBaseUnit / (float) $conversion->factor_to_base, 4);
    }
}
