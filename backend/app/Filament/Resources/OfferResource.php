<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OfferResource\Pages;
use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OfferResource extends Resource
{
    protected static ?string $model = Offer::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $navigationLabel = 'Teklifler';

    protected static ?string $modelLabel = 'Teklif';

    protected static ?string $pluralModelLabel = 'Teklifler';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Teklif Bilgileri')
                    ->schema([
                        Forms\Components\Select::make('product_id')
                            ->label('Ürün')
                            ->relationship('product', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('seller_id')
                            ->label('Satıcı')
                            ->relationship('seller', 'pharmacy_name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('price')
                            ->label('Fiyat (TL)')
                            ->numeric()
                            ->required()
                            ->prefix('₺')
                            ->step(0.01),
                        Forms\Components\TextInput::make('stock')
                            ->label('Stok')
                            ->numeric()
                            ->required()
                            ->minValue(0),
                    ])->columns(2),

                Forms\Components\Section::make('Ek Bilgiler')
                    ->schema([
                        Forms\Components\DatePicker::make('expiry_date')
                            ->label('Son Kullanma Tarihi')
                            ->required()
                            ->native(false)
                            ->minDate(now()->addDay()),
                        Forms\Components\TextInput::make('batch_number')
                            ->label('Parti Numarası')
                            ->maxLength(50),
                        Forms\Components\Select::make('status')
                            ->label('Durum')
                            ->options([
                                'active' => 'Aktif',
                                'inactive' => 'Pasif',
                                'sold_out' => 'Tükendi',
                            ])
                            ->required()
                            ->default('active'),
                        Forms\Components\Textarea::make('notes')
                            ->label('Notlar')
                            ->rows(2)
                            ->maxLength(500),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('product.name')
                    ->label('Ürün')
                    ->searchable()
                    ->sortable()
                    ->limit(25),
                Tables\Columns\TextColumn::make('seller.pharmacy_name')
                    ->label('Satıcı')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('price')
                    ->label('Fiyat')
                    ->money('TRY')
                    ->sortable(),
                Tables\Columns\TextColumn::make('stock')
                    ->label('Stok')
                    ->sortable()
                    ->badge()
                    ->color(fn (int $state): string => match (true) {
                        $state <= 0 => 'danger',
                        $state <= 10 => 'warning',
                        default => 'success',
                    }),
                Tables\Columns\TextColumn::make('expiry_date')
                    ->label('SKT')
                    ->date('d.m.Y')
                    ->sortable()
                    ->color(fn ($record): string => $record->expiry_date->isPast() ? 'danger' : 'success'),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Durum')
                    ->colors([
                        'success' => 'active',
                        'warning' => 'inactive',
                        'danger' => 'sold_out',
                    ])
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'active' => 'Aktif',
                        'inactive' => 'Pasif',
                        'sold_out' => 'Tükendi',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Oluşturulma')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Durum')
                    ->options([
                        'active' => 'Aktif',
                        'inactive' => 'Pasif',
                        'sold_out' => 'Tükendi',
                    ]),
                Tables\Filters\SelectFilter::make('seller_id')
                    ->label('Satıcı')
                    ->relationship('seller', 'pharmacy_name')
                    ->searchable()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('price', 'asc');
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOffers::route('/'),
            'create' => Pages\CreateOffer::route('/create'),
            'edit' => Pages\EditOffer::route('/{record}/edit'),
        ];
    }
}

