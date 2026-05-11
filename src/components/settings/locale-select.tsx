"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setLocale } from "@/app/actions/settings";
import { cn } from "@/lib/utils";

export function LocaleSelect({ current }: { current: "ko" | "en" }) {
  const [isPending, start] = useTransition();
  const router = useRouter();

  function change(locale: "ko" | "en") {
    start(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={current === "ko" ? "default" : "outline"}
        onClick={() => change("ko")}
        disabled={isPending}
        className={cn("flex-1")}
      >
        한국어
      </Button>
      <Button
        variant={current === "en" ? "default" : "outline"}
        onClick={() => change("en")}
        disabled={isPending}
        className={cn("flex-1")}
      >
        English
      </Button>
    </div>
  );
}
