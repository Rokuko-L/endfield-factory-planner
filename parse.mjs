// Wiki page parser (dev-only). Reads the JSON files saved by
// scrape.mjs and emits a structured record per machine: name, type,
// footprint, and recipe list. Outputs ./parsed/machines.json
// (gitignored). Run generate-data.mjs to convert that into
// src/data.ts.
//
// Run with: node parse.mjs
//
// What this captures per machine:
//   - Name and "Type" tag (e.g. "Production I") from the infobox.
//   - Footprint: 1×1 for logistics, 5×5 for everything else
//     (no reliable per-machine size on the wiki page text).
//   - Recipes: parsed from the <th>Cost/Product/Time</th> tables
//     and the <th>Input/Duration/Power</th> tables. Each row is
//     interpreted as "N inputs → M outputs", with a single-output
//     synthetic "Power" resource for the power-generation tables.
//
// Known limitations:
//   - Multi-input cells take the FIRST data-name only; secondary
//     inputs (e.g. Sewage as a co-input) are not captured.
//   - The wiki's "Treatment complete" / similar abstract product
//     strings are skipped (no data-name). The editor's recipe
//     editor can fill them in.

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

// Categories: everything not in this list is treated as a 5x5
// "machine" with recipes. Logistics machines are 1x1 belt/pipe
// addons (passthrough) — they have no recipes.
const LOGISTICS_SLUGS = new Set([
  "Belt_Bridge",
  "Converger",
  "Item_Control_Port",
  "Pipe_Bridge",
  "Pipe_Control_Port",
  "Pipe_Converger",
  "Pipe_Splitter",
  "Splitter",
]);

function htmlDecode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(s) {
  // Replace <br>, <br/>, <br />, and similar with a space BEFORE
  // stripping tags, so numbers separated by line breaks don't get
  // concatenated (e.g. "5<br />30/min" → "530/min" otherwise).
  const withBreaks = s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/div>/gi, " ");
  return htmlDecode(withBreaks.replace(/<[^>]+>/g, ""));
}

function pageTitle(html) {
  const m = html.match(/<h1[^>]*id="firstHeading"[^>]*>([\s\S]*?)<\/h1>/);
  if (!m) return null;
  return stripTags(m[1]).trim();
}

/**
 * Extract the facility "Type" from the infobox. The DRUID layout
 * uses a <div class="druid-data druid-data-type ..."> with an <img>
 * whose alt is "Type.png" (e.g. "Production I.png"), followed by the
 * type name in plain text.
 */
function pageType(html) {
  const block = html.match(
    /druid-data-type[\s\S]*?<\/div>/i,
  );
  if (!block) return null;
  // The <img> alt is the authoritative source.
  const img = block[0].match(/<img[^>]*alt="([^"]+)"/i);
  if (img) {
    return img[1].replace(/\.png$/i, "").replace(/_/g, " ").trim();
  }
  // Fallback: strip the img tag and any HTML, then trim.
  const noImg = block[0].replace(/<img[^>]*>/gi, "");
  return stripTags(noImg).trim() || null;
}

function pageRarity(html) {
  const block = html.match(
    /druid-data-rarity[\s\S]*?<\/div>/i,
  );
  if (!block) return null;
  return stripTags(block[0].replace(/<img[^>]*>/gi, "")).trim() || null;
}

/**
 * Extract all recipe tables. A recipe table is one that has all three
 * headers: Cost, Product, Time. We avoid the Acquisition table (which
 * also has "Cost" / "Product" / "Time" headers for build cost) by
 * requiring the surrounding heading to be a Usage/Fluid Mode section
 * rather than Acquisition.
 *
 * Each row in a recipe table has the structure:
 *   <td> ... <div class="item-tooltip" data-name="Ferrium Ore"> ... </div> ... <div class="item-count">1</div> ... 30/min </td>
 *   <td> ... (similar for output) </td>
 *   <td> 2s </td>
 */
function extractRecipes(html) {
  const recipes = [];

  // Walk all h2 and h3 headings. For each "mode" section, track
  // whether it's Item (default) or Fluid based on the heading text.
  // A section is "fluid" if its heading text contains "fluid" (case
  // insensitive). The closing pattern uses just </h\1> (not
  // </span></h\1>) because a more specific closing pattern was
  // causing regex backtracking issues that missed some sections.
  const headingRe = /<h([23])[^>]*>\s*<span[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[23]|$)/gi;
  let m;
  while ((m = headingRe.exec(html)) !== null) {
    const id = m[2];
    // m[3] may include trailing </span>; strip it.
    const headingText = m[3].replace(/<\/span>/g, "").replace(/<[^>]+>/g, "").toLowerCase();
    const body = m[4];
    if (
      id === "Acquisition" || id === "Navigation" || id === "Trivia" ||
      id === "Gallery" || id === "See_Also" || id === "Tips"
    ) {
      continue;
    }
    const isFluid = /fluid/.test(headingText);
    const tableRe = /<table[\s\S]*?<\/table>/gi;
    let t;
    while ((t = tableRe.exec(body)) !== null) {
      const table = t[0];
      const hasInput = /<th[^>]*>\s*(Cost|Input)\s*<\/th>/i.test(table);
      const hasOutput = /<th[^>]*>\s*(Product|Output|Power)\s*<\/th>/i.test(table);
      if (!hasInput || !hasOutput) continue;
      parseTable(table, recipes, isFluid ? "fluid" : "item");
    }
  }
  return recipes;
}

