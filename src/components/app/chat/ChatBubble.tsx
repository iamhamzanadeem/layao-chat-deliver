import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface ChatBubbleProps {
  isFromUser: boolean;
  timestamp: Date;
  children: React.ReactNode;
  className?: string;
}

const ChatBubble = ({ isFromUser, timestamp, children, className }: ChatBubbleProps) => {
  return (
    <div
      className={cn(
        'flex w-full mb-3',
        isFromUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 relative',
          isFromUser
            ? 'bg-chat-user text-chat-user-foreground rounded-br-md'
            : 'bg-chat-bot text-chat-bot-foreground rounded-bl-md',
          className
        )}
      >
        <div className="break-words">{children}</div>
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isFromUser ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isFromUser ? 'text-chat-user-foreground/70' : 'text-muted-foreground'
            )}
          >
            {format(timestamp, 'h:mm a')}
          </span>
          {isFromUser && (
            <CheckCheck className="w-3.5 h-3.5 text-chat-user-foreground/70" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
