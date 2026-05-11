"use client";
import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Power } from "lucide-react";
import { Input } from "@/shared/ui";
import { Button } from "@/shared/ui";
import { Select } from "@/shared/ui";
import { Badge } from "@/shared/ui";
import { Card, CardContent } from "@/shared/ui";
import {
  createRoutine,
  deleteRoutine,
  updateRoutine,
} from "@/app/actions/routines";
import {
  RoutineFormSchema,
  type RoutineFormValues,
} from "@/shared/schemas/routine";
import { isoDate } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";

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
  startDate: string;
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
  const [isPending, start] = useTransition();

  // The form bag holds ALL freq-related fields at once (byWeekday, byMonthDay,
  // timeOfDay, endDate). zod's superRefine decides which are required for the
  // chosen freq, and the submit handler strips the irrelevant ones before
  // sending to the server action.
  const form = useForm<RoutineFormValues>({
    resolver: zodResolver(RoutineFormSchema),
    defaultValues: {
      title: "",
      freq: "DAILY",
      byWeekday: 127, // all weekdays
      byMonthDay: 1,
      timeOfDay: "",
      startDate: isoDate(new Date()),
      endDate: "",
      categoryId: "",
    },
  });

  // `watch` re-renders this component whenever `freq` changes — that's how we
  // get the conditional UI without setState/useEffect plumbing.
  const freq = form.watch("freq");
  const errors = form.formState.errors;

  function onSubmit(values: RoutineFormValues) {
    start(async () => {
      // Form bag → server action shape. Drop fields that don't apply to the
      // chosen freq; convert empty strings to null where the server expects.
      await createRoutine({
        title: values.title,
        freq: values.freq,
        byWeekday: values.freq === "WEEKLY" ? values.byWeekday : undefined,
        byMonthDay: values.freq === "MONTHLY" ? values.byMonthDay : null,
        timeOfDay: values.timeOfDay || null,
        startDate: values.startDate,
        endDate: values.endDate || null,
        categoryId: values.categoryId || null,
      });
      form.reset();
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)} className="w-full">
        <Plus className="h-4 w-4" /> {t("routine.new")}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3"
          noValidate
        >
          <div>
            <Input
              {...form.register("title")}
              placeholder={t("routine.new")}
              autoFocus
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">
                {t("routine.errors.title")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">{t("routine.freq")}</span>
              <Select {...form.register("freq")}>
                <option value="DAILY">{t("routine.freqDaily")}</option>
                <option value="WEEKLY">{t("routine.freqWeekly")}</option>
                <option value="MONTHLY">{t("routine.freqMonthly")}</option>
              </Select>
            </label>

            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">
                {t("routine.timeOfDay")}
              </span>
              <Input type="time" {...form.register("timeOfDay")} />
            </label>

            {categories.length > 0 && (
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">
                  {t("todo.category")}
                </span>
                <Select {...form.register("categoryId")}>
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

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">
                {t("routine.startDate")}
              </span>
              <Input
                type="date"
                {...form.register("startDate")}
                aria-invalid={!!errors.startDate}
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">
                {t("routine.endDate")}
              </span>
              <Input
                type="date"
                {...form.register("endDate")}
                aria-invalid={!!errors.endDate}
              />
            </label>
          </div>
          {errors.endDate && (
            <p className="text-xs text-destructive">
              {t("routine.errors.endBeforeStart")}
            </p>
          )}

          {/* Conditional fields driven by `watch("freq")`. */}
          {freq === "WEEKLY" && (
            <div>
              {/* Controller is RHF's escape hatch for inputs that can't be wired
                with plain `register` — here, our custom WeekdayPicker takes
                `value` + `onChange` rather than DOM events. */}
              <Controller
                control={form.control}
                name="byWeekday"
                render={({ field }) => (
                  <WeekdayPicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.byWeekday && (
                <p className="mt-1 text-xs text-destructive">
                  {t("routine.errors.weekdayAtLeastOne")}
                </p>
              )}
            </div>
          )}

          {freq === "MONTHLY" && (
            <label className="space-y-1 text-xs block">
              <span className="text-muted-foreground">
                {t("routine.monthDay", {
                  day: form.watch("byMonthDay") || 1,
                })}
              </span>
              {/* register() supports valueAsNumber for numeric inputs — without
                it the value comes back as a string and zod's `number()` fails. */}
              <Input
                type="number"
                min={1}
                max={31}
                {...form.register("byMonthDay", { valueAsNumber: true })}
                aria-invalid={!!errors.byMonthDay}
              />
            </label>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.reset();
                setOpen(false);
              }}
            >
              {t("todo.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending || form.formState.isSubmitting}
            >
              {t("todo.save")}
            </Button>
          </div>
        </form>
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
  categories: _categories,
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
