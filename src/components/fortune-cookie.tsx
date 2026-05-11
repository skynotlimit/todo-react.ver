"use client";
import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getFortuneForToday, todayKey } from "@/lib/fortunes";

const STORAGE_PREFIX = "fortune-cookie-shown:";

export function FortuneCookie({ userId }: { userId: string }) {
  const t = useTranslations();
  const locale = useLocale();

  const [open, setOpen] = React.useState(false);
  const [cracked, setCracked] = React.useState(false);
  const [shaking, setShaking] = React.useState(false);
  const [fortune, setFortune] = React.useState<{
    text: string;
    author?: string;
  } | null>(null);

  // Show on first visit per local-day per user.
  React.useEffect(() => {
    const key = `${STORAGE_PREFIX}${userId}:${todayKey()}`;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(key)) return;
    setFortune(getFortuneForToday(locale, userId));
    // tiny delay so it feels like a "welcome" moment
    const t = setTimeout(() => setOpen(true), 350);
    return () => clearTimeout(t);
  }, [locale, userId]);

  function close() {
    const key = `${STORAGE_PREFIX}${userId}:${todayKey()}`;
    try {
      window.localStorage.setItem(key, "1");
    } catch {}
    setOpen(false);
    // reset state in case user reopens this session
    setTimeout(() => {
      setCracked(false);
      setShaking(false);
    }, 300);
  }

  function crack() {
    if (cracked) return;
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      setCracked(true);
    }, 450);
  }

  if (!open || !fortune) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("fortune.title")}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-card p-6 sm:p-8 shadow-2xl border border-border text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-4">
          {t("fortune.title")}
        </p>

        {!cracked ? (
          <>
            <button
              type="button"
              onClick={crack}
              aria-label={t("fortune.tap")}
              className="block mx-auto select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-full"
            >
              <span
                className={
                  "block text-7xl sm:text-8xl " +
                  (shaking ? "cookie-shake" : "cookie-wiggle")
                }
                aria-hidden
              >
                🥠
              </span>
            </button>
            <p className="mt-6 text-sm text-muted-foreground">
              {t("fortune.tap")}
            </p>
          </>
        ) : (
          <div className="fortune-rise space-y-5">
            <div className="text-5xl" aria-hidden>
              ✨
            </div>
            <blockquote className="text-base sm:text-lg font-semibold leading-relaxed">
              &ldquo;{fortune.text}&rdquo;
            </blockquote>
            {fortune.author && (
              <p className="text-xs text-muted-foreground">— {fortune.author}</p>
            )}
            <Button onClick={close} className="tap-44 w-full h-11 mt-2">
              {t("fortune.ok")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
