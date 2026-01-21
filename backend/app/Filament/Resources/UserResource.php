<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Mail\PharmacyApprovedMail;
use App\Mail\PharmacyRejectedMail;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationLabel = 'Eczacılar';

    protected static ?string $modelLabel = 'Eczacı';

    protected static ?string $pluralModelLabel = 'Eczacılar';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Hesap Bilgileri')
                    ->schema([
                        Forms\Components\TextInput::make('email')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),
                        Forms\Components\TextInput::make('password')
                            ->password()
                            ->dehydrateStateUsing(fn($state) => Hash::make($state))
                            ->dehydrated(fn($state) => filled($state))
                            ->required(fn(string $context): bool => $context === 'create')
                            ->maxLength(255),
                    ])->columns(2),

                Forms\Components\Section::make('Eczane Bilgileri')
                    ->schema([
                        Forms\Components\TextInput::make('gln_code')
                            ->label('GLN Kodu')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(13)
                            ->minLength(13),
                        Forms\Components\TextInput::make('pharmacy_name')
                            ->label('Eczane Adı')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('phone')
                            ->label('Telefon')
                            ->tel()
                            ->maxLength(20),
                        Forms\Components\TextInput::make('city')
                            ->label('Şehir')
                            ->maxLength(100),
                        Forms\Components\Textarea::make('address')
                            ->label('Adres')
                            ->rows(3)
                            ->maxLength(500),
                    ])->columns(2),

                Forms\Components\Section::make('Yetki ve Durum')
                    ->schema([
                        Forms\Components\Select::make('role')
                            ->label('Rol')
                            ->options([
                                'super-admin' => 'Süper Admin',
                                'pharmacist' => 'Eczacı',
                            ])
                            ->required()
                            ->default('pharmacist'),
                        Forms\Components\Select::make('verification_status')
                            ->label('Doğrulama Durumu')
                            ->options([
                                'pending' => 'Onay Bekliyor',
                                'approved' => 'Onaylandı',
                                'rejected' => 'Reddedildi',
                            ])
                            ->default('pending'),
                        Forms\Components\Toggle::make('is_verified')
                            ->label('Doğrulandı')
                            ->default(false),
                    ])->columns(3),

                Forms\Components\Section::make('Belgeler')
                    ->schema([
                        Forms\Components\KeyValue::make('documents')
                            ->label('Yüklenen Belgeler')
                            ->keyLabel('Belge Türü')
                            ->valueLabel('Dosya URL')
                            ->addable(false)
                            ->deletable(false)
                            ->editableKeys(false)
                            ->editableValues(false),
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Ret Sebebi')
                            ->rows(3)
                            ->visible(fn($record) => $record?->verification_status === 'rejected'),
                    ])
                    ->collapsible(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('pharmacy_name')
                    ->label('Eczane Adı')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('gln_code')
                    ->label('GLN Kodu')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('city')
                    ->label('Şehir')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('verification_status')
                    ->label('Durum')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'approved',
                        'danger' => 'rejected',
                    ])
                    ->formatStateUsing(fn($state) => User::VERIFICATION_STATUS_LABELS[$state] ?? $state),
                Tables\Columns\BadgeColumn::make('role')
                    ->label('Rol')
                    ->colors([
                        'danger' => 'super-admin',
                        'success' => 'pharmacist',
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Kayıt Tarihi')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('verification_status')
                    ->label('Doğrulama Durumu')
                    ->options([
                        'pending' => 'Onay Bekliyor',
                        'approved' => 'Onaylandı',
                        'rejected' => 'Reddedildi',
                    ]),
                Tables\Filters\SelectFilter::make('role')
                    ->label('Rol')
                    ->options([
                        'super-admin' => 'Süper Admin',
                        'pharmacist' => 'Eczacı',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Onayla')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn($record) => $record->verification_status === 'pending' && $record->role === 'pharmacist')
                    ->requiresConfirmation()
                    ->modalHeading('Eczane Onayı')
                    ->modalDescription('Bu eczaneyi onaylamak istediğinize emin misiniz? Kullanıcıya hoş geldin e-postası gönderilecektir.')
                    ->action(function ($record) {
                        $record->approve(auth()->id());

                        // Send welcome email
                        Mail::to($record->email)->queue(new PharmacyApprovedMail($record));

                        Notification::make()
                            ->title('Eczane onaylandı')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\Action::make('reject')
                    ->label('Reddet')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn($record) => $record->verification_status === 'pending' && $record->role === 'pharmacist')
                    ->form([
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Ret Sebebi')
                            ->required()
                            ->rows(3)
                            ->placeholder('Lütfen ret sebebini belirtiniz...'),
                    ])
                    ->action(function ($record, array $data) {
                        $record->reject($data['rejection_reason'], auth()->id());

                        // Send rejection email
                        Mail::to($record->email)->queue(new PharmacyRejectedMail($record, $data['rejection_reason']));

                        Notification::make()
                            ->title('Başvuru reddedildi')
                            ->warning()
                            ->send();
                    }),

                Tables\Actions\Action::make('viewDocuments')
                    ->label('Belgeler')
                    ->icon('heroicon-o-document-text')
                    ->color('info')
                    ->visible(fn($record) => !empty($record->documents))
                    ->modalHeading('Yüklenen Belgeler')
                    ->modalContent(fn($record) => view('filament.modals.user-documents', ['documents' => $record->documents]))
                    ->modalSubmitAction(false),

                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('bulkApprove')
                        ->label('Toplu Onayla')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function ($records) {
                            foreach ($records as $record) {
                                if ($record->verification_status === 'pending') {
                                    $record->approve(auth()->id());
                                    Mail::to($record->email)->queue(new PharmacyApprovedMail($record));
                                }
                            }
                            Notification::make()
                                ->title('Seçili eczaneler onaylandı')
                                ->success()
                                ->send();
                        }),
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            UserResource\RelationManagers\DocumentsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'view' => Pages\ViewUser::route('/{record}'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
