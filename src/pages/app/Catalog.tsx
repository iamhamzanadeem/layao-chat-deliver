import { useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useOrder } from '@/contexts/OrderContext';
import AppHeader from '@/components/app/AppHeader';

const categories = [
  { id: '1', name: 'Groceries', slug: 'groceries', icon: '🥬', color: 'bg-green-100' },
  { id: '2', name: 'Food', slug: 'food', icon: '🍔', color: 'bg-orange-100' },
  { id: '3', name: 'Pharmacy', slug: 'pharmacy', icon: '💊', color: 'bg-blue-100' },
  { id: '4', name: 'Errands', slug: 'errands', icon: '📦', color: 'bg-purple-100' },
];

const sampleProducts = [
  { id: '1', name: 'Fresh Milk 1L', price: 280, unit: 'pack', category: 'groceries' },
  { id: '2', name: 'Eggs (12 pcs)', price: 350, unit: 'dozen', category: 'groceries' },
  { id: '3', name: 'Chicken Biryani', price: 450, unit: 'plate', category: 'food' },
  { id: '4', name: 'Panadol Extra', price: 120, unit: 'pack', category: 'pharmacy' },
];

const Catalog = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { items, addItem, removeItem, updateQuantity, itemCount, total, subtotal, deliveryFee } = useOrder();

  const filteredProducts = sampleProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const handleAddProduct = (product: typeof sampleProducts[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      unit: product.unit,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader 
        title="Browse" 
        action={
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 relative">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Your Cart ({itemCount})</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
                ) : (
                  <>
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Rs. {item.price} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3 space-y-1">
                      <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rs. {subtotal}</span></div>
                      <div className="flex justify-between text-sm"><span>Delivery</span><span>Rs. {deliveryFee}</span></div>
                      <div className="flex justify-between font-semibold"><span>Total</span><span className="text-primary">Rs. {total}</span></div>
                    </div>
                    <Button className="w-full mt-4">Checkout</Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-colors ${
                selectedCategory === cat.slug ? 'border-primary bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-xs font-medium">{cat.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => {
            const qty = getItemQuantity(product.id);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-3"
              >
                <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center text-3xl mb-2">
                  📦
                </div>
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <p className="text-primary font-semibold text-sm">Rs. {product.price}</p>
                <div className="mt-2">
                  {qty > 0 ? (
                    <div className="flex items-center justify-between">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => updateQuantity(items.find(i => i.productId === product.id)!.id, qty - 1)}>-</Button>
                      <span className="font-medium">{qty}</span>
                      <Button size="sm" className="h-8 w-8 p-0" onClick={() => updateQuantity(items.find(i => i.productId === product.id)!.id, qty + 1)}>+</Button>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full h-8" onClick={() => handleAddProduct(product)}>Add</Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
