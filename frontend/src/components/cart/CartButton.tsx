'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export function CartButton() {
    const { itemCount, setOpen, fetchCart } = useCartStore();

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setOpen(true)}
        >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {itemCount > 99 ? '99+' : itemCount}
                </span>
            )}
            <span className="sr-only">Sepeti aç</span>
        </Button>
    );
}
