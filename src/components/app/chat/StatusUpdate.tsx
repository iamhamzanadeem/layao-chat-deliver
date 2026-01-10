import { Package, CheckCircle, Truck, MapPin, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { StatusUpdateData } from '@/types/chat';

interface StatusUpdateProps {
  data: StatusUpdateData;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    label: 'Order Pending',
  },
  confirmed: {
    icon: CheckCircle,
    color: 'text-info',
    bgColor: 'bg-info/10',
    label: 'Order Confirmed',
  },
  preparing: {
    icon: Package,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    label: 'Preparing',
  },
  on_the_way: {
    icon: Truck,
    color: 'text-success',
    bgColor: 'bg-success/10',
    label: 'On the Way',
  },
  delivered: {
    icon: MapPin,
    color: 'text-success',
    bgColor: 'bg-success/10',
    label: 'Delivered',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    label: 'Cancelled',
  },
};

const StatusUpdate = ({ data }: StatusUpdateProps) => {
  const config = statusConfig[data.status];
  const Icon = config.icon;

  return (
    <div className="flex justify-center my-4">
      <div className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        config.bgColor
      )}>
        <Icon className={cn('w-4 h-4', config.color)} />
        <div className="text-sm">
          <span className={cn('font-medium', config.color)}>{config.label}</span>
          <span className="text-muted-foreground mx-1">•</span>
          <span className="text-muted-foreground">#{data.orderNumber}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdate;
