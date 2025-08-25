'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase, NEXT_PUBLIC_TEST_HOTEL_ID } from '@/lib/supabase';
import { toast } from 'sonner';
import { hasCookieConsent, setCookie } from '@/lib/cookies';
import { type LanguageCode } from '@/utils/languages';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  roomNumber: z.string().min(1, 'Room number is required'),
  language: z.string().min(2, 'Please select a language'),
});

export type SignupFormData = z.infer<typeof signupSchema>;

export function useSignupForm(onSignupComplete: (guestData: {
  id: string;
  name: string;
  roomNumber: string;
  language: LanguageCode;
  hotelName: string;
  hotelLanguages: string[];
}) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [hotelData, setHotelData] = useState<{ name: string; languages: string[]; default_language: string } | null>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', roomNumber: '', language: '' },
  });

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const { data, error } = await supabase
          .from('hotels')
          .select('name, languages, default_language')
          .eq('id', NEXT_PUBLIC_TEST_HOTEL_ID)
          .single();
        if (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching hotel data:', error);
          }
          toast.error('Failed to load hotel information');
          return;
        }
        if (data) {
          setHotelData({ name: data.name, languages: data.languages, default_language: data.default_language });
          form.setValue('language', data.default_language);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error:', error);
        }
        toast.error('Failed to load hotel information');
      }
    };
    fetchHotelData();
  }, [form]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw new Error(`Authentication failed: ${authError.message}`);
      if (!authData.user) throw new Error('Failed to create user session');

      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .insert({
          user_id: authData.user.id,
          hotel_id: NEXT_PUBLIC_TEST_HOTEL_ID,
          last_name: data.name,
          room_number: data.roomNumber,
          language: data.language,
        })
        .select()
        .single();
      if (guestError) throw new Error(`Failed to create guest record: ${guestError.message}`);

      toast.success('Welcome! Setting up your chat experience...');

      if (hasCookieConsent()) {
        const payload = {
          id: guestData.id,
          name: data.name,
          roomNumber: data.roomNumber,
          language: data.language,
          hotelName: hotelData?.name || 'Our Hotel',
          hotelLanguages: hotelData?.languages || [],
        };
        setCookie('guest_info', JSON.stringify(payload), 60 * 60);
      }

      onSignupComplete({
        id: guestData.id,
        name: data.name,
        roomNumber: data.roomNumber,
        language: data.language as LanguageCode,
        hotelName: hotelData?.name || 'Our Hotel',
        hotelLanguages: hotelData?.languages || [],
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Signup error:', error);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to complete signup');
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, hotelData, onSubmit };
}


