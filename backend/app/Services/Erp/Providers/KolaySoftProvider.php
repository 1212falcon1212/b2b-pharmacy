<?php

namespace App\Services\Erp\Providers;

use App\Interfaces\ErpIntegrationInterface;
use App\Models\UserIntegration;
use Illuminate\Support\Facades\Log;
use SoapClient;
use SoapFault;

class KolaySoftProvider implements ErpIntegrationInterface
{
    // Live endpoint
    private const LIVE_WSDL = 'https://servis.smartdonusum.com/EArchiveInvoiceService/EArchiveInvoiceWS?wsdl';
    // Test endpoint
    private const TEST_WSDL = 'https://servis.kolayentegrasyon.net/EArchiveInvoiceService/EArchiveInvoiceWS?wsdl';

    protected UserIntegration $integration;
    protected string $wsdlUrl;
    protected string $username;
    protected string $password;
    protected bool $testMode;
    protected ?SoapClient $client = null;

    public function __construct(UserIntegration $integration)
    {
        $this->integration = $integration;

        $extras = $this->integration->extra_params ?? [];

        $this->username = $extras['username'] ?? $this->integration->api_key ?? '';
        $this->password = $extras['password'] ?? $this->integration->api_secret ?? '';
        $this->testMode = !empty($extras['test_mode']);

        // Use test or live endpoint
        $this->wsdlUrl = $this->testMode ? self::TEST_WSDL : self::LIVE_WSDL;

        // Custom WSDL URL if provided
        if (!empty($extras['wsdl_url'])) {
            $this->wsdlUrl = $extras['wsdl_url'];
        }
    }

    public function getName(): string
    {
        return 'kolaysoft';
    }

