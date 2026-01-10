import { User, MapPin, Bell, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/app/AppHeader';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/app/auth');
  };

  const menuItems = [
    { icon: MapPin, label: 'Saved Addresses', onClick: () => {} },
    { icon: Bell, label: 'Notifications', onClick: () => {} },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => {} },
  ];

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Profile" />
      
      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">
              {user?.user_metadata?.full_name || user?.phone || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email || user?.phone}</p>
          </div>
          <Button variant="outline" size="sm">Edit</Button>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-left font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sign Out */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
