import { db } from "./src/db/index";
import { manuscriptSubmissions } from "./src/db/schema";
async function main() {
  const rows = await db.select().from(manuscriptSubmissions);
  console.log(rows);
}
main();
