import { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  MapPin, 
  Phone, 
  Clock, 
  Percent,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Search,
  Store
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  useAdminPartnerRestaurants,
  useCreatePartnerRestaurant,
  useUpdatePartnerRestaurant,
  useToggleAcceptingOrders,
  useDeletePartnerRestaurant,
  usePartnerRestaurantStats,
  type PartnerRestaurant,
  type CreatePartnerRestaurantInput
} from '@/hooks/admin/usePartnerRestaurants';
import { cn } from '@/lib/utils';

interface RestaurantFormData {
  name: string;
  address: string;
  phone: string;
  cuisine_type: string;
  description: string;
  latitude: string;
  longitude: string;
  delivery_radius_km: string;
  average_prep_time: string;
  commission_percent: string;
  opening_time: string;
  closing_time: string;
}

const initialFormData: RestaurantFormData = {
  name: '',
  address: '',
  phone: '',
  cuisine_type: '',
  description: '',
  latitude: '33.7',
  longitude: '73.1',
  delivery_radius_km: '5',
  average_prep_time: '30',
  commission_percent: '15',
  opening_time: '09:00',
  closing_time: '22:00',
};

const RestaurantCard = ({
  restaurant,
  onEdit,
  onToggle,
  onDelete,
}: {
  restaurant: PartnerRestaurant;
  onEdit: () => void;
  onToggle: (isAccepting: boolean) => void;
  onDelete: () => void;
}) => {
  const toggleMutation = useToggleAcceptingOrders();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {restaurant.image_url ? (
              <img 
                src={restaurant.image_url} 
                alt={restaurant.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Utensils className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">{restaurant.name}</CardTitle>
              {restaurant.cuisine_type && (
                <p className="text-sm text-muted-foreground">{restaurant.cuisine_type}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={restaurant.is_accepting_orders ? 'default' : 'secondary'}
              className={cn(
                restaurant.is_accepting_orders 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {restaurant.is_accepting_orders ? 'Accepting' : 'Paused'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{restaurant.address}</span>
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap gap-3 text-sm">
          {restaurant.phone && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="w-3 h-3" />
              {restaurant.phone}
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            {restaurant.average_prep_time || 30} min
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Percent className="w-3 h-3" />
            {Number(restaurant.commission_percent || 15)}%
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={restaurant.is_accepting_orders || false}
              onCheckedChange={(checked) => onToggle(checked)}
              disabled={toggleMutation.isPending}
            />
            <span className="text-sm text-muted-foreground">
              {restaurant.is_accepting_orders ? 'Accepting Orders' : 'Paused'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RestaurantFormDialog = ({
  open,
  onOpenChange,
  restaurant,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant?: PartnerRestaurant | null;
  onSubmit: (data: RestaurantFormData) => void;
  isSubmitting: boolean;
}) => {
  const [formData, setFormData] = useState<RestaurantFormData>(initialFormData);

  // Reset form when dialog opens with restaurant data
  useState(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone || '',
        cuisine_type: restaurant.cuisine_type || '',
        description: restaurant.description || '',
        latitude: String(restaurant.latitude),
        longitude: String(restaurant.longitude),
        delivery_radius_km: String(restaurant.delivery_radius_km || 5),
        average_prep_time: String(restaurant.average_prep_time || 30),
        commission_percent: String(restaurant.commission_percent || 15),
        opening_time: restaurant.opening_time?.slice(0, 5) || '09:00',
        closing_time: restaurant.closing_time?.slice(0, 5) || '22:00',
      });
    } else {
      setFormData(initialFormData);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof RestaurantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {restaurant ? 'Edit Restaurant' : 'Add Partner Restaurant'}
          </DialogTitle>
          <DialogDescription>
            {restaurant ? 'Update restaurant details' : 'Register a new partner restaurant'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Restaurant name"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Full address"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="0300-1234567"
                />
              </div>
              <div>
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Input
                  id="cuisine"
                  value={formData.cuisine_type}
                  onChange={(e) => updateField('cuisine_type', e.target.value)}
                  placeholder="Pakistani, Fast Food, etc."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Brief description of the restaurant"
                rows={2}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Location</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => updateField('latitude', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => updateField('longitude', e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="radius">Delivery Radius (km)</Label>
              <Input
                id="radius"
                type="number"
                value={formData.delivery_radius_km}
                onChange={(e) => updateField('delivery_radius_km', e.target.value)}
              />
            </div>
          </div>

          {/* Operations */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Operations</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="prep_time">Prep Time (min)</Label>
                <Input
                  id="prep_time"
                  type="number"
                  value={formData.average_prep_time}
                  onChange={(e) => updateField('average_prep_time', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="commission">Commission (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  value={formData.commission_percent}
                  onChange={(e) => updateField('commission_percent', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="opening">Opening Time</Label>
                <Input
                  id="opening"
                  type="time"
                  value={formData.opening_time}
                  onChange={(e) => updateField('opening_time', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="closing">Closing Time</Label>
                <Input
                  id="closing"
                  type="time"
                  value={formData.closing_time}
                  onChange={(e) => updateField('closing_time', e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : restaurant ? 'Save Changes' : 'Add Restaurant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PartnerRestaurants = () => {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<PartnerRestaurant | null>(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState<PartnerRestaurant | null>(null);

  const { data: restaurants, isLoading } = useAdminPartnerRestaurants();
  const { data: stats } = usePartnerRestaurantStats();
  const createMutation = useCreatePartnerRestaurant();
  const updateMutation = useUpdatePartnerRestaurant();
  const toggleMutation = useToggleAcceptingOrders();
  const deleteMutation = useDeletePartnerRestaurant();

  const filteredRestaurants = restaurants?.filter((r) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(searchLower) ||
      r.address.toLowerCase().includes(searchLower) ||
      r.cuisine_type?.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenCreate = () => {
    setEditingRestaurant(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (restaurant: PartnerRestaurant) => {
    setEditingRestaurant(restaurant);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: RestaurantFormData) => {
    const input: CreatePartnerRestaurantInput = {
      name: data.name,
      address: data.address,
      phone: data.phone || undefined,
      cuisine_type: data.cuisine_type || undefined,
      description: data.description || undefined,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      delivery_radius_km: parseFloat(data.delivery_radius_km) || 5,
      average_prep_time: parseInt(data.average_prep_time) || 30,
      commission_percent: parseFloat(data.commission_percent) || 15,
      opening_time: data.opening_time + ':00',
      closing_time: data.closing_time + ':00',
    };

    if (editingRestaurant) {
      updateMutation.mutate(
        { id: editingRestaurant.id, ...input },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(input, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleToggle = (id: string, isAccepting: boolean) => {
    toggleMutation.mutate({ id, isAccepting });
  };

  const handleDelete = () => {
    if (deletingRestaurant) {
      deleteMutation.mutate(deletingRestaurant.id, {
        onSuccess: () => setDeletingRestaurant(null),
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Partner Restaurants</h1>
            <p className="text-muted-foreground">Manage partner restaurant registrations</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Restaurant
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Store className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Partners</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <ToggleRight className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{stats.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Utensils className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accepting Orders</p>
                    <p className="text-2xl font-bold">{stats.accepting}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Restaurant Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48" />
              </Card>
            ))}
          </div>
        ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onEdit={() => handleOpenEdit(restaurant)}
                onToggle={(isAccepting) => handleToggle(restaurant.id, isAccepting)}
                onDelete={() => setDeletingRestaurant(restaurant)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-1">No partner restaurants</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? 'No restaurants match your search' : 'Get started by adding your first partner restaurant'}
            </p>
            {!search && (
              <Button onClick={handleOpenCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Restaurant
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <RestaurantFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        restaurant={editingRestaurant}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRestaurant} onOpenChange={(open) => !open && setDeletingRestaurant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingRestaurant?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PartnerRestaurants;
