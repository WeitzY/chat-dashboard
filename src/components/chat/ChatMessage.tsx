'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  sender: 'guest' | 'ai';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        message.sender === 'guest' ? "justify-end" : "justify-start"
      )}
    >
      {message.sender === 'ai' && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="h-3 w-3 text-white" />
          </div>
        </div>
      )}
      
      <Card className={cn(
        "max-w-[70%]",
        message.sender === 'guest' 
          ? "bg-blue-600 text-white" 
          : "bg-white"
      )}>
        <CardContent className="px-3 py-1.5">
          <p className="text-[14px] leading-tight">{message.content}</p>
          <p className={cn(
            "text-[10px] mt-0.5",
            message.sender === 'guest' 
              ? "text-blue-100" 
              : "text-gray-500"
          )}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </CardContent>
      </Card>

      {message.sender === 'guest' && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
