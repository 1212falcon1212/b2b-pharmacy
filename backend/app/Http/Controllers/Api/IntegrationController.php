<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SyncErpProductsJob;
use App\Models\UserIntegration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class IntegrationController extends Controller
{
    /**
     * List user integrations with masked details
     */
    public function index()
    {
        $integrations = auth()->user()->integrations;

        return response()->json([
            'status' => 'success',
            'data' => $integrations->map(function ($integration) {
                return [
                    'id' => $integration->id,
                    'erp_type' => $integration->erp_type,
                    'status' => $integration->status,
                    'last_sync_at' => $integration->last_sync_at,
                    'error_message' => $integration->error_message,
                    'is_configured' => !empty($integration->api_key),
                ];
            })
        ]);
    }

    /**
     * Create or update integration settings
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'erp_type' => 'required|string|in:entegra,bizimhesap,parasut,sentos,stockmount,dopigo,kolaysoft',
            'api_key' => 'nullable|string',
            'api_secret' => 'nullable|string',
            'app_id' => 'nullable|string',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
            'test_mode' => 'nullable|boolean',
            'wsdl_url' => 'nullable|string',
        ]);

        $extraParams = [];
        if (!empty($validated['username']))
            $extraParams['username'] = $validated['username'];
        if (!empty($validated['password']))
            $extraParams['password'] = $validated['password'];
        if (isset($validated['test_mode']))
            $extraParams['test_mode'] = $validated['test_mode'];
        if (!empty($validated['wsdl_url']))
            $extraParams['wsdl_url'] = $validated['wsdl_url'];

        $integration = $request->user()->integrations()->updateOrCreate(
            ['erp_type' => $validated['erp_type']],
            [
                'api_key' => $validated['api_key'] ?? '',
                'api_secret' => $validated['api_secret'] ?? '',
                'app_id' => $validated['app_id'] ?? null,
                'status' => 'pending', // Reset status on update
                'error_message' => null,
                'extra_params' => $extraParams,
            ]
        );

        return response()->json([
            'message' => 'Entegrasyon başarıyla kaydedildi',
            'data' => $integration
        ]);
    }

    /**
     * Trigger manual sync
     */
    public function sync(string $erpType)
    {
        $integration = auth()->user()->integrations()
            ->where('erp_type', $erpType)
            ->firstOrFail();

        // Dispatch job
        SyncErpProductsJob::dispatch($integration);

        return response()->json([
            'status' => 'success',
            'message' => 'Senkronizasyon işlemi kuyruğa alındı. Birkaç dakika sürebilir.',
        ]);
    }

    /**
     * Remove integration
     */
    public function destroy(string $erpType)
    {
        auth()->user()->integrations()
            ->where('erp_type', $erpType)
            ->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Entegrasyon kaldırıldı.',
        ]);
    }
}
