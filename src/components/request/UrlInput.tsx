// src/components/request/UrlInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { Copy, Clock } from 'lucide-react';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  recentUrls: string[];
}

export const UrlInput: React.FC<UrlInputProps> = ({ value, onChange, onSend, recentUrls }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Generate suggestions based on input and history
  useEffect(() => {
    if (!value.trim() || !isFocused) {
      setSuggestions([]);
      return;
    }

    const matchingUrls = recentUrls.filter(url =>
      url.toLowerCase().includes(value.toLowerCase()) && url !== value
    ).slice(0, 5);

    setSuggestions(matchingUrls);
  }, [value, recentUrls, isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: "URL copied",
      description: "URL has been copied to clipboard",
    });
  };

  return (
    <div className="relative flex-1">
      <div className={`flex items-center border rounded-md transition-all ${isFocused ? 'border-primary ring-1 ring-primary/20' : 'border-input'}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full px-3 py-2 h-10 bg-background rounded-md focus:outline-none pr-20"
          placeholder="https://api.example.com/endpoint"
          spellCheck={false}
          autoComplete="off"
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={copyToClipboard}
            title="Copy URL"
          >
            <Copy size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setSuggestions(recentUrls.slice(0, 5))}
            title="Show History"
          >
            <Clock size={14} />
          </Button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto animate-in fade-in-50 zoom-in-95 slide-in-from-top-2">
          <div className="py-1">
            {suggestions.map((url, index) => (
              <button
                key={index}
                className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-accent truncate"
                onClick={() => {
                  onChange(url);
                  inputRef.current?.focus();
                }}
              >
                <Clock size={14} className="mr-2 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{url}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
