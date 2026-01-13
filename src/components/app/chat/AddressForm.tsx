import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateAddress } from '@/hooks/app/useAddresses';
import type { DeliveryAddress } from '@/contexts/OrderContext';

interface AddressFormProps {
  onSave: (address: DeliveryAddress) => void;
  onCancel: () => void;
}

const AddressForm = ({ onSave, onCancel }: AddressFormProps) => {
  const createAddress = useCreateAddress();
  const [formData, setFormData] = useState({
    label: 'Home',
    fullAddress: '',
    area: '',
    landmark: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullAddress.trim()) return;

    try {
      const result = await createAddress.mutateAsync({
        label: formData.label,
        fullAddress: formData.fullAddress,
        area: formData.area || undefined,
        landmark: formData.landmark || undefined,
        isDefault: true,
      });

      onSave({
        id: result.id,
        label: result.label,
        fullAddress: result.full_address,
        area: result.area || undefined,
        landmark: result.landmark || undefined,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-chat-bot-foreground font-medium mb-2">
        Add New Address 📍
      </p>

      <div className="space-y-2">
        <Label htmlFor="label" className="text-xs">Label</Label>
        <div className="flex gap-2">
          {['Home', 'Office', 'Other'].map((label) => (
            <Button
              key={label}
              type="button"
              size="sm"
              variant={formData.label === label ? 'default' : 'outline'}
              onClick={() => setFormData((prev) => ({ ...prev, label }))}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullAddress" className="text-xs">Full Address *</Label>
        <Textarea
          id="fullAddress"
          placeholder="House/Flat no, Street, Area..."
          value={formData.fullAddress}
          onChange={(e) => setFormData((prev) => ({ ...prev, fullAddress: e.target.value }))}
          className="min-h-[80px] bg-background"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="area" className="text-xs">Area (Optional)</Label>
        <Input
          id="area"
          placeholder="e.g., New City Phase 2"
          value={formData.area}
          onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="landmark" className="text-xs">Landmark (Optional)</Label>
        <Input
          id="landmark"
          placeholder="e.g., Near ABC Mosque"
          value={formData.landmark}
          onChange={(e) => setFormData((prev) => ({ ...prev, landmark: e.target.value }))}
          className="bg-background"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={!formData.fullAddress.trim() || createAddress.isPending}
        >
          {createAddress.isPending ? 'Saving...' : 'Save Address'}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
