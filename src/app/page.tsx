'use client';

import { useState, useEffect } from 'react';
import { SignupForm } from '@/components/SignupForm';
import { ChatInterface } from '@/components/ChatInterface';
import { type LanguageCode } from '@/utils/languages';
import { getCookie } from '@/lib/cookies';
import { supabase } from '@/lib/supabase';

interface GuestData {
  id: string;
  name: string;
  roomNumber: string;
  language: LanguageCode;
  hotelName: string;
  hotelLanguages?: string[];
}

export default function Home() {
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch by only loading after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load guest from cookie or fallback to db if session exists
  useEffect(() => {
    if (!mounted) return;
    
    const load = async () => {
      const cookie = getCookie('guest_info');
      if (cookie) {
        try {
          const parsed = JSON.parse(cookie);
          setGuestData(parsed);
          return;
        } catch {}
      }
      // If there is no cookie, expire any existing Supabase session so the user isn't auto-restored
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        await supabase.auth.signOut();
      }
    };
    load();
  }, [mounted]);

  const handleSignupComplete = (data: GuestData) => {
    setGuestData(data);
  };

  const handleLanguageChange = (language: LanguageCode) => {
    if (guestData) {
      setGuestData({ ...guestData, language });
    }
  };

  // Show loading until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Chat Interface (always rendered, blurred when signup form is shown) */}
      <div className={guestData ? '' : 'blur-sm pointer-events-none'}>
        <ChatInterface 
          guestData={guestData || {
            id: '',
            name: 'Guest',
            roomNumber: '000',
            language: 'en',
            hotelName: 'Hotel',
            hotelLanguages: ['en']
          }} 
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* Signup Form Overlay */}
      {!guestData && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <SignupForm onSignupComplete={handleSignupComplete} />
        </div>
      )}
    </div>
  );
}