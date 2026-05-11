"use client";
import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/actions/categories";
import {
  CategoryFormSchema,
  type CategoryFormValues,
} from "@/schemas/category";

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
  const [isPending, start] = useTransition();

  // ── React Hook Form (RHF) basics ─────────────────────────────────────
  // useForm returns a "form instance". The methods we destructure:
  //   register      — wires a native input to the form (value + onChange)
  //   handleSubmit  — wraps your submit fn; runs validation first
  //   watch         — read current values (re-renders on change)
  //   setValue      — programmatically set a field's value
  //   reset         — clear or set the whole form back
  //   formState     — { errors, isSubmitting, isDirty, ... }
  // zodResolver bridges our zod schema to RHF: errors land in formState.errors.
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: { name: "", color: PALETTE[0] },
  });

  const color = form.watch("color");

  async function onSubmit(values: CategoryFormValues) {
    start(async () => {
      await createCategory(values);
      form.reset({ name: "", color: PALETTE[0] });
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-wrap items-center gap-2"
        noValidate
      >
        <div className="flex-1 min-w-40">
          <Input
            {...form.register("name")}
            placeholder={t("category.new")}
            aria-invalid={!!form.formState.errors.name}
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-xs text-destructive">
              {t("category.errors.name")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {PALETTE.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() =>
                form.setValue("color", c, { shouldValidate: true })
              }
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

        <Button
          type="submit"
          disabled={isPending || form.formState.isSubmitting}
        >
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

  // For the edit row, defaultValues come from the row's current category.
  // formState.isDirty tells us if the user changed *anything* — we use that
  // to show/hide the Save button (no manual `name !== category.name` checks).
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: { name: category.name, color: category.color },
  });

  async function onSubmit(values: CategoryFormValues) {
    start(async () => {
      await updateCategory({ id: category.id, ...values });
      // Reset *with the new values* so isDirty becomes false again until
      // the user edits something next time.
      form.reset(values);
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex items-center gap-2 px-3 py-2 border-b border-border last:border-0"
      noValidate
    >
      <input
        type="color"
        {...form.register("color")}
        className="h-7 w-7 rounded cursor-pointer bg-transparent border border-border"
      />
      <Input
        {...form.register("name")}
        aria-invalid={!!form.formState.errors.name}
        className="flex-1"
      />
      {form.formState.isDirty && (
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={isPending || form.formState.isSubmitting}
        >
          {t("todo.save")}
        </Button>
      )}
      <Button
        type="button"
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
    </form>
  );
}
