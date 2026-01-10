import { useState, useRef } from 'react';
import { Send, Camera, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendImage?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput = ({
  onSendMessage,
  onSendImage,
  placeholder = 'Type your order...',
  disabled = false,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendImage) {
      onSendImage(file);
    }
    e.target.value = '';
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-3 bg-card border-t border-border"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 text-muted-foreground"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        <Camera className="w-5 h-5" />
      </Button>

      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full resize-none rounded-2xl border border-input bg-background',
            'px-4 py-2.5 text-sm leading-relaxed',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'max-h-32 overflow-y-auto'
          )}
          style={{
            height: 'auto',
            minHeight: '42px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />
      </div>

      {message.trim() ? (
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          disabled={disabled}
        >
          <Send className="w-5 h-5" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 text-muted-foreground"
          disabled={disabled}
        >
          <Mic className="w-5 h-5" />
        </Button>
      )}
    </form>
  );
};

export default ChatInput;
