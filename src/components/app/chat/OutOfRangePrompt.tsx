import { motion } from 'framer-motion';
import { MapPin, Truck, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeInUp } from '@/lib/animations';

interface OutOfRangePromptProps {
  onUseErrandService: () => void;
  onChooseDifferentAddress: () => void;
  distanceMessage?: string;
}

const OutOfRangePrompt = ({
  onUseErrandService,
  onChooseDifferentAddress,
  distanceMessage,
}: OutOfRangePromptProps) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/40">
          <MapPin className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Outside Delivery Zone</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {distanceMessage || "You're outside our standard delivery area, but we can still help!"}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {/* Errand Service Option */}
        <Button
          variant="default"
          className="w-full justify-start h-auto py-3 px-4"
          onClick={onUseErrandService}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-foreground/20">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Use "Get Job Done" Service</div>
              <div className="text-xs opacity-80">
                We'll provide a custom delivery quote for your location
              </div>
            </div>
          </div>
        </Button>

        {/* Different Address Option */}
        <Button
          variant="outline"
          className="w-full justify-start h-auto py-3 px-4"
          onClick={onChooseDifferentAddress}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Choose Different Address</div>
              <div className="text-xs text-muted-foreground">
                Select an address within our delivery zone
              </div>
            </div>
          </div>
        </Button>
      </div>

      {/* Info */}
      <p className="text-xs text-center text-muted-foreground mt-4">
        Standard delivery is available within 5km of our stores
      </p>
    </motion.div>
  );
};

export default OutOfRangePrompt;
