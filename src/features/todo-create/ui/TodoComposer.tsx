"use client";
import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, Sparkles, Clock } from "lucide-react";
import { Input } from "@/shared/ui";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { addDays, endOfLocalDay } from "@/shared/lib/utils";
import { createTodo } from "@/app/actions/todos";

type CategoryLite = { id: string; name: string; color: string };

type Priority = "LOW" | "MEDIUM" | "HIGH";
type DueOption = "none" | "today" | "tomorrow" | "custom";

const priorityChips: { value: Priority; labelKey: string; color: string }[] = [
  { value: "LOW",    labelKey: "priority.LOW",    color: "rgb(var(--rarity-common))" },
  { value: "MEDIUM", labelKey: "priority.MEDIUM", color: "rgb(var(--rarity-rare))" },
  { value: "HIGH",   labelKey: "priority.HIGH",   color: "rgb(var(--rarity-epic))" },
];

function toLocalDateTimeInput(d: Date) {
  const tzo = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzo).toISOString().slice(0, 16);
}

export function TodoComposer({
  categories,
  defaultDueIso,
}: {
  categories: CategoryLite[];
  /**
   * If provided, "today" chip is the initial selection. Otherwise "none".
   * The page passes this when defaulting to today (e.g. /today route).
   */
  defaultDueIso?: string | null;
}) {
  const t = useTranslations();
  const [title, setTitle] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>("MEDIUM");
  const [categoryId, setCategoryId] = React.useState("");
  const [dueOption, setDueOption] = React.useState<DueOption>(
    defaultDueIso ? "today" : "none",
  );
  const [customDue, setCustomDue] = React.useState(() =>
    toLocalDateTimeInput(endOfLocalDay()),
  );
  const [isPending, start] = useTransition();

  function resolveDueIso(): string | null {
    switch (dueOption) {
      case "none":
        return null;
      case "today":
        return endOfLocalDay().toISOString();
      case "tomorrow":
        return endOfLocalDay(addDays(new Date(), 1)).toISOString();
      case "custom":
        return customDue ? new Date(customDue).toISOString() : null;
    }
  }

  function add() {
    const value = title.trim();
    if (!value) return;
    const dueIso = resolveDueIso();
    start(async () => {
      await createTodo({
        title: value,
        priority,
        dueAt: dueIso,
        categoryId: categoryId || null,
      });
      setTitle("");
      // keep priority/category/due selections so user can rapid-fire add
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
      className="rounded-xl border border-border bg-card p-3 sm:p-4 space-y-3"
    >
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        {t("quest.newQuest")}
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("todo.newPlaceholder")}
        className="h-11 text-base"
        disabled={isPending}
      />

      {/* Priority + category row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {priorityChips.map((p) => {
            const active = priority === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  "tap-44 h-9 px-3 rounded-full border text-xs font-semibold transition",
                  active
                    ? "text-white border-transparent"
                    : "text-muted-foreground border-border hover:bg-accent",
                )}
                style={active ? { backgroundColor: p.color } : undefined}
                disabled={isPending}
              >
                {t(p.labelKey)}
              </button>
            );
          })}
        </div>

        {categories.length > 0 && (
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="tap-44 h-9 rounded-md border border-input bg-background px-2 text-sm"
            disabled={isPending}
          >
            <option value="">{t("category.none")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Due-time row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
          <Clock className="h-3.5 w-3.5" />
          {t("quest.due")}
        </span>
        <DueChip
          active={dueOption === "none"}
          onClick={() => setDueOption("none")}
        >
          {t("quest.dueNone")}
        </DueChip>
        <DueChip
          active={dueOption === "today"}
          onClick={() => setDueOption("today")}
        >
          {t("quest.dueToday")}
        </DueChip>
        <DueChip
          active={dueOption === "tomorrow"}
          onClick={() => setDueOption("tomorrow")}
        >
          {t("quest.dueTomorrow")}
        </DueChip>
        <DueChip
          active={dueOption === "custom"}
          onClick={() => setDueOption("custom")}
        >
          {t("quest.dueCustom")}
        </DueChip>
        {dueOption === "custom" && (
          <input
            type="datetime-local"
            value={customDue}
            onChange={(e) => setCustomDue(e.target.value)}
            className="tap-44 h-9 rounded-md border border-input bg-background px-2 text-xs"
            disabled={isPending}
          />
        )}
      </div>

      {/* Submit */}
      <div className="flex">
        <Button
          type="submit"
          disabled={!title.trim() || isPending}
          className="tap-44 ml-auto h-11 px-5"
        >
          <Plus className="h-4 w-4" />
          {t("quest.accept")}
        </Button>
      </div>
    </form>
  );
}

function DueChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap-44 h-9 px-3 rounded-full border text-xs font-semibold transition",
        active
          ? "bg-foreground text-background border-transparent"
          : "text-muted-foreground border-border hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}
