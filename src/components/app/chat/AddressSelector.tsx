import { useState } from 'react';
import { MapPin, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddresses } from '@/hooks/app/useAddresses';
import AddressForm from './AddressForm';
import { cn } from '@/lib/utils';
import type { DeliveryAddress } from '@/contexts/OrderContext';

interface AddressSelectorProps {
  onSelect: (address: DeliveryAddress) => void;
}

const AddressSelector = ({ onSelect }: AddressSelectorProps) => {
  const { data: addresses, isLoading } = useAddresses();
  const [showForm, setShowForm] = useState(false);

  const handleAddressCreated = (address: DeliveryAddress) => {
    setShowForm(false);
    onSelect(address);
  };

  if (showForm) {
    return (
      <div className="bg-chat-bot rounded-2xl rounded-tl-md p-4 max-w-[90%]">
        <AddressForm 
          onSave={handleAddressCreated} 
          onCancel={() => setShowForm(false)} 
        />
      </div>
    );
  }

  return (
    <div className="bg-chat-bot rounded-2xl rounded-tl-md p-4 max-w-[90%]">
      <p className="text-sm text-chat-bot-foreground mb-3">
        Where should we deliver? 📍
      </p>
      
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : addresses && addresses.length > 0 ? (
        <div className="space-y-2">
          {addresses.map((address) => (
            <button
              key={address.id}
              onClick={() =>
                onSelect({
                  id: address.id,
                  label: address.label,
                  fullAddress: address.full_address,
                  area: address.area || undefined,
                  landmark: address.landmark || undefined,
                })
              }
              className={cn(
                'w-full p-3 rounded-xl border-2 border-border bg-card',
                'hover:border-primary hover:bg-primary/5 transition-all',
                'flex items-start gap-3 text-left'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{address.label}</span>
                  {address.is_default && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {address.full_address}
                </p>
                {address.landmark && (
                  <p className="text-xs text-muted-foreground truncate">
                    Near: {address.landmark}
                  </p>
                )}
              </div>
              <Check className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100" />
            </button>
          ))}
          
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        </div>
      ) : (
        <div className="text-center py-4">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            No saved addresses yet
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
