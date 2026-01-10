import { NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrder } from '@/contexts/OrderContext';

const navItems = [
  { path: '/app/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/app/catalog', icon: ShoppingBag, label: 'Browse' },
  { path: '/app/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/app/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const { itemCount } = useOrder();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          const showBadge = item.path === '/app/catalog' && itemCount > 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full relative',
                'transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-6 h-6', isActive && 'animate-scale-in')} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] mt-1 font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
