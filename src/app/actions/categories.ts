"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";

const HEX = /^#[0-9a-fA-F]{6}$/;

const CreateSchema = z.object({
  name: z.string().min(1).max(40),
  color: z.string().regex(HEX).default("#6b7280"),
});

export async function createCategory(input: z.infer<typeof CreateSchema>) {
  const userId = await requireUserId();
  const data = CreateSchema.parse(input);
  await db.category.create({
    data: { userId, name: data.name.trim(), color: data.color },
  });
  revalidatePath("/categories");
  revalidatePath("/today");
}

export async function updateCategory(input: {
  id: string;
  name: string;
  color: string;
}) {
  const userId = await requireUserId();
  const cat = await db.category.findFirst({
    where: { id: input.id, userId },
    select: { id: true },
  });
  if (!cat) throw new Error("NOT_FOUND");
  if (!HEX.test(input.color)) throw new Error("INVALID_COLOR");
  await db.category.update({
    where: { id: input.id },
    data: { name: input.name.trim(), color: input.color },
  });
  revalidatePath("/categories");
  revalidatePath("/today");
}

export async function deleteCategory(id: string) {
  const userId = await requireUserId();
  const cat = await db.category.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!cat) throw new Error("NOT_FOUND");
  await db.category.delete({ where: { id } });
  revalidatePath("/categories");
  revalidatePath("/today");
}
