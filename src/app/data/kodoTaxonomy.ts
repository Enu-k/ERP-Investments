import type { InstrumentType } from "../types/yield";

export const kodoSchemeCategories = [
  "Liquid",
  "Debt",
  "Hybrid",
  "Equity",
  "Index Funds",
  "Fund of Fund",
  "Solution Oriented",
  "Others",
  "Not Specified"
] as const;

export type KodoSchemeCategory = typeof kodoSchemeCategories[number];

export const kodoEnabledTaxonomy = [
  { category: "Liquid", subCategory: "Liquid Fund", schemeCount: 154 },
  { category: "Liquid", subCategory: "Overnight Fund", schemeCount: 39 },
  { category: "Debt", subCategory: "Banking & PSU Fund", schemeCount: 74 },
  { category: "Debt", subCategory: "Corporate Bond Fund", schemeCount: 86 },
  { category: "Debt", subCategory: "Credit Risk Fund", schemeCount: 54 },
  { category: "Debt", subCategory: "Dynamic Bond Fund", schemeCount: 61 },
  { category: "Debt", subCategory: "Floater Fund", schemeCount: 75 },
  { category: "Debt", subCategory: "Gilt Fund", schemeCount: 82 },
  { category: "Debt", subCategory: "Gilt Fund with 10 year Constant Duration", schemeCount: 6 },
  { category: "Debt", subCategory: "Long Duration Fund", schemeCount: 42 },
  { category: "Debt", subCategory: "Low Duration Fund", schemeCount: 95 },
  { category: "Debt", subCategory: "Medium Duration Fund", schemeCount: 76 },
  { category: "Debt", subCategory: "Medium to Long Duration Fund", schemeCount: 44 },
  { category: "Debt", subCategory: "Money Market Fund", schemeCount: 75 },
  { category: "Debt", subCategory: "Short Duration Fund", schemeCount: 89 },
  { category: "Debt", subCategory: "Ultra Short Duration Fund", schemeCount: 71 },
  { category: "Hybrid", subCategory: "Aggressive Hybrid Fund", schemeCount: 70 },
  { category: "Hybrid", subCategory: "Arbitrage Fund", schemeCount: 91 },
  { category: "Hybrid", subCategory: "Balanced Hybrid Fund", schemeCount: 8 },
  { category: "Hybrid", subCategory: "Conservative Hybrid Fund", schemeCount: 77 },
  { category: "Hybrid", subCategory: "Dynamic Asset Allocation or Balanced Advantage Fund", schemeCount: 46 },
  { category: "Hybrid", subCategory: "Equity Savings", schemeCount: 57 },
  { category: "Hybrid", subCategory: "Multi-Asset Allocation Fund", schemeCount: 50 },
  { category: "Hybrid", subCategory: "NON CONSERVATIVE HYBRID FUND", schemeCount: 3 },
  { category: "Equity", subCategory: "BANKING AND FINANCIAL SERVICES FUND", schemeCount: 3 },
  { category: "Equity", subCategory: "CONSUMPTION FUND", schemeCount: 4 },
  { category: "Equity", subCategory: "Contra Fund", schemeCount: 9 },
  { category: "Equity", subCategory: "Dividend Yield Fund", schemeCount: 21 },
  { category: "Equity", subCategory: "ELSS", schemeCount: 35 },
  { category: "Equity", subCategory: "Flexi Cap Fund", schemeCount: 64 },
  { category: "Equity", subCategory: "Focused Fund", schemeCount: 45 },
  { category: "Equity", subCategory: "FUND OF FUND", schemeCount: 12 },
  { category: "Equity", subCategory: "INDEX", schemeCount: 1 },
  { category: "Equity", subCategory: "Large & Mid Cap Fund", schemeCount: 48 },
  { category: "Equity", subCategory: "Large Cap Fund", schemeCount: 48 },
  { category: "Equity", subCategory: "LONG SHORT FUND", schemeCount: 2 },
  { category: "Equity", subCategory: "Mid Cap Fund", schemeCount: 50 },
  { category: "Equity", subCategory: "Multi Cap Fund", schemeCount: 41 },
  { category: "Equity", subCategory: "SBI QUALITY FUND", schemeCount: 1 },
  { category: "Equity", subCategory: "Sectoral / Thematic Fund", schemeCount: 436 },
  { category: "Equity", subCategory: "Small Cap Fund", schemeCount: 39 },
  { category: "Equity", subCategory: "Value Fund", schemeCount: 38 },
  { category: "Equity", subCategory: "YIELD FUND", schemeCount: 3 },
  { category: "Index Funds", subCategory: "Index Funds", schemeCount: 632 },
  { category: "Fund of Fund", subCategory: "Domestic Fund of Funds", schemeCount: 132 },
  { category: "Fund of Fund", subCategory: "International Fund of Funds", schemeCount: 13 },
  { category: "Solution Oriented", subCategory: "Children's Fund", schemeCount: 12 },
  { category: "Solution Oriented", subCategory: "Retirement Fund", schemeCount: 47 },
  { category: "Others", subCategory: "ETFs", schemeCount: 51 },
  { category: "Not Specified", subCategory: "Unknown", schemeCount: 58 }
] as const satisfies readonly {
  category: KodoSchemeCategory;
  subCategory: string;
  schemeCount: number;
}[];

