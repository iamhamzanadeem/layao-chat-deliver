import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, ChevronDown, Clock, MapPin } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import ChatBubble from '@/components/app/chat/ChatBubble';
import ChatInput from '@/components/app/chat/ChatInput';
import QuickActions from '@/components/app/chat/QuickActions';
import ProductCard from '@/components/app/chat/ProductCard';
import ProductResults from '@/components/app/chat/ProductResults';
import CategorySelector from '@/components/app/chat/CategorySelector';
import ProductGrid from '@/components/app/chat/ProductGrid';
import CartSheet from '@/components/app/chat/CartSheet';
import CartPreviewBar from '@/components/app/chat/CartPreviewBar';
import TypingIndicator from '@/components/app/chat/TypingIndicator';
import DeliveryTypeSelector from '@/components/app/chat/DeliveryTypeSelector';
import AddressSelector from '@/components/app/chat/AddressSelector';
import OrderConfirmation from '@/components/app/chat/OrderConfirmation';
import OrderPlaced from '@/components/app/chat/OrderPlaced';
import LocationPrompt from '@/components/app/chat/LocationPrompt';
import { useOrder, type DeliveryType, type DeliveryAddress } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useProductSearch } from '@/hooks/app/useProductSearch';
import { useCreateOrder } from '@/hooks/app/useCreateOrder';
import type { ChatMessage, ProductCardData } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppSidebarMobile } from '@/components/app/AppSidebar';

interface AppLayoutContext {
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string | null) => void;
}

type CheckoutStep = 'idle' | 'delivery_type' | 'address' | 'confirmation';

