'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { ChatMessage, type Message } from './ChatMessage';
import { useRef, useEffect } from 'react';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full p-2 sm:p-3" ref={scrollAreaRef}>
        <div className="space-y-2">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start gap-2">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="h-3 w-3 text-white" />
                </div>
              </div>
              <Card className="bg-white max-w-[70%]">
                <CardContent className="px-3 py-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
