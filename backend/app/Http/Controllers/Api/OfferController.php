<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreOfferRequest;
use App\Http\Requests\Api\UpdateOfferRequest;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    /**
     * Get all offers (admin only, or filtered by product)
     */
    public function index(Request $request): JsonResponse
    {
        $productId = $request->input('product_id');
        $status = $request->input('status', 'active');
        $perPage = $request->input('per_page', 15);

        $query = Offer::with(['product:id,name,barcode,brand', 'seller:id,pharmacy_name,city'])
            ->where('status', $status);

        if ($productId) {
            $query->where('product_id', $productId);
        }

        $offers = $query->orderBy('price', 'asc')->paginate($perPage);

        return response()->json([
            'offers' => $offers->items(),
            'pagination' => [
                'current_page' => $offers->currentPage(),
                'last_page' => $offers->lastPage(),
                'per_page' => $offers->perPage(),
                'total' => $offers->total(),
            ],
        ]);
    }

    /**
     * Get current user's offers
     */
    public function myOffers(Request $request): JsonResponse
    {
        $status = $request->input('status');
        $perPage = $request->input('per_page', 15);

        $query = $request->user()->offers()
            ->with(['product:id,name,barcode,brand,image']);

        if ($status) {
            $query->where('status', $status);
        }

        $offers = $query->latest()->paginate($perPage);

        return response()->json([
            'offers' => $offers->items(),
            'pagination' => [
                'current_page' => $offers->currentPage(),
                'last_page' => $offers->lastPage(),
                'per_page' => $offers->perPage(),
                'total' => $offers->total(),
            ],
        ]);
    }

    /**
     * Create a new offer
     */
    public function store(StoreOfferRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $offer = $request->user()->offers()->create($validated);

        $offer->load(['product:id,name,barcode,brand']);

        return response()->json([
            'message' => 'Teklif başarıyla oluşturuldu.',
            'offer' => $offer,
        ], 201);
    }

    /**
     * Get single offer
     */
    public function show(Offer $offer): JsonResponse
    {
        $offer->load(['product', 'seller:id,pharmacy_name,city']);

        return response()->json([
            'offer' => $offer,
        ]);
    }

    /**
     * Update an offer (only owner can update)
     */
    public function update(UpdateOfferRequest $request, Offer $offer): JsonResponse
    {
        // Check if user owns this offer
        if ($offer->seller_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Bu teklifi düzenleme yetkiniz yok.',
            ], 403);
        }

        $offer->update($request->validated());
        $offer->load(['product:id,name,barcode,brand']);

        return response()->json([
            'message' => 'Teklif başarıyla güncellendi.',
            'offer' => $offer,
        ]);
    }

    /**
     * Delete an offer (only owner can delete)
     */
    public function destroy(Request $request, Offer $offer): JsonResponse
    {
        // Check if user owns this offer
        if ($offer->seller_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Bu teklifi silme yetkiniz yok.',
            ], 403);
        }

        $offer->delete();

        return response()->json([
            'message' => 'Teklif başarıyla silindi.',
        ]);
    }
}

