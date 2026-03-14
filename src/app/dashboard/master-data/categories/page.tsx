export const dynamic = "force-dynamic";
import { getCategories } from "@/actions/categories";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  const res = await getCategories();
  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load categories");
  }
  const categories = res.data!;

  return <CategoriesClient initialCategories={categories} />;
}
