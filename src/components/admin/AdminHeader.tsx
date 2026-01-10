import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Menu, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

const AdminHeader = ({ onMenuClick, sidebarCollapsed }: AdminHeaderProps) => {
  const { user, signOut, isDevMode } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/auth');
  };

  const initials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'A';

  return (
    <header
      className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4"
      style={{ left: sidebarCollapsed ? '4rem' : '16rem' }}
    >
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        {isDevMode && (
          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-500">
            <FlaskConical className="h-3 w-3" />
            DEV
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.user_metadata?.full_name || 'Admin'}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.user_metadata?.full_name || 'Admin User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || user?.phone}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
