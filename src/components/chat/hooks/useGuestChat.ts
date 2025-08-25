'use client';

import { useEffect, useState } from 'react';
import { getTranslation, type LanguageCode } from '@/utils/languages';
import { hasCookieConsent, setCookie, getCookie } from '@/lib/cookies';
import { supabase, NEXT_PUBLIC_TEST_HOTEL_ID } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'guest' | 'ai';
  timestamp: Date;
}

interface UseGuestChatArgs {
  guestData: {
    id: string;
    name: string;
    roomNumber: string;
    language: LanguageCode;
    hotelName: string;
  };
  onLanguageChange: (language: LanguageCode) => void;
}

export function useGuestChat({ guestData, onLanguageChange }: UseGuestChatArgs) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(guestData.language);

  // Initialize welcome message
  useEffect(() => {
    const welcome: ChatMessage = {
      id: '1',
      content:
        `${getTranslation(currentLanguage, 'greetNameRoom')
          .replace('{name}', guestData.name)
          .replace('{roomNumber}', guestData.roomNumber)} ` +
        getTranslation(currentLanguage, 'initialGreeting').replace('{hotelName}', guestData.hotelName),
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([welcome]);
  }, [currentLanguage, guestData.hotelName, guestData.name, guestData.roomNumber]);

  const handleLanguageChange = (newLanguage: string) => {
    const langCode = newLanguage as LanguageCode;
    setCurrentLanguage(langCode);
    onLanguageChange(langCode);

    if (hasCookieConsent()) {
      try {
        const cookie = getCookie('guest_info');
        if (cookie) {
          const parsed = JSON.parse(cookie);
          parsed.language = langCode;
          setCookie('guest_info', JSON.stringify(parsed), 60 * 60);
        }
      } catch {}
    }

    const welcome: ChatMessage = {
      id: '1',
      content:
        `${getTranslation(langCode, 'greetNameRoom')
          .replace('{name}', guestData.name)
          .replace('{roomNumber}', guestData.roomNumber)} ` +
        getTranslation(langCode, 'initialGreeting').replace('{hotelName}', guestData.hotelName),
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([welcome]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'guest',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token ?? '';

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-handler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          message: userMessage.content,
          hotelId: NEXT_PUBLIC_TEST_HOTEL_ID,
          lastName: guestData.name,
          roomNumber: guestData.roomNumber,
          language: currentLanguage,
          sessionCode: getCookie('guest_session') || undefined,
          guestId: guestData.id || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edge Function returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const aiMessageText = data?.guestResponse || data?.message || 'Thanks! Our team will review your request.';
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiMessageText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was a problem sending your message. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    currentLanguage,
    handleLanguageChange,
    handleSendMessage,
  };
}


