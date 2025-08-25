'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_LANGUAGES, type LanguageCode } from '@/utils/languages';

interface ChatHeaderProps {
  guestData: {
    name: string;
    roomNumber: string;
    hotelName: string;
    hotelLanguages?: string[];
  };
  currentLanguage: LanguageCode;
  onLanguageChange: (language: string) => void;
}

export function ChatHeader({ guestData, currentLanguage, onLanguageChange }: ChatHeaderProps) {
  const getAvailableLanguages = () => {
    if (guestData.hotelLanguages && guestData.hotelLanguages.length > 0) {
      return AVAILABLE_LANGUAGES.filter(l =>
        guestData.hotelLanguages?.includes(l.code)
      );
    }
    return AVAILABLE_LANGUAGES;
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-white/80 backdrop-blur border-b">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex flex-col">
          <h1 className="font-semibold text-gray-900 text-sm sm:text-base">
            Room {guestData.roomNumber} • {guestData.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">{guestData.hotelName}</p>
        </div>
      </div>
      
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-24 sm:w-40 cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {getAvailableLanguages().map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <span className="flex items-center gap-2">
                <span>{language.flag}</span>
                {/* Mobile: show abbreviation, Desktop: show full name */}
                <span className="sm:hidden uppercase">{language.code}</span>
                <span className="hidden sm:inline">{language.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
