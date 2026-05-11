"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import {
  CategoryFormSchema,
  type CategoryFormValues,
} from "@/shared/schemas/category";

export async function createCategory(input: CategoryFormValues) {
  const userId = await requireUserId();
  const data = CategoryFormSchema.parse(input);
  await db.category.create({
    data: { userId, name: data.name, color: data.color },
  });
  revalidatePath("/categories");
  revalidatePath("/today");
}

export async function updateCategory(
  input: { id: string } & CategoryFormValues,
) {
  const userId = await requireUserId();
  const data = CategoryFormSchema.parse({
    name: input.name,
    color: input.color,
  });
  const cat = await db.category.findFirst({
    where: { id: input.id, userId },
    select: { id: true },
  });
  if (!cat) throw new Error("NOT_FOUND");
  await db.category.update({
    where: { id: input.id },
    data: { name: data.name, color: data.color },
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
