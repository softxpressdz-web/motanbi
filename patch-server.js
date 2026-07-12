import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');
const putApi = `
  app.put("/api/manuscripts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, retailPrice } = req.body;
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (retailPrice !== undefined) {
        updateData.retailPrice = retailPrice;
        // update royalty as well: 15% of retail price
        updateData.royaltyPerSale = (parseFloat(retailPrice) * 0.15).toFixed(2);
      }
      
      const [updated] = await db.update(schema.manuscriptSubmissions)
        .set(updateData)
        .where(eq(schema.manuscriptSubmissions.id, id))
        .returning();
      return sendAPIResponse(res, "success", "تم تحديث طلب النشر بنجاح", updated);
    } catch (error: any) {
      console.error("Error updating manuscript:", error);
      return sendAPIResponse(res, "error", "فشل تحديث طلب النشر", error.message, null, 500);
    }
  });
`;

code = code.replace('app.get("/api/manuscripts", async (req, res) => {', putApi + '\n  app.get("/api/manuscripts", async (req, res) => {');
fs.writeFileSync('server.ts', code);
