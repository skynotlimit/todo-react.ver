import { useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import type { TodoWithRels } from "@/components/todo/todo-row";
import { xpOf } from "@/lib/quest";

export function DailyProgress({ todos }: { todos: TodoWithRels[] }) {
  const t = useTranslations();
  const total = todos.length;
  const done = todos.filter((x) => x.completedAt).length;
  const totalXp = todos.reduce((acc, x) => acc + xpOf[x.priority], 0);
  const earnedXp = todos
    .filter((x) => x.completedAt)
    .reduce((acc, x) => acc + xpOf[x.priority], 0);

  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Trophy
            className="h-4 w-4"
            style={{ color: "rgb(var(--rarity-epic))" }}
          />
          <span className="text-sm font-semibold tracking-wide">
            {t("quest.dailyProgress")}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground tabular-nums">
          <span className="font-bold text-foreground">{done}</span> / {total}
          <span className="mx-2 opacity-50">·</span>
          <span className="font-bold text-foreground">{earnedXp}</span> /{" "}
          {totalXp} XP
        </div>
      </div>

      <div className="relative h-2.5 rounded-full overflow-hidden bg-muted">
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-500 rounded-full"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, rgb(var(--rarity-rare)), rgb(var(--rarity-epic)))",
          }}
        />
      </div>
    </div>
  );
}
