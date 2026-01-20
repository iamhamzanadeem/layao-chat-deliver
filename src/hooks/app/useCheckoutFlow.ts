import { useState, useCallback } from 'react';
import { useOrder, type DeliveryType, type DeliveryAddress } from '@/contexts/OrderContext';
import { useCreateOrder } from '@/hooks/app/useCreateOrder';
import type { ChatMessage } from '@/types/chat';

export type CheckoutStep = 'idle' | 'delivery_type' | 'address' | 'confirmation';

interface UseCheckoutFlowOptions {
  onAddMessage: (message: ChatMessage) => void;
  onOpenCart: (open: boolean) => void;
}

export function useCheckoutFlow({ onAddMessage, onOpenCart }: UseCheckoutFlowOptions) {
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle');
  const { 
    items, 
    subtotal, 
    deliveryFee, 
    total, 
    deliveryType,
    deliveryAddress,
    setDeliveryType, 
    setDeliveryAddress 
  } = useOrder();
  const createOrder = useCreateOrder();

  const addBotMessage = useCallback((content: string, type: ChatMessage['type'] = 'bot') => {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      type,
      content,
      isFromUser: false,
      createdAt: new Date(),
    };
    onAddMessage(message);
    return message;
  }, [onAddMessage]);

  const addUserMessage = useCallback((content: string) => {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'text',
      content,
      isFromUser: true,
      createdAt: new Date(),
    };
    onAddMessage(message);
    return message;
  }, [onAddMessage]);

  const startCheckout = useCallback(() => {
    onOpenCart(false);
    setCheckoutStep('delivery_type');
    addBotMessage("Let's complete your order! First, choose your delivery speed:", 'delivery_type_select');
  }, [onOpenCart, addBotMessage]);

  const handleDeliveryTypeSelect = useCallback((type: DeliveryType) => {
    setDeliveryType(type);
    const typeName = type === 'instant' ? 'Instant Delivery (Rs. 100)' : 'Flexible Delivery (Rs. 50)';
    addUserMessage(typeName);
    setCheckoutStep('address');
    addBotMessage("Great choice! Now, where should we deliver?", 'address_select');
  }, [setDeliveryType, addUserMessage, addBotMessage]);

  const handleAddressSelect = useCallback((address: DeliveryAddress) => {
    setDeliveryAddress(address);
    addUserMessage(`📍 ${address.label}: ${address.fullAddress}`);
    setCheckoutStep('confirmation');
    addBotMessage("Please review and confirm your order:", 'order_confirmation');
  }, [setDeliveryAddress, addUserMessage, addBotMessage]);

  const handleConfirmOrder = useCallback(async () => {
    if (!deliveryAddress) return;

    try {
      const result = await createOrder.mutateAsync({
        items,
        deliveryType,
        deliveryAddress,
        subtotal,
        deliveryFee,
        total,
      });

      setCheckoutStep('idle');
      
      const orderPlacedMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'order_placed',
        content: result.orderNumber,
        isFromUser: false,
        createdAt: new Date(),
        metadata: { deliveryType },
      };
      onAddMessage(orderPlacedMessage);
    } catch (error) {
      // Error handled by mutation
    }
  }, [deliveryAddress, items, deliveryType, subtotal, deliveryFee, total, createOrder, onAddMessage]);

  const handleEditCart = useCallback(() => {
    setCheckoutStep('idle');
    onOpenCart(true);
  }, [onOpenCart]);

  const cancelCheckout = useCallback(() => {
    setCheckoutStep('idle');
  }, []);

  return {
    checkoutStep,
    isCheckoutActive: checkoutStep !== 'idle',
    isConfirming: createOrder.isPending,
    startCheckout,
    handleDeliveryTypeSelect,
    handleAddressSelect,
    handleConfirmOrder,
    handleEditCart,
    cancelCheckout,
  };
}
