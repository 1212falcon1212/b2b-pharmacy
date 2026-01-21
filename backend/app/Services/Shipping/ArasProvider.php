<?php

namespace App\Services\Shipping;

use App\Interfaces\ShippingProviderInterface;
use App\Interfaces\ShipmentResult;
use App\Interfaces\TrackingResult;
use App\Models\Order;
use App\Models\Setting;
use App\Models\ShippingLog;
use Illuminate\Support\Facades\Log;
use SoapClient;

/**
 * Aras Kargo Provider
 */
class ArasProvider implements ShippingProviderInterface
{
    protected array $config;
    protected bool $enabled;

    public function __construct()
    {
        $this->config = [
            'customer_code' => Setting::getValue('shipping.aras_customer_code', ''),
            'username' => Setting::getValue('shipping.aras_username', ''),
            'password' => Setting::getValue('shipping.aras_password', '', true),
            'configuration_id' => Setting::getValue('shipping.aras_configuration_id', ''),
            'order_link' => 'https://customerws.araskargo.com.tr/ArasCargoCustomerIntegrationService/ArasCargoIntegrationService.svc?wsdl',
            'track_link' => 'https://customerws.araskargo.com.tr/ArasCargoIntegrationService/ArasCargoIntegrationService.svc?wsdl',
            'base_tracking_link' => 'https://kargotakip.araskargo.com.tr/mainpage.aspx?code=',
        ];
        $this->enabled = Setting::getValue('shipping.aras_enabled', false);
    }

    public function getName(): string
    {
        return 'aras';
    }

    public function isAvailable(): bool
    {
        return $this->enabled && !empty($this->config['customer_code']) && !empty($this->config['username']);
    }

    public function createShipment(Order $order, array $senderInfo): ShipmentResult
    {
        if (!$this->isAvailable()) {
            return ShipmentResult::failure('Aras Kargo entegrasyonu aktif değil.');
        }

        try {
            $shippingAddress = $order->shipping_address;

            $requestParams = [
                'customerInfo' => [
                    'CustomerCode' => $this->config['customer_code'],
                    'UserName' => $this->config['username'],
                    'Password' => $this->config['password'],
                ],
                'model' => [
                    'ConfigurationId' => $this->config['configuration_id'],
                    'IntegrationCode' => $order->order_number,
                    'InvoiceNumber' => $order->order_number,
                    'TradingWaybillNumber' => $order->order_number,
                    'LovPayOrType' => '1', // Gönderici öder
                    'MainServiceCode' => 'STNK',
                    'ReceiverAddressInfo' => [
                        'Address' => $shippingAddress['address'] ?? '',
                        'CityName' => $shippingAddress['city'] ?? '',
                        'TownName' => $shippingAddress['district'] ?? '',
                        'MobilePhone' => $shippingAddress['phone'] ?? '',
                        'Name' => $shippingAddress['name'] ?? '',
                    ],
                    'SenderAddressInfo' => [
                        'Address' => $senderInfo['address'] ?? '',
                        'CityName' => $senderInfo['city'] ?? '',
                        'TownName' => $senderInfo['district'] ?? '',
                        'MobilePhone' => $senderInfo['phone'] ?? '',
                        'Name' => $senderInfo['name'] ?? '',
                    ],
                ],
            ];

            $this->logRequest($order, 'create', $requestParams);

            $client = new SoapClient($this->config['order_link']);
            $response = $client->SaveOrder($requestParams);

            if (isset($response->SaveOrderResult)) {
                $result = $response->SaveOrderResult;

                if ($result->Result == 1) {
                    $this->logResponse($order, 'create', (array) $result, 200);
                    return ShipmentResult::success(
                        trackingNumber: $order->order_number,
                        message: $result->Description ?? 'Kargo başarıyla oluşturuldu.',
                    );
                } else {
                    $this->logResponse($order, 'create', (array) $result, 400, $result->Description ?? 'Hata');
                    return ShipmentResult::failure($result->Description ?? 'Kargo oluşturulamadı.', 400);
                }
            }

            return ShipmentResult::failure('Beklenmedik API yanıtı.', 500);
        } catch (\Throwable $e) {
            $this->logResponse($order, 'create', [], 503, $e->getMessage());
            Log::error('Aras createShipment error: ' . $e->getMessage());
            return ShipmentResult::failure($e->getMessage(), 503);
        }
    }

