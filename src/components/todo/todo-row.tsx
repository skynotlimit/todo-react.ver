"use client";
import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Pencil, Check, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TodoEditor } from "@/components/todo/todo-editor";
import { cn } from "@/lib/utils";
import { toggleTodo, deleteTodo } from "@/app/actions/todos";
import {
  rarityIcon,
  rarityLabel,
  rarityOf,
  rarityVars,
  xpOf,
} from "@/lib/quest";

export type TodoWithRels = {
  id: string;
  title: string;
  notes: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueAt: Date | null;
  remindAt: Date | null;
  completedAt: Date | null;
  categoryId: string | null;
  category: { id: string; name: string; color: string } | null;
  tags: { tag: { id: string; name: string } }[];
};

type CategoryLite = { id: string; name: string; color: string };

export function TodoRow({
  todo,
  categories,
}: {
  todo: TodoWithRels;
  categories: CategoryLite[];
}) {
  const t = useTranslations();
  const [isPending, start] = useTransition();
  const [editing, setEditing] = React.useState(false);
  const [burst, setBurst] = React.useState(false);
  const completed = !!todo.completedAt;
  const rarity = rarityOf[todo.priority];
  const xp = xpOf[todo.priority];

  if (editing) {
    return (
      <TodoEditor
        todo={todo}
        categories={categories}
        onClose={() => setEditing(false)}
      />
    );
  }

  function onComplete() {
    if (completed) {
      start(() => toggleTodo(todo.id, false));
      return;
    }
    setBurst(true);
    setTimeout(() => setBurst(false), 600);
    start(() => toggleTodo(todo.id, true));
  }

  return (
    <article
      style={rarityVars[rarity]}
      className={cn(
        "quest-card relative rounded-2xl border-2 p-1.5 flex flex-col",
        `is-${rarity}`,
        completed && "is-completed",
        burst && "quest-burst",
        isPending && "opacity-60",
      )}
    >
      {completed && <span className="completed-stamp">COMPLETED</span>}

      {/* ── Header strip: title (left) + XP "HP" (right) ───────────── */}
      <header
        className="flex items-start gap-2 px-2.5 pt-1.5 pb-2"
        style={{ color: "rgb(var(--rarity))" }}
      >
        <h3
          className={cn(
            "flex-1 min-w-0 text-sm sm:text-base font-extrabold leading-tight",
            "line-clamp-2 break-words",
            completed && "line-through opacity-70",
          )}
          title={todo.title}
        >
          {todo.title}
        </h3>
        <div
          className="shrink-0 inline-flex items-baseline gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums"
          style={{
            backgroundColor: "rgb(var(--rarity) / 0.15)",
          }}
          aria-label={`${xp} XP`}
        >
          <span className="text-xs sm:text-sm">{xp}</span>
          <span className="opacity-80">XP</span>
        </div>
      </header>

      {/* ── Art window ─────────────────────────────────────────────── */}
      <div
        className="quest-art rounded-md mx-1.5 aspect-[16/9] flex items-center justify-center"
        style={{
          borderTop: "2px solid rgb(var(--rarity) / 0.6)",
          borderBottom: "2px solid rgb(var(--rarity) / 0.6)",
        }}
      >
        <span
          className="relative z-[1] text-5xl sm:text-6xl drop-shadow-sm"
          aria-hidden
        >
          {rarityIcon[rarity]}
        </span>
        {todo.category && (
          <span
            className="absolute bottom-1 right-1.5 z-[1] rounded-full border px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur"
            style={{
              color: todo.category.color,
              borderColor: todo.category.color + "88",
              backgroundColor: todo.category.color + "22",
            }}
          >
            {todo.category.name}
          </span>
        )}
      </div>

      {/* ── Rarity stamp strip ────────────────────────────────────── */}
      <div
        className="mx-1.5 mt-1.5 flex items-center justify-between gap-1.5 px-2 py-1 rounded text-[10px] font-bold tracking-[0.2em]"
        style={{
          backgroundColor: "rgb(var(--rarity) / 0.12)",
          color: "rgb(var(--rarity))",
        }}
      >
        <span className="inline-flex items-center gap-1">
          <span aria-hidden>{rarityIcon[rarity]}</span>
          {rarityLabel[rarity]}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-normal opacity-90">
          {todo.dueAt && (
            <span className="inline-flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />
              {formatDue(todo.dueAt)}
            </span>
          )}
          {todo.remindAt && (
            <span className="inline-flex items-center gap-0.5">
              <Bell className="h-3 w-3" />
              {formatTime(todo.remindAt)}
            </span>
          )}
        </div>
      </div>

      {/* ── Notes / description box ───────────────────────────────── */}
      <div className="mx-1.5 mt-1.5 flex-1 rounded-md bg-card/70 px-2.5 py-2 min-h-[3.5rem]">
        {todo.notes ? (
          <p
            className={cn(
              "text-xs text-foreground/80 whitespace-pre-line break-words line-clamp-3",
              completed && "line-through opacity-70",
            )}
          >
            {todo.notes}
          </p>
        ) : (
          <p className="text-xs italic text-muted-foreground/70">
            {todo.tags.length > 0
              ? todo.tags.map((tt) => `#${tt.tag.name}`).join(" ")
              : t("quest.noNotes")}
          </p>
        )}
        {todo.notes && todo.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {todo.tags.map((tt) => (
              <span
                key={tt.tag.id}
                className="text-[10px] text-muted-foreground"
              >
                #{tt.tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Action button ─────────────────────────────────────────── */}
      <footer className="m-1.5 mt-2 flex items-center gap-1">
        <Button
          type="button"
          onClick={onComplete}
          disabled={isPending}
          className={cn(
            "tap-44 flex-1 h-11 rounded-lg font-bold text-xs whitespace-nowrap",
            completed
              ? "bg-muted text-muted-foreground hover:bg-muted"
              : "text-white shadow-md",
          )}
          style={
            completed
              ? undefined
              : {
                  backgroundColor: "rgb(var(--rarity))",
                  boxShadow: "0 4px 12px -4px rgb(var(--rarity) / 0.6)",
                }
          }
          aria-label={completed ? t("todo.uncomplete") : t("todo.complete")}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
          {completed ? t("quest.undo") : t("quest.complete")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("todo.edit")}
          onClick={() => setEditing(true)}
          className="tap-44 h-11 w-11"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("todo.delete")}
          onClick={() =>
            start(async () => {
              if (confirm(t("common.confirmDelete"))) await deleteTodo(todo.id);
            })
          }
          className="tap-44 h-11 w-11 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </footer>
    </article>
  );
}

function formatDue(date: Date) {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000,
  );
  const time =
    d.getHours() || d.getMinutes() ? ` ${formatTime(date)}` : "";
  if (diff === 0) return `오늘${time}`;
  if (diff === 1) return `내일${time}`;
  if (diff === -1) return `어제${time}`;
  return `${d.getMonth() + 1}/${d.getDate()}${time}`;
}

function formatTime(date: Date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}
