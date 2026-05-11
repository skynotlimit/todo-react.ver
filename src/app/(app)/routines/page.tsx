import { getTranslations } from "next-intl/server";
import { requireUserId } from "@/lib/session";
import { getCategories, getRoutines } from "@/lib/queries";
import { RoutineManager } from "@/features/routine-manage";

export default async function RoutinesPage() {
  const userId = await requireUserId();
  const t = await getTranslations();
  const [routines, categories] = await Promise.all([
    getRoutines(userId),
    getCategories(userId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("routine.title")}
      </h1>
      <RoutineManager
        routines={routines.map((r) => ({
          ...r,
          startDate: r.startDate.toISOString().slice(0, 10),
          endDate: r.endDate ? r.endDate.toISOString().slice(0, 10) : null,
        }))}
        categories={categories}
      />
    </div>
  );
}
