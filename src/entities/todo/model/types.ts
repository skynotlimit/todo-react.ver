// Domain type for a Todo with its loaded relations (category + tags).
// Lives in `entities/todo/model/` so it can be imported wherever a todo
// shape is needed without pulling in the UI component.

export type TodoWithRels = {
  id: string;
  title: string;
  notes: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueAt: Date | null;
  remindAt: Date | null;
  completedAt: Date | null;
  categoryId: string | null;
  category: { id: string; name: string; color: string } | null;
  tags: { tag: { id: string; name: string } }[];
};