    /**
     * Get SOAP Client
     */
    protected function getClient(): SoapClient
    {
        if (!$this->client) {
            try {
                $opts = [
                    'http' => [
                        'header' => "Username: {$this->username}\r\nPassword: {$this->password}\r\n"
                    ],
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                    ]
                ];

                $context = stream_context_create($opts);

                $this->client = new SoapClient($this->wsdlUrl, [
                    'stream_context' => $context,
                    'trace' => 1,
                    'exceptions' => true,
                    'cache_wsdl' => WSDL_CACHE_NONE,
                    'features' => SOAP_SINGLE_ELEMENT_ARRAYS,
                ]);
            } catch (SoapFault $e) {
                Log::error('KolaySoft SOAP Connection Error: ' . $e->getMessage());
                throw $e;
            }
        }
        return $this->client;
    }

    public function testConnection(): bool
    {
        $envLabel = $this->testMode ? '[TEST]' : '[CANLI]';

        try {
            $client = $this->getClient();

            // Test with getPrefixList
            $result = $client->getPrefixList();

            if (isset($result->return->stateExplanation)) {
                $this->integration->update([
                    'status' => 'active',
                    'error_message' => null,
                ]);

                Log::info('KolaySoft Connection Success', [
                    'environment' => $envLabel,
                    'message' => $result->return->stateExplanation,
                ]);

                return true;
            }

            $this->integration->update([
                'status' => 'active',
                'error_message' => null,
            ]);
            return true;
        } catch (SoapFault $e) {
            Log::error('KolaySoft Connection Test Error: ' . $e->getMessage());
            $this->integration->update([
                'status' => 'error',
                'error_message' => $envLabel . ' SOAP Baglanti hatasi: ' . $e->getMessage(),
            ]);
            return false;
        } catch (\Exception $e) {
            $this->integration->update([
                'status' => 'error',
                'error_message' => $envLabel . ' Baglanti hatasi: ' . $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * KolaySoft is for E-Invoice only, not product sync
     */
    public function getProducts(int $page = 1, int $limit = 100): array
    {
        // KolaySoft doesn't support product sync
        return [];
    }

    public function mapToSystemSchema(array $erpProduct): array
    {
        // Not applicable for KolaySoft
        return [];
    }

    /**
     * Create E-Invoice via KolaySoft
     */
    public function createInvoice(array $invoiceData): array
    {
        try {
            $uuid = $invoiceData['uuid'] ?? \Illuminate\Support\Str::uuid()->toString();
            $invoiceNo = $invoiceData['invoice_no'] ?? '';
            $prefix = $invoiceData['document_no_prefix'] ?? ('DNM' . date('Y'));

            // Generate UBL XML (simplified - in production use UBL generator)
            $xmlContent = $this->generateSimpleUBL($invoiceData);

            Log::info('KolaySoft Invoice Request', [
                'uuid' => $uuid,
                'invoice_no' => $invoiceNo,
                'prefix' => $prefix,
            ]);

            // SOAP Envelope
            $soapEnvelope = '<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://earchiveinvoiceservice.entegrator.com/">
<soap:Body>
<ns1:sendInvoice>
<invoiceXMLList>
<documentUUID>' . $uuid . '</documentUUID>
<documentId>' . $invoiceNo . '</documentId>
<xmlContent><![CDATA[' . $xmlContent . ']]></xmlContent>
<sourceUrn>' . ($invoiceData['source_urn'] ?? 'urn:mail:defaultpk') . '</sourceUrn>
<destinationUrn>' . ($invoiceData['destination_urn'] ?? 'urn:mail:defaultgb') . '</destinationUrn>
<documentDate>' . ($invoiceData['issue_date'] ?? date('Y-m-d')) . '</documentDate>
<submitForApproval>' . (($invoiceData['submit_for_approval'] ?? true) ? 'true' : 'false') . '</submitForApproval>
<documentNoPrefix>' . $prefix . '</documentNoPrefix>
</invoiceXMLList>
</ns1:sendInvoice>
</soap:Body>
</soap:Envelope>';

            $response = $this->sendSoapRequest($soapEnvelope);

            // Parse response
            $code = null;
            $explanation = null;

            if (preg_match('/<code>([^<]*)<\/code>/', $response['body'], $m)) $code = $m[1];
            if (preg_match('/<explanation>([^<]*)<\/explanation>/', $response['body'], $m)) $explanation = $m[1];
            if (preg_match('/<faultstring>([^<]*)<\/faultstring>/', $response['body'], $m)) {
                return [
                    'success' => false,
                    'message' => 'SOAP Fault: ' . $m[1],
                    'invoice_id' => $uuid,
                ];
            }

            $successCodes = ['000', '200', 'SUCCESS', '0'];
            if (in_array($code, $successCodes)) {
                return [
                    'success' => true,
                    'message' => $explanation ?? 'Fatura basariyla gonderildi.',
                    'invoice_id' => $uuid,
                    'invoice_no' => $invoiceNo,
                ];
            }

            return [
                'success' => false,
                'message' => 'Fatura gonderimi basarisiz: ' . ($explanation ?? 'Bilinmeyen Hata'),
                'invoice_id' => $uuid,
            ];
        } catch (\Exception $e) {
            Log::error('KolaySoft Invoice Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Sistem Hatasi: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send SOAP request via CURL
     */
    protected function sendSoapRequest(string $soapXml): array
    {
        $endpoint = str_replace('?wsdl', '', $this->wsdlUrl);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $endpoint,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $soapXml,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: text/xml; charset=utf-8',
                'SOAPAction: ""',
                'Username: ' . $this->username,
                'Password: ' . $this->password,
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT => 60,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception('CURL Error: ' . $error);
        }

        return [
            'http_code' => $httpCode,
            'body' => $response
        ];
    }

    /**
     * Generate simple UBL XML (placeholder - use proper UBL generator in production)
     */
    protected function generateSimpleUBL(array $data): string
    {
        // This is a simplified placeholder
        // In production, use the KolaySoftUBLGenerator class
        return '<?xml version="1.0" encoding="UTF-8"?><Invoice></Invoice>';
    }

    /**
     * Get prefix list
     */
    public function getPrefixList(): array
    {
        try {
            $client = $this->getClient();
            $result = $client->getPrefixList();

            return [
                'success' => true,
                'message' => $result->return->stateExplanation ?? 'Basarili',
                'data' => $result->return ?? null
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Prefix listesi alinamadi: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get customer credit count
     */
    public function getCreditCount(): array
    {
        try {
            $client = $this->getClient();
            $result = $client->getCustomerCreditCount();

            return [
                'success' => true,
                'credit_count' => $result->return ?? 0,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'credit_count' => 0,
                'message' => 'Kredi sayisi alinamadi: ' . $e->getMessage(),
            ];
        }
    }
}
