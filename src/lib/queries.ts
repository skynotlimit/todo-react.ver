import { db } from "@/lib/db";
import { startOfLocalDay, endOfLocalDay, addDays } from "@/lib/utils";

const todoInclude = {
  category: true,
  tags: { include: { tag: true } },
} as const;

export async function getTodayTodos(userId: string) {
  const start = startOfLocalDay();
  const end = endOfLocalDay();
  return db.todo.findMany({
    where: {
      userId,
      OR: [
        { dueAt: { gte: start, lte: end } },
        { dueAt: null, completedAt: null },
      ],
    },
    orderBy: [
      { completedAt: "asc" },
      { priority: "desc" },
      { dueAt: "asc" },
      { createdAt: "asc" },
    ],
    include: todoInclude,
  });
}

export async function getUpcomingTodos(userId: string) {
  const start = startOfLocalDay(addDays(new Date(), 1));
  const end = endOfLocalDay(addDays(new Date(), 14));
  return db.todo.findMany({
    where: {
      userId,
      completedAt: null,
      dueAt: { gte: start, lte: end },
    },
    orderBy: [{ dueAt: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
    include: todoInclude,
  });
}

export async function getAllOpenTodos(userId: string) {
  return db.todo.findMany({
    where: { userId, completedAt: null },
    orderBy: [
      { priority: "desc" },
      { dueAt: "asc" },
      { createdAt: "asc" },
    ],
    include: todoInclude,
  });
}

export async function getCompletedTodos(userId: string) {
  return db.todo.findMany({
    where: { userId, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 200,
    include: todoInclude,
  });
}

export async function getCategories(userId: string) {
  return db.category.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

export async function getTags(userId: string) {
  return db.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function getRoutines(userId: string) {
  return db.routine.findMany({
    where: { userId },
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
    include: { category: true },
  });
}

export async function getRoutinesForToday(userId: string) {
  return db.routine.findMany({
    where: { userId, active: true },
    include: {
      category: true,
      logs: {
        where: { date: startOfLocalDay() },
      },
    },
  });
}
