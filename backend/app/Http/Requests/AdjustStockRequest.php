<?php

namespace App\Http\Requests;

use App\Models\Ingredient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ingredient_id' => ['required', 'integer'],
            'location' => ['required', 'in:bodega,vitrina'],
            'quantity_delta' => ['required', 'numeric'],
            'unit' => ['required', 'string', 'max:50'],
            'reason' => ['required', 'in:merma,vencimiento,derretimiento,rotura,consumo_personal,recepcion,traslado,ajuste_manual'],
            'justification' => ['required_if:reason,merma,vencimiento,derretimiento,rotura,consumo_personal,ajuste_manual', 'nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $ingredientId = $this->input('ingredient_id');
            if ($ingredientId && ! Ingredient::where('id', $ingredientId)->exists()) {
                $validator->errors()->add('ingredient_id', 'El insumo indicado no existe o no pertenece a este negocio.');
            }
        });
    }
}
