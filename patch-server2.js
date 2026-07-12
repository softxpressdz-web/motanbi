import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/updateData\.royaltyPerSale = \(parseFloat\(retailPrice\) \* 0\.15\)\.toFixed\(2\);/g, "updateData.royaltyPerSale = (parseFloat(retailPrice) * 0.10).toFixed(2);");
// Check if productionCostPerBook is updated
if (!code.includes("if (productionCostPerBook !== undefined)")) {
  const replaceStr = `if (status !== undefined) updateData.status = status;
      if (productionCostPerBook !== undefined) updateData.productionCostPerBook = productionCostPerBook;
      if (retailPrice !== undefined) {
        updateData.retailPrice = retailPrice;
        // update royalty as well: 10% of retail price
        updateData.royaltyPerSale = (parseFloat(retailPrice) * 0.10).toFixed(2);
      }`;
  code = code.replace(/if \(status !== undefined\) updateData\.status = status;[\s\S]*?updateData\.royaltyPerSale = \(parseFloat\(retailPrice\) \* [0-9\.]+\)\.toFixed\(2\);\n      \}/g, replaceStr);
}
fs.writeFileSync('server.ts', code);
