"use client";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/shared/ui";
import { Badge } from "@/shared/ui";
import { Button } from "@/shared/ui";
import { cn, isoDate } from "@/shared/lib/utils";
import { skipRoutineLog, toggleRoutineLog } from "@/app/actions/routines";

type RoutineWithLogs = {
  id: string;
  title: string;
  timeOfDay: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: { id: string; name: string; color: string } | null;
  logs: { date: Date; completedAt: Date | null; skipped: boolean }[];
};

export function RoutineToday({ routines }: { routines: RoutineWithLogs[] }) {
  const t = useTranslations();
  const today = isoDate(new Date());
  const [isPending, start] = useTransition();

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {routines.map((r) => {
        const log = r.logs[0];
        const completed = !!log?.completedAt;
        const skipped = !!log?.skipped;
        return (
          <div
            key={r.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0",
              isPending && "opacity-60",
            )}
          >
            <Checkbox
              checked={completed}
              disabled={skipped}
              onCheckedChange={(next) =>
                start(() => toggleRoutineLog(r.id, today, next))
              }
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-sm",
                    (completed || skipped) && "completed-strike",
                  )}
                >
                  {r.title}
                </span>
                {r.timeOfDay && (
                  <span className="text-xs text-muted-foreground">
                    {r.timeOfDay}
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {r.category && (
                  <Badge
                    className="border"
                    style={{
                      color: r.category.color,
                      borderColor: r.category.color + "55",
                      backgroundColor: r.category.color + "10",
                    }}
                  >
                    {r.category.name}
                  </Badge>
                )}
                {skipped && <Badge>{t("routine.skip")}</Badge>}
              </div>
            </div>
            {!completed && !skipped && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => start(() => skipRoutineLog(r.id, today))}
              >
                {t("routine.skip")}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
