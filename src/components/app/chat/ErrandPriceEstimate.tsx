import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Calculator, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ErrandDetails, ErrandPriceEstimate as PriceEstimate } from '@/types/errand';
import type { DeliveryAddress } from '@/contexts/OrderContext';

interface ErrandPriceEstimateProps {
  errandDetails: ErrandDetails;
  deliveryAddress: DeliveryAddress;
  priceEstimate: PriceEstimate | null;
  isCalculating: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  isSubmitting: boolean;
}

const ErrandPriceEstimateComponent = ({
  errandDetails,
  deliveryAddress,
  priceEstimate,
  isCalculating,
  onConfirm,
  onEdit,
  isSubmitting,
}: ErrandPriceEstimateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-sm border border-border max-w-md"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Errand Summary</h3>
      </div>

      {/* Task Description */}
      <div className="bg-muted/50 rounded-lg p-3 mb-4">
        <p className="text-sm text-foreground">{errandDetails.taskDescription}</p>
      </div>

      {/* Locations */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pickup from</p>
            <p className="text-sm font-medium text-foreground">{errandDetails.pickupAddress}</p>
            {errandDetails.pickupContactName && (
              <p className="text-xs text-muted-foreground">
                Contact: {errandDetails.pickupContactName}
                {errandDetails.pickupContactPhone && ` • ${errandDetails.pickupContactPhone}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Deliver to</p>
            <p className="text-sm font-medium text-foreground">{deliveryAddress.label}</p>
            <p className="text-xs text-muted-foreground">{deliveryAddress.fullAddress}</p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      {isCalculating ? (
        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Calculating price...</span>
        </div>
      ) : priceEstimate ? (
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Fee</span>
            <span className="text-foreground">Rs. {priceEstimate.base_fee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Distance ({priceEstimate.distance_km.toFixed(1)} km)
            </span>
            <span className="text-foreground">Rs. {priceEstimate.distance_fee}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
            <span className="text-foreground">Estimated Total</span>
            <span className="text-primary">Rs. {priceEstimate.total_fee}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-4 text-destructive bg-destructive/10 rounded-lg px-3">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Unable to calculate price. Admin will provide a quote.</span>
        </div>
      )}

      {/* Approval Notice */}
      <div className={cn(
        'flex items-start gap-2 mt-4 p-3 rounded-lg',
        'bg-secondary text-secondary-foreground'
      )}>
        <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p className="text-xs">
          <strong>Note:</strong> This request requires admin approval. You'll be notified once confirmed.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={onEdit} className="flex-1" disabled={isSubmitting}>
          Edit Details
        </Button>
        <Button 
          onClick={onConfirm} 
          className="flex-1 gap-2" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Submit Request
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default ErrandPriceEstimateComponent;