const Chat = () => {
  const { selectedOrderId, onSelectOrder } = useOutletContext<AppLayoutContext>();
  const { user } = useAuth();
  const { 
    position,
    selectedRestaurant,
    isWithinDeliveryZone,
    deliveryMessage,
    requestLocation,
  } = useLocation();
  const { 
    items, 
    itemCount, 
    total, 
    subtotal,
    deliveryFee,
    deliveryType,
    deliveryAddress,
    setDeliveryType,
    setDeliveryAddress 
  } = useOrder();
  const { searchByMessage } = useProductSearch();
  const createOrder = useCreateOrder();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Show location prompt flag
  const [hasShownLocationPrompt, setHasShownLocationPrompt] = useState(false);
  
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
  
  // Checkout flow state
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle');
  
  // Loading state for typing indicator
  const [isSearching, setIsSearching] = useState(false);

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
      setCheckoutStep('idle');
    }
  }, [selectedOrderId]);

  const addBotMessage = (content: string, type: ChatMessage['type'] = 'bot') => {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      type,
      content,
      isFromUser: false,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, message]);
    return message;
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'text',
      content,
      isFromUser: true,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show typing indicator while searching
    setIsSearching(true);

    // Search for products based on the message
    const searchResult = await searchByMessage(content);

    setIsSearching(false);

    if (searchResult.hasResults) {
      // Found matching products - display them inline
      const productResultsMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'product_results',
        content: '',
        isFromUser: false,
        createdAt: new Date(),
        products: searchResult.products,
        keywords: searchResult.keywords,
      };
      setMessages((prev) => [...prev, productResultsMessage]);
    } else if (searchResult.keywords.length > 0) {
      // Had keywords but no matches - suggest browsing
      addBotMessage(`I couldn't find "${searchResult.keywords.join(', ')}" in our inventory. Try browsing our menu to see what's available! 🔍`);
      setIsBrowsing(true);
    } else {
      // No product keywords detected - generic response
      addBotMessage("Got it! Tap 'Browse Menu' below to see our products, or tell me what you'd like to order! 🛒");
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'browse') {
      setIsBrowsing(true);
      setSelectedCategoryId(null);
    } else if (action === 'popular') {
      addBotMessage("🔥 Here are our most popular items! Searching for trending products...");
      setIsBrowsing(true);
    } else if (action === 'deals') {
      addBotMessage("💰 Looking for deals? Check out our special offers!");
      setIsBrowsing(true);
    } else if (action === 'help') {
      addBotMessage("Need help? You can:\n• Browse Menu - see all products\n• Type what you want\n• Send a photo of items\n• Call us: 0300-1234567");
    } else if (action === 'track') {
      addBotMessage("You can see all your orders in the sidebar on the left. Tap the menu icon to open it! 📋");
    } else if (action === 'reorder') {
      addBotMessage("Select a previous order from the sidebar to view and reorder items! ↩️");
    }
  };

  const closeBrowseMode = () => {
    setIsBrowsing(false);
    setSelectedCategoryId(null);
  };

  // Checkout flow handlers
  const startCheckout = () => {
    setCartOpen(false);
    setCheckoutStep('delivery_type');
    addBotMessage("Let's complete your order! First, choose your delivery speed:", 'delivery_type_select');
  };

  const handleDeliveryTypeSelect = (type: DeliveryType) => {
    setDeliveryType(type);
    const typeName = type === 'instant' ? 'Instant Delivery (Rs. 100)' : 'Flexible Delivery (Rs. 50)';
    
    // Add user selection message
    const selectionMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'text',
      content: typeName,
      isFromUser: true,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, selectionMessage]);
    
    setCheckoutStep('address');
    addBotMessage("Great choice! Now, where should we deliver?", 'address_select');
  };

  const handleAddressSelect = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
    
    // Add user selection message
    const selectionMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'text',
      content: `📍 ${address.label}: ${address.fullAddress}`,
      isFromUser: true,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, selectionMessage]);
    
    setCheckoutStep('confirmation');
    addBotMessage("Please review and confirm your order:", 'order_confirmation');
  };

  const handleConfirmOrder = async () => {
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
      
      // Add order placed message
      const orderPlacedMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'order_placed',
        content: result.orderNumber,
        isFromUser: false,
        createdAt: new Date(),
        metadata: { deliveryType },
      };
      setMessages((prev) => [...prev, orderPlacedMessage]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEditCart = () => {
    setCheckoutStep('idle');
    setCartOpen(true);
  };

  // Render checkout step components
  const renderCheckoutStep = () => {
    switch (checkoutStep) {
      case 'delivery_type':
        return <DeliveryTypeSelector onSelect={handleDeliveryTypeSelect} />;
      case 'address':
        return <AddressSelector onSelect={handleAddressSelect} />;
      case 'confirmation':
        return (
          <OrderConfirmation 
            onConfirm={handleConfirmOrder} 
            onEdit={handleEditCart}
            isLoading={createOrder.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppSidebarMobile selectedOrderId={selectedOrderId} onSelectOrder={onSelectOrder} />
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">L</span>
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Layao</h1>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-success">● Online</span>
              <span className="text-muted-foreground">•</span>
              {selectedRestaurant ? (
                <span className="flex items-center gap-1 text-primary">
                  <MapPin className="w-3 h-3" />
                  {selectedRestaurant.name}
                </span>
              ) : (
                <button 
                  onClick={requestLocation}
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  Set location
                </button>
              )}
            </div>
          </div>
        </div>
        
        {itemCount > 0 && checkoutStep === 'idle' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Button
              size="sm"
              className="gap-2 relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Rs. {total.toFixed(0)}</span>
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground"
              >
                {itemCount}
              </Badge>
            </Button>
          </motion.div>
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
            initial={{ 
              opacity: 0, 
              x: message.isFromUser ? 20 : -20,
              scale: 0.95 
            }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: 1 
            }}
            transition={{ 
              delay: index * 0.03,
              type: 'spring',
              stiffness: 300,
              damping: 25
            }}
            className={message.isFromUser ? 'flex justify-end' : ''}
          >
            {message.type === 'product_card' && message.metadata ? (
              <ProductCard data={message.metadata as unknown as ProductCardData} />
            ) : message.type === 'product_results' && message.products ? (
              <ProductResults 
                products={message.products} 
                keywords={message.keywords || []} 
              />
            ) : message.type === 'order_placed' ? (
              <OrderPlaced 
                orderNumber={message.content} 
                deliveryType={(message.metadata?.deliveryType as DeliveryType) || 'flexible'} 
              />
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
        
        {/* Typing indicator while searching */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Checkout step component */}
        {checkoutStep !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
          >
            {renderCheckoutStep()}
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - hide during checkout */}
      {checkoutStep === 'idle' && <QuickActions onAction={handleQuickAction} />}

      {/* Cart Preview Bar - hide during checkout */}
      {checkoutStep === 'idle' && (
        <CartPreviewBar onClick={() => setCartOpen(true)} />
      )}

      {/* Input - hide during checkout */}
      {checkoutStep === 'idle' && <ChatInput onSendMessage={handleSendMessage} />}

      {/* Cart Sheet */}
      <CartSheet 
        open={cartOpen} 
        onOpenChange={setCartOpen} 
        onCheckout={startCheckout}
      />
    </div>
  );
};

export default Chat;
