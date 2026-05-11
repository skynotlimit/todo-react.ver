"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { fromIsoDate } from "@/lib/utils";

const FreqSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);
const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

const CreateSchema = z.object({
  title: z.string().min(1).max(300),
  notes: z.string().max(2000).optional().nullable(),
  priority: PrioritySchema.optional(),
  freq: FreqSchema,
  byWeekday: z.number().int().min(0).max(127).optional(),
  byMonthDay: z.number().int().min(1).max(31).optional().nullable(),
  timeOfDay: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable(),
  remindBefore: z.number().int().min(0).max(1440).optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  categoryId: z.string().optional().nullable(),
});

export async function createRoutine(input: z.infer<typeof CreateSchema>) {
  const userId = await requireUserId();
  const data = CreateSchema.parse(input);
  await db.routine.create({
    data: {
      userId,
      title: data.title.trim(),
      notes: data.notes ?? null,
      priority: data.priority ?? "MEDIUM",
      freq: data.freq,
      byWeekday: data.byWeekday ?? 127,
      byMonthDay: data.byMonthDay ?? null,
      timeOfDay: data.timeOfDay ?? null,
      remindBefore: data.remindBefore ?? null,
      startDate: fromIsoDate(data.startDate),
      endDate: data.endDate ? fromIsoDate(data.endDate) : null,
      categoryId: data.categoryId || null,
    },
  });
  revalidateAll();
}

export async function updateRoutine(
  id: string,
  input: Partial<z.infer<typeof CreateSchema>> & { active?: boolean },
) {
  const userId = await requireUserId();
  const existing = await db.routine.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new Error("NOT_FOUND");

  await db.routine.update({
    where: { id },
    data: {
      title: input.title?.trim(),
      notes: input.notes ?? undefined,
      priority: input.priority,
      freq: input.freq,
      byWeekday: input.byWeekday,
      byMonthDay: input.byMonthDay ?? undefined,
      timeOfDay: input.timeOfDay ?? undefined,
      remindBefore: input.remindBefore ?? undefined,
      startDate: input.startDate ? fromIsoDate(input.startDate) : undefined,
      endDate: input.endDate ? fromIsoDate(input.endDate) : undefined,
      categoryId: input.categoryId === undefined ? undefined : input.categoryId || null,
      active: input.active,
    },
  });
  revalidateAll();
}

export async function deleteRoutine(id: string) {
  const userId = await requireUserId();
  const existing = await db.routine.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new Error("NOT_FOUND");
  await db.routine.delete({ where: { id } });
  revalidateAll();
}

export async function toggleRoutineLog(
  routineId: string,
  isoDate: string,
  completed: boolean,
) {
  const userId = await requireUserId();
  const r = await db.routine.findFirst({
    where: { id: routineId, userId },
    select: { id: true },
  });
  if (!r) throw new Error("NOT_FOUND");

  const date = fromIsoDate(isoDate);
  const existing = await db.routineLog.findUnique({
    where: { routineId_date: { routineId, date } },
  });
  if (existing) {
    await db.routineLog.update({
      where: { routineId_date: { routineId, date } },
      data: { completedAt: completed ? new Date() : null, skipped: false },
    });
  } else {
    await db.routineLog.create({
      data: {
        routineId,
        date,
        completedAt: completed ? new Date() : null,
      },
    });
  }
  revalidateAll();
}

export async function skipRoutineLog(routineId: string, isoDate: string) {
  const userId = await requireUserId();
  const r = await db.routine.findFirst({
    where: { id: routineId, userId },
    select: { id: true },
  });
  if (!r) throw new Error("NOT_FOUND");

  const date = fromIsoDate(isoDate);
  const existing = await db.routineLog.findUnique({
    where: { routineId_date: { routineId, date } },
  });
  if (existing) {
    await db.routineLog.update({
      where: { routineId_date: { routineId, date } },
      data: { skipped: true, completedAt: null },
    });
  } else {
    await db.routineLog.create({
      data: { routineId, date, skipped: true },
    });
  }
  revalidateAll();
}

function revalidateAll() {
  revalidatePath("/today");
  revalidatePath("/routines");
}
