'use client';

import { type LanguageCode } from '@/utils/languages';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { ChatDisclaimer } from './chat/ChatDisclaimer';
import { useGuestChat } from './chat/hooks/useGuestChat';

interface ChatInterfaceProps {
  guestData: {
    id: string;
    name: string;
    roomNumber: string;
    language: LanguageCode;
    hotelName: string;
    hotelLanguages?: string[];
  };
  onLanguageChange: (language: LanguageCode) => void;
}

export function ChatInterface({ guestData, onLanguageChange }: ChatInterfaceProps) {
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    currentLanguage,
    handleLanguageChange,
    handleSendMessage,
  } = useGuestChat({ guestData, onLanguageChange });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 safe-area-bottom safe-area-top">
      <ChatHeader 
        guestData={guestData}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
      
      <ChatMessages 
        messages={messages}
        isLoading={isLoading}
      />

      <ChatInput
        inputValue={inputValue}
        isLoading={isLoading}
        currentLanguage={currentLanguage}
        onInputChange={setInputValue}
        onSendMessage={handleSendMessage}
        onKeyDown={handleKeyDown}
      />

      <ChatDisclaimer currentLanguage={currentLanguage} />
    </div>
  );
}