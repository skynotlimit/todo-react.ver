import { getTranslations } from "next-intl/server";
import { requireUserId } from "@/lib/session";
import { getCategories } from "@/lib/queries";
import { CategoryManager } from "@/components/category/category-manager";

export default async function CategoriesPage() {
  const userId = await requireUserId();
  const t = await getTranslations();
  const categories = await getCategories(userId);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("category.title")}
      </h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
