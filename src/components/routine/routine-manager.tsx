"use client";
import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Power } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  createRoutine,
  deleteRoutine,
  updateRoutine,
} from "@/app/actions/routines";
import { isoDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Routine = {
  id: string;
  title: string;
  notes: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  freq: "DAILY" | "WEEKLY" | "MONTHLY";
  byWeekday: number;
  byMonthDay: number | null;
  timeOfDay: string | null;
  remindBefore: number | null;
  startDate: string; // ISO date
  endDate: string | null;
  active: boolean;
  categoryId: string | null;
  category: { id: string; name: string; color: string } | null;
};

type CategoryLite = { id: string; name: string; color: string };

const WEEKDAY_KEYS = ["0", "1", "2", "3", "4", "5", "6"] as const;

export function RoutineManager({
  routines,
  categories,
}: {
  routines: Routine[];
  categories: CategoryLite[];
}) {
  return (
    <div className="space-y-4">
      <NewRoutineForm categories={categories} />
      <div className="space-y-3">
        {routines.length === 0 && (
          <Card>
            <CardContent className="text-sm text-muted-foreground">
              —
            </CardContent>
          </Card>
        )}
        {routines.map((r) => (
          <RoutineCard key={r.id} routine={r} categories={categories} />
        ))}
      </div>
    </div>
  );
}

function NewRoutineForm({ categories }: { categories: CategoryLite[] }) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [freq, setFreq] = React.useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [byWeekday, setByWeekday] = React.useState<number>(127);
  const [byMonthDay, setByMonthDay] = React.useState<number>(1);
  const [timeOfDay, setTimeOfDay] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [isPending, start] = useTransition();

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)} className="w-full">
        <Plus className="h-4 w-4" /> {t("routine.new")}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("routine.new")}
          autoFocus
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">{t("routine.freq")}</span>
            <Select
              value={freq}
              onChange={(e) => setFreq(e.target.value as typeof freq)}
            >
              <option value="DAILY">{t("routine.freqDaily")}</option>
              <option value="WEEKLY">{t("routine.freqWeekly")}</option>
              <option value="MONTHLY">{t("routine.freqMonthly")}</option>
            </Select>
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">
              {t("routine.timeOfDay")}
            </span>
            <Input
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
            />
          </label>
          {categories.length > 0 && (
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">
                {t("todo.category")}
              </span>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">{t("category.none")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </label>
          )}
        </div>

        {freq === "WEEKLY" && (
          <WeekdayPicker value={byWeekday} onChange={setByWeekday} />
        )}
        {freq === "MONTHLY" && (
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">
              {t("routine.monthDay", { day: byMonthDay })}
            </span>
            <Input
              type="number"
              min={1}
              max={31}
              value={byMonthDay}
              onChange={(e) =>
                setByMonthDay(Math.max(1, Math.min(31, +e.target.value || 1)))
              }
            />
          </label>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("todo.cancel")}
          </Button>
          <Button
            disabled={!title.trim() || isPending}
            onClick={() =>
              start(async () => {
                await createRoutine({
                  title,
                  freq,
                  byWeekday: freq === "WEEKLY" ? byWeekday : undefined,
                  byMonthDay: freq === "MONTHLY" ? byMonthDay : null,
                  timeOfDay: timeOfDay || null,
                  startDate: isoDate(new Date()),
                  categoryId: categoryId || null,
                });
                setTitle("");
                setOpen(false);
              })
            }
          >
            {t("todo.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WeekdayPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap gap-1.5">
      {WEEKDAY_KEYS.map((k, idx) => {
        const on = ((value >> idx) & 1) === 1;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(value ^ (1 << idx))}
            className={cn(
              "h-9 w-9 rounded-full text-xs font-medium border transition-colors",
              on
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {t(`routine.weekday.${k}`)}
          </button>
        );
      })}
    </div>
  );
}

function RoutineCard({
  routine,
  categories,
}: {
  routine: Routine;
  categories: CategoryLite[];
}) {
  const t = useTranslations();
  const [isPending, start] = useTransition();

  const summary = (() => {
    if (routine.freq === "DAILY") return t("routine.freqDaily");
    if (routine.freq === "WEEKLY") {
      const days = WEEKDAY_KEYS.filter(
        (_, i) => ((routine.byWeekday >> i) & 1) === 1,
      ).map((k) => t(`routine.weekday.${k}`));
      return `${t("routine.freqWeekly")} · ${days.join(", ")}`;
    }
    return t("routine.monthDay", { day: routine.byMonthDay ?? 1 });
  })();

  return (
    <Card className={cn(!routine.active && "opacity-60")}>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-medium">{routine.title}</span>
              {routine.timeOfDay && (
                <span className="text-xs text-muted-foreground">
                  {routine.timeOfDay}
                </span>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap pt-1.5">
              <Badge>{summary}</Badge>
              {routine.category && (
                <Badge
                  className="border"
                  style={{
                    color: routine.category.color,
                    borderColor: routine.category.color + "55",
                    backgroundColor: routine.category.color + "10",
                  }}
                >
                  {routine.category.name}
                </Badge>
              )}
              <Badge>
                {routine.active ? t("routine.active") : t("routine.inactive")}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                start(() =>
                  updateRoutine(routine.id, { active: !routine.active }),
                )
              }
              disabled={isPending}
              aria-label="toggle active"
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                start(async () => {
                  if (confirm(t("common.confirmDelete"))) {
                    await deleteRoutine(routine.id);
                  }
                })
              }
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
