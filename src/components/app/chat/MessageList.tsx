import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageRenderer from './MessageRenderer';
import TypingIndicator from './TypingIndicator';
import DeliveryTypeSelector from './DeliveryTypeSelector';
import AddressSelector from './AddressSelector';
import OrderConfirmation from './OrderConfirmation';
import ErrandTaskTypeSelector from './ErrandTaskTypeSelector';
import ErrandDetailsForm from './ErrandDetailsForm';
import ErrandPriceEstimateComponent from './ErrandPriceEstimate';
import RestaurantSelector from './RestaurantSelector';
import RestaurantMenu from './RestaurantMenu';
import type { ChatMessage } from '@/types/chat';
import type { CheckoutStep } from '@/hooks/app/useCheckoutFlow';
import type { ErrandStep } from '@/hooks/app/useErrandFlow';
import type { DeliveryType, DeliveryAddress } from '@/contexts/OrderContext';
import type { ErrandTaskType, ErrandDetails, ErrandPriceEstimate } from '@/types/errand';
import { messageVariants, fadeInUp, springTransition } from '@/lib/animations';

interface MessageListProps {
  messages: ChatMessage[];
  isSearching: boolean;
  // Checkout props
  checkoutStep: CheckoutStep;
  isConfirming: boolean;
  onDeliveryTypeSelect: (type: DeliveryType) => void;
  onAddressSelect: (address: DeliveryAddress) => void;
  onConfirmOrder: () => void;
  onEditCart: () => void;
  // Errand props
  errandStep: ErrandStep;
  errandDetails: ErrandDetails | null;
  errandDeliveryAddress: DeliveryAddress | null;
  priceEstimate: ErrandPriceEstimate | null;
  isCalculatingPrice: boolean;
  isErrandSubmitting: boolean;
  onTaskTypeSelect: (type: ErrandTaskType) => void;
  onDetailsSubmit: (details: ErrandDetails) => void;
  onErrandAddressSelect: (address: DeliveryAddress) => void;
  onSubmitErrand: () => void;
  onEditDetails: () => void;
  // Restaurant props
  showRestaurantList: boolean;
  browsingRestaurantId: string | null;
  onSelectRestaurant: (restaurantId: string) => void;
  onCloseRestaurantList: () => void;
  onBackToRestaurantList: () => void;
  onCloseRestaurantMenu: () => void;
}

const MessageList = ({
  messages,
  isSearching,
  checkoutStep,
  isConfirming,
  onDeliveryTypeSelect,
  onAddressSelect,
  onConfirmOrder,
  onEditCart,
  // Errand props
  errandStep,
  errandDetails,
  errandDeliveryAddress,
  priceEstimate,
  isCalculatingPrice,
  isErrandSubmitting,
  onTaskTypeSelect,
  onDetailsSubmit,
  onErrandAddressSelect,
  onSubmitErrand,
  onEditDetails,
  // Restaurant props
  showRestaurantList,
  browsingRestaurantId,
  onSelectRestaurant,
  onCloseRestaurantList,
  onBackToRestaurantList,
  onCloseRestaurantMenu,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, checkoutStep, errandStep, showRestaurantList, browsingRestaurantId]);

  const renderCheckoutStep = () => {
    switch (checkoutStep) {
      case 'delivery_type':
        return <DeliveryTypeSelector onSelect={onDeliveryTypeSelect} />;
      case 'address':
        return <AddressSelector onSelect={onAddressSelect} />;
      case 'confirmation':
        return (
          <OrderConfirmation 
            onConfirm={onConfirmOrder} 
            onEdit={onEditCart}
            isLoading={isConfirming}
          />
        );
      default:
        return null;
    }
  };

  const renderErrandStep = () => {
    switch (errandStep) {
      case 'task_type':
        return <ErrandTaskTypeSelector onSelect={onTaskTypeSelect} />;
      case 'details':
        return (
          <ErrandDetailsForm 
            taskType={errandDetails?.taskType || 'custom'} 
            onSubmit={onDetailsSubmit}
            onBack={() => {/* Reset handled by hook */}}
          />
        );
      case 'address':
        return <AddressSelector onSelect={onErrandAddressSelect} />;
      case 'price_estimate':
        if (errandDetails && errandDeliveryAddress) {
          return (
            <ErrandPriceEstimateComponent
              errandDetails={errandDetails}
              deliveryAddress={errandDeliveryAddress}
              priceEstimate={priceEstimate}
              isCalculating={isCalculatingPrice}
              onConfirm={onSubmitErrand}
              onEdit={onEditDetails}
              isSubmitting={isErrandSubmitting}
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          custom={message.isFromUser}
          variants={messageVariants}
          initial="initial"
          animate="animate"
          transition={{ 
            delay: index * 0.03,
            ...springTransition 
          }}
          className={message.isFromUser ? 'flex justify-end' : ''}
        >
          <MessageRenderer message={message} />
        </motion.div>
      ))}
      
      {/* Typing Indicator */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <TypingIndicator />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Checkout Step Component */}
      {checkoutStep !== 'idle' && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mt-2"
        >
          {renderCheckoutStep()}
        </motion.div>
      )}

      {/* Errand Step Component */}
      {errandStep !== 'idle' && errandStep !== 'submitted' && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mt-2"
        >
          {renderErrandStep()}
        </motion.div>
      )}

      {/* Restaurant List */}
      {showRestaurantList && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mt-2"
        >
          <RestaurantSelector 
            onSelect={onSelectRestaurant}
            onClose={onCloseRestaurantList}
          />
        </motion.div>
      )}

      {/* Restaurant Menu */}
      {browsingRestaurantId && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mt-2"
        >
          <RestaurantMenu
            restaurantId={browsingRestaurantId}
            onBack={onBackToRestaurantList}
            onClose={onCloseRestaurantMenu}
          />
        </motion.div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
