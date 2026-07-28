import { chromium } from "playwright";
import { injectAxe, checkA11y } from "@axe-core/playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await context.newPage();

  for (const path of ["/imprint", "/privacy"]) {
    await page.goto(`http://localhost:8080${path}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await injectAxe(page);
    const results = await checkA11y(page, null, { detailedReport: true, detailedReportOptions: { html: true } });
    
    if (results.violations.length > 0) {
      console.log(`\n${path} - ${results.violations.length} accessibility violations:`);
      for (const violation of results.violations) {
        console.log(`  - ${violation.id}: ${violation.description} (impact: ${violation.impact})`);
        for (const node of violation.nodes) {
          console.log(`    Target: ${node.target}`);
        }
      }
    } else {
      console.log(`${path}: No accessibility violations found`);
    }
  }

  await browser.close();
}

main();
