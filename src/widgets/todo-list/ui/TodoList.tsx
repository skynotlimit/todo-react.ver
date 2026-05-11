import { useTranslations } from "next-intl";
import { TodoRow, type TodoWithRels } from "@/entities/todo";

type CategoryLite = { id: string; name: string; color: string };

export function TodoList({
  todos,
  categories,
  emptyKey = "todo.empty",
}: {
  todos: TodoWithRels[];
  categories: CategoryLite[];
  emptyKey?: string;
}) {
  if (todos.length === 0) {
    return <EmptyState messageKey={emptyKey} />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {todos.map((t) => (
        <TodoRow key={t.id} todo={t} categories={categories} />
      ))}
    </div>
  );
}

function EmptyState({ messageKey }: { messageKey: string }) {
  const t = useTranslations();
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <div className="text-3xl mb-3" aria-hidden>📜</div>
      <p className="text-sm text-muted-foreground">{t(messageKey)}</p>
    </div>
  );
}
