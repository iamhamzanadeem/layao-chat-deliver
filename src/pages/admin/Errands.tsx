import { useState } from 'react';
import { useErrands, useUpdateErrandApproval, useTodayErrandStats } from '@/hooks/admin/useErrands';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Truck,
  MapPin,
  Navigation,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Package,
  Utensils,
  Sparkles,
  User,
  Phone,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ErrandApprovalStatus, ErrandTaskType } from '@/types/errand';
import StatsCard from '@/components/admin/StatsCard';

const TASK_TYPE_CONFIG: Record<ErrandTaskType, { icon: React.ElementType; label: string; color: string }> = {
  document: { icon: FileText, label: 'Document', color: 'bg-blue-100 text-blue-700' },
  restaurant: { icon: Utensils, label: 'Restaurant', color: 'bg-orange-100 text-orange-700' },
  package: { icon: Package, label: 'Package', color: 'bg-purple-100 text-purple-700' },
  custom: { icon: Sparkles, label: 'Custom', color: 'bg-pink-100 text-pink-700' },
};

const STATUS_CONFIG: Record<ErrandApprovalStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  quoted: { label: 'Quoted', color: 'bg-blue-100 text-blue-800' },
};

const Errands = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ErrandApprovalStatus | 'all'>('all');
  const [selectedErrandId, setSelectedErrandId] = useState<string | null>(null);
  
  const { data: errands, isLoading } = useErrands({ approvalStatus: statusFilter });
  const { data: stats } = useTodayErrandStats();
  const updateApproval = useUpdateErrandApproval();

  const filteredErrands = errands?.filter((errand) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      errand.order.order_number.toLowerCase().includes(searchLower) ||
      errand.task_description.toLowerCase().includes(searchLower) ||
      errand.pickup_address.toLowerCase().includes(searchLower) ||
      errand.profile?.full_name?.toLowerCase().includes(searchLower) ||
      errand.profile?.phone?.includes(search)
    );
  });

  const selectedErrand = errands?.find((e) => e.id === selectedErrandId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Errand Requests</h1>
        <p className="text-muted-foreground">Manage and approve errand requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Today's Requests"
          value={stats?.totalRequests || 0}
          icon={Truck}
        />
        <StatsCard
          title="Pending"
          value={stats?.pending || 0}
          icon={Clock}
        />
        <StatsCard
          title="Approved"
          value={stats?.approved || 0}
          icon={CheckCircle}
        />
        <StatsCard
          title="Est. Revenue"
          value={`Rs. ${stats?.estimatedRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order #, task, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ErrandApprovalStatus | 'all')}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Errands Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filteredErrands?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No errand requests found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredErrands?.map((errand) => {
            const taskConfig = TASK_TYPE_CONFIG[errand.task_type as ErrandTaskType] || TASK_TYPE_CONFIG.custom;
            const statusConfig = STATUS_CONFIG[errand.approval_status as ErrandApprovalStatus];
            const TaskIcon = taskConfig.icon;

            return (
              <div
                key={errand.id}
                onClick={() => setSelectedErrandId(errand.id)}
                className={cn(
                  'bg-card border border-border rounded-xl p-4 cursor-pointer',
                  'hover:border-primary/50 hover:shadow-sm transition-all'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('p-2 rounded-lg', taskConfig.color)}>
                      <TaskIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{errand.order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{taskConfig.label}</p>
                    </div>
                  </div>
                  <Badge className={cn('text-xs', statusConfig.color)}>
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Task Description */}
                <p className="text-sm text-foreground line-clamp-2 mb-3">
                  {errand.task_description}
                </p>

                {/* Locations */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-accent-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground line-clamp-1">{errand.pickup_address}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Navigation className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground line-clamp-1">
                      {errand.order.delivery_address.fullAddress}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{errand.profile?.full_name || 'Unknown'}</span>
                  </div>
                  <p className="font-semibold text-primary">
                    Rs. {errand.final_price || errand.estimated_total}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <ErrandDetailModal
        errand={selectedErrand}
        open={!!selectedErrandId}
        onClose={() => setSelectedErrandId(null)}
        onApprove={(notes, price) => {
          updateApproval.mutate({
            id: selectedErrandId!,
            approvalStatus: 'approved',
            adminNotes: notes,
            finalPrice: price,
          }, { onSuccess: () => setSelectedErrandId(null) });
        }}
        onReject={(notes) => {
          updateApproval.mutate({
            id: selectedErrandId!,
            approvalStatus: 'rejected',
            adminNotes: notes,
          }, { onSuccess: () => setSelectedErrandId(null) });
        }}
        isUpdating={updateApproval.isPending}
      />
    </div>
  );
};

interface ErrandDetailModalProps {
  errand: ReturnType<typeof useErrands>['data'] extends (infer T)[] ? T : never;
  open: boolean;
  onClose: () => void;
  onApprove: (notes: string, price: number) => void;
  onReject: (notes: string) => void;
  isUpdating: boolean;
}

const ErrandDetailModal = ({
  errand,
  open,
  onClose,
  onApprove,
  onReject,
  isUpdating,
}: ErrandDetailModalProps) => {
  const [notes, setNotes] = useState('');
  const [finalPrice, setFinalPrice] = useState('');

  if (!errand) return null;

  const taskConfig = TASK_TYPE_CONFIG[errand.task_type as ErrandTaskType] || TASK_TYPE_CONFIG.custom;
  const statusConfig = STATUS_CONFIG[errand.approval_status as ErrandApprovalStatus];
  const TaskIcon = taskConfig.icon;

  const handleApprove = () => {
    const price = parseFloat(finalPrice) || errand.estimated_total;
    onApprove(notes, price);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', taskConfig.color)}>
              <TaskIcon className="w-4 h-4" />
            </div>
            {errand.order.order_number}
          </DialogTitle>
          <DialogDescription>
            {taskConfig.label} • {format(new Date(errand.created_at), 'PPp')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge className={cn(statusConfig.color)}>{statusConfig.label}</Badge>
          </div>

          {/* Customer Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <h4 className="font-medium text-sm">Customer</h4>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{errand.profile?.full_name || 'Unknown'}</span>
            </div>
            {errand.profile?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{errand.profile.phone}</span>
              </div>
            )}
          </div>

          {/* Task Description */}
          <div>
            <h4 className="font-medium text-sm mb-2">Task Description</h4>
            <p className="text-sm bg-muted/50 rounded-lg p-3">{errand.task_description}</p>
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <MapPin className="w-4 h-4 text-accent-foreground" />
                Pickup Location
              </div>
              <p className="text-sm text-muted-foreground ml-6">{errand.pickup_address}</p>
              {errand.pickup_contact_name && (
                <p className="text-xs text-muted-foreground ml-6 mt-1">
                  Contact: {errand.pickup_contact_name}
                  {errand.pickup_contact_phone && ` • ${errand.pickup_contact_phone}`}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Navigation className="w-4 h-4 text-primary" />
                Delivery Location
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {errand.order.delivery_address.fullAddress}
              </p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Fee</span>
              <span>Rs. {errand.base_fee}</span>
            </div>
            {errand.distance_km && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Distance ({Number(errand.distance_km).toFixed(1)} km)
                </span>
                <span>Rs. {errand.distance_fee}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Estimated Total</span>
              <span className="text-primary">Rs. {errand.estimated_total}</span>
            </div>
          </div>

          {/* Admin Actions (only show for pending) */}
          {errand.approval_status === 'pending' && (
            <div className="border-t border-border pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="finalPrice">Final Price (optional)</Label>
                <Input
                  id="finalPrice"
                  type="number"
                  placeholder={`${errand.estimated_total}`}
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Admin Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes for this request..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => onReject(notes)}
                  disabled={isUpdating}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleApprove}
                  disabled={isUpdating}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
              </div>
            </div>
          )}

          {/* Show admin notes if already processed */}
          {errand.admin_notes && errand.approval_status !== 'pending' && (
            <div className="border-t border-border pt-4">
              <h4 className="font-medium text-sm mb-2">Admin Notes</h4>
              <p className="text-sm text-muted-foreground">{errand.admin_notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Errands;
