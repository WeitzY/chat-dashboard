'use client';

// form types imported by hook; no direct use here
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { AVAILABLE_LANGUAGES, getTranslation, type LanguageCode } from '@/utils/languages';
import { Loader2 } from 'lucide-react';
import { LanguageSelector } from './signup/LanguageSelector';
import { FormFieldComponent } from './signup/FormField';
import { useSignupForm } from './signup/useSignupForm';

interface SignupFormProps {
  onSignupComplete: (guestData: {
    id: string;
    name: string;
    roomNumber: string;
    language: LanguageCode;
    hotelName: string;
    hotelLanguages: string[];
  }) => void;
}

export function SignupForm({ onSignupComplete }: SignupFormProps) {
  const { form, isLoading, hotelData, onSubmit } = useSignupForm(onSignupComplete);

  const currentLanguage = form.watch('language') as LanguageCode;
  
  // Get available languages from hotel data, filtered by what we support
  const availableLanguages = hotelData?.languages
    ?.map(code => AVAILABLE_LANGUAGES.find(lang => lang.code === code))
    .filter((language): language is NonNullable<typeof language> => language !== undefined) || [];

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-2xl">
      <CardHeader className="text-center px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold leading-tight">
          {hotelData?.name ? `Welcome to ${hotelData.name}` : 'Welcome to our hotel'}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <LanguageSelector
                  control={form.control}
                  name="language"
                  currentLanguage={currentLanguage}
                  availableLanguages={availableLanguages}
                  onValueChange={field.onChange}
                  value={field.value}
                />
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormFieldComponent
                  label="name"
                  placeholder="Enter your name"
                  field={field}
                  currentLanguage={currentLanguage}
                />
              )}
            />

            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormFieldComponent
                  label="roomNumber"
                  placeholder="Enter your room number"
                  field={field}
                  currentLanguage={currentLanguage}
                />
              )}
            />

            <Button 
              type="submit"
              className="w-full h-12 text-base font-medium cursor-pointer" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                currentLanguage ? getTranslation(currentLanguage, 'startChat') : 'Start Chat'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}