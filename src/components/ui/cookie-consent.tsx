'use client';

import { useEffect, useState } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { setCookie, getCookie } from '@/lib/cookies';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const consent = getCookie('cookie_consent');
    if (!consent) setVisible(true);
  }, [mounted]);

  if (!mounted || !visible) return null;

  const accept = () => {
    setCookie('cookie_consent', '1', 60 * 60 * 24 * 365); // 1 year
    setVisible(false);
  };

  const decline = () => {
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <Card className="bg-white/90 backdrop-blur border shadow-lg">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-gray-700 flex-1">
              We use cookies to remember your language and session for a better experience.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" className="cursor-pointer" onClick={decline}>Decline</Button>
              <Button className="cursor-pointer" onClick={accept}>Allow</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CookieConsent;


