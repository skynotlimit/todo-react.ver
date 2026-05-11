import { db } from "@/lib/db";
import { startOfLocalDay, endOfLocalDay, addDays } from "@/lib/utils";
import { xpOf } from "@/lib/quest";

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

export async function getCompletedTodosInMonth(
  userId: string,
  year: number,
  month: number,
) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return db.todo.findMany({
    where: {
      userId,
      completedAt: { gte: start, lt: end },
    },
    orderBy: { completedAt: "desc" },
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

export type QuestStats = {
  totalQuests: number;
  totalXp: number;
  byPriority: { LOW: number; MEDIUM: number; HIGH: number };
};

export async function getQuestStats(userId: string): Promise<QuestStats> {
  const rows = await db.todo.groupBy({
    by: ["priority"],
    where: { userId, completedAt: { not: null } },
    _count: { _all: true },
  });
  const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  for (const r of rows) byPriority[r.priority] = r._count._all;
  const totalQuests = byPriority.LOW + byPriority.MEDIUM + byPriority.HIGH;
  const totalXp =
    byPriority.LOW * xpOf.LOW +
    byPriority.MEDIUM * xpOf.MEDIUM +
    byPriority.HIGH * xpOf.HIGH;
  return { totalQuests, totalXp, byPriority };
}

export async function getTotalXp(userId: string): Promise<number> {
  const { totalXp } = await getQuestStats(userId);
  return totalXp;
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
