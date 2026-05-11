"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calendar,
  CalendarClock,
  Inbox,
  Repeat,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function MobileBottomNav() {
  const t = useTranslations();
  const pathname = usePathname();

  const links = [
    { href: "/today", label: t("nav.today"), icon: Calendar },
    { href: "/upcoming", label: t("nav.upcoming"), icon: CalendarClock },
    { href: "/all", label: t("nav.all"), icon: Inbox },
    { href: "/routines", label: t("nav.routines"), icon: Repeat },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "tap-44 flex flex-col items-center justify-center gap-0.5 h-16 text-[10px] font-medium",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "scale-110 transition")}
                />
                <span>{l.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
