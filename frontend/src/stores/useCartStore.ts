import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '@/lib/api';

export interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    offer_id: number;
    seller_id: number;
    quantity: number;
    price_at_addition: number;
    product: {
        id: number;
        name: string;
        barcode: string;
        image?: string;
        brand?: string;
    };
    offer: {
        id: number;
        price: number;
        stock: number;
        expiry_date?: string;
    };
    seller: {
        id: number;
        pharmacy_name: string;
        city?: string;
    };
}

export interface CartBySeller {
    seller: {
        id: number;
        pharmacy_name: string;
        city?: string;
    };
    items: CartItem[];
    subtotal: number;
}

export interface ValidationIssue {
    item_id: number;
    product_name: string;
    type: 'unavailable' | 'stock' | 'price_changed';
    message: string;
    available_stock?: number;
    old_price?: number;
    new_price?: number;
}

interface CartState {
    items: CartItem[];
    itemsBySeller: CartBySeller[];
    itemCount: number;
    total: number;
    isLoading: boolean;
    isOpen: boolean;
    validationIssues: ValidationIssue[];

    // Animation states
    isShaking: boolean;
    lastAddedItemId: number | null;
    removingItemId: number | null;

    // Actions
    setOpen: (open: boolean) => void;
    fetchCart: () => Promise<void>;
    addItem: (offerId: number, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    validateCart: () => Promise<boolean>;
    triggerShake: () => void;
    setLastAddedItemId: (id: number | null) => void;
    setRemovingItemId: (id: number | null) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            itemsBySeller: [],
            itemCount: 0,
            total: 0,
            isLoading: false,
            isOpen: false,
            validationIssues: [],

            // Animation states
            isShaking: false,
            lastAddedItemId: null,
            removingItemId: null,

            setOpen: (open) => set({ isOpen: open }),

            triggerShake: () => {
                set({ isShaking: true });
                setTimeout(() => set({ isShaking: false }), 500);
            },

            setLastAddedItemId: (id) => {
                set({ lastAddedItemId: id });
                if (id) {
                    setTimeout(() => set({ lastAddedItemId: null }), 2000);
                }
            },

            setRemovingItemId: (id) => set({ removingItemId: id }),

            fetchCart: async () => {
                set({ isLoading: true });
                try {
                    const response = await cartApi.get();
                    if (response.data) {
                        set({
                            items: response.data.items || [],
                            itemsBySeller: response.data.items_by_seller || [],
                            itemCount: response.data.item_count || 0,
                            total: response.data.total || 0,
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch cart:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            addItem: async (offerId, quantity = 1) => {
                set({ isLoading: true });
                try {
                    const response = await cartApi.addItem(offerId, quantity);
                    if (response.data) {
                        set({
                            itemCount: response.data.item_count,
                            total: response.data.total,
                        });
                        // Trigger shake animation
                        get().triggerShake();
                        // Refetch full cart to get updated items
                        await get().fetchCart();
                        // Set last added item for highlight
                        if (response.data.item) {
                            get().setLastAddedItemId(response.data.item.id);
                        }
                    } else if (response.error) {
                        throw new Error(response.error);
                    }
                } catch (error) {
                    console.error('Failed to add item:', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            updateQuantity: async (itemId, quantity) => {
                set({ isLoading: true });
                try {
                    const response = await cartApi.updateQuantity(itemId, quantity);
                    if (response.data) {
                        set({
                            itemCount: response.data.item_count,
                            total: response.data.total,
                        });
                        await get().fetchCart();
                    } else if (response.error) {
                        throw new Error(response.error);
                    }
                } catch (error) {
                    console.error('Failed to update quantity:', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            removeItem: async (itemId) => {
                // Set removing animation
                get().setRemovingItemId(itemId);

                // Wait for animation
                await new Promise(resolve => setTimeout(resolve, 300));

                set({ isLoading: true });
                try {
                    const response = await cartApi.removeItem(itemId);
                    if (response.data) {
                        set({
                            itemCount: response.data.item_count,
                            total: response.data.total,
                        });
                        await get().fetchCart();
                    }
                } catch (error) {
                    console.error('Failed to remove item:', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                    get().setRemovingItemId(null);
                }
            },

            clearCart: async () => {
                set({ isLoading: true });
                try {
                    await cartApi.clear();
                    set({
                        items: [],
                        itemsBySeller: [],
                        itemCount: 0,
                        total: 0,
                    });
                } catch (error) {
                    console.error('Failed to clear cart:', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            validateCart: async () => {
                try {
                    const response = await cartApi.validate();
                    if (response.data) {
                        set({ validationIssues: response.data.issues || [] });
                        return response.data.valid;
                    }
                    return false;
                } catch (error) {
                    console.error('Failed to validate cart:', error);
                    return false;
                }
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({
                itemCount: state.itemCount,
                total: state.total,
                // Don't persist animation states
            }),
        }
    )
);
