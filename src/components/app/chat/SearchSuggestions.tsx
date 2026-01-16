import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchSuggestionsProps {
  query: string;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const SearchSuggestions = ({ query, suggestions, onSuggestionClick }: SearchSuggestionsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-chat-bot rounded-2xl rounded-tl-md p-4 max-w-[90%]"
    >
      <div className="flex items-start gap-2 mb-3">
        <Search className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-foreground">
            Couldn't find "<span className="font-medium">{query}</span>".
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Did you mean:
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full gap-1.5 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SearchSuggestions;
