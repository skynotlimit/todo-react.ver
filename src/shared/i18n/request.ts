import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const SUPPORTED = ["ko", "en"] as const;
type Locale = (typeof SUPPORTED)[number];
const DEFAULT_LOCALE: Locale = "ko";

function pickLocale(value: string | undefined | null): Locale {
  if (!value) return DEFAULT_LOCALE;
  const lower = value.toLowerCase();
  for (const l of SUPPORTED) if (lower.startsWith(l)) return l;
  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLocale = cookieStore.get("locale")?.value;
  const acceptLanguage = headerStore.get("accept-language") ?? "";

  const locale = cookieLocale
    ? pickLocale(cookieLocale)
    : pickLocale(acceptLanguage.split(",")[0]);

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
