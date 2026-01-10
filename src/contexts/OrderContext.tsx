import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
}

export interface DeliveryAddress {
  id?: string;
  label: string;
  fullAddress: string;
  area?: string;
  landmark?: string;
}

interface OrderContextType {
  items: CartItem[];
  deliveryAddress: DeliveryAddress | null;
  notes: string;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setDeliveryAddress: (address: DeliveryAddress | null) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const DELIVERY_FEE = 50; // PKR

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [notes, setNotes] = useState('');

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === item.productId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, { ...item, id: crypto.randomUUID() }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setDeliveryAddress(null);
    setNotes('');
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <OrderContext.Provider
      value={{
        items,
        deliveryAddress,
        notes,
        addItem,
        removeItem,
        updateQuantity,
        setDeliveryAddress,
        setNotes,
        clearCart,
        subtotal,
        deliveryFee,
        total,
        itemCount,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
