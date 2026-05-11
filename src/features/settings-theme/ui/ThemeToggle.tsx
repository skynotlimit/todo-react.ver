"use client";
import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/shared/ui";
import { useTheme } from "@/app/providers";
import { cn } from "@/shared/lib/utils";

export function ThemeToggle() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();

  const opts = [
    { v: "light" as const, label: t("common.themeLight"), icon: Sun },
    { v: "dark" as const, label: t("common.themeDark"), icon: Moon },
    { v: "system" as const, label: t("common.themeSystem"), icon: Monitor },
  ];

  return (
    <div className="flex gap-2">
      {opts.map((o) => (
        <Button
          key={o.v}
          variant={theme === o.v ? "default" : "outline"}
          onClick={() => setTheme(o.v)}
          className={cn("flex-1")}
        >
          <o.icon className="h-4 w-4" />
          {o.label}
        </Button>
      ))}
    </div>
  );
}
