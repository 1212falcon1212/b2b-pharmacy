<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get all active products with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $category = $request->input('category');

        $query = Product::active()
            ->withCount(['activeOffers as offers_count'])
            ->withMin('activeOffers as lowest_price', 'price');

        if ($category) {
            $query->whereHas('category', fn($q) => $q->where('slug', $category));
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'products' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Search products by name, barcode, or brand
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $query = $request->input('q');
        $perPage = $request->input('per_page', 15);

        $products = Product::search($query)
            ->where('is_active', true)
            ->query(
                fn($builder) => $builder
                    ->withCount(['activeOffers as offers_count'])
                    ->withMin('activeOffers as lowest_price', 'price')
            )
            ->paginate($perPage);

        return response()->json([
            'products' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get single product details
     */
    public function show(Product $product): JsonResponse
    {
        $product->loadCount(['activeOffers as offers_count']);
        $product->loadMin('activeOffers as lowest_price', 'price');
        $product->loadMax('activeOffers as highest_price', 'price');

        return response()->json([
            'product' => $product,
        ]);
    }

    /**
     * Get all offers for a product (Cimri model - price comparison)
     */
    public function offers(Product $product, Request $request): JsonResponse
    {
        $sortBy = $request->input('sort_by', 'price');
        $sortOrder = $request->input('sort_order', 'asc');

        $offers = $product->activeOffers()
            ->with(['seller:id,pharmacy_name,city'])
            ->inStock()
            ->notExpired()
            ->orderBy($sortBy, $sortOrder)
            ->get()
            ->map(function ($offer) {
                return [
                    'id' => $offer->id,
                    'price' => $offer->price,
                    'stock' => $offer->stock,
                    'expiry_date' => $offer->expiry_date->format('Y-m-d'),
                    'batch_number' => $offer->batch_number,
                    'seller' => [
                        'id' => $offer->seller->id,
                        'pharmacy_name' => $offer->seller->pharmacy_name,
                        'city' => $offer->seller->city,
                    ],
                ];
            });

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'barcode' => $product->barcode,
                'brand' => $product->brand,
                'image' => $product->image,
            ],
            'offers' => $offers,
            'offers_count' => $offers->count(),
            'lowest_price' => $offers->min('price'),
            'highest_price' => $offers->max('price'),
        ]);
    }
}

