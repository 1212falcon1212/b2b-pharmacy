<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class PaymentSettingsPage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-credit-card';

    protected static string $view = 'filament.pages.payment-settings';

    protected static ?string $navigationLabel = 'Ödeme Ayarları';

    protected static ?string $title = 'Ödeme Sistemi Ayarları';

    protected static ?string $navigationGroup = 'Ayarlar';

    protected static ?int $navigationSort = 100;

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'active_gateway' => Setting::getValue('payment.active_gateway', 'none'),
            'test_mode' => Setting::getValue('payment.test_mode', true),
            // Iyzico
            'iyzico_api_key' => Setting::getValue('payment.iyzico_api_key', ''),
            'iyzico_secret_key' => Setting::getValue('payment.iyzico_secret_key', ''),
            'iyzico_base_url' => Setting::getValue('payment.iyzico_base_url', 'https://sandbox-api.iyzipay.com'),
            // PayTR
            'paytr_merchant_id' => Setting::getValue('payment.paytr_merchant_id', ''),
            'paytr_merchant_key' => Setting::getValue('payment.paytr_merchant_key', ''),
            'paytr_merchant_salt' => Setting::getValue('payment.paytr_merchant_salt', ''),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Genel Ayarlar')
                    ->description('Aktif ödeme geçidi ve test modu ayarları')
                    ->schema([
                        Forms\Components\Select::make('active_gateway')
                            ->label('Aktif Ödeme Geçidi')
                            ->options([
                                'none' => 'Ödeme Kapalı',
                                'iyzico' => 'Iyzico',
                                'paytr' => 'PayTR',
                            ])
                            ->default('none')
                            ->required()
                            ->live()
                            ->helperText('Kullanılacak ödeme sistemini seçin'),

                        Forms\Components\Toggle::make('test_mode')
                            ->label('Test Modu')
                            ->default(true)
                            ->helperText('Test modunda gerçek ödeme alınmaz'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Iyzico Ayarları')
                    ->description('Iyzico API bilgileri')
                    ->schema([
                        Forms\Components\TextInput::make('iyzico_api_key')
                            ->label('API Key')
                            ->placeholder('sandbox-xxxxxxxxxxxx')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('iyzico_secret_key')
                            ->label('Secret Key')
                            ->password()
                            ->maxLength(255),

                        Forms\Components\Select::make('iyzico_base_url')
                            ->label('API URL')
                            ->options([
                                'https://sandbox-api.iyzipay.com' => 'Sandbox (Test)',
                                'https://api.iyzipay.com' => 'Production (Canlı)',
                            ])
                            ->default('https://sandbox-api.iyzipay.com'),
                    ])
                    ->columns(3)
                    ->visible(fn(Forms\Get $get): bool => $get('active_gateway') === 'iyzico'),

                Forms\Components\Section::make('PayTR Ayarları')
                    ->description('PayTR API bilgileri')
                    ->schema([
                        Forms\Components\TextInput::make('paytr_merchant_id')
                            ->label('Merchant ID')
                            ->placeholder('123456')
                            ->maxLength(50),

                        Forms\Components\TextInput::make('paytr_merchant_key')
                            ->label('Merchant Key')
                            ->password()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('paytr_merchant_salt')
                            ->label('Merchant Salt')
                            ->password()
                            ->maxLength(255),
                    ])
                    ->columns(3)
                    ->visible(fn(Forms\Get $get): bool => $get('active_gateway') === 'paytr'),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        // Save general settings
        Setting::setValue('payment.active_gateway', $data['active_gateway'], 'payment', 'string');
        Setting::setValue('payment.test_mode', $data['test_mode'], 'payment', 'boolean');

        // Save Iyzico settings (encrypted)
        Setting::setValue('payment.iyzico_api_key', $data['iyzico_api_key'], 'payment', 'encrypted');
        Setting::setValue('payment.iyzico_secret_key', $data['iyzico_secret_key'], 'payment', 'encrypted');
        Setting::setValue('payment.iyzico_base_url', $data['iyzico_base_url'], 'payment', 'string');

        // Save PayTR settings (encrypted)
        Setting::setValue('payment.paytr_merchant_id', $data['paytr_merchant_id'], 'payment', 'encrypted');
        Setting::setValue('payment.paytr_merchant_key', $data['paytr_merchant_key'], 'payment', 'encrypted');
        Setting::setValue('payment.paytr_merchant_salt', $data['paytr_merchant_salt'], 'payment', 'encrypted');

        Notification::make()
            ->title('Ödeme ayarları kaydedildi')
            ->success()
            ->send();
    }

    protected function getFormActions(): array
    {
        return [
            Forms\Components\Actions\Action::make('save')
                ->label('Kaydet')
                ->submit('save'),
        ];
    }
}
