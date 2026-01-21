<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GlnWhitelistResource\Pages;
use App\Models\GlnWhitelist;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class GlnWhitelistResource extends Resource
{
    protected static ?string $model = GlnWhitelist::class;

    protected static ?string $navigationIcon = 'heroicon-o-shield-check';

    protected static ?string $navigationLabel = 'GLN Whitelist';

    protected static ?string $modelLabel = 'GLN Kaydı';

    protected static ?string $pluralModelLabel = 'GLN Whitelist';

    protected static ?string $navigationGroup = 'Ayarlar';

    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('GLN Bilgileri')
                    ->schema([
                        Forms\Components\TextInput::make('gln_code')
                            ->label('GLN Kodu')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(13)
                            ->minLength(13)
                            ->numeric(),
                        Forms\Components\TextInput::make('pharmacy_name')
                            ->label('Eczane Adı')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('city')
                            ->label('Şehir')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('district')
                            ->label('İlçe')
                            ->maxLength(100),
                        Forms\Components\Textarea::make('address')
                            ->label('Adres')
                            ->rows(2)
                            ->maxLength(500),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Aktif')
                            ->default(true),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('gln_code')
                    ->label('GLN Kodu')
                    ->searchable()
                    ->copyable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('pharmacy_name')
                    ->label('Eczane Adı')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('city')
                    ->label('Şehir')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('district')
                    ->label('İlçe')
                    ->searchable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Eklenme Tarihi')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Aktif Durumu'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
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
            'index' => Pages\ListGlnWhitelists::route('/'),
            'create' => Pages\CreateGlnWhitelist::route('/create'),
            'edit' => Pages\EditGlnWhitelist::route('/{record}/edit'),
        ];
    }
}

