'use client';

import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getTranslation, type LanguageCode } from '@/utils/languages';

interface TextFieldController {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
}

interface FormFieldProps {
  label: string;
  placeholder: string;
  field: TextFieldController;
  currentLanguage?: LanguageCode;
}

export function FormFieldComponent({ label, placeholder, field, currentLanguage }: FormFieldProps) {
  return (
    <FormItem>
      <FormLabel>
        {currentLanguage ? getTranslation(currentLanguage, label as keyof typeof import('@/utils/languages').translations['en']) : label}
      </FormLabel>
      <FormControl>
        <Input
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          name={field.name}
          placeholder={placeholder}
          className="text-base mobile-input"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
