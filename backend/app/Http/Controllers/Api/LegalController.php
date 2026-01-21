<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PDF; // Barryvdh\DomPDF\Facade\Pdf

class LegalController extends Controller
{
    /**
     * Get specific legal document text (HTML).
     */
    public function getDocument(string $slug)
    {
        // In a real app, fetch from database or CMS.
        // For now, returning static mock data.

        $text = match ($slug) {
            'kvkk' => $this->getKvkkText(),
            'mesafeli-satis-sozlesmesi' => $this->getDistanceSalesText(),
            'iptal-iade' => $this->getCancellationText(),
            default => null,
        };

        if (!$text) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        return response()->json(['content' => $text, 'version' => '1.0']);
    }

    /**
     * Record user approval of a contract.
     */
    public function approveContract(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'version' => 'required|string',
        ]);

        Contract::create([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'version' => $request->version,
            'ip_address' => $request->ip(),
            'approved_at' => now(),
        ]);

        return response()->json(['message' => 'Sözleşme onayı kaydedildi.']);
    }

    /**
     * Generate dynamic B2B Sales Contract PDF.
     */
    public function generateB2BContract(Request $request)
    {
        // Should validate Order ID and content here
        // For demo purposes, we generate a generic preview

        $data = [
            'buyer_name' => Auth::user()->name ?? 'Misafir',
            'seller_name' => 'EczanePazarı B2B Platformu',
            'date' => now()->format('d.m.Y'),
            'order_id' => $request->order_id ?? 'Ön İzleme'
        ];

        $pdf = app('dompdf.wrapper')->loadView('legal.b2b-contract', $data);

        return $pdf->download('satis-sozlesmesi.pdf');
    }

    // --- Static Texts (Placeholder) ---

    private function getKvkkText()
    {
        return "<h1>KVKK Aydınlatma Metni</h1><p>Şirketimiz, kişisel verilerinizi 6698 sayılı kanuna uygun olarak işlemektedir...</p>";
    }

    private function getDistanceSalesText()
    {
        return "<h1>Mesafeli Satış Sözleşmesi</h1><p>Madde 1: Taraflar...</p>";
    }

    private function getCancellationText()
    {
        return "<h1>İptal ve İade Koşulları</h1><p>Ürün tesliminden itibaren 14 gün içinde...</p>";
    }
}
