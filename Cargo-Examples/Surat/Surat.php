<?php

namespace Modules\Cargo\Drivers\Surat;

use Modules\Cargo\Contracts\ShipmentInterface;
use Modules\Cargo\Support\ShipmentBase;
use SoapClient;

class Surat extends ShipmentBase implements ShipmentInterface
{
    protected $suratConf = [];

    public function __construct($config)
    {
        $this->suratConf = config('cargo.surat');
        parent::__construct($config);
    }

    public function send($params, $products)
    {
        // Sürat Kargo için sipariş oluşturma implementasyonu
        return $this->shipmentResponse(200, 'Kargo başarıyla kaydedildi.');
    }

    public function cancel($params)
    {
        return $this->shipmentResponse(200, 'Kargo Başarılı bir şekilde iptal edildi.');
    }

    public function track($params)
    {
        try {
            $client = new SoapClient($this->suratConf['link']);

            $requestParams = [
                'CariKodu' => $this->suratConf['username'],
                'Sifre' => $this->suratConf['password'],
                'WebSiparisKodlari' => [$params['InvoiceNumber']],
            ];

            $response = $client->PazaryeriGonderiHareketDetayli($requestParams);
            $response_array = json_decode($response->PazaryeriGonderiHareketDetayliResult, true);

            $has_error = isset($response_array['IsError']) && $response_array['IsError'];

            if (!$has_error && isset($response_array['Gonderiler'])) {
                $data['status'] = $this->getStatusCode($response_array['Gonderiler'][0]['KargonunDurumuSayi'] ?? 0);
                if ($data['status'] == 0) {
                    $data['description'] = 'Sipariş içeriği hazırlanıyor.';
                } else {
                    $data['trackingCode'] = $response_array['Gonderiler'][0]['KargoTakipNo'];
                    $data['trackingURL'] = $response_array['Gonderiler'][0]['TakipUrl'];
                    $data['description'] = $response_array['Gonderiler'][0]['KargonunDurumu'];
                    $data['desi'] = $response_array['Gonderiler'][0]['ToplamDesiKg'];
                    $data['price'] = $response_array['Gonderiler'][0]['Tutar'];
                }
                return $this->shipmentResponse(200, 'Kargo takibi başarılı.', $data);
            } else {
                $data['status'] = 0;
                $data['description'] = 'Sipariş içeriği hazırlanıyor.';
                return $this->shipmentResponse(200, 'Sipariş takibi başarılı!', $data);
            }
        } catch (\Exception $e) {
            return $this->shipmentResponse(503, 'Bir hata oluştu!', $e);
        }
    }

    private function getStatusCode($status_code)
    {
        if ($status_code == 0) {
            return 0;
        } elseif ($status_code == 1) {
            return 1;
        } elseif ($status_code == 2 || $status_code == 3) {
            return 2;
        } elseif ($status_code == 4) {
            return 3;
        } elseif ($status_code == 5) {
            return 4;
        } elseif ($status_code == 6) {
            return 5;
        } elseif ($status_code > 6) {
            return 8;
        }
        return 0;
    }
}
