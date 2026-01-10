import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatBubble from '@/components/app/chat/ChatBubble';
import ChatInput from '@/components/app/chat/ChatInput';
import QuickActions from '@/components/app/chat/QuickActions';
import ProductCard from '@/components/app/chat/ProductCard';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatMessage, ProductCardData } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const { user } = useAuth();
  const { itemCount, total } = useOrder();
  const navigate = useNavigate();
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        content: "Got it! You can browse our catalog to add items, or just tell me what you need and I'll help you find it. 🛒",
        isFromUser: false,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'help') {
      const helpMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: "Need help? You can:\n• Browse Menu - see all products\n• Type what you want\n• Send a photo of items\n• Call us: 0300-1234567",
        isFromUser: false,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, helpMessage]);
    } else if (action === 'track') {
      navigate('/app/orders');
    } else if (action === 'reorder') {
      navigate('/app/orders');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
            onClick={() => navigate('/app/catalog')}
          >
            <ShoppingCart className="w-4 h-4" />
            Rs. {total.toFixed(0)}
          </Button>
        )}
      </div>

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
              <ProductCard data={message.metadata as ProductCardData} />
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
    </div>
  );
};

export default Chat;
