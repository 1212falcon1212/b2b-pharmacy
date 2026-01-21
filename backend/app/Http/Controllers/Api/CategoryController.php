<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Get all active categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::active()
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Get single category with products
     */
    public function show(int $id): JsonResponse
    {
        $category = Category::with([
            'products' => function ($query) {
                $query->active()->withCount('offers');
            }
        ])->find($id);

        if (!$category) {
            return response()->json(['message' => 'Kategori bulunamadı.'], 404);
        }

        return response()->json([
            'category' => $category,
            'products' => $category->products,
        ]);
    }
}
