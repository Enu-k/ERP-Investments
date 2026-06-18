import type { InstrumentType } from "../types/yield";

export const vrSchemeCategories = [
  "Debt",
  "Equity",
  "Hybrid",
  "Other",
  "Solution Oriented"
] as const;

export type VrSchemeCategory = typeof vrSchemeCategories[number];

export const vrEnabledTaxonomy = [
  { category: "Debt", subCategory: "Banking and PSU", recordCount: 67 },
  { category: "Debt", subCategory: "Corporate Bond", recordCount: 75 },
  { category: "Debt", subCategory: "Credit Risk", recordCount: 46 },
  { category: "Debt", subCategory: "Dynamic Bond", recordCount: 62 },
  { category: "Debt", subCategory: "Floater", recordCount: 57 },
  { category: "Debt", subCategory: "Gilt", recordCount: 66 },
  { category: "Debt", subCategory: "Gilt with 10 year Constant Duration", recordCount: 17 },
  { category: "Debt", subCategory: "Liquid", recordCount: 99 },
  { category: "Debt", subCategory: "Long Duration", recordCount: 41 },
  { category: "Debt", subCategory: "Low Duration", recordCount: 96 },
  { category: "Debt", subCategory: "Medium Duration", recordCount: 53 },
  { category: "Debt", subCategory: "Medium to Long Duration", recordCount: 53 },
  { category: "Debt", subCategory: "Money Market", recordCount: 75 },
  { category: "Debt", subCategory: "Overnight", recordCount: 69 },
  { category: "Debt", subCategory: "Short Duration", recordCount: 77 },
  { category: "Debt", subCategory: "Ultra Short Duration", recordCount: 78 },
  { category: "Equity", subCategory: "Contra", recordCount: 9 },
  { category: "Equity", subCategory: "Dividend Yield", recordCount: 21 },
  { category: "Equity", subCategory: "ELSS", recordCount: 34 },
  { category: "Equity", subCategory: "Flexi Cap", recordCount: 45 },
  { category: "Equity", subCategory: "Focused", recordCount: 43 },
  { category: "Equity", subCategory: "Large & MidCap", recordCount: 45 },
  { category: "Equity", subCategory: "Large Cap", recordCount: 44 },
  { category: "Equity", subCategory: "Mid Cap", recordCount: 42 },
  { category: "Equity", subCategory: "Multi Cap", recordCount: 43 },
  { category: "Equity", subCategory: "Sectoral / Thematic", recordCount: 429 },
  { category: "Equity", subCategory: "Small Cap", recordCount: 36 },
  { category: "Equity", subCategory: "Value", recordCount: 35 },
  { category: "Hybrid", subCategory: "Aggressive Hybrid", recordCount: 56 },
  { category: "Hybrid", subCategory: "Arbitrage", recordCount: 51 },
  { category: "Hybrid", subCategory: "Conservative Hybrid", recordCount: 55 },
  { category: "Hybrid", subCategory: "Dynamic Asset Allocation or Balanced Advantage", recordCount: 47 },
  { category: "Hybrid", subCategory: "Equity Savings", recordCount: 51 },
  { category: "Hybrid", subCategory: "Multi Asset Allocation", recordCount: 48 },
  { category: "Other", subCategory: "FoFs (Overseas/Domestic)", recordCount: 253 },
  { category: "Other", subCategory: "Index Funds / ETFs", recordCount: 645 },
  { category: "Solution Oriented", subCategory: "Children's", recordCount: 13 },
  { category: "Solution Oriented", subCategory: "Retirement", recordCount: 47 }
] as const satisfies readonly {
  category: VrSchemeCategory;
  subCategory: string;
  recordCount: number;
}[];

export type VrSchemeSubCategory = typeof vrEnabledTaxonomy[number]["subCategory"];

export interface VrSchemeClassification {
  schemeCategory?: VrSchemeCategory;
  schemeSubCategory?: VrSchemeSubCategory;
}

export function getVrSubCategories(category: VrSchemeCategory | "All") {
  return vrEnabledTaxonomy
    .filter((entry) => category === "All" || entry.category === category)
    .map((entry) => entry.subCategory)
    .sort((a, b) => a.localeCompare(b));
}

