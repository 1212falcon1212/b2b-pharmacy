<?php

namespace Modules\Cargo\Drivers\PTT;

use Modules\Cargo\Contracts\ShipmentInterface;
use Modules\Cargo\Support\ShipmentBase;
use SoapClient;
use Illuminate\Support\Facades\Log;

class PTT extends ShipmentBase implements ShipmentInterface
{
    protected $pttConf = [];

    public function __construct($config)
    {
        $this->pttConf = config('cargo.ptt');
        parent::__construct($config);
    }

    public function send($params, $products)
    {
        try {
            $totalDeci = 0;
            foreach ($products as $item) {
                if (isset($item['product'])) {
                    $productDeci = (double) ($item['product']->deci ?? 1);
                    $quantity = (int) ($item['quantity'] ?? 1);
                    $totalDeci += $quantity * $productDeci;
                }
            }
            $totalDeci = max($totalDeci, 1);

            $receiverAddress = $params['receiver_address'] ?? '';
            $receiverName = $params['receiver_name'] ?? '';
            $receiverCity = $params['receiver_city'] ?? '';
            $receiverDistrict = $params['receiver_district'] ?? '';
            $receiverMobile = $params['receiver_mobile_phone'] ?? '';

            $senderName = $params['sender_name'] ?? '';
            $senderAddress = $params['sender_address'] ?? '';
            $senderEmail = $params['sender_email'] ?? '';
            $senderCity = $params['sender_city'] ?? '';
            $senderDistrict = $params['sender_district'] ?? '';
            $senderMobile = $params['sender_mobile_phone'] ?? '';

            $barcode = $params['barcode'] ?? ($params['invoice_number'] ?? '');
            $orderCode = $params['order_code'] ?? $barcode;

            $wsdl = $this->pttConf['order_link'] ?? null;
            if (empty($wsdl)) {
                return $this->shipmentResponse(503, 'PTT WSDL adresi tanımlı değil.', null);
            }

            $username = $this->pttConf['username'] ?? null;
            $customerId = (int) ($this->pttConf['customer_id'] ?? 0);
            $password = $this->pttConf['password'] ?? null;

            if (empty($username) || empty($customerId) || empty($password)) {
                return $this->shipmentResponse(503, 'PTT entegrasyonu için kullanıcı adı, müşteri numarası veya şifre eksik.', null);
            }

            $dongu = [
                'aAdres' => $receiverAddress,
                'agirlik' => 1,
                'aliciAdi' => $receiverName,
                'aliciIlAdi' => $receiverCity,
                'aliciIlceAdi' => $receiverDistrict,
                'aliciSms' => $receiverMobile,
                'aliciTel' => $receiverMobile,
                'barkodNo' => $barcode,
                'boy' => 1,
                'desi' => $totalDeci,
                'en' => 1,
                'gondericibilgi' => [
                    'gonderici_adi' => $senderName,
                    'gonderici_adresi' => $senderAddress,
                    'gonderici_email' => $senderEmail,
                    'gonderici_il_ad' => $senderCity,
                    'gonderici_ilce_ad' => $senderDistrict,
                    'gonderici_sms' => $senderMobile,
                    'gonderici_telefonu' => $senderMobile,
                ],
                'musteriReferansNo' => $orderCode,
                'yukseklik' => 1,
            ];

            $input = [
                'dongu' => [$dongu],
                'dosyaAdi' => 'LB_' . date('YmdHis'),
                'gonderiTip' => 'NORMAL',
                'gonderiTur' => 'KARGO',
                'kullanici' => $username,
                'musteriId' => $customerId,
                'sifre' => $password,
            ];

            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ],
            ]);

            $client = new SoapClient($wsdl, [
                'stream_context' => $context,
                'cache_wsdl' => WSDL_CACHE_NONE,
                'trace' => 1,
                'exceptions' => true,
            ]);

            $response = $client->kabulEkle2(['input' => $input]);

            return $this->shipmentResponse(200, 'PTT gönderi kaydı başarıyla oluşturuldu.', $response);
        } catch (\Throwable $e) {
            return $this->shipmentResponse(503, $e->getMessage(), null);
        }
    }

    public function cancel($params)
    {
        try {
            $wsdl = $this->pttConf['order_link'] ?? null;
            if (empty($wsdl)) {
                return $this->shipmentResponse(503, 'PTT WSDL adresi tanımlı değil.', null);
            }

            $customerId = (int) ($this->pttConf['customer_id'] ?? 0);
            $password = $this->pttConf['password'] ?? null;

            $barcode = $params['barcode'] ?? ($params['invoice_number'] ?? '');

            $input = [
                'barcode' => $barcode,
                'dosyaAdi' => 'LB_CANCEL_' . date('YmdHis'),
                'musteriId' => $customerId,
                'sifre' => $password,
            ];

            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ],
            ]);

            $client = new SoapClient($wsdl, [
                'stream_context' => $context,
                'cache_wsdl' => WSDL_CACHE_NONE,
                'trace' => 1,
                'exceptions' => true,
            ]);

            $response = $client->barkodVeriSil(['inpDelete' => $input]);

            $result = $response->return ?? null;
            $hataKodu = $result->hataKodu ?? null;
            $aciklama = $result->aciklama ?? '';

            if ($hataKodu === null || $hataKodu === 0) {
                return $this->shipmentResponse(200, $aciklama ?: 'PTT gönderi kaydı başarıyla iptal edildi.', $result);
            }

            return $this->shipmentResponse(422, $aciklama ?: 'PTT gönderi iptal işlemi başarısız.', $result);
        } catch (\Throwable $e) {
            return $this->shipmentResponse(503, $e->getMessage(), null);
        }
    }

    public function track($params)
    {
        try {
            $wsdl = $this->pttConf['track_link'] ?? null;
            if (empty($wsdl)) {
                return $this->shipmentResponse(503, 'PTT takip WSDL adresi tanımlı değil.', null);
            }

            $customerId = (int) ($this->pttConf['customer_id'] ?? 0);
            $password = $this->pttConf['password'] ?? null;

            $barcode = $params['barcode'] ?? ($params['InvoiceNumber'] ?? '');

            $input = [
                'barkod' => $barcode,
                'kullanici' => (string) $customerId,
                'sifre' => $password,
            ];

            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ],
            ]);

            $client = new SoapClient($wsdl, [
                'stream_context' => $context,
                'cache_wsdl' => WSDL_CACHE_NONE,
                'trace' => 1,
                'exceptions' => true,
            ]);

            $response = $client->gonderiSorgu2(['input' => $input]);

            $result = $response->return ?? null;
            if (!$result) {
                return $this->shipmentResponse(503, 'PTT takip servisi geçersiz yanıt döndü.', null);
            }

            $delivered = !empty($result->TESALAN);
            $status = $delivered ? 5 : 1;

            $trackingCode = $result->BARNO ?? $barcode;
            $description = $result->sonucAciklama ?? '';

            $data = [
                'status' => $status,
                'trackingCode' => $trackingCode,
                'trackingURL' => ($this->pttConf['base_tracking_link'] ?? '') . $trackingCode,
                'description' => $description,
                'desi' => (double) ($result->GR ?? 0),
                'price' => (double) ($result->GONUCR ?? 0),
            ];

            return $this->shipmentResponse(200, 'PTT kargo takibi başarılı.', $data);
        } catch (\Throwable $e) {
            return $this->shipmentResponse(503, $e->getMessage(), null);
        }
    }
}
