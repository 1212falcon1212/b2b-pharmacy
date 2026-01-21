'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const regionId = 'html5qr-code-full-region';

    useEffect(() => {
        let isMounted = true;

        const startScanner = async () => {
            try {
                // Prevent creating multiple instances
                if (scannerRef.current) return;

                const scanner = new Html5Qrcode(regionId);
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        if (isMounted) {
                            onScan(decodedText);
                            // Stop handled by parent or unmount
                        }
                    },
                    (errorMessage) => {
                        // Scanning fails continuously, harmless
                    }
                );
            } catch (err) {
                if (isMounted) {
                    setError('Kameraya erişilemedi. Lütfen izinleri kontrol edin.');
                    console.error(err);
                }
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(startScanner, 100);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(console.error);
                } else {
                    scannerRef.current.clear();
                }
                scannerRef.current = null;
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            <Button
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
                onClick={onClose}
            >
                <X className="w-8 h-8" />
            </Button>

            <div id={regionId} className="w-full h-full max-w-md bg-black relative aspect-square overflow-hidden rounded-lg" />

            {error && (
                <div className="absolute bottom-10 px-4 py-2 bg-red-600/90 text-white rounded-lg text-sm max-w-xs text-center backdrop-blur-sm">
                    {error}
                </div>
            )}

            <div className="absolute bottom-24 text-white text-center opacity-80 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                Barkodu kare içine getirin
            </div>
        </div>
    );
}
