<?php

namespace App\Http\Requests;

use App\Models\Ingredient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.ingredient_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'items.*.unit' => ['required', 'string', 'max:50'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $ingredientIds = collect($this->input('items', []))->pluck('ingredient_id')->filter()->unique();

            if ($ingredientIds->isEmpty()) {
                return;
            }

            $validCount = Ingredient::whereIn('id', $ingredientIds)->count();

            if ($validCount !== $ingredientIds->count()) {
                $validator->errors()->add('items', 'Uno o más insumos indicados no existen o no pertenecen a este negocio.');
            }
        });
    }
}
