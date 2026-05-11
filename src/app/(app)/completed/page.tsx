import { getTranslations } from "next-intl/server";
import { requireUserId } from "@/lib/session";
import { getCategories, getCompletedTodos } from "@/lib/queries";
import { TodoList } from "@/components/todo/todo-list";

export default async function CompletedPage() {
  const userId = await requireUserId();
  const t = await getTranslations();
  const [todos, categories] = await Promise.all([
    getCompletedTodos(userId),
    getCategories(userId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("nav.completed")}
      </h1>
      <TodoList todos={todos} categories={categories} />
    </div>
  );
}
