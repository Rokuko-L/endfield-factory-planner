// Wiki scraper (dev-only). Fetches all 38 facility pages from the
// Endfield wiki (Logistics, Depot, Production I, Production II, Power)
// and saves them as JSON to ./scraped/<slug>.json. Intermediate
// artifacts only — ./scraped/ is gitignored. Run parse.mjs after
// this to generate src/data.ts.
//
// Run with: node scrape.mjs
//
// The wiki rate-limits aggressively. The script retries on 429 with
// exponential backoff and skips files already on disk.

import { mkdir, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const PAGES = [
  // Logistics
  ["Belt_Bridge", "Belt Bridge"],
  ["Converger", "Converger"],
  ["Item_Control_Port", "Item Control Port"],
  ["Pipe_Bridge", "Pipe Bridge"],
  ["Pipe_Control_Port", "Pipe Control Port"],
  ["Pipe_Converger", "Pipe Converger"],
  ["Pipe_Splitter", "Pipe Splitter"],
  ["Splitter", "Splitter"],
  // Depot
  ["Conduit_Inlet", "Conduit Inlet"],
  ["Conduit_Inlet_Manifold", "Conduit Inlet Manifold"],
  ["Conduit_Outlet_Manifold", "Conduit Outlet Manifold"],
  ["Depot_Bus_Port", "Depot Bus Port"],
  ["Depot_Bus_Section", "Depot Bus Section"],
  ["Depot_Loader", "Depot Loader"],
  ["Depot_Unloader", "Depot Unloader"],
  ["Fluid_Tank", "Fluid Tank"],
  ["Protocol_Stash", "Protocol Stash"],
  // Production I
  ["Fitting_Unit", "Fitting Unit"],
  ["Moulding_Unit", "Moulding Unit"],
  ["Planting_Unit", "Planting Unit"],
  ["Refining_Unit", "Refining Unit"],
  ["Seed-Picking_Unit", "Seed-Picking Unit"],
  ["Shredding_Unit", "Shredding Unit"],
  ["Water_Treatment_Unit", "Water Treatment Unit"],
  // Production II
  ["Expanded_Crucible", "Expanded Crucible"],
  ["Filling_Unit", "Filling Unit"],
  ["Forge_of_the_Sky", "Forge of the Sky"],
  ["Gearing_Unit", "Gearing Unit"],
  ["Grinding_Unit", "Grinding Unit"],
  ["Packaging_Unit", "Packaging Unit"],
  ["Purification_Unit", "Purification Unit"],
  ["Reactor_Crucible", "Reactor Crucible"],
  ["Separating_Unit", "Separating Unit"],
  // Power
  ["Electric_Pylon", "Electric Pylon"],
  ["Relay_Tower", "Relay Tower"],
  ["Thermal_Bank", "Thermal Bank"],
  ["Xiranite_Pylon", "Xiranite Pylon"],
  ["Xiranite_Relay", "Xiranite Relay"],
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "endfield-planner-scraper/1.0" },
      });
      if (res.status === 429 || res.status >= 500) {
        const wait = 1500 * attempt;
        console.error(`  retry ${attempt} after ${wait}ms (HTTP ${res.status})`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) {
        console.error(`FAIL ${url}: HTTP ${res.status}`);
        return null;
      }
      return await res.text();
    } catch (e) {
      console.error(`  network error attempt ${attempt}: ${e}`);
      await sleep(1500 * attempt);
    }
  }
  return null;
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function main() {
  const out = resolve("scraped");
  await mkdir(out, { recursive: true });

  for (const [slug, title] of PAGES) {
    const outFile = resolve(out, `${slug}.json`);
    if (await exists(outFile)) {
      console.log(`SKIP ${slug} (already on disk)`);
      continue;
    }
    const url = `https://endfield.wiki.gg/wiki/${slug}`;
    const text = await fetchWithRetry(url);
    if (text === null) {
      console.error(`FAIL ${slug}: gave up after retries`);
      continue;
    }
    await writeFile(
      outFile,
      JSON.stringify({ slug, title, url, html: text }, null, 0),
      "utf-8",
    );
    console.log(`OK ${slug} (${text.length} bytes)`);
    await sleep(1500);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
