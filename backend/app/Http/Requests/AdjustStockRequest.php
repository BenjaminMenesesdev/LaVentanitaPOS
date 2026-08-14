<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ingredient_id' => ['required', 'integer', 'exists:ingredients,id'],
            'location' => ['required', 'in:bodega,vitrina'],
            'quantity_delta' => ['required', 'numeric'],
            'unit' => ['required', 'string', 'max:50'],
            'reason' => ['required', 'in:merma,vencimiento,derretimiento,rotura,consumo_personal,recepcion,traslado,ajuste_manual'],
            'justification' => ['required_if:reason,merma,vencimiento,derretimiento,rotura,consumo_personal,ajuste_manual', 'nullable', 'string', 'max:255'],
        ];
    }
}
