<?php

namespace Modules\Cargo\Drivers\Aras;

use Modules\Cargo\Contracts\ShipmentInterface;
use Modules\Cargo\Support\ShipmentBase;
use SoapClient;

class Aras extends ShipmentBase implements ShipmentInterface
{
    protected $aras_conf = [];

    public function __construct($config)
    {
        $this->aras_conf = config('cargo.aras');
        parent::__construct($config);
    }

    public function send($params, $products)
    {
        try {
            if (!isset($params['is_order_return']) && empty($params['sender_address_id'])) {
                return $this->shipmentResponse(404, 'Gönderici adres anahtarı bulunamadı!');
            }

            $payment_type = in_array($params['payment_type'] ?? '', ['Gonderici_Odeyecek', 'Platform_Odeyecek']) ? '1' : '2';

            $sender_phone = $params['sender_mobile_phone'] ?? '';
            $receiver_phone = $params['receiver_mobile_phone'] ?? '';

            $requestParams = [
                'customerInfo' => [
                    'CustomerCode' => $this->aras_conf['customer_code'],
                    'UserName' => $this->aras_conf['username'],
                    'Password' => $this->aras_conf['password'],
                ],
                'model' => [
                    'ConfigurationId' => $this->aras_conf['configuration_id'],
                    'IntegrationCode' => $params['invoice_number'],
                    'InvoiceNumber' => $params['invoice_number'],
                    'TradingWaybillNumber' => $params['invoice_number'],
                    'LovPayOrType' => $payment_type,
                    'MainServiceCode' => 'STNK',
                    'ReceiverAddressInfo' => [
                        'Address' => $params['receiver_address'],
                        'AddressId' => $params['receiver_address_id'] ?? '',
                        'CityName' => $params['receiver_city'],
                        'MobilePhone' => $receiver_phone,
                        'Name' => $params['receiver_name'],
                        'TaxNumber' => $params['receiver_tax_number'] ?? '',
                        'TaxOffice' => $params['receiver_tax_office'] ?? '',
                        'TownName' => $params['receiver_district']
                    ],
                    'SenderAddressInfo' => [
                        'Address' => $params['sender_address'],
                        'AddressId' => $params['sender_address_id'] ?? '',
                        'CityName' => $params['sender_city'],
                        'MobilePhone' => $sender_phone,
                        'Name' => $params['sender_name'],
                        'TaxNumber' => $params['sender_tax_number'] ?? '',
                        'TaxOffice' => $params['sender_tax_office'] ?? '',
                        'TownName' => $params['sender_district']
                    ]
                ]
            ];

            $client = new SoapClient($this->aras_conf['order_link']);
            $response = $client->SaveOrder($requestParams);

            if (isset($response->SaveOrderResult)) {
                $result = $response->SaveOrderResult;
                $code = $result->Result == 1 ? 200 : 404;
                return $this->shipmentResponse($code, $result->Description, $result->Result);
            } else {
                return $this->shipmentResponse(503, 'Bir hata oluştu!');
            }
        } catch (\Throwable $e) {
            return $this->shipmentResponse(503, $e->getMessage(), $e);
        }
    }

    public function cancel($params)
    {
        try {
            $client = new SoapClient($this->aras_conf['order_link']);

            $requestParams = [
                'orderCode' => $params['invoice_number'],
                'customerInfo' => [
                    'CustomerCode' => $this->aras_conf['customer_code'],
                    'UserName' => $this->aras_conf['username'],
                    'Password' => $this->aras_conf['password'],
                ]
            ];

            $response = $client->DeleteOrder($requestParams);

            if (isset($response->DeleteOrderResult)) {
                $result = $response->DeleteOrderResult;
                if ($result->Result == 1) {
                    return $this->shipmentResponse(200, 'Kargo Başarılı bir şekilde iptal edildi.', $result->Description);
                } else {
                    return $this->shipmentResponse(400, 'İptal işlemi yapılamadı. Daha önce iptal edilmiş olabilir');
                }
            }
            return $this->shipmentResponse(503, 'Beklenmedik hata');
        } catch (\Throwable $e) {
            return $this->shipmentResponse(503, $e->getMessage());
        }
    }

    public function track($params)
    {
        $login_info = '
            <LoginInfo>
                <UserName>' . $this->aras_conf['username'] . '</UserName>
                <Password>' . $this->aras_conf['password'] . '</Password>
                <CustomerCode>' . $this->aras_conf['customer_code'] . '</CustomerCode>
            </LoginInfo>';

        $query_info = '
            <QueryInfo>
                <QueryType>39</QueryType>
                <IntegrationCode>' . $params['InvoiceNumber'] . '</IntegrationCode>
            </QueryInfo>';

        try {
            $client = new SoapClient($this->aras_conf['track_link'], ['encoding' => 'utf-8']);

            $requestParams = [
                'loginInfo' => $login_info,
                'queryInfo' => $query_info
            ];

            $response = $client->GetQueryXML($requestParams);

            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($response->GetQueryXMLResult);
            libxml_use_internal_errors(false);

            if (isset($xml->Collection)) {
                $result = $xml->Collection;

                $data = [
                    'status' => $this->getStatusCode((int) $result->DURUM_KODU, (int) $result->TIP_KODU),
                    'trackingCode' => (string) $result->KARGO_TAKIP_NO,
                    'trackingURL' => $this->aras_conf['base_tracking_link'] . (string) $result->KARGO_TAKIP_NO,
                    'description' => (string) $result->DURUMU,
                    'desi' => (double) $result->KG_DESI,
                    'price' => (double) $result->TUTAR,
                ];
            } else {
                $data['status'] = 0;
                $data['description'] = 'Sipariş içeriği hazırlanıyor.';
            }
            return $this->shipmentResponse(200, 'Kargo takibi başarılı.', $data);
        } catch (\Throwable $e) {
            return $this->shipmentResponse(503, 'Bir hata oluştu!', $e);
        }
    }

    private function getStatusCode($status_code, $type_code)
    {
        if ($type_code == 1 || $type_code == 2) {
            if ($status_code == 6) {
                return 5;
            } elseif ($status_code == 7) {
                return 4;
            } else {
                return $status_code;
            }
        } elseif ($type_code == 3) {
            return 7;
        } else {
            return 0;
        }
    }
}
