<?php

namespace Modules\Cargo\Drivers\MNG;

use Modules\Cargo\Contracts\ShipmentInterface;
use Modules\Cargo\Support\ShipmentBase;
use SoapClient;

class MNG extends ShipmentBase implements ShipmentInterface
{
    protected $client = null;
    protected $mngConf = [];

    public function __construct($config)
    {
        $this->mngConf = config('cargo.mng');
        $this->client = new SoapClient($this->mngConf['link']);
        parent::__construct($config);
    }

    public function send($params, $order_lines)
    {
        try {
            $productsAsArray = [];
            foreach ($order_lines as $line) {
                $product = $line['product'] ?? null;
                if ($product) {
                    $productsAsArray[] = [
                        'Kg' => (int) round(($product->weight ?? 1000) / 1000),
                        'Desi' => (int) round($product->deci ?? 1),
                        'Adet' => (int) ($line['quantity'] ?? 1),
                        'Icerik' => str_replace(':', ' ', $product->name ?? 'Ürün'),
                    ];
                }
            }

            $requestParams = [
                'pKullaniciAdi' => $this->mngConf['username'],
                'pSifre' => $this->mngConf['password'],
                'pSiparisNo' => $params['invoice_number'],
                'pBarkodText' => $params['invoice_number'],
                'pIrsaliyeNo' => $params['invoice_number'],
                'pUrunBedeli' => 0,
                'pKapidaOdeme' => 'Mal_Bedeli_Tahsil_Edilmesin',
                'pOdemeSekli' => $params['payment_type'] ?? 'Gonderici_Odeyecek',
                'pTeslimSekli' => 'Adrese_Teslim',
                'pKargoCinsi' => $params['type'] ?? 'Koli',
                'pGonSms' => 'SMSGonderilmesin',
                'pAliciSms' => 'SMSGonderilmesin',
                'pKapidaTahsilat' => 'Mal_Bedeli_Tahsil_Edilmesin',
                'pAciklama' => $params['description'] ?? '',
                'pGonderiParcaList' => [
                    'GonderiParca' => $productsAsArray
                ],
                'pGonderenMusteri' => [
                    'pGonMusteriAdi' => $params['sender_name'],
                    'pGonIlAdi' => $params['sender_city'],
                    'pGonilceAdi' => $params['sender_district'],
                    'pGonAdresText' => $params['sender_address'],
                    'pGonTelCep' => $params['sender_mobile_phone'],
                ],
                'pAliciMusteri' => [
                    'pAliciMusteriAdi' => $params['receiver_name'],
                    'pAliciIlAdi' => $params['receiver_city'],
                    'pAliciilceAdi' => $params['receiver_district'],
                    'pAliciAdresText' => $params['receiver_address'],
                    'pAliciTelCep' => $params['receiver_mobile_phone'],
                ]
            ];

            $response = $this->client->SiparisKayit_C2C($requestParams);

            if ($response->SiparisKayit_C2CResult == 1) {
                return $this->shipmentResponse(200, 'Kargo başarıyla kaydedildi.', $response);
            } elseif (strpos($response->SiparisKayit_C2CResult, 'ZATEN VAR') !== false) {
                return $this->shipmentResponse(201, 'Kargo zaten kaydedilmiş.', $response);
            } else {
                return $this->shipmentResponse(400, 'Bir hata oluştu.', $response->SiparisKayit_C2CResult);
            }
        } catch (\Exception $e) {
            return $this->shipmentResponse(503, $e->getMessage(), $e);
        }
    }

    public function cancel($params)
    {
        try {
            $requestParams = [
                'pKullaniciAdi' => $this->mngConf['username'],
                'pSifre' => $this->mngConf['password'],
                'pSiparisNo' => $params['invoice_number'],
            ];

            $response = $this->client->SiparisIptali_C2C($requestParams);

            if ($response->SiparisIptali_C2CResult == 1) {
                return $this->shipmentResponse(200, 'Kargo Başarılı bir şekilde iptal edildi.', $response->SiparisIptali_C2CResult);
            } else {
                return $this->shipmentResponse(400, 'İptal işlemi yapılamadı. Daha önce iptal edilmiş olabilir', $response->SiparisIptali_C2CResult);
            }
        } catch (\Exception $e) {
            return $this->shipmentResponse(503, $e->getMessage(), $e);
        }
    }

    public function track($params)
    {
        try {
            $requestParams = [
                'pRfSipGnMusteriNo' => $this->mngConf['username'],
                'pRfSipGnMusteriSifre' => $this->mngConf['password'],
                'pChBarkod' => '',
                'pChFaturaSeri' => '',
                'pChFaturaNo' => '',
                'pNmGonderiNo' => '',
                'pChSiparisNo' => $params['InvoiceNumber'],
                'pGonderiCikisTarihi' => ''
            ];

            $response = $this->client->GelecekIadeSiparisKontrol($requestParams);

            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($response->GelecekIadeSiparisKontrolResult->any);
            libxml_use_internal_errors(false);

            $data['status'] = (int) ($xml->NewDataSet->Table1->SIPARIS_STATU ?? 0);

            if ($data['status'] == 0) {
                $data['description'] = 'Sipariş içeriği hazırlanıyor.';
            } else {
                $data['trackingCode'] = (string) $xml->NewDataSet->Table1->GONDERI_NO;
                $data['trackingURL'] = (string) $xml->NewDataSet->Table1->KARGO_TAKIP_URL;
                $data['description'] = (string) $xml->NewDataSet->Table1->SIPARIS_STATU_ACIKLAMA;
                $data['desi'] = (string) $xml->NewDataSet->Table1->KGDESI;
                $data['price'] = (string) $xml->NewDataSet->Table1->TUTAR;
            }

            return $this->shipmentResponse(200, 'Kargo takibi başarılı.', $data);
        } catch (\Exception $e) {
            return $this->shipmentResponse(503, 'Bir hata oluştu!', $e);
        }
    }
}
