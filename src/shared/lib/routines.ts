import { weekdayIndex } from "@/shared/lib/utils";
import type { Routine, RoutineFreq } from "@prisma/client";

export function isRoutineDueOn(routine: Routine, date: Date): boolean {
  if (!routine.active) return false;
  const day = startOfDay(date);
  const start = startOfDay(routine.startDate);
  if (day < start) return false;
  if (routine.endDate) {
    const end = startOfDay(routine.endDate);
    if (day > end) return false;
  }

  switch (routine.freq as RoutineFreq) {
    case "DAILY":
      return true;
    case "WEEKLY": {
      const idx = weekdayIndex(day);
      return ((routine.byWeekday >> idx) & 1) === 1;
    }
    case "MONTHLY":
      return routine.byMonthDay
        ? day.getDate() === routine.byMonthDay
        : day.getDate() === start.getDate();
  }
}

function startOfDay(d: Date) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}
