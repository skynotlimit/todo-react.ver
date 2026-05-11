import { getTranslations } from "next-intl/server";
import { requireUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { Badge } from "@/shared/ui";

export default async function TagsPage() {
  const userId = await requireUserId();
  const t = await getTranslations();

  const tags = await db.tag.findMany({
    where: { userId },
    include: { _count: { select: { todos: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("tag.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          태그는 할 일을 추가할 때 자동으로 생성됩니다.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          tags.map((tag) => (
            <Badge key={tag.id} className="text-sm py-1 px-3">
              #{tag.name}
              <span className="ml-2 text-xs text-muted-foreground">
                {tag._count.todos}
              </span>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