export type KodoSchemeSubCategory = typeof kodoEnabledTaxonomy[number]["subCategory"];

export interface KodoSchemeClassification {
  schemeCategory?: KodoSchemeCategory;
  schemeSubCategory?: KodoSchemeSubCategory;
}

export function getKodoSubCategories(category: KodoSchemeCategory | "All") {
  return kodoEnabledTaxonomy
    .filter((entry) => category === "All" || entry.category === category)
    .map((entry) => entry.subCategory)
    .sort((a, b) => a.localeCompare(b));
}

export function describeKodoCategory(category: KodoSchemeCategory) {
  const entries = kodoEnabledTaxonomy.filter((entry) => entry.category === category);
  const schemeCount = entries.reduce((total, entry) => total + entry.schemeCount, 0);
  return `${entries.length} sub-categories · ${schemeCount} schemes`;
}

export function normalizeKodoCategory(value?: string | null): KodoSchemeCategory | undefined {
  if (!value) return undefined;
  const normalized = normalizeLabel(value);
  return kodoSchemeCategories.find((category) => normalizeLabel(category) === normalized);
}

export function normalizeKodoSubCategory(value?: string | null, category?: KodoSchemeCategory): KodoSchemeSubCategory | undefined {
  if (!value) return undefined;
  const normalized = normalizeLabel(value);
  return kodoEnabledTaxonomy.find((entry) => {
    const categoryMatches = !category || entry.category === category;
    return categoryMatches && normalizeLabel(entry.subCategory) === normalized;
  })?.subCategory;
}

export function inferSchemeTaxonomy(
  instrument: InstrumentType,
  schemeName?: string,
  apiCategory?: string | null,
  apiSubCategory?: string | null
): KodoSchemeClassification {
  if (instrument === "Fixed Deposit" || instrument === "Current Account") return {};

  const inferred = inferFromInstrument(instrument) ?? inferFromSchemeName(schemeName);
  const schemeCategory = normalizeKodoCategory(apiCategory) ?? inferred?.schemeCategory;
  const schemeSubCategory =
    normalizeKodoSubCategory(apiSubCategory, schemeCategory) ??
    (schemeCategory === inferred?.schemeCategory ? inferred?.schemeSubCategory : undefined);

  return { schemeCategory, schemeSubCategory };
}

function inferFromInstrument(instrument: InstrumentType): KodoSchemeClassification | undefined {
  if (instrument === "Liquid Mutual Fund") return { schemeCategory: "Liquid", schemeSubCategory: "Liquid Fund" };
  if (instrument === "Overnight Fund") return { schemeCategory: "Liquid", schemeSubCategory: "Overnight Fund" };
  if (instrument === "Money Market Fund") return { schemeCategory: "Debt", schemeSubCategory: "Money Market Fund" };
  return undefined;
}

function inferFromSchemeName(schemeName?: string): KodoSchemeClassification | undefined {
  const normalized = normalizeLabel(schemeName);
  if (!normalized) return undefined;

  const match = kodoEnabledTaxonomy.find((entry) => normalized.includes(normalizeLabel(entry.subCategory)));
  return match ? { schemeCategory: match.category, schemeSubCategory: match.subCategory } : undefined;
}

function normalizeLabel(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ");
}
