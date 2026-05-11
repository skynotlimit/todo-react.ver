import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getQuestStats } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { LocaleSelect } from "@/components/settings/locale-select";
import { PushToggle } from "@/components/settings/push-toggle";
import { SignOutButton } from "@/components/settings/sign-out-button";
import { QuestStatsCard } from "@/components/settings/quest-stats-card";

export default async function SettingsPage() {
  const session = await auth();
  const t = await getTranslations();
  const c = await cookies();
  const locale = (c.get("locale")?.value as "ko" | "en" | undefined) ?? "ko";

  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

  const stats = session?.user?.id
    ? await getQuestStats(session.user.id)
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("nav.settings")}
      </h1>

      {session?.user && (
        <Card>
          <CardContent className="flex items-center gap-3">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                className="h-10 w-10 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <div className="flex-1">
              <div className="font-medium">{session.user.name}</div>
              <div className="text-sm text-muted-foreground">
                {session.user.email}
              </div>
            </div>
            <SignOutButton />
          </CardContent>
        </Card>
      )}

      {stats && <QuestStatsCard stats={stats} />}

      <Card>
        <CardHeader>
          <CardTitle>{t("common.theme")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("common.language")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LocaleSelect current={locale} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("push.enable")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PushToggle vapidPublicKey={vapid} />
        </CardContent>
      </Card>
    </div>
  );
}
