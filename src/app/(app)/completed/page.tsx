import { getTranslations } from "next-intl/server";
import { requireUserId } from "@/lib/session";
import { getCategories, getCompletedTodosInMonth } from "@/lib/queries";
import { CompletedCalendar } from "@/widgets/completed-calendar";

export default async function CompletedPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const userId = await requireUserId();
  const t = await getTranslations();
  const { month: monthParam } = await searchParams;

  const { year, month } = parseMonthParam(monthParam);

  const [todos, categories] = await Promise.all([
    getCompletedTodosInMonth(userId, year, month),
    getCategories(userId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("nav.completed")}
      </h1>
      <CompletedCalendar
        todos={todos}
        categories={categories}
        year={year}
        month={month}
      />
    </div>
  );
}

function parseMonthParam(raw: string | undefined): {
  year: number;
  month: number;
} {
  const match = raw?.match(/^(\d{4})-(\d{1,2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) return { year, month };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}