export function getVrCategoryForSubCategory(subCategory: VrSchemeSubCategory) {
  return vrEnabledTaxonomy.find((entry) => entry.subCategory === subCategory)?.category;
}

export function normalizeVrCategory(value?: string | null): VrSchemeCategory | undefined {
  if (!value) return undefined;
  const normalized = normalizeLabel(value);
  return vrSchemeCategories.find((category) => normalizeLabel(category) === normalized);
}

export function normalizeVrSubCategory(value?: string | null, category?: VrSchemeCategory): VrSchemeSubCategory | undefined {
  if (!value) return undefined;
  const normalized = normalizeLabel(value);
  return vrEnabledTaxonomy.find((entry) => {
    const categoryMatches = !category || entry.category === category;
    return categoryMatches && subCategoryAliases(entry.subCategory).includes(normalized);
  })?.subCategory;
}

export function inferSchemeTaxonomy(
  instrument: InstrumentType,
  schemeName?: string,
  apiCategory?: string | null,
  apiSubCategory?: string | null
): VrSchemeClassification {
  if (instrument === "Fixed Deposit" || instrument === "Current Account") return {};

  const inferred = inferFromInstrument(instrument) ?? inferFromSchemeName(schemeName);
  const schemeCategory = normalizeVrCategory(apiCategory) ?? inferred?.schemeCategory;
  const schemeSubCategory =
    normalizeVrSubCategory(apiSubCategory, schemeCategory) ??
    (schemeCategory === inferred?.schemeCategory ? inferred?.schemeSubCategory : undefined);

  return { schemeCategory, schemeSubCategory };
}

function inferFromInstrument(instrument: InstrumentType): VrSchemeClassification | undefined {
  if (instrument === "Liquid Mutual Fund") return { schemeCategory: "Debt", schemeSubCategory: "Liquid" };
  if (instrument === "Overnight Fund") return { schemeCategory: "Debt", schemeSubCategory: "Overnight" };
  if (instrument === "Money Market Fund") return { schemeCategory: "Debt", schemeSubCategory: "Money Market" };
  return undefined;
}

function inferFromSchemeName(schemeName?: string): VrSchemeClassification | undefined {
  const normalized = normalizeLabel(schemeName);
  if (!normalized) return undefined;

  const match = vrEnabledTaxonomy.find((entry) =>
    subCategoryAliases(entry.subCategory).some((alias) => normalized.includes(alias))
  );
  return match ? { schemeCategory: match.category, schemeSubCategory: match.subCategory } : undefined;
}

function subCategoryAliases(subCategory: VrSchemeSubCategory) {
  const normalized = normalizeLabel(subCategory);
  const aliases = new Set([normalized]);

  if (!normalized.endsWith("fund") && !normalized.endsWith("funds")) aliases.add(`${normalized} fund`);
  aliases.add(normalized.replace(/\bfunds?\b/g, "").replace(/\s+/g, " ").trim());

  if (subCategory === "Banking and PSU") aliases.add("banking psu");
  if (subCategory === "Gilt with 10 year Constant Duration") aliases.add("gilt fund with 10 year constant duration");
  if (subCategory === "Large & MidCap") aliases.add("large and mid cap");
  if (subCategory === "Multi Asset Allocation") aliases.add("multi asset allocation fund");
  if (subCategory === "Index Funds / ETFs") {
    aliases.add("index");
    aliases.add("index funds");
    aliases.add("etfs");
  }
  if (subCategory === "FoFs (Overseas/Domestic)") {
    aliases.add("fund of fund");
    aliases.add("fund of funds");
    aliases.add("fof");
    aliases.add("fofs");
    aliases.add("domestic fund of funds");
    aliases.add("international fund of funds");
  }
  if (subCategory === "Children's") aliases.add("childrens fund");
  if (subCategory === "Retirement") aliases.add("retirement fund");

  return Array.from(aliases).filter(Boolean);
}

function normalizeLabel(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[()/-]/g, " ")
    .replace(/\s+/g, " ");
}
