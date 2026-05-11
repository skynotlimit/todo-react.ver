import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";
import { isRoutineDueOn } from "@/shared/lib/routines";

/**
 * Push reminder dispatch. Call this from a cron (e.g. every minute):
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://your-host/api/push/dispatch
 *
 * Sends pushes for:
 *   - todos whose remindAt is within the last minute
 *   - routines whose timeOfDay - remindBefore matches the current minute (today)
 */
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
  }

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60_000);

  // ── Todos ──
  const dueTodos = await db.todo.findMany({
    where: {
      remindAt: { gte: oneMinuteAgo, lte: now },
      completedAt: null,
    },
    select: { id: true, userId: true, title: true },
  });

  for (const t of dueTodos) {
    await sendPushToUser(t.userId, {
      title: "📝 " + t.title,
      body: "리마인더",
      url: "/today",
    });
  }

  // ── Routines ──
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const routines = await db.routine.findMany({
    where: { active: true, timeOfDay: { not: null } },
    include: { logs: { where: { date: todayStart } } },
  });

  for (const r of routines) {
    if (!isRoutineDueOn(r, now)) continue;
    if (r.logs[0]?.completedAt || r.logs[0]?.skipped) continue;
    if (!r.timeOfDay) continue;

    const [hh, mm] = r.timeOfDay.split(":").map(Number);
    const target = new Date(now);
    target.setHours(hh, mm, 0, 0);
    const remindAt = new Date(target.getTime() - (r.remindBefore ?? 0) * 60_000);
    if (remindAt >= oneMinuteAgo && remindAt <= now) {
      await sendPushToUser(r.userId, {
        title: "🔁 " + r.title,
        body: r.timeOfDay,
        url: "/today",
      });
    }
  }

  return NextResponse.json({ ok: true, todos: dueTodos.length });
}