    public function cancelShipment(Order $order): ShipmentResult
    {
        if (!$this->isAvailable()) {
            return ShipmentResult::failure('Aras Kargo entegrasyonu aktif değil.');
        }

        try {
            $requestParams = [
                'orderCode' => $order->order_number,
                'customerInfo' => [
                    'CustomerCode' => $this->config['customer_code'],
                    'UserName' => $this->config['username'],
                    'Password' => $this->config['password'],
                ],
            ];

            $this->logRequest($order, 'cancel', $requestParams);

            $client = new SoapClient($this->config['order_link']);
            $response = $client->DeleteOrder($requestParams);

            if (isset($response->DeleteOrderResult)) {
                $result = $response->DeleteOrderResult;

                if ($result->Result == 1) {
                    $this->logResponse($order, 'cancel', (array) $result, 200);
                    return ShipmentResult::success($order->tracking_number ?? '', message: 'Kargo iptal edildi.');
                } else {
                    $this->logResponse($order, 'cancel', (array) $result, 400, 'İptal başarısız');
                    return ShipmentResult::failure('İptal işlemi yapılamadı.', 400);
                }
            }

            return ShipmentResult::failure('Beklenmedik API yanıtı.', 500);
        } catch (\Throwable $e) {
            $this->logResponse($order, 'cancel', [], 503, $e->getMessage());
            return ShipmentResult::failure($e->getMessage(), 503);
        }
    }

    public function trackShipment(Order $order): TrackingResult
    {
        if (!$this->isAvailable()) {
            return TrackingResult::failure('Aras Kargo entegrasyonu aktif değil.');
        }

        try {
            $loginInfo = '<LoginInfo>
                <UserName>' . $this->config['username'] . '</UserName>
                <Password>' . $this->config['password'] . '</Password>
                <CustomerCode>' . $this->config['customer_code'] . '</CustomerCode>
            </LoginInfo>';

            $queryInfo = '<QueryInfo>
                <QueryType>39</QueryType>
                <IntegrationCode>' . $order->order_number . '</IntegrationCode>
            </QueryInfo>';

            $client = new SoapClient($this->config['track_link'], ['encoding' => 'utf-8']);
            $response = $client->GetQueryXML([
                'loginInfo' => $loginInfo,
                'queryInfo' => $queryInfo,
            ]);

            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($response->GetQueryXMLResult);
            libxml_use_internal_errors(false);

            if (isset($xml->Collection)) {
                $result = $xml->Collection;
                $statusCode = (int) $result->DURUM_KODU;
                $status = $this->mapStatus($statusCode);
                $trackingNo = (string) $result->KARGO_TAKIP_NO;

                return TrackingResult::fromStatus(
                    status: $status['code'],
                    statusLabel: (string) $result->DURUMU ?: $status['label'],
                    trackingNumber: $trackingNo,
                    trackingUrl: $this->config['base_tracking_link'] . $trackingNo,
                );
            }

            return TrackingResult::fromStatus('pending', 'Sipariş hazırlanıyor');
        } catch (\Throwable $e) {
            return TrackingResult::failure($e->getMessage());
        }
    }

    public function getLabel(Order $order): ?string
    {
        // Aras barkod/etiket için ayrı endpoint kullanılır
        return null;
    }

    protected function mapStatus(int $code): array
    {
        return match ($code) {
            1, 2 => ['code' => 'processing', 'label' => 'Hazırlanıyor'],
            3, 4 => ['code' => 'shipped', 'label' => 'Kargoya verildi'],
            5 => ['code' => 'in_transit', 'label' => 'Yolda'],
            6 => ['code' => 'out_for_delivery', 'label' => 'Dağıtımda'],
            7 => ['code' => 'delivered', 'label' => 'Teslim edildi'],
            8 => ['code' => 'returned', 'label' => 'İade edildi'],
            default => ['code' => 'pending', 'label' => 'Bekliyor'],
        };
    }

    protected function logRequest(Order $order, string $action, array $request): void
    {
        ShippingLog::create([
            'order_id' => $order->id,
            'provider' => $this->getName(),
            'action' => $action,
            'request' => $request,
            'status' => 'pending',
        ]);
    }

    protected function logResponse(Order $order, string $action, array $response, int $code, ?string $error = null): void
    {
        ShippingLog::where('order_id', $order->id)
            ->where('provider', $this->getName())
            ->where('action', $action)
            ->where('status', 'pending')
            ->latest()
            ->first()
                ?->update([
                'response' => $response,
                'response_code' => $code,
                'status' => $error ? 'failed' : 'success',
                'error' => $error,
            ]);
    }
}
