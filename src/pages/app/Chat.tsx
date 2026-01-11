import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, ChevronDown } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import ChatBubble from '@/components/app/chat/ChatBubble';
import ChatInput from '@/components/app/chat/ChatInput';
import QuickActions from '@/components/app/chat/QuickActions';
import ProductCard from '@/components/app/chat/ProductCard';
import CategorySelector from '@/components/app/chat/CategorySelector';
import ProductGrid from '@/components/app/chat/ProductGrid';
import CartSheet from '@/components/app/chat/CartSheet';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatMessage, ProductCardData } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { AppSidebarMobile } from '@/components/app/AppSidebar';

interface AppLayoutContext {
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string | null) => void;
}

const Chat = () => {
  const { selectedOrderId, onSelectOrder } = useOutletContext<AppLayoutContext>();
  const { user } = useAuth();
  const { itemCount, total } = useOrder();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: `Hey ${user?.user_metadata?.full_name || 'there'}! 👋 Welcome to Layao. What would you like to order today?`,
      isFromUser: false,
      createdAt: new Date(),
    },
  ]);

  // Browse mode state
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset browse mode when selecting an order
  useEffect(() => {
    if (selectedOrderId) {
      setIsBrowsing(false);
      // TODO: Load order messages
    }
  }, [selectedOrderId]);

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'text',
      content,
      isFromUser: true,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: "Got it! Tap 'Browse Menu' below to see our products, or just tell me what you need! 🛒",
        isFromUser: false,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'browse') {
      setIsBrowsing(true);
      setSelectedCategoryId(null);
    } else if (action === 'help') {
      const helpMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: "Need help? You can:\n• Browse Menu - see all products\n• Type what you want\n• Send a photo of items\n• Call us: 0300-1234567",
        isFromUser: false,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, helpMessage]);
    } else if (action === 'track') {
      // Show orders in sidebar
      const trackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: "You can see all your orders in the sidebar on the left. Tap the menu icon to open it! 📋",
        isFromUser: false,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, trackMessage]);
    } else if (action === 'reorder') {
      const reorderMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: "Select a previous order from the sidebar to view and reorder items! ↩️",
        isFromUser: false,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, reorderMessage]);
    }
  };

  const closeBrowseMode = () => {
    setIsBrowsing(false);
    setSelectedCategoryId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppSidebarMobile selectedOrderId={selectedOrderId} onSelectOrder={onSelectOrder} />
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">L</span>
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Layao</h1>
            <p className="text-xs text-success">Online • Ready to deliver</p>
          </div>
        </div>
        
        {itemCount > 0 && (
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-4 h-4" />
            Rs. {total.toFixed(0)}
          </Button>
        )}
      </div>

      {/* Browse Mode Panel */}
      <AnimatePresence>
        {isBrowsing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-muted/30 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Browse Menu</h3>
                <Button variant="ghost" size="sm" onClick={closeBrowseMode}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Categories */}
              <CategorySelector 
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
              />
              
              {/* Products Grid */}
              <div className="mt-4 max-h-64 overflow-y-auto">
                <ProductGrid categoryId={selectedCategoryId} />
              </div>

              {/* Collapse indicator */}
              <button 
                onClick={closeBrowseMode}
                className="w-full flex items-center justify-center pt-2 text-muted-foreground"
              >
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {message.type === 'product_card' && message.metadata ? (
              <ProductCard data={message.metadata as unknown as ProductCardData} />
            ) : (
              <ChatBubble
                isFromUser={message.isFromUser}
                timestamp={message.createdAt}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </ChatBubble>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <QuickActions onAction={handleQuickAction} />

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} />

      {/* Cart Sheet */}
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
};

export default Chat;
