'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'mr', label: 'म' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const current = useLocale();

  const switchTo = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchTo(code)}
          className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
            current === code
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          title={code === 'en' ? 'English' : code === 'hi' ? 'हिन्दी' : 'मराठी'}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
