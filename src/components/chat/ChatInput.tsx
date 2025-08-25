'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { getTranslation, type LanguageCode } from '@/utils/languages';

interface ChatInputProps {
  inputValue: string;
  isLoading: boolean;
  currentLanguage: LanguageCode;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function ChatInput({ 
  inputValue, 
  isLoading, 
  currentLanguage, 
  onInputChange, 
  onSendMessage, 
  onKeyDown 
}: ChatInputProps) {
  return (
    <div className="p-2 sm:p-3 bg-white/80 backdrop-blur border-t">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={getTranslation(currentLanguage, 'typeMessage')}
            disabled={isLoading}
            className="resize-none text-base mobile-input"
          />
        </div>
        <Button 
          onClick={onSendMessage}
          disabled={!inputValue.trim() || isLoading}
          size="icon"
          className="cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
