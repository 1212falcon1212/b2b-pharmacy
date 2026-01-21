<?php

namespace App\Console\Commands;

use App\Models\GlnWhitelist;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ImportGlnList extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'gln:import 
                            {file : Dosya yolu (JSON, CSV veya Excel)}
                            {--format= : Dosya formatı (json, csv, excel). Belirtilmezse uzantıdan algılanır}
                            {--truncate : Mevcut verileri silmeden önce tabloyu temizle}';

    /**
     * The console command description.
     */
    protected $description = 'GLN whitelist verilerini JSON, CSV veya Excel dosyasından içe aktar';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $filePath = $this->argument('file');
        $format = $this->option('format');
        $truncate = $this->option('truncate');

        // Check if file exists
        if (!file_exists($filePath)) {
            $this->error("Dosya bulunamadı: {$filePath}");
            return Command::FAILURE;
        }

        // Detect format from extension if not provided
        if (!$format) {
            $format = $this->detectFormat($filePath);
        }

        if (!in_array($format, ['json', 'csv', 'excel', 'xlsx', 'xls'])) {
            $this->error("Desteklenmeyen format: {$format}. Desteklenen formatlar: json, csv, excel");
            return Command::FAILURE;
        }

        $this->info("GLN listesi içe aktarılıyor: {$filePath}");
        $this->info("Format: {$format}");

        try {
            // Truncate if requested
            if ($truncate) {
                if ($this->confirm('Bu işlem mevcut tüm GLN kayıtlarını silecek. Devam etmek istiyor musunuz?')) {
                    GlnWhitelist::truncate();
                    $this->warn('Mevcut GLN kayıtları silindi.');
                }
            }

            // Import based on format
            $data = match ($format) {
                'json' => $this->parseJson($filePath),
                'csv' => $this->parseCsv($filePath),
                'excel', 'xlsx', 'xls' => $this->parseExcel($filePath),
                default => throw new \Exception("Desteklenmeyen format: {$format}")
            };

            if (empty($data)) {
                $this->warn('Dosyada veri bulunamadı.');
                return Command::SUCCESS;
            }

            $this->info("Toplam {$this->formatNumber(count($data))} kayıt bulundu.");

            // Progress bar
            $bar = $this->output->createProgressBar(count($data));
            $bar->start();

            $imported = 0;
            $updated = 0;
            $skipped = 0;
            $errors = [];

            DB::transaction(function () use ($data, $bar, &$imported, &$updated, &$skipped, &$errors) {
                foreach ($data as $index => $row) {
                    try {
                        $glnCode = $this->normalizeGlnCode($row['gln_code'] ?? $row['gln'] ?? null);

                        if (!$glnCode) {
                            $skipped++;
                            $errors[] = "Satır " . ($index + 1) . ": GLN kodu eksik";
                            $bar->advance();
                            continue;
                        }

                        // Validate GLN format (13 digits)
                        if (!preg_match('/^\d{13}$/', $glnCode)) {
                            $skipped++;
                            $errors[] = "Satır " . ($index + 1) . ": Geçersiz GLN formatı ({$glnCode})";
                            $bar->advance();
                            continue;
                        }

                        $pharmacyName = $row['pharmacy_name'] ?? $row['eczane_adi'] ?? $row['name'] ?? '';
                        $city = $row['city'] ?? $row['sehir'] ?? $row['il'] ?? null;
                        $district = $row['district'] ?? $row['ilce'] ?? null;
                        $address = $row['address'] ?? $row['adres'] ?? null;

                        // Upsert (update or insert)
                        $existing = GlnWhitelist::where('gln_code', $glnCode)->first();

                        if ($existing) {
                            $existing->update([
                                'pharmacy_name' => $pharmacyName ?: $existing->pharmacy_name,
                                'city' => $city ?: $existing->city,
                                'district' => $district ?: $existing->district,
                                'address' => $address ?: $existing->address,
                            ]);
                            $updated++;
                        } else {
                            GlnWhitelist::create([
                                'gln_code' => $glnCode,
                                'pharmacy_name' => $pharmacyName,
                                'city' => $city,
                                'district' => $district,
                                'address' => $address,
                                'is_active' => true,
                                'is_used' => false,
                            ]);
                            $imported++;
                        }
                    } catch (\Exception $e) {
                        $skipped++;
                        $errors[] = "Satır " . ($index + 1) . ": " . $e->getMessage();
                    }

                    $bar->advance();
                }
            });

            $bar->finish();
            $this->newLine(2);

            // Summary
            $this->info("İçe aktarma tamamlandı!");
            $this->table(
                ['Durum', 'Adet'],
                [
                    ['Yeni eklenen', $imported],
                    ['Güncellenen', $updated],
                    ['Atlanan', $skipped],
                    ['Toplam işlenen', $imported + $updated + $skipped],
                ]
            );

            // Show errors if any
            if (!empty($errors) && $this->option('verbose')) {
                $this->newLine();
                $this->warn('Hatalar:');
                foreach (array_slice($errors, 0, 20) as $error) {
                    $this->line("  - {$error}");
                }
                if (count($errors) > 20) {
                    $this->line("  ... ve " . (count($errors) - 20) . " hata daha");
                }
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Hata: " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Detect file format from extension
     */
    private function detectFormat(string $filePath): string
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        return match ($extension) {
            'json' => 'json',
            'csv' => 'csv',
            'xlsx', 'xls' => 'excel',
            default => 'csv' // Default to CSV
        };
    }

    /**
     * Parse JSON file
     */
    private function parseJson(string $filePath): array
    {
        $content = file_get_contents($filePath);
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('JSON parse hatası: ' . json_last_error_msg());
        }

        return is_array($data) ? $data : [];
    }

    /**
     * Parse CSV file
     */
    private function parseCsv(string $filePath): array
    {
        $data = [];
        $headers = null;

        if (($handle = fopen($filePath, 'r')) !== false) {
            while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                // First row is headers
                if ($headers === null) {
                    $headers = array_map(fn($h) => strtolower(trim($h)), $row);
                    continue;
                }

                // Map row to headers
                $data[] = array_combine($headers, $row);
            }
            fclose($handle);
        }

        return $data;
    }

    /**
     * Parse Excel file
     */
    private function parseExcel(string $filePath): array
    {
        $data = [];
        $rows = Excel::toArray(null, $filePath);

        if (empty($rows) || empty($rows[0])) {
            return [];
        }

        $sheet = $rows[0];
        $headers = null;

        foreach ($sheet as $row) {
            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // First row is headers
            if ($headers === null) {
                $headers = array_map(fn($h) => strtolower(trim($h ?? '')), $row);
                continue;
            }

            // Map row to headers
            $mappedRow = [];
            foreach ($headers as $index => $header) {
                $mappedRow[$header] = $row[$index] ?? null;
            }
            $data[] = $mappedRow;
        }

        return $data;
    }

    /**
     * Normalize GLN code (remove spaces, ensure string)
     */
    private function normalizeGlnCode($glnCode): ?string
    {
        if ($glnCode === null) {
            return null;
        }

        // Convert to string and remove non-digit characters
        $glnCode = preg_replace('/\D/', '', (string) $glnCode);

        // Pad with leading zeros if necessary
        if (strlen($glnCode) > 0 && strlen($glnCode) < 13) {
            $glnCode = str_pad($glnCode, 13, '0', STR_PAD_LEFT);
        }

        return $glnCode ?: null;
    }

    /**
     * Format number with thousands separator
     */
    private function formatNumber(int $number): string
    {
        return number_format($number, 0, ',', '.');
    }
}
