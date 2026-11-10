import { create } from 'zustand';
import { cartApi, parseCartError } from '@/features/cart/api/cartApi';
import {
  getGuestSessionKey,
  clearGuestSessionKey,
  getOrCreateGuestSessionKey,
} from '@/lib/storage';
import type { Cart, CartItem } from '@/types/cart';
import { toast } from 'sonner';

interface CartState {
  cart: Cart | null;
  itemCount: number;
  totalPrice: string;
  isLoading: boolean;
  isUpdatingItem: number | null;
  isDrawerOpen: boolean;

  // Drawer harakatlari
  setDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;

  // Savatcha ma'lumotlarini yuklash
  fetchCart: () => Promise<void>;
  fetchCartCount: () => Promise<void>;

  // Asosiy amallar
  addItem: (variantId: number, quantity?: number, openDrawerAfter?: boolean) => Promise<boolean>;
  updateQuantity: (itemId: number, newQuantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  itemCount: 0,
  totalPrice: '0.00',
  isLoading: false,
  isUpdatingItem: null,
  isDrawerOpen: false,

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const cart = await cartApi.getCart();
      set({
        cart,
        itemCount: cart.total_items,
        totalPrice: cart.total_price,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      set({ isLoading: false });
    }
  },

  fetchCartCount: async () => {
    try {
      const summary = await cartApi.getCartCount();
      set({
        itemCount: summary.total_items,
        totalPrice: summary.total_price,
      });
    } catch (error) {
      console.warn('Failed to fetch cart count:', error);
    }
  },

  addItem: async (variantId, quantity = 1, openDrawerAfter = true) => {
    try {
      set({ isLoading: true });
      // Mehmon sessiya kaliti mavjudligini kafolatlash
      getOrCreateGuestSessionKey();

      const updatedCart = await cartApi.addItem({
        variant_id: variantId,
        quantity,
      });

      set({
        cart: updatedCart,
        itemCount: updatedCart.total_items,
        totalPrice: updatedCart.total_price,
        isLoading: false,
        isDrawerOpen: openDrawerAfter ? true : get().isDrawerOpen,
      });

      toast.success('Mahsulot savatchaga muvaffaqiyatli qo\'shildi!');
      return true;
    } catch (error) {
      const errorMsg = parseCartError(error);
      toast.error(errorMsg);
      set({ isLoading: false });
      return false;
    }
  },

  updateQuantity: async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await get().removeItem(itemId);
      return;
    }

    const previousCart = get().cart;
    if (!previousCart) return;

    // Optimistic Update: Interfeysni darhol yangilaymiz
    const updatedItems = previousCart.items.map((item: CartItem) => {
      if (item.id === itemId) {
        const itemUnitPrice = parseFloat(item.current_unit_price || item.unit_price_at_addition || '0');
        const newTotal = (itemUnitPrice * newQuantity).toFixed(2);
        return {
          ...item,
          quantity: newQuantity,
          total_price: newTotal,
        };
      }
      return item;
    });

    const newTotalItems = updatedItems.reduce((acc, curr) => acc + curr.quantity, 0);

    set({
      cart: {
        ...previousCart,
        items: updatedItems,
        total_items: newTotalItems,
      },
      itemCount: newTotalItems,
      isUpdatingItem: itemId,
    });

    try {
      const serverCart = await cartApi.updateQuantity(itemId, { quantity: newQuantity });
      set({
        cart: serverCart,
        itemCount: serverCart.total_items,
        totalPrice: serverCart.total_price,
        isUpdatingItem: null,
      });
    } catch (error) {
      // Xatolik yuz berganda avvalgi holatga qaytarish (Rollback)
      set({
        cart: previousCart,
        itemCount: previousCart.total_items,
        totalPrice: previousCart.total_price,
        isUpdatingItem: null,
      });
      const errorMsg = parseCartError(error);
      toast.error(errorMsg);
    }
  },

  removeItem: async (itemId) => {
    const previousCart = get().cart;
    if (!previousCart) return;

    // Optimistic Update: Elementni darhol ro'yxatdan olib tashlaymiz
    const remainingItems = previousCart.items.filter((item) => item.id !== itemId);
    const newTotalItems = remainingItems.reduce((acc, curr) => acc + curr.quantity, 0);

    set({
      cart: {
        ...previousCart,
        items: remainingItems,
        total_items: newTotalItems,
        is_empty: remainingItems.length === 0,
      },
      itemCount: newTotalItems,
      isUpdatingItem: itemId,
    });

    try {
      const serverCart = await cartApi.removeItem(itemId);
      set({
        cart: serverCart,
        itemCount: serverCart.total_items,
        totalPrice: serverCart.total_price,
        isUpdatingItem: null,
      });
      toast.success('Mahsulot savatchadan olib tashlandi');
    } catch (error) {
      // Rollback
      set({
        cart: previousCart,
        itemCount: previousCart.total_items,
        totalPrice: previousCart.total_price,
        isUpdatingItem: null,
      });
      const errorMsg = parseCartError(error);
      toast.error(errorMsg);
    }
  },

  clearCart: async () => {
    const previousCart = get().cart;
    try {
      set({ isLoading: true });
      const clearedCart = await cartApi.clearCart();
      set({
        cart: clearedCart,
        itemCount: 0,
        totalPrice: '0.00',
        isLoading: false,
      });
      toast.success('Savatcha to\'liq tozalandi');
    } catch (error) {
      set({ cart: previousCart, isLoading: false });
      const errorMsg = parseCartError(error);
      toast.error(errorMsg);
    }
  },

  mergeGuestCart: async () => {
    const guestKey = getGuestSessionKey();
    if (!guestKey) return;

    try {
      const mergedCart = await cartApi.mergeCart({
        guest_session_key: guestKey,
      });
      clearGuestSessionKey();
      set({
        cart: mergedCart,
        itemCount: mergedCart.total_items,
        totalPrice: mergedCart.total_price,
      });
    } catch (err) {
      console.warn('Cart merge skipped or failed:', err);
    }
  },

  initialize: async () => {
    getOrCreateGuestSessionKey();
    await get().fetchCartCount();
  },
}));
