import { motion, AnimatePresence } from 'framer-motion';
import QuickActions from './QuickActions';
import ChatInput from './ChatInput';
import CartPreviewBar from './CartPreviewBar';
import { fadeInUp, smoothTransition } from '@/lib/animations';

interface ChatInputAreaProps {
  onSendMessage: (message: string) => void;
  onSendImage?: (file: File) => void;
  onQuickAction: (action: string) => void;
  onOpenCart: () => void;
  isCheckoutActive: boolean;
}

/**
 * Unified chat input area with quick actions, cart preview, and message input.
 * Hidden during checkout flow.
 */
const ChatInputArea = ({
  onSendMessage,
  onSendImage,
  onQuickAction,
  onOpenCart,
  isCheckoutActive,
}: ChatInputAreaProps) => {
  return (
    <AnimatePresence>
      {!isCheckoutActive && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={smoothTransition}
          className="flex flex-col"
        >
          {/* Quick Actions */}
          <QuickActions onAction={onQuickAction} />
          
          {/* Cart Preview Bar */}
          <CartPreviewBar onClick={onOpenCart} />
          
          {/* Chat Input */}
          <ChatInput 
            onSendMessage={onSendMessage}
            onSendImage={onSendImage}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatInputArea;
