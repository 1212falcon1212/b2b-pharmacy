<?php

namespace Modules\Cargo\Drivers\YurtIci;

use Modules\Cargo\Contracts\ShipmentInterface;
use Modules\Cargo\Support\ShipmentBase;
use SoapClient;
use Illuminate\Support\Facades\Log;

class YurtIci extends ShipmentBase implements ShipmentInterface
{
    protected $yurticiConf = [];

    public function __construct($config)
    {
        $this->yurticiConf = config('cargo.yurtici');
        parent::__construct($config);
    }

    public function send($params, $products)
    {
        try {
            $wsdl = $this->yurticiConf['order_link'] ?? null;
            if (empty($wsdl)) {
                return $this->shipmentResponse(503, 'Yurtiçi Kargo WSDL adresi tanımlı değil.', null);
            }

            $username = $this->yurticiConf['username'] ?? null;
            $password = $this->yurticiConf['password'] ?? null;
            $customerId = $this->yurticiConf['customer_id'] ?? null;

            if (empty($username) || empty($password) || empty($customerId)) {
                return $this->shipmentResponse(503, 'Yurtiçi Kargo entegrasyonu için kullanıcı adı, şifre veya müşteri numarası eksik.', null);
            }

            $totalDeci = 0;
            $totalWeight = 0;
            foreach ($products as $item) {
                if (isset($item['product'])) {
                    $productDeci = (double) ($item['product']->deci ?? 1);
                    $productWeight = (double) ($item['product']->weight ?? 1);
                    $quantity = (int) ($item['quantity'] ?? 1);
                    $totalDeci += $quantity * $productDeci;
                    $totalWeight += $quantity * ($productWeight > 0 ? $productWeight : 1);
                }
            }
            $totalDeci = max($totalDeci, 1);
            $totalWeight = max($totalWeight, 1);

            $invoice_number = $params['invoice_number'] ?? '';
            $order_code = $params['order_code'] ?? $invoice_number;

            $client = new SoapClient($wsdl, [
                'cache_wsdl' => WSDL_CACHE_NONE,
                'trace' => 1,
                'exceptions' => true,
            ]);

            $requestParams = [
                'wsUserName' => $username,
                'wsPassword' => $password,
                'wsUserLanguage' => 'TR',
                'shipmentData' => [
                    'ngiDocumentKey' => $invoice_number,
                    'cargoType' => 2,
                    'totalCargoCount' => 1,
                    'totalDesi' => (string) $totalDeci,
                    'totalWeight' => (string) $totalWeight,
                    'personGiver' => $params['sender_name'],
                    'productCode' => 'STA',
                    'docCargoDataArray' => [
                        'ngiCargoKey' => $invoice_number,
                        'cargoType' => 2,
                        'cargoDesi' => (string) $totalDeci,
                        'cargoWeight' => (string) $totalWeight,
                        'cargoCount' => 1,
                    ],
                    'codData' => [
                        'ttInvoiceAmount' => '',
                        'dcSelectedCredit' => ''
                    ]
                ],
                'XSenderCustAddress' => [
                    'senderCustName' => $params['sender_name'],
                    'senderAddress' => $params['sender_address'],
                    'cityId' => $params['sender_city_id'] ?? '',
                    'townName' => $params['sender_district'],
                    'senderPhone' => $params['sender_mobile_phone']
                ],
                'XConsigneeCustAddress' => [
                    'consigneeCustName' => $params['receiver_name'],
                    'consigneeAddress' => $params['receiver_address'],
                    'cityId' => $params['receiver_city_id'] ?? '',
                    'townName' => $params['receiver_district'],
                    'consigneeMobilePhone' => $params['receiver_mobile_phone']
                ],
                'payerCustData' => [
                    'invCustId' => $customerId,
                ]
            ];

            $response = $client->createNgiShipmentWithAddress($requestParams);

            if (isset($response->XShipmentDataResponse)) {
                $result = $response->XShipmentDataResponse;
                if ((string) $result->outFlag == 0) {
                    return $this->shipmentResponse(200, 'Kargo başarıyla kaydedildi.', $response);
                } else {
                    $errorMsg = $result->outResult ?? 'Bilinmeyen hata';
                    return $this->shipmentResponse(400, 'Bir hata oluştu! Açıklama: ' . $errorMsg);
                }
            } else {
                return $this->shipmentResponse(400, 'Bir hata oluştu, lütfen daha sonra tekrar deneyin!');
            }
        } catch (\Throwable $e) {
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }

    public function cancel($params)
    {
        try {
            $wsdl = $this->yurticiConf['order_link'] ?? null;
            if (empty($wsdl)) {
                return $this->shipmentResponse(503, 'Yurtiçi Kargo WSDL adresi tanımlı değil.', null);
            }

            $username = $this->yurticiConf['username'] ?? null;
            $password = $this->yurticiConf['password'] ?? null;

            $invoice_number = $params['invoice_number'] ?? ($params['barcode'] ?? '');

            $client = new SoapClient($wsdl, [
                'cache_wsdl' => WSDL_CACHE_NONE,
                'trace' => 1,
                'exceptions' => true,
            ]);

            $requestParams = [
                'wsUserName' => $username,
                'wsPassword' => $password,
                'wsUserLanguage' => 'TR',
                'ngiCargoKey' => $invoice_number,
                'ngiDocumentKey' => $invoice_number,
                'cancellationDescription' => $params['cancellation_reason'] ?? 'Müşteri talebi ile iptal edildi',
            ];

            $response = $client->cancelNgiShipment($requestParams);

            if (isset($response->XCancelShipmentResponse)) {
                $result = $response->XCancelShipmentResponse;
                if ((string) $result->outFlag == 0) {
                    return $this->shipmentResponse(200, 'İşlem başarılı bir şekilde gerçekleştirildi.');
                } else {
                    $errorMsg = $result->outResult ?? 'Bilinmeyen hata';
                    return $this->shipmentResponse(400, 'Bir hata oluştu! Açıklama: ' . $errorMsg);
                }
            } else {
                return $this->shipmentResponse(400, 'Bir hata oluştu, lütfen daha sonra tekrar deneyin!');
            }
        } catch (\Throwable $e) {
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }

    public function track($params)
    {
        try {
            $wsdl = $this->yurticiConf['track_link'] ?? null;
            if (empty($wsdl)) {
                return $this->shipmentResponse(503, 'Yurtiçi Kargo takip WSDL adresi tanımlı değil.', null);
            }

            $username = $this->yurticiConf['username'] ?? null;
            $password = $this->yurticiConf['password'] ?? null;
            $customerId = $this->yurticiConf['customer_id'] ?? null;

            $barcode = $params['barcode'] ?? ($params['InvoiceNumber'] ?? '');

            $client = new SoapClient($wsdl, [
                'cache_wsdl' => WSDL_CACHE_NONE,
                'trace' => 1,
                'exceptions' => true,
            ]);

            $requestParams = [
                'userName' => $username,
                'password' => $password,
                'language' => 'tr',
                'custParamsVO' => [
                    'invCustIdArray' => $customerId
                ],
                'fieldName' => 53,
                'fieldValueArray' => $barcode,
                'withCargoLifecycle' => 1
            ];

            $response = $client->listInvDocumentInterfaceByReference($requestParams);

            $data = [
                'status' => 0,
                'description' => 'Sipariş içeriği hazırlanıyor.'
            ];

            if (isset($response->ShippingDataResponseVO)) {
                $result = $response->ShippingDataResponseVO;
                if ($result->outFlag == '0' && isset($result->shippingDataDetailVOArray)) {
                    $detail = $result->shippingDataDetailVOArray;

                    $data['status'] = 1;
                    $data['description'] = 'Kargo yolda.';
                    $data['trackingCode'] = $detail->docId ?? $barcode;
                    $data['trackingURL'] = ($this->yurticiConf['base_tracking_link'] ?? '') . ($data['trackingCode'] ?? '');
                    $data['desi'] = (double) ($detail->totalDesiKg ?? 0);
                    $data['price'] = (double) ($detail->totalAmount ?? 0);
                }
            }

            return $this->shipmentResponse(200, 'Kargo takibi başarılı.', $data);
        } catch (\Throwable $e) {
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }
}