function parseTable(table, recipes, kind) {
  const rows = table.split(/<tr[^>]*>/i).slice(1);
  if (rows.length === 0) return;

  // The first row is the header. Find the column indices of the input,
  // output, and time columns.
  const headerCells = [];
  const headerRe = /<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi;
  let hm;
  while ((hm = headerRe.exec(rows[0])) !== null) {
    headerCells.push(stripTags(hm[2]).trim().toLowerCase());
  }
  const inCol = findCol(headerCells, ["cost", "input"]);
  const outCol = findCol(headerCells, ["product", "output", "power"]);
  const timeCol = findCol(headerCells, ["time", "duration"]);
  if (inCol < 0 || outCol < 0) return;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = [];
    const cellRe = /<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi;
    let m;
    while ((m = cellRe.exec(row)) !== null) {
      cells.push(m[2]);
    }
    if (cells.length <= outCol) continue;

    const inItem = extractItem(cells[inCol], "input");
    const outItem = extractItem(cells[outCol], "output");
    if (!inItem || !outItem) continue;

    // Apply the section's kind (item/fluid) to the parsed items.
    inItem.kind = kind;
    outItem.kind = kind;

    let time;
    if (timeCol >= 0 && timeCol < cells.length) {
      time = extractTime(cells[timeCol]) ?? undefined;
    }

    recipes.push({
      in: inItem,
      out: outItem,
      ...(time !== undefined ? { time } : {}),
    });
  }
}

function findCol(headers, candidates) {
  for (let i = 0; i < headers.length; i++) {
    if (candidates.includes(headers[i])) return i;
  }
  return -1;
}

/**
 * Extract the resource name + rate from a recipe cell. The cell
 * contains a `.item-tooltip` div with a `data-name` attribute
 * (e.g. "Ferrium Ore"), and plain text like "30/min" for the rate.
 *
 * The `kind` argument tells us which column we're in. For most
 * cells we read `data-name` and the rate. For power-generation
 * tables the "output" column is just a number (e.g. "50") and we
 * synthesize a "Power" resource.
 */
function extractItem(cell, kind) {
  const text = stripTags(cell);

  // If this is an output cell and the text is just a number, treat
  // it as a power output.
  if (kind === "output") {
    const onlyNumber = text.match(/^\s*([\d.]+)\s*$/);
    if (onlyNumber) {
      return { resource: "Power", kind: "item", rate: Number(onlyNumber[1]) };
    }
  }

  // Prefer data-name; fall back to <img alt> stripping the .png.
  const dt = cell.match(/data-name="([^"]+)"/);
  let name = null;
  if (dt) {
    name = dt[1];
  } else {
    const img = cell.match(/<img[^>]*alt="([^"]+)"/i);
    if (img) name = img[1].replace(/\.png$/i, "").replace(/_/g, " ");
  }
  if (!name) return null;

  // Rate: look for the last number followed by /min or /s, OR a plain
  // number as the last token in the cell text.
  let rate = 1;
  const rateMatch = text.match(/([\d.]+)\s*\/(min|s)\b/);
  if (rateMatch) {
    rate = Number(rateMatch[1]);
  } else {
    const lastNum = text.match(/([\d.]+)\s*$/);
    if (lastNum) rate = Number(lastNum[1]);
  }
  return { resource: name, kind: "item", rate };
}

function extractTime(cell) {
  const text = stripTags(cell);
  const m = text.match(/([\d.]+)\s*(s|sec|m|min)\b/i);
  if (m) return Number(m[1]);
  return null;
}

function buildMachineType(slug, title, type, recipes) {
  const isLogistics = LOGISTICS_SLUGS.has(slug);
  const width = isLogistics ? 1 : 5;
  const height = isLogistics ? 1 : 5;
  return {
    name: title,
    width,
    height,
    ports: [],
    edgeBands: {},
    recipes: recipes.map((r, i) => ({
      id: `recipe_${i + 1}`,
      inputs: [r.in],
      outputs: [r.out],
      ...(r.time !== undefined ? { time: r.time } : {}),
    })),
    _meta: {
      type,
      slug,
      isLogistics,
    },
  };
}

async function main() {
  const scraped = resolve("scraped");
  const out = resolve("parsed");
  await mkdir(out, { recursive: true });
  const files = (await readdir(scraped))
    .filter((f) => f.endsWith(".json"))
    .sort();
  const all = [];
  for (const f of files) {
    const raw = await readFile(resolve(scraped, f), "utf-8");
    const { slug, html } = JSON.parse(raw);
    const title = pageTitle(html) ?? slug.replace(/_/g, " ");
    const type = pageType(html);
    const rarity = pageRarity(html);
    const recipes = extractRecipes(html);
    const machine = buildMachineType(slug, title, type, recipes);
    all.push({ slug, title, type, rarity, ...machine });
    console.log(
      `${slug.padEnd(28)} type=${(type ?? "?").padEnd(20)} recipes=${recipes.length}`,
    );
  }
  await writeFile(
    resolve(out, "machines.json"),
    JSON.stringify(all, null, 2),
    "utf-8",
  );
  console.log(`\nWrote ${all.length} machines to parsed/machines.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
