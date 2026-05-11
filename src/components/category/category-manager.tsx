"use client";
import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/actions/categories";

type Category = {
  id: string;
  name: string;
  color: string;
};

const PALETTE = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

export function CategoryManager({ categories }: { categories: Category[] }) {
  const t = useTranslations();
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState(PALETTE[0]);
  const [isPending, start] = useTransition();

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          start(async () => {
            await createCategory({ name, color });
            setName("");
          });
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("category.new")}
          className="flex-1 min-w-40"
        />
        <div className="flex items-center gap-1">
          {PALETTE.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-6 w-6 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? c : "transparent",
                outline: color === c ? "1px solid currentColor" : "none",
              }}
              aria-label={c}
            />
          ))}
        </div>
        <Button type="submit" disabled={!name.trim() || isPending}>
          <Plus className="h-4 w-4" />
          {t("todo.addButton")}
        </Button>
      </form>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {categories.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            —
          </div>
        ) : (
          categories.map((c) => (
            <CategoryRow
              key={c.id}
              category={c}
              isPending={isPending}
              start={start}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  isPending,
  start,
}: {
  category: Category;
  isPending: boolean;
  start: React.TransitionStartFunction;
}) {
  const t = useTranslations();
  const [name, setName] = React.useState(category.name);
  const [color, setColor] = React.useState(category.color);
  const dirty = name !== category.name || color !== category.color;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border last:border-0">
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-7 w-7 rounded cursor-pointer bg-transparent border border-border"
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      {dirty && (
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            start(async () => {
              await updateCategory({ id: category.id, name, color });
            })
          }
          disabled={isPending}
        >
          {t("todo.save")}
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        onClick={() =>
          start(async () => {
            if (confirm(t("common.confirmDelete"))) {
              await deleteCategory(category.id);
            }
          })
        }
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
