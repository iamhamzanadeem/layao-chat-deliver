import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageRenderer from './MessageRenderer';
import TypingIndicator from './TypingIndicator';
import DeliveryTypeSelector from './DeliveryTypeSelector';
import AddressSelector from './AddressSelector';
import OrderConfirmation from './OrderConfirmation';
import type { ChatMessage } from '@/types/chat';
import type { CheckoutStep } from '@/hooks/app/useCheckoutFlow';
import type { DeliveryType, DeliveryAddress } from '@/contexts/OrderContext';
import { messageVariants, fadeInUp, springTransition } from '@/lib/animations';

interface MessageListProps {
  messages: ChatMessage[];
  isSearching: boolean;
  checkoutStep: CheckoutStep;
  isConfirming: boolean;
  onDeliveryTypeSelect: (type: DeliveryType) => void;
  onAddressSelect: (address: DeliveryAddress) => void;
  onConfirmOrder: () => void;
  onEditCart: () => void;
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
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, checkoutStep]);

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
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
