import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');

const newRoute = `  app.put("/api/manuscripts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, retailPrice, productionCostPerBook, pageCount, coverType, printCopies, totalPrintCost, signatureName } = req.body;
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (productionCostPerBook !== undefined) updateData.productionCostPerBook = productionCostPerBook;
      if (pageCount !== undefined) updateData.pageCount = pageCount;
      if (coverType !== undefined) updateData.coverType = coverType;
      if (printCopies !== undefined) updateData.printCopies = printCopies;
      if (totalPrintCost !== undefined) updateData.totalPrintCost = totalPrintCost;
      if (signatureName !== undefined) updateData.signatureName = signatureName;
      if (retailPrice !== undefined) {
        updateData.retailPrice = retailPrice;
        // update royalty as well: 10% of retail price
        updateData.royaltyPerSale = (parseFloat(retailPrice) * 0.10).toFixed(2);
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
  });`;

code = code.replace(/app\.put\("\/api\/manuscripts\/:id", async \(req, res\) => \{[\s\S]*?\}\catch \(\S+\) \{[\s\S]*?\}\n  \}\);/, newRoute);

fs.writeFileSync('server.ts', code);
