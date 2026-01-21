<x-filament-panels::page>
    <x-filament::section>
        <x-slot name="heading">
            Genel Komisyon Ayarları
        </x-slot>
        <x-slot name="description">
            Platform genelinde geçerli komisyon kuralları
        </x-slot>

        <form wire:submit="save">
            {{ $this->form }}

            <div class="mt-6">
                <x-filament::button type="submit">
                    Kaydet
                </x-filament::button>
            </div>
        </form>
    </x-filament::section>

    <x-filament::section class="mt-6">
        <x-slot name="heading">
            Kategori Bazlı Komisyon Oranları
        </x-slot>
        <x-slot name="description">
            Her kategori için özel komisyon oranı belirleyebilirsiniz
        </x-slot>

        {{ $this->table }}
    </x-filament::section>
</x-filament-panels::page>