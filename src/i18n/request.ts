import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED = ['en', 'hi', 'mr'];

const MODULE_NAMES = [
  'common',
  'nav',
  'dashboard',
  'forms',
  'toasts',
  'sales',
  'inventory',
  'quotationsAndDelivery',
  'categories',
  'products',
  'priceLists',
  'locations',
  'outletSwitcher',
  'billing',
] as const;

async function loadMessages(locale: string) {
  const modules = await Promise.all(
    MODULE_NAMES.map(async (mod) => {
      const data = (await import(`../messages/${locale}/${mod}.json`)).default;
      return [mod, data] as const;
    }),
  );

  const messages: Record<string, any> = {};
  for (const [mod, data] of modules) {
    messages[mod] = data;
  }
  return messages;
}

export default getRequestConfig(async () => {
  const raw = (await cookies()).get('NEXT_LOCALE')?.value ?? 'en';
  const locale = SUPPORTED.includes(raw) ? raw : 'en';

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
