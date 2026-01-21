import ChatBubble from './ChatBubble';
import ProductCard from './ProductCard';
import ProductResults from './ProductResults';
import OrderPlaced from './OrderPlaced';
import type { ChatMessage, ProductCardData } from '@/types/chat';
import type { DeliveryType } from '@/contexts/OrderContext';

interface MessageRendererProps {
  message: ChatMessage;
}

/**
 * Renders a single chat message based on its type.
 * Centralizes all message rendering logic in one place.
 */
const MessageRenderer = ({ message }: MessageRendererProps) => {
  switch (message.type) {
    case 'product_card':
      if (message.metadata) {
        return <ProductCard data={message.metadata as unknown as ProductCardData} />;
      }
      return null;

    case 'product_results':
      if (message.products) {
        return (
          <ProductResults 
            products={message.products} 
            keywords={message.keywords || []} 
            groupedProducts={message.groupedProducts}
          />
        );
      }
      return null;

    case 'order_placed':
      return (
        <OrderPlaced 
          orderNumber={message.content} 
          deliveryType={(message.metadata?.deliveryType as DeliveryType) || 'flexible'} 
        />
      );

    case 'text':
    case 'bot':
    case 'delivery_type_select':
    case 'address_select':
    case 'order_confirmation':
    default:
      return (
        <ChatBubble
          isFromUser={message.isFromUser}
          timestamp={message.createdAt}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </ChatBubble>
      );
  }
};

export default MessageRenderer;
