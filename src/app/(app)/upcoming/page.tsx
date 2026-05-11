import { getTranslations } from "next-intl/server";
import { requireUserId } from "@/lib/session";
import { getCategories, getUpcomingTodos } from "@/lib/queries";
import { TodoComposer } from "@/components/todo/todo-composer";
import { TodoList } from "@/components/todo/todo-list";

export default async function UpcomingPage() {
  const userId = await requireUserId();
  const t = await getTranslations();
  const [todos, categories] = await Promise.all([
    getUpcomingTodos(userId),
    getCategories(userId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("nav.upcoming")}
      </h1>
      <TodoComposer categories={categories} />
      <TodoList todos={todos} categories={categories} />
    </div>
  );
}
