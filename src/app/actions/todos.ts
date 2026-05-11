"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";

const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

const CreateSchema = z.object({
  title: z.string().min(1).max(300),
  notes: z.string().max(5000).optional().nullable(),
  priority: PrioritySchema.optional(),
  dueAt: z.string().datetime().optional().nullable(),
  remindAt: z.string().datetime().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string().min(1).max(30)).optional(),
});

export async function createTodo(input: z.infer<typeof CreateSchema>) {
  const userId = await requireUserId();
  const data = CreateSchema.parse(input);

  const tagIds = await ensureTagIds(userId, data.tags ?? []);

  const todo = await db.todo.create({
    data: {
      userId,
      title: data.title.trim(),
      notes: data.notes ?? null,
      priority: data.priority ?? "MEDIUM",
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      remindAt: data.remindAt ? new Date(data.remindAt) : null,
      categoryId: data.categoryId || null,
      tags: tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  });
  revalidateAll();
  return todo;
}

const UpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(300).optional(),
  notes: z.string().max(5000).optional().nullable(),
  priority: PrioritySchema.optional(),
  dueAt: z.string().datetime().optional().nullable(),
  remindAt: z.string().datetime().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string().min(1).max(30)).optional(),
});

export async function updateTodo(input: z.infer<typeof UpdateSchema>) {
  const userId = await requireUserId();
  const data = UpdateSchema.parse(input);

  const existing = await db.todo.findFirst({
    where: { id: data.id, userId },
    select: { id: true },
  });
  if (!existing) throw new Error("NOT_FOUND");

  await db.todo.update({
    where: { id: data.id },
    data: {
      title: data.title?.trim(),
      notes: data.notes,
      priority: data.priority,
      dueAt: data.dueAt === undefined ? undefined : data.dueAt ? new Date(data.dueAt) : null,
      remindAt: data.remindAt === undefined ? undefined : data.remindAt ? new Date(data.remindAt) : null,
      categoryId: data.categoryId === undefined ? undefined : data.categoryId || null,
    },
  });

  if (data.tags) {
    const tagIds = await ensureTagIds(userId, data.tags);
    await db.todoTag.deleteMany({ where: { todoId: data.id } });
    if (tagIds.length) {
      await db.todoTag.createMany({
        data: tagIds.map((tagId) => ({ todoId: data.id, tagId })),
      });
    }
  }
  revalidateAll();
}

export async function toggleTodo(id: string, completed: boolean) {
  const userId = await requireUserId();
  const existing = await db.todo.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new Error("NOT_FOUND");

  await db.todo.update({
    where: { id },
    data: { completedAt: completed ? new Date() : null },
  });
  revalidateAll();
}

export async function deleteTodo(id: string) {
  const userId = await requireUserId();
  const existing = await db.todo.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new Error("NOT_FOUND");
  await db.todo.delete({ where: { id } });
  revalidateAll();
}

async function ensureTagIds(userId: string, names: string[]): Promise<string[]> {
  if (!names.length) return [];
  const cleaned = Array.from(
    new Set(names.map((n) => n.trim()).filter((n) => n.length > 0)),
  );
  if (!cleaned.length) return [];

  const existing = await db.tag.findMany({
    where: { userId, name: { in: cleaned } },
    select: { id: true, name: true },
  });
  const existingNames = new Set(existing.map((t) => t.name));
  const toCreate = cleaned.filter((n) => !existingNames.has(n));
  if (toCreate.length) {
    await db.tag.createMany({
      data: toCreate.map((name) => ({ userId, name })),
      skipDuplicates: true,
    });
  }
  const all = await db.tag.findMany({
    where: { userId, name: { in: cleaned } },
    select: { id: true },
  });
  return all.map((t) => t.id);
}

function revalidateAll() {
  revalidatePath("/today");
  revalidatePath("/upcoming");
  revalidatePath("/all");
  revalidatePath("/completed");
}
