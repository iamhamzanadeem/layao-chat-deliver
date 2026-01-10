import { ClipboardList } from 'lucide-react';
import AppHeader from '@/components/app/AppHeader';

const Orders = () => {
  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Orders" />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <ClipboardList className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">No Orders Yet</h2>
        <p className="text-muted-foreground max-w-xs">
          Your order history will appear here once you place your first order.
        </p>
      </div>
    </div>
  );
};

export default Orders;
