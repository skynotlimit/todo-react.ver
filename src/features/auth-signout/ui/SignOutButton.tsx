"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui";
import { signOutAction } from "@/app/actions/settings";

export function SignOutButton() {
  const t = useTranslations();
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline">
        {t("auth.signOut")}
      </Button>
    </form>
  );
}
