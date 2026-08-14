<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CloseShiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shift_date' => ['required', 'date', 'before_or_equal:today'],
            'cash_counted' => ['required', 'numeric', 'min:0'],
        ];
    }
}
