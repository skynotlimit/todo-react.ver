import { getTranslations } from "next-intl/server";
import { Sparkles, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import {
  rarityIcon,
  rarityLabel,
  rarityOf,
  rarityVars,
  type Priority,
} from "@/shared/lib/quest";
import type { QuestStats } from "@/lib/queries";

export async function QuestStatsCard({ stats }: { stats: QuestStats }) {
  const t = await getTranslations();
  const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stats.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Stat
            icon={<Trophy className="h-4 w-4" />}
            label={t("stats.totalQuests")}
            value={stats.totalQuests.toLocaleString()}
          />
          <Stat
            icon={<Sparkles className="h-4 w-4" />}
            label={t("stats.totalXp")}
            value={stats.totalXp.toLocaleString()}
            unit="XP"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {priorities.map((p) => {
            const rarity = rarityOf[p];
            const count = stats.byPriority[p];
            return (
              <div
                key={p}
                style={rarityVars[rarity]}
                className="rounded-lg border-2 px-2.5 py-2 flex items-center gap-2"
              >
                <span
                  aria-hidden
                  className="text-lg"
                  style={{ color: "rgb(var(--rarity))" }}
                >
                  {rarityIcon[rarity]}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[10px] font-bold tracking-[0.15em] truncate"
                    style={{ color: "rgb(var(--rarity))" }}
                  >
                    {rarityLabel[rarity]}
                  </div>
                  <div className="text-base font-bold tabular-nums leading-tight">
                    {count.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 px-3 py-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums flex items-baseline gap-1">
        {value}
        {unit && (
          <span className="text-xs font-semibold text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
