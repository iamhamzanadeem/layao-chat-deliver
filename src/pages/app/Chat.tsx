import { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useOrder } from '@/contexts/OrderContext';
import { useProductSearch } from '@/hooks/app/useProductSearch';
import { usePopularProducts } from '@/hooks/app/usePopularProducts';
import { useDealsProducts } from '@/hooks/app/useDealsProducts';
import { useReorder } from '@/hooks/app/useReorder';
import { useCheckoutFlow } from '@/hooks/app/useCheckoutFlow';
import { useErrandFlow } from '@/hooks/app/useErrandFlow';
import type { ChatMessage, ExtendedProduct } from '@/types/chat';

// Components
import ChatHeader from '@/components/app/chat/ChatHeader';
import BrowsePanel from '@/components/app/chat/BrowsePanel';
import MessageList from '@/components/app/chat/MessageList';
import ChatInputArea from '@/components/app/chat/ChatInputArea';
import CartSheet from '@/components/app/chat/CartSheet';

interface AppLayoutContext {
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string | null) => void;
}

const Chat = () => {
  const { selectedOrderId, onSelectOrder } = useOutletContext<AppLayoutContext>();
  const { user } = useAuth();
  const { 
    position,
    selectedRestaurant,
    requestLocation,
  } = useLocation();
  const { itemCount, total } = useOrder();
  const { searchByMessage } = useProductSearch();
  const { data: popularProducts, isLoading: isLoadingPopular } = usePopularProducts();
  const { data: dealsProducts, isLoading: isLoadingDeals } = useDealsProducts();
  const { reorderLastOrder, hasRecentOrders, isLoading: isLoadingReorder } = useReorder();

  // Messages state
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
  
  // Restaurant browsing state
  const [showRestaurantList, setShowRestaurantList] = useState(false);
  const [browsingRestaurantId, setBrowsingRestaurantId] = useState<string | null>(null);
  
  // Loading state
  const [isSearching, setIsSearching] = useState(false);

  // Add message callback for checkout flow
  const handleAddMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Checkout flow hook
  const {
    checkoutStep,
    isCheckoutActive,
    isConfirming,
    startCheckout,
    handleDeliveryTypeSelect,
    handleAddressSelect,
    handleConfirmOrder,
    handleEditCart,
  } = useCheckoutFlow({
    onAddMessage: handleAddMessage,
    onOpenCart: setCartOpen,
  });

  // Errand flow hook
  const {
    errandStep,
    isErrandActive,
    errandDetails,
    deliveryAddress: errandDeliveryAddress,
    priceEstimate,
    isCalculatingPrice,
    isSubmitting: isErrandSubmitting,
    startErrandFlow,
    handleTaskTypeSelect,
    handleDetailsSubmit,
    handleAddressSelect: handleErrandAddressSelect,
    handleSubmitErrand,
    handleEditDetails,
    cancelErrandFlow,
  } = useErrandFlow({ onAddMessage: handleAddMessage });

  // Reset browse mode when selecting an order
  useEffect(() => {
    if (selectedOrderId) {
      setIsBrowsing(false);
    }
  }, [selectedOrderId]);

  // Helper to add bot messages
  const addBotMessage = useCallback((content: string, type: ChatMessage['type'] = 'bot') => {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      type,
      content,
      isFromUser: false,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  // Handle sending text messages
  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'text',
      content,
      isFromUser: true,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsSearching(true);
    const searchResult = await searchByMessage(content);
    setIsSearching(false);

    if (searchResult.hasResults) {
      const productResultsMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'product_results',
        content: '',
        isFromUser: false,
        createdAt: new Date(),
        products: searchResult.products,
        keywords: searchResult.keywords,
        groupedProducts: searchResult.groupedProducts,
      };
      setMessages((prev) => [...prev, productResultsMessage]);
    } else if (searchResult.keywords.length > 0) {
      addBotMessage(`I couldn't find "${searchResult.keywords.join(', ')}" in our inventory. Try browsing our menu to see what's available! 🔍`);
      setIsBrowsing(true);
    } else {
      addBotMessage("Got it! Tap 'Browse Menu' below to see our products, or tell me what you'd like to order! 🛒");
    }
  }, [searchByMessage, addBotMessage]);

  // Handle quick actions
  const handleQuickAction = useCallback(async (action: string) => {
    if (action === 'browse') {
      setIsBrowsing(true);
      setSelectedCategoryId(null);
    } else if (action === 'errand') {
      // Start errand flow
      startErrandFlow();
    } else if (action === 'restaurant') {
      // Partner restaurants
      setShowRestaurantList(true);
      addBotMessage("🍽️ Here are partner restaurants that deliver to you:");
    } else if (action === 'popular') {
      if (isLoadingPopular) {
        setIsSearching(true);
        return;
      }
      
      if (popularProducts && popularProducts.length > 0) {
        const message: ChatMessage = {
          id: crypto.randomUUID(),
          type: 'product_results',
          content: '',
          isFromUser: false,
          createdAt: new Date(),
          products: popularProducts as ExtendedProduct[],
          keywords: ['popular', 'trending', 'hot'],
        };
        setMessages((prev) => [...prev, message]);
        addBotMessage("🔥 Here are our most popular items!");
      } else {
        addBotMessage("No popular items available right now. Browse our menu to find something you'll love! 🛒");
        setIsBrowsing(true);
      }
    } else if (action === 'deals') {
      if (isLoadingDeals) {
        setIsSearching(true);
        return;
      }
      
      if (dealsProducts && dealsProducts.length > 0) {
        const message: ChatMessage = {
          id: crypto.randomUUID(),
          type: 'product_results',
          content: '',
          isFromUser: false,
          createdAt: new Date(),
          products: dealsProducts as ExtendedProduct[],
          keywords: ['deals', 'discount', 'offers'],
        };
        setMessages((prev) => [...prev, message]);
        addBotMessage("💰 Check out these amazing deals!");
      } else {
        addBotMessage("No active deals right now. Check back soon for special offers! 🎁");
        setIsBrowsing(true);
      }
    } else if (action === 'help') {
      addBotMessage("Need help? You can:\n• Browse Menu - see all products\n• Get Job Done - any errand service\n• Type what you want\n• Call us: 0300-1234567");
    } else if (action === 'track') {
      addBotMessage("You can see all your orders in the sidebar on the left. Tap the menu icon to open it! 📋");
    } else if (action === 'reorder') {
      if (isLoadingReorder) {
        setIsSearching(true);
        return;
      }
      
      if (hasRecentOrders) {
        const result = reorderLastOrder();
        if (result.success) {
          addBotMessage(`✅ Added ${result.itemCount} item${result.itemCount > 1 ? 's' : ''} from your last order to cart!`);
        } else {
          addBotMessage("Couldn't add items to cart. Please try again.");
        }
      } else {
        addBotMessage("You don't have any previous orders yet. Start shopping to create your first order! 🛒");
        setIsBrowsing(true);
      }
    }
  }, [
    isLoadingPopular,
    popularProducts,
    isLoadingDeals,
    dealsProducts,
    isLoadingReorder,
    hasRecentOrders,
    reorderLastOrder,
    addBotMessage,
    startErrandFlow,
  ]);

  const closeBrowseMode = useCallback(() => {
    setIsBrowsing(false);
    setSelectedCategoryId(null);
  }, []);

  // Restaurant selection handlers
  const handleSelectRestaurant = useCallback((restaurantId: string) => {
    setShowRestaurantList(false);
    setBrowsingRestaurantId(restaurantId);
    addBotMessage("📋 Here's the menu! Add items to your cart:");
  }, [addBotMessage]);

  const handleCloseRestaurantList = useCallback(() => {
    setShowRestaurantList(false);
  }, []);

  const handleBackToRestaurantList = useCallback(() => {
    setBrowsingRestaurantId(null);
    setShowRestaurantList(true);
  }, []);

  const handleCloseRestaurantMenu = useCallback(() => {
    setBrowsingRestaurantId(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ChatHeader
        selectedOrderId={selectedOrderId}
        onSelectOrder={onSelectOrder}
        selectedRestaurant={selectedRestaurant}
        onRequestLocation={requestLocation}
        itemCount={itemCount}
        total={total}
        isCheckoutActive={isCheckoutActive}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Browse Mode Panel */}
      <BrowsePanel
        isOpen={isBrowsing}
        onClose={closeBrowseMode}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Messages */}
      <MessageList
        messages={messages}
        isSearching={isSearching}
        checkoutStep={checkoutStep}
        isConfirming={isConfirming}
        onDeliveryTypeSelect={handleDeliveryTypeSelect}
        onAddressSelect={handleAddressSelect}
        onConfirmOrder={handleConfirmOrder}
        onEditCart={handleEditCart}
        // Errand props
        errandStep={errandStep}
        errandDetails={errandDetails}
        errandDeliveryAddress={errandDeliveryAddress}
        priceEstimate={priceEstimate}
        isCalculatingPrice={isCalculatingPrice}
        isErrandSubmitting={isErrandSubmitting}
        onTaskTypeSelect={handleTaskTypeSelect}
        onDetailsSubmit={handleDetailsSubmit}
        onErrandAddressSelect={handleErrandAddressSelect}
        onSubmitErrand={handleSubmitErrand}
        onEditDetails={handleEditDetails}
        // Restaurant props
        showRestaurantList={showRestaurantList}
        browsingRestaurantId={browsingRestaurantId}
        onSelectRestaurant={handleSelectRestaurant}
        onCloseRestaurantList={handleCloseRestaurantList}
        onBackToRestaurantList={handleBackToRestaurantList}
        onCloseRestaurantMenu={handleCloseRestaurantMenu}
      />

      {/* Input Area (Quick Actions + Cart Preview + Chat Input) */}
      <ChatInputArea
        onSendMessage={handleSendMessage}
        onQuickAction={handleQuickAction}
        onOpenCart={() => setCartOpen(true)}
        isCheckoutActive={isCheckoutActive}
      />

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
