import { db } from "./src/db/index.js";
import * as schema from "./src/db/schema.js";
import { eq, notInArray } from "drizzle-orm";

async function run() {
  const categories = [
    "كتب الاقتصاد",
    "كتب التسويق",
    "كتب المحاسبة",
    "كتب التسيير",
    "كتب التجارة",
    "كتب اللغة",
    "كتب الفلسفة",
    "كتب الادب",
    "كتب الشريعة",
  ];
  
  // First, let's insert missing ones
  for (const cat of categories) {
    const existing = await db.select().from(schema.categories).where(eq(schema.categories.name, cat));
    if (existing.length === 0) {
      console.log("Inserting", cat);
      await db.insert(schema.categories).values({
        name: cat,
        description: `كتب ومؤلفات قيمة في مجال ${cat}`,
      });
    }
  }

  // Delete ones that are not in this list
  console.log("Deleting old ones");
  const toDelete = await db.select().from(schema.categories).where(notInArray(schema.categories.name, categories));
  for (const cat of toDelete) {
    console.log("Deleting", cat.name);
    // Delete relations first
    await db.delete(schema.bookCategories).where(eq(schema.bookCategories.categoryId, cat.id));
    await db.delete(schema.categories).where(eq(schema.categories.id, cat.id));
  }
  console.log("Done");
  process.exit(0);
}
run();
