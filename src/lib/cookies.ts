'use client';

export function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax${secure}`;
}

export function getCookie(name: string): string | null {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    const [k, v] = cookie.split('=');
    if (decodeURIComponent(k) === name) {
      return decodeURIComponent(v || '');
    }
  }
  return null;
}

export function deleteCookie(name: string) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; samesite=lax${secure}`;
}

export function hasCookieConsent(): boolean {
  return getCookie('cookie_consent') === '1';
}


