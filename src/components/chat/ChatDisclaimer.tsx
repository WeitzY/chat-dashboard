'use client';

import { getTranslation, type LanguageCode } from '@/utils/languages';

interface ChatDisclaimerProps {
  currentLanguage: LanguageCode;
}

export function ChatDisclaimer({ currentLanguage }: ChatDisclaimerProps) {
  return (
    <div className="px-3 py-2 sm:px-4 sm:py-2 bg-white/80 backdrop-blur">
      <p className="text-[11px] sm:text-xs text-gray-600 text-center">
        {getTranslation(currentLanguage, 'aiDisclaimer')}
      </p>
    </div>
  );
}
