<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.sku' => ['nullable'],
            'items.*.name' => ['nullable', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:500'],
            'items.*.price' => ['nullable', 'numeric', 'min:0'],
            'items.*.flavors' => ['nullable', 'array'],
            'items.*.flavors.*' => ['string', 'max:100'],
            'payment_method' => ['sometimes', 'in:efectivo,debito,credito'],
            'payments' => ['sometimes', 'array', 'min:1'],
            'payments.*.method' => ['required_with:payments', 'in:efectivo,debito,credito'],
            'payments.*.amount' => ['required_with:payments', 'numeric', 'min:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (empty($this->input('payment_method')) && empty($this->input('payments'))) {
                $validator->errors()->add('payment_method', 'Debe indicar payment_method o payments.');
            }
        });
    }

    public function resolvedPaymentMethod(): string
    {
        if ($this->filled('payment_method')) {
            return $this->input('payment_method');
        }

        return $this->input('payments.0.method');
    }
}
