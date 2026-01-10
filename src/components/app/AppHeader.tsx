import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  action?: React.ReactNode;
  className?: string;
}

const AppHeader = ({
  title,
  showBack = false,
  showMenu = false,
  action,
  className,
}: AppHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border',
        'px-4 h-14 flex items-center justify-between gap-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-foreground truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {action}
        {showMenu && (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="w-5 h-5" />
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
