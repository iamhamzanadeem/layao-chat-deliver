import { useState, useCallback, useEffect } from 'react';
import { useOrder, type DeliveryAddress } from '@/contexts/OrderContext';
import { useErrandPriceEstimate, useCreateErrand } from '@/hooks/app/useErrand';
import type { ChatMessage } from '@/types/chat';
import type { ErrandTaskType, ErrandDetails, ErrandPriceEstimate } from '@/types/errand';

export type ErrandStep = 
  | 'idle' 
  | 'task_type' 
  | 'details' 
  | 'address' 
  | 'price_estimate' 
  | 'submitted';

interface UseErrandFlowOptions {
  onAddMessage: (message: ChatMessage) => void;
}

export function useErrandFlow({ onAddMessage }: UseErrandFlowOptions) {
  const [errandStep, setErrandStep] = useState<ErrandStep>('idle');
  const [errandDetails, setErrandDetails] = useState<ErrandDetails | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<ErrandPriceEstimate | null>(null);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState<string | null>(null);

  const priceEstimateMutation = useErrandPriceEstimate();
  const createErrandMutation = useCreateErrand();

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

  // Start the errand flow
  const startErrandFlow = useCallback(() => {
    setErrandStep('task_type');
    addBotMessage("I can help you get any task done! 🚀", 'errand_task_type');
  }, [addBotMessage]);

  // Handle task type selection
  const handleTaskTypeSelect = useCallback((taskType: ErrandTaskType) => {
    const labels: Record<ErrandTaskType, string> = {
      document: '📄 Document Pickup',
      restaurant: '🍽️ Restaurant Order',
      package: '📦 Package Delivery',
      custom: '✨ Custom Task',
    };
    addUserMessage(labels[taskType]);
    setErrandStep('details');
    addBotMessage("Great! Tell me more about your task:", 'errand_details');
  }, [addUserMessage, addBotMessage]);

  // Handle details submission
  const handleDetailsSubmit = useCallback((details: ErrandDetails) => {
    setErrandDetails(details);
    addUserMessage(`📍 Pickup: ${details.pickupAddress}\n📝 ${details.taskDescription}`);
    setErrandStep('address');
    addBotMessage("Where should we deliver?", 'address_select');
  }, [addUserMessage, addBotMessage]);

  // Handle address selection
  const handleAddressSelect = useCallback(async (address: DeliveryAddress) => {
    setDeliveryAddress(address);
    addUserMessage(`📍 ${address.label}: ${address.fullAddress}`);
    setErrandStep('price_estimate');
    addBotMessage("Calculating your errand price...", 'errand_price_estimate');

    // Try to calculate price if we have coordinates
    // For now, we'll use a fallback since we might not have precise coords
    // In production, integrate with geocoding API
    try {
      const estimate = await priceEstimateMutation.mutateAsync({
        pickupLat: errandDetails?.pickupLat || 33.7,
        pickupLng: errandDetails?.pickupLng || 73.1,
        deliveryLat: 33.7, // Would come from address
        deliveryLng: 73.1, // Would come from address
      });
      setPriceEstimate(estimate);
    } catch {
      // If calculation fails, we'll still show the form with a note
      setPriceEstimate({
        distance_km: 0,
        base_fee: 150,
        distance_fee: 0,
        total_fee: 150,
      });
    }
  }, [addUserMessage, addBotMessage, errandDetails, priceEstimateMutation]);

  // Handle errand submission
  const handleSubmitErrand = useCallback(async () => {
    if (!errandDetails || !deliveryAddress || !priceEstimate) return;

    try {
      const result = await createErrandMutation.mutateAsync({
        errandDetails,
        deliveryAddress,
        priceEstimate,
      });

      setSubmittedOrderNumber(result.orderNumber);
      setErrandStep('submitted');

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'errand_submitted',
        content: result.orderNumber,
        isFromUser: false,
        createdAt: new Date(),
      };
      onAddMessage(message);
    } catch {
      // Error handled by mutation
    }
  }, [errandDetails, deliveryAddress, priceEstimate, createErrandMutation, onAddMessage]);

  // Go back to edit details
  const handleEditDetails = useCallback(() => {
    setErrandStep('details');
  }, []);

  // Cancel the flow
  const cancelErrandFlow = useCallback(() => {
    setErrandStep('idle');
    setErrandDetails(null);
    setDeliveryAddress(null);
    setPriceEstimate(null);
    setSubmittedOrderNumber(null);
  }, []);

  return {
    errandStep,
    isErrandActive: errandStep !== 'idle',
    errandDetails,
    deliveryAddress,
    priceEstimate,
    isCalculatingPrice: priceEstimateMutation.isPending,
    isSubmitting: createErrandMutation.isPending,
    submittedOrderNumber,
    startErrandFlow,
    handleTaskTypeSelect,
    handleDetailsSubmit,
    handleAddressSelect,
    handleSubmitErrand,
    handleEditDetails,
    cancelErrandFlow,
  };
}
