import { getTranslations } from "next-intl/server";
import { requireUserId } from "@/lib/session";
import { getAllOpenTodos, getCategories } from "@/lib/queries";
import { TodoComposer } from "@/features/todo-create";
import { TodoList } from "@/widgets/todo-list";

export default async function AllPage() {
  const userId = await requireUserId();
  const t = await getTranslations();
  const [todos, categories] = await Promise.all([
    getAllOpenTodos(userId),
    getCategories(userId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t("nav.all")}</h1>
      <TodoComposer categories={categories} />
      <TodoList todos={todos} categories={categories} />
    </div>
  );
}
