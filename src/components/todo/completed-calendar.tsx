"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TodoRow, type TodoWithRels } from "@/components/todo/todo-row";
import { cn } from "@/lib/utils";
import { isoDate, weekdayIndex } from "@/lib/utils";

type CategoryLite = { id: string; name: string; color: string };

export function CompletedCalendar({
  todos,
  categories,
  year,
  month,
}: {
  todos: TodoWithRels[];
  categories: CategoryLite[];
  year: number;
  month: number; // 1-12
}) {
  const t = useTranslations();
  const router = useRouter();
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  // Switching months should clear the selection so the right panel doesn't
  // dangle a date that belongs to a different month.
  React.useEffect(() => {
    setSelectedKey(null);
  }, [year, month]);

  // Group completed todos by local-date key (YYYY-MM-DD).
  const byDay = React.useMemo(() => {
    const map = new Map<string, TodoWithRels[]>();
    for (const todo of todos) {
      if (!todo.completedAt) continue;
      const key = isoDate(new Date(todo.completedAt));
      const list = map.get(key);
      if (list) list.push(todo);
      else map.set(key, [todo]);
    }
    return map;
  }, [todos]);

  const cells = React.useMemo(() => buildMonthCells(year, month), [year, month]);

  const selectedTodos = selectedKey ? byDay.get(selectedKey) ?? [] : [];

  function navMonth(delta: number) {
    const target = new Date(year, month - 1 + delta, 1);
    router.push(
      `/completed?month=${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`,
    );
  }

  function navToday() {
    const now = new Date();
    router.push(
      `/completed?month=${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    );
  }

  const weekdayLabels = [0, 1, 2, 3, 4, 5, 6].map((i) =>
    t(`routine.weekday.${i}`),
  );

  const monthLabel = t("completed.monthLabel", { year, month });
  const todayKey = isoDate(new Date());

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="space-y-3">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("completed.prevMonth")}
              onClick={() => navMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="subtle" size="sm" onClick={navToday}>
              {t("common.today")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("completed.nextMonth")}
              onClick={() => navMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
          {weekdayLabels.map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const key = isoDate(cell.date);
            const items = byDay.get(key);
            const count = items?.length ?? 0;
            const isSelected = key === selectedKey;
            const isToday = key === todayKey;
            const clickable = count > 0;

            return (
              <button
                key={key}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && setSelectedKey(key)}
                aria-pressed={isSelected}
                className={cn(
                  "relative aspect-square rounded-md border text-xs flex flex-col items-center justify-start p-1.5 transition-colors",
                  cell.inMonth
                    ? "bg-card border-border"
                    : "bg-muted/20 border-transparent text-muted-foreground/50",
                  clickable && "hover:bg-accent cursor-pointer",
                  !clickable && "cursor-default",
                  isSelected && "ring-2 ring-ring border-ring",
                  isToday && !isSelected && "border-primary/60",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    isToday && "text-primary font-bold",
                  )}
                >
                  {cell.date.getDate()}
                </span>
                {count > 0 && (
                  <span className="mt-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Detail panel */}
      <aside className="space-y-3">
        {selectedKey ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {formatPanelHeader(selectedKey, t)}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.close")}
                onClick={() => setSelectedKey(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {selectedTodos.map((todo) => (
                <TodoRow key={todo.id} todo={todo} categories={categories} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-10 text-center text-xs text-muted-foreground">
            {t("completed.selectDate")}
          </div>
        )}
      </aside>
    </div>
  );
}

// Build 6 × 7 = 42 cells starting from the Monday on/before the 1st.
function buildMonthCells(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const offset = weekdayIndex(first); // Mon=0 ... Sun=6
  const start = new Date(first);
  start.setDate(first.getDate() - offset);

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month - 1 });
  }
  return cells;
}

function formatPanelHeader(
  isoKey: string,
  t: ReturnType<typeof useTranslations>,
) {
  const [y, m, d] = isoKey.split("-").map(Number);
  const dateObj = new Date(y, (m ?? 1) - 1, d ?? 1);
  const weekdayKey = `routine.weekday.${weekdayIndex(dateObj)}` as const;
  return t("completed.panelHeader", {
    year: y,
    month: m,
    day: d,
    weekday: t(weekdayKey),
  });
}
