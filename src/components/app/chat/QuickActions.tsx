import { Button } from '@/components/ui/button';
import { ShoppingBag, RotateCcw, MapPin, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const quickActions = [
  { id: 'browse', icon: ShoppingBag, label: 'Browse Menu' },
  { id: 'reorder', icon: RotateCcw, label: 'Reorder Last' },
  { id: 'track', icon: MapPin, label: 'Track Order' },
  { id: 'help', icon: HelpCircle, label: 'Help' },
];

const QuickActions = ({ onAction }: QuickActionsProps) => {
  const navigate = useNavigate();

  const handleClick = (actionId: string) => {
    if (actionId === 'browse') {
      navigate('/app/catalog');
    } else {
      onAction(actionId);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3 bg-muted/50 border-t border-border">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="secondary"
            size="sm"
            className="rounded-full h-8 px-3 gap-1.5 text-xs font-medium"
            onClick={() => handleClick(action.id)}
          >
            <Icon className="w-3.5 h-3.5" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};

export default QuickActions;
