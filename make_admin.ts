import { db } from "./src/db/index.js";
import * as schema from "./src/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const userEmail = "softxpressdz@gmail.com";
    await db.update(schema.users)
      .set({ role: "admin" })
      .where(eq(schema.users.email, userEmail));
    console.log(`Updated ${userEmail} to admin.`);
  } catch (err) {
    console.error(err);
  }
}
main();
