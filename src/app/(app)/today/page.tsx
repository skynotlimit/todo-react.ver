import { getTranslations } from "next-intl/server";
import { requireUserId } from "@/lib/session";
import {
  getCategories,
  getRoutinesForToday,
  getTodayTodos,
} from "@/lib/queries";
import { isRoutineDueOn } from "@/lib/routines";
import { endOfLocalDay } from "@/lib/utils";
import { TodoComposer } from "@/components/todo/todo-composer";
import { TodoList } from "@/components/todo/todo-list";
import { DailyProgress } from "@/components/todo/daily-progress";
import { RoutineToday } from "@/components/routine/routine-today";

export default async function TodayPage() {
  const userId = await requireUserId();
  const t = await getTranslations();

  const [todos, categories, routines] = await Promise.all([
    getTodayTodos(userId),
    getCategories(userId),
    getRoutinesForToday(userId),
  ]);

  const today = new Date();
  const todaysRoutines = routines.filter((r) => isRoutineDueOn(r, today));

  const dateLabel = formatHeader(today);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {dateLabel}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("nav.today")}
        </h1>
      </header>

      <TodoComposer
        categories={categories}
        defaultDueIso={endOfLocalDay(today).toISOString()}
      />

      {todos.length > 0 && <DailyProgress todos={todos} />}

      {todos.length > 8 && (
        <p className="text-xs text-muted-foreground italic">
          {t("todo.tooMany")}
        </p>
      )}

      <TodoList todos={todos} categories={categories} />

      {todaysRoutines.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">
            {t("routine.today")}
          </h2>
          <RoutineToday routines={todaysRoutines} />
        </section>
      )}
    </div>
  );
}

function formatHeader(d: Date) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}
