<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Models\User;
use App\Services\GLN\Contracts\GlnVerificationInterface;
use App\Services\GLN\WhitelistGlnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private GlnVerificationInterface $glnService,
        private WhitelistGlnService $whitelistService
    ) {}

    /**
     * Register a new user with GLN verification
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Verify GLN code for registration (checks if available)
        $glnResult = $this->whitelistService->verifyForRegistration($validated['gln_code']);

        if (!$glnResult->success) {
            return response()->json([
                'message' => 'GLN doğrulama başarısız.',
                'error' => $glnResult->errorMessage,
                'error_code' => $glnResult->errorCode,
            ], 422);
        }

        // Check if GLN is already registered in users table
        if (User::where('gln_code', $validated['gln_code'])->exists()) {
            return response()->json([
                'message' => 'Bu GLN kodu zaten kayıtlı.',
                'error_code' => 'GLN_ALREADY_REGISTERED',
            ], 422);
        }

        // Use database transaction for atomicity
        $user = DB::transaction(function () use ($validated, $glnResult) {
            // Create user with verified data
            $user = User::create([
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'gln_code' => $glnResult->glnCode,
                'pharmacy_name' => $glnResult->pharmacyName ?? $validated['pharmacy_name'] ?? '',
                'phone' => $validated['phone'] ?? null,
                'address' => $glnResult->address ?? $validated['address'] ?? null,
                'city' => $glnResult->city ?? $validated['city'] ?? null,
                'role' => 'pharmacist',
                'is_verified' => true,
                'verified_at' => now(),
            ]);

            // Mark GLN as used
            $this->whitelistService->markAsUsed($glnResult->glnCode, $user->id);

            return $user;
        });

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Kayıt başarılı.',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'gln_code' => $user->gln_code,
                'pharmacy_name' => $user->pharmacy_name,
                'city' => $user->city,
                'is_verified' => $user->is_verified,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and return token
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Geçersiz e-posta veya şifre.',
                'error_code' => 'INVALID_CREDENTIALS',
            ], 401);
        }

        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Hesabınız henüz doğrulanmamış.',
                'error_code' => 'NOT_VERIFIED',
            ], 403);
        }

        // Delete old tokens if requested
        if ($validated['revoke_others'] ?? false) {
            $user->tokens()->delete();
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Giriş başarılı.',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'gln_code' => $user->gln_code,
                'pharmacy_name' => $user->pharmacy_name,
                'city' => $user->city,
                'is_verified' => $user->is_verified,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout user (revoke current token)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Çıkış başarılı.',
        ]);
    }

    /**
     * Logout from all devices (revoke all tokens)
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Tüm cihazlardan çıkış yapıldı.',
        ]);
    }

    /**
     * Get current authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'gln_code' => $user->gln_code,
                'pharmacy_name' => $user->pharmacy_name,
                'phone' => $user->phone,
                'address' => $user->address,
                'city' => $user->city,
                'is_verified' => $user->is_verified,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Verify GLN code (public endpoint for registration form)
     */
    public function verifyGln(Request $request): JsonResponse
    {
        $request->validate([
            'gln_code' => 'required|string|size:13',
        ]);

        // Use verifyForRegistration to check availability
        $result = $this->whitelistService->verifyForRegistration($request->gln_code);

        if (!$result->success) {
            return response()->json([
                'valid' => false,
                'message' => $result->errorMessage,
                'error_code' => $result->errorCode,
            ], 422);
        }

        // Double check if already registered in users table
        $alreadyRegistered = User::where('gln_code', $request->gln_code)->exists();

        if ($alreadyRegistered) {
            return response()->json([
                'valid' => false,
                'message' => 'Bu GLN kodu zaten kayıtlı.',
                'error_code' => 'ALREADY_REGISTERED',
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'already_registered' => false,
            'pharmacy_name' => $result->pharmacyName,
            'city' => $result->city,
            'district' => $result->district,
            'address' => $result->address,
        ]);
    }
}

