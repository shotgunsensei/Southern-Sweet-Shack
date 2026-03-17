import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@workspace/api-client-react";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const TAX_RATE = 0.0675; // 6.75% NC Sales Tax

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      addItem: (product, quantity = 1) => set((state) => {
        const existingItem = state.items.find(item => item.product.id === product.id);
        if (existingItem) {
          return {
            items: state.items.map(item => 
              item.product.id === product.id 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
            isOpen: true
          };
        }
        return { items: [...state.items, { product, quantity }], isOpen: true };
      }),
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId)
      })),
      
      updateQuantity: (productId, quantity) => set((state) => ({
        items: quantity <= 0 
          ? state.items.filter(item => item.product.id !== productId)
          : state.items.map(item => 
              item.product.id === productId ? { ...item, quantity } : item
            )
      })),
      
      clearCart: () => set({ items: [] }),
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = parseFloat(item.product.price);
          return total + (price * item.quantity);
        }, 0);
      },
      
      getTax: () => {
        return get().getSubtotal() * TAX_RATE;
      },
      
      getTotal: () => {
        return get().getSubtotal() + get().getTax();
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: "burneys-cart",
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
