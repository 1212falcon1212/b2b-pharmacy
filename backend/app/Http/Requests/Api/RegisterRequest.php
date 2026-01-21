<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:users,email', 'max:255'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,#^()_+=\-\[\]{}|\\:";\'<>,\/]).+$/',
            ],
            'gln_code' => ['required', 'string', 'size:13', 'unique:users,gln_code'],
            'pharmacy_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'E-posta adresi gereklidir.',
            'email.email' => 'Geçerli bir e-posta adresi giriniz.',
            'email.unique' => 'Bu e-posta adresi zaten kayıtlı.',
            'password.required' => 'Sifre gereklidir.',
            'password.min' => 'Sifre en az 8 karakter olmalidir.',
            'password.confirmed' => 'Sifre tekrari eslemiyor.',
            'password.regex' => 'Sifre en az bir buyuk harf, bir kucuk harf, bir rakam ve bir ozel karakter icermelidir.',
            'gln_code.required' => 'GLN kodu gereklidir.',
            'gln_code.size' => 'GLN kodu 13 haneli olmalıdır.',
            'gln_code.unique' => 'Bu GLN kodu zaten kayıtlı.',
        ];
    }
}

