<?php

namespace App\Filament\Resources\GlnWhitelistResource\Pages;

use App\Filament\Resources\GlnWhitelistResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditGlnWhitelist extends EditRecord
{
    protected static string $resource = GlnWhitelistResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}

