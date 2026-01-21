<?php

namespace App\Filament\Pages;

use App\Models\Category;
use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;

class CommissionSettingsPage extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-calculator';

    protected static string $view = 'filament.pages.commission-settings';

    protected static ?string $navigationLabel = 'Komisyon Ayarları';

    protected static ?string $title = 'Komisyon Ayarları';

    protected static ?string $navigationGroup = 'Finans';

    protected static ?int $navigationSort = 2;

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'default_commission_rate' => Setting::getValue('commission.default_rate', 8),
            'minimum_commission' => Setting::getValue('commission.minimum', 1),
            'commission_enabled' => Setting::getValue('commission.enabled', true),
            'commission_calculation' => Setting::getValue('commission.calculation', 'percentage'),
            'marketplace_fee_rate' => Setting::getValue('commission.marketplace_fee_rate', 0.89),
            'withholding_tax_rate' => Setting::getValue('commission.withholding_tax_rate', 1.00),
            'commission_tax_rate' => Setting::getValue('commission.tax_rate', 18),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Genel Komisyon Ayarları')
                    ->description('Platform genelinde geçerli komisyon kuralları')
                    ->schema([
                        Forms\Components\Toggle::make('commission_enabled')
                            ->label('Komisyon Sistemi Aktif')
                            ->default(true)
                            ->helperText('Devre dışı bırakılırsa hiç komisyon kesilmez'),

                        Forms\Components\TextInput::make('default_commission_rate')
                            ->label('Varsayılan Komisyon Oranı')
                            ->numeric()
                            ->suffix('%')
                            ->minValue(0)
                            ->maxValue(50)
                            ->default(8)
                            ->helperText('Kategori belirtilmemişse bu oran uygulanır'),

                        Forms\Components\TextInput::make('minimum_commission')
                            ->label('Minimum Komisyon Tutarı')
                            ->numeric()
                            ->suffix('₺')
                            ->minValue(0)
                            ->default(1)
                            ->helperText('Her işlem için minimum kesilecek tutar'),

                        Forms\Components\Select::make('commission_calculation')
                            ->label('Komisyon Hesaplama Yöntemi')
                            ->options([
                                'percentage' => 'Yüzdelik (%)',
                                'fixed' => 'Sabit Tutar (₺)',
                                'mixed' => 'Karma (% + Sabit)',
                            ])
                            ->default('percentage'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Ek Kesintiler')
                    ->description('Komisyon dışında satıcılardan alınan kesintiler')
                    ->schema([
                        Forms\Components\TextInput::make('marketplace_fee_rate')
                            ->label('Pazaryeri Hizmet Bedeli')
                            ->numeric()
                            ->suffix('%')
                            ->step(0.01)
                            ->minValue(0)
                            ->maxValue(10)
                            ->default(0.89)
                            ->helperText('Her satıştan alınan platform hizmet bedeli'),

                        Forms\Components\TextInput::make('withholding_tax_rate')
                            ->label('Stopaj Oranı')
                            ->numeric()
                            ->suffix('%')
                            ->step(0.01)
                            ->minValue(0)
                            ->maxValue(10)
                            ->default(1.00)
                            ->helperText('Vergi stopajı kesintisi'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('KDV Ayarları')
                    ->description('Komisyon üzerinden alınan vergiler')
                    ->schema([
                        Forms\Components\TextInput::make('commission_tax_rate')
                            ->label('Komisyon KDV Oranı')
                            ->numeric()
                            ->suffix('%')
                            ->default(18)
                            ->helperText('Komisyon faturasına uygulanacak KDV'),
                    ])
                    ->columns(2),
            ])
            ->statePath('data');
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(Category::query())
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Kategori')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('commission_rate')
                    ->label('Komisyon Oranı')
                    ->suffix('%')
                    ->sortable()
                    ->badge()
                    ->color(fn($state) => $state > 10 ? 'danger' : ($state > 5 ? 'warning' : 'success')),

                Tables\Columns\TextColumn::make('tax_rate')
                    ->label('KDV Oranı')
                    ->suffix('%')
                    ->sortable(),

                Tables\Columns\TextColumn::make('products_count')
                    ->label('Ürün Sayısı')
                    ->counts('products')
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\Action::make('edit')
                    ->label('Düzenle')
                    ->icon('heroicon-o-pencil')
                    ->form([
                        Forms\Components\TextInput::make('commission_rate')
                            ->label('Komisyon Oranı (%)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(50)
                            ->required(),
                        Forms\Components\TextInput::make('tax_rate')
                            ->label('KDV Oranı (%)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(20)
                            ->required(),
                    ])
                    ->fillForm(fn(Category $record): array => [
                        'commission_rate' => $record->commission_rate,
                        'tax_rate' => $record->tax_rate,
                    ])
                    ->action(function (Category $record, array $data): void {
                        $record->update([
                            'commission_rate' => $data['commission_rate'],
                            'tax_rate' => $data['tax_rate'],
                        ]);
                        Notification::make()
                            ->title('Kategori güncellendi')
                            ->success()
                            ->send();
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkAction::make('updateCommission')
                    ->label('Toplu Komisyon Güncelle')
                    ->icon('heroicon-o-pencil-square')
                    ->form([
                        Forms\Components\TextInput::make('commission_rate')
                            ->label('Yeni Komisyon Oranı (%)')
                            ->numeric()
                            ->required(),
                    ])
                    ->action(function ($records, array $data) {
                        $records->each(function ($record) use ($data) {
                            $record->update(['commission_rate' => $data['commission_rate']]);
                        });
                        Notification::make()
                            ->title($records->count() . ' kategori güncellendi')
                            ->success()
                            ->send();
                    }),
            ])
            ->defaultSort('name');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        Setting::setValue('commission.enabled', $data['commission_enabled'] ?? true);
        Setting::setValue('commission.default_rate', $data['default_commission_rate'] ?? 8);
        Setting::setValue('commission.minimum', $data['minimum_commission'] ?? 1);
        Setting::setValue('commission.calculation', $data['commission_calculation'] ?? 'percentage');
        Setting::setValue('commission.tax_rate', $data['commission_tax_rate'] ?? 18);
        Setting::setValue('commission.marketplace_fee_rate', $data['marketplace_fee_rate'] ?? 0.89);
        Setting::setValue('commission.withholding_tax_rate', $data['withholding_tax_rate'] ?? 1.00);

        Setting::clearCache();

        Notification::make()
            ->title('Komisyon ayarları kaydedildi')
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
