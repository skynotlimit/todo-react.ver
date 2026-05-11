"use client";
import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui";
import { Input } from "@/shared/ui";
import { Textarea } from "@/shared/ui";
import { Select } from "@/shared/ui";
import { updateTodo } from "@/app/actions/todos";
import type { TodoWithRels } from "@/entities/todo";

type CategoryLite = { id: string; name: string; color: string };

export function TodoEditor({
  todo,
  categories,
  onClose,
}: {
  todo: TodoWithRels;
  categories: CategoryLite[];
  onClose: () => void;
}) {
  const t = useTranslations();
  const [isPending, start] = useTransition();
  const [title, setTitle] = React.useState(todo.title);
  const [notes, setNotes] = React.useState(todo.notes ?? "");
  const [priority, setPriority] =
    React.useState<TodoWithRels["priority"]>(todo.priority);
  const [dueLocal, setDueLocal] = React.useState(
    todo.dueAt ? toLocalInput(todo.dueAt) : "",
  );
  const [categoryId, setCategoryId] = React.useState(todo.categoryId ?? "");
  const [tags, setTags] = React.useState(
    todo.tags.map((tt) => tt.tag.name).join(", "),
  );

  function save() {
    start(async () => {
      await updateTodo({
        id: todo.id,
        title,
        notes: notes || null,
        priority,
        dueAt: dueLocal ? new Date(dueLocal).toISOString() : null,
        categoryId: categoryId || null,
        tags: tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      onClose();
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("todo.notes")}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">{t("todo.priority")}</span>
          <Select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as TodoWithRels["priority"])
            }
          >
            <option value="LOW">{t("priority.LOW")}</option>
            <option value="MEDIUM">{t("priority.MEDIUM")}</option>
            <option value="HIGH">{t("priority.HIGH")}</option>
          </Select>
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">{t("todo.due")}</span>
          <Input
            type="datetime-local"
            value={dueLocal}
            onChange={(e) => setDueLocal(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">{t("todo.category")}</span>
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
        <label className="space-y-1 text-xs col-span-2 sm:col-span-3">
          <span className="text-muted-foreground">{t("todo.tags")}</span>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2"
          />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={isPending}>
          {t("todo.cancel")}
        </Button>
        <Button onClick={save} disabled={isPending || !title.trim()}>
          {isPending ? t("common.saving") : t("todo.save")}
        </Button>
      </div>
    </div>
  );
}

function toLocalInput(d: Date) {
  const date = new Date(d);
  const tzo = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzo).toISOString().slice(0, 16);
}
