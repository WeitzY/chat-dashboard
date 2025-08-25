'use client';

import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTranslation, type LanguageCode } from '@/utils/languages';
import { Control, FieldPath } from 'react-hook-form';

type SignupShape = { name: string; roomNumber: string; language: string };

interface LanguageSelectorProps {
  control: Control<SignupShape>;
  name: FieldPath<SignupShape>;
  currentLanguage: LanguageCode;
  availableLanguages: Array<{ code: string; name: string; flag: string }>;
  onValueChange: (value: string) => void;
  value: string;
}

export function LanguageSelector({ 
  currentLanguage, 
  availableLanguages, 
  onValueChange, 
  value 
}: LanguageSelectorProps) {
  return (
    <FormItem>
      <FormLabel>
        {currentLanguage ? getTranslation(currentLanguage, 'language') : 'Language'}
      </FormLabel>
      <Select onValueChange={onValueChange} value={value}>
        <FormControl>
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Select your language" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {availableLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <span className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
