export interface FdRateApiRow {
  bank_id: string;
  bank_name: string;
  rate_pa: number;
  annualised_return_label: string;
  estimated_return: number;
  estimated_return_label: string;
  tenure_label?: string;
  min_days?: number;
  max_days?: number;
  amount_slab?: string;
  effective_from?: string;
  fetched_at?: string;
  source_url?: string;
  last_sync_status?: string;
}

export interface FdRatesSyncStatus {
  status: "idle" | "running" | "success" | "partial_success" | "failed";
  started_at?: string | null;
  finished_at?: string | null;
  success_count: number;
  failure_count: number;
  row_count: number;
  message: string;
  banks: string[];
}

export interface LatestFdRatesResponse {
  rows: FdRateApiRow[];
  sync: FdRatesSyncStatus;
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const apiBaseUrl = (configuredApiBaseUrl || (import.meta.env.DEV ? "http://127.0.0.1:8000" : undefined))?.replace(/\/$/, "");
const configuredStaticRatesBaseUrl = import.meta.env.VITE_FD_RATES_DATA_URL as string | undefined;
const staticRatesBaseUrl = (configuredStaticRatesBaseUrl || `${import.meta.env.BASE_URL}data/fd-rates/latest`).replace(/\/$/, "");

type RawFdRateRow = Record<string, unknown>;
type RawRunReport = {
  started_at?: string | null;
  finished_at?: string | null;
  success_count?: number;
  failure_count?: number;
  skipped_count?: number;
  row_count?: number;
  banks?: Array<{ bank_id?: string; bank_name?: string; status?: string }> | string[];
};

export function hasFdRatesApi() {
  return Boolean(apiBaseUrl || staticRatesBaseUrl);
}

export async function fetchLatestFdRates(amountInr: number, tenureDays: number) {
  const normalizedAmount = Math.max(0, Math.round(amountInr));
  const normalizedTenure = Math.max(1, Math.round(tenureDays));
  let apiError: unknown;

  if (apiBaseUrl) {
    try {
      const url = new URL(`${apiBaseUrl}/api/fd-rates/latest`);
      url.searchParams.set("amount_inr", String(normalizedAmount));
      url.searchParams.set("tenure_days", String(normalizedTenure));
      return await fetchJson<LatestFdRatesResponse>(url.toString());
    } catch (error) {
      apiError = error;
    }
  }

  try {
    return await fetchStaticFdRates(normalizedAmount, normalizedTenure);
  } catch (staticError) {
    if (apiError instanceof Error) throw apiError;
    if (staticError instanceof Error) throw staticError;
    throw new Error("FD rates data unavailable");
  }
}

export async function fetchFdRatesSyncStatus() {
  return fetchJson<FdRatesSyncStatus>(`${requireApiBaseUrl()}/api/fd-rates/sync/status`);
}

export async function triggerFdRatesSync() {
  return fetchJson<FdRatesSyncStatus>(`${requireApiBaseUrl()}/api/fd-rates/sync`, { method: "POST" });
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  if (!response.ok) {
    throw new Error(`FD rates API returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function requireApiBaseUrl() {
  if (!apiBaseUrl) throw new Error("VITE_API_BASE_URL is not configured");
  return apiBaseUrl;
}

async function fetchStaticFdRates(amountInr: number, tenureDays: number): Promise<LatestFdRatesResponse> {
  const [baseRows, finalRows, report] = await Promise.all([
    fetchStaticJson<RawFdRateRow[]>(`${staticRatesBaseUrl}/fd_rates.json`),
    fetchStaticJson<RawFdRateRow[]>(`${staticRatesBaseUrl}/fd_rates_final.json`),
    fetchStaticJson<RawRunReport>(`${staticRatesBaseUrl}/run_report.json`)
  ]);
  const rows = mergeRows(baseRows ?? [], finalRows ?? []);
  if (!rows.length) throw new Error("No bundled FD scraper rows found");
  const sync = reportToSyncStatus(report, rows.length);
  return {
    rows: frontendRateRows(rows, amountInr, tenureDays, sync.status),
    sync
  };
}

async function fetchStaticJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`FD rates data returned ${response.status}`);
  return response.json() as Promise<T>;
}

function mergeRows(baseRows: RawFdRateRow[], finalRows: RawFdRateRow[]) {
  const merged = new Map<string, RawFdRateRow>();
  for (const row of baseRows) merged.set(rowKey(row), row);
  for (const row of finalRows) merged.set(rowKey(row), row);
  return Array.from(merged.values());
}

function frontendRateRows(rows: RawFdRateRow[], amountInr: number, tenureDays: number, syncStatus: FdRatesSyncStatus["status"]) {
  return selectBestRates(rows, amountInr, tenureDays).map((row) => {
    const rate = rowRate(row);
    const estimatedReturn = amountInr * (rate / 100) * tenureDays / 365;
    const [minDays, maxDays] = tenureBounds(row);
    const bankId = String(firstValue(row, "bank_id", "bankId") ?? "");
    const bankName = String(firstValue(row, "bank_name", "bankName") ?? bankId);

    return {
      bank_id: bankId,
      bank_name: bankName,
      rate_pa: rate,
      annualised_return_label: `${rate.toFixed(2)}% p.a.`,
      estimated_return: Math.round(estimatedReturn),
      estimated_return_label: formatInr(estimatedReturn),
      tenure_label: stringValue(firstValue(row, "tenure_label", "tenureLabel")),
      min_days: minDays ?? undefined,
      max_days: maxDays ?? undefined,
      amount_slab: stringValue(firstValue(row, "llm_amount_slab_normalized", "amount_slab", "amountSlab")),
      effective_from: stringValue(firstValue(row, "effective_from", "effectiveDate")),
      fetched_at: stringValue(firstValue(row, "fetched_at", "retrievedAt")),
      source_url: stringValue(firstValue(row, "source_url", "sourceUrl")),
      last_sync_status: syncStatus
    };
  });
}

function selectBestRates(rows: RawFdRateRow[], amountInr: number, tenureDays: number) {
  const bestByBank = new Map<string, RawFdRateRow>();
  for (const row of rows) {
    if (!rateApplies(row) || !tenureApplies(row, tenureDays) || !amountApplies(row, amountInr)) continue;
    const bankId = String(firstValue(row, "bank_id", "bankId", "bank_name", "bankName") ?? "");
    if (!bankId) continue;
    const current = bestByBank.get(bankId);
    if (!current || rowRate(row) > rowRate(current)) bestByBank.set(bankId, row);
  }
  return Array.from(bestByBank.values()).sort((a, b) => {
    const rateDelta = rowRate(b) - rowRate(a);
    if (rateDelta !== 0) return rateDelta;
    return String(firstValue(a, "bank_name", "bankName") ?? "").localeCompare(String(firstValue(b, "bank_name", "bankName") ?? ""));
  });
}

function rowKey(row: RawFdRateRow) {
  const [minDays, maxDays] = tenureBounds(row);
  return [
    firstValue(row, "bank_id", "bankId"),
    firstValue(row, "tenure_label", "tenureLabel"),
    minDays,
    maxDays,
    firstValue(row, "amount_slab", "amountSlab"),
    rowRate(row)
  ].join("|");
}

function tenureApplies(row: RawFdRateRow, tenureDays: number) {
  const [minDays, maxDays] = tenureBounds(row);
  if (minDays == null || maxDays == null) return true;
  return minDays <= tenureDays && tenureDays <= maxDays;
}

function tenureBounds(row: RawFdRateRow): [number | null, number | null] {
  const parsed = tenureBoundsFromLabel(firstValue(row, "tenure_label", "tenureLabel"));
  if (parsed[0] !== null || parsed[1] !== null) return parsed;

  return [
    intValue(firstValue(row, "min_days", "llm_tenure_min_days", "tenorMinDays")),
    intValue(firstValue(row, "max_days", "llm_tenure_max_days", "tenorMaxDays"))
  ];
}

function tenureBoundsFromLabel(value: unknown): [number | null, number | null] {
  if (typeof value !== "string" || !value.trim()) return [null, null];

  const text = value.toLowerCase().replace(/[–—]/g, "-");
  if (text.includes("less than")) {
    const [before, after] = text.split("less than", 2);
    const minDays = durationSegmentToDays(before);
    const maxDays = durationSegmentToDays(after);
    if (minDays !== null || maxDays !== null) return [minDays, maxDays];
  }

  const parts = text.split(/\s+to\s+|\s*-\s*/, 2);
  if (parts.length === 2) {
    const [before, after] = parts;
    let minDays = durationSegmentToDays(before);
    const maxDays = durationSegmentToDays(after);
    if (minDays === null) {
      const startAmount = firstNumber(before);
      const endUnit = firstDurationUnit(after);
      if (startAmount !== null && endUnit !== null) {
        minDays = durationToDays(startAmount, inferMissingStartUnit(startAmount, endUnit));
      }
    }
    if (minDays !== null || maxDays !== null) return [minDays, maxDays];
  }

  const rangeMatch = text.match(
    /^>?\s*(\d+(?:\.\d+)?)\s*(days?|months?|years?|yrs?|yr|y)?\s*(?:to|-)\s*<?\s*(\d+(?:\.\d+)?)\s*(days?|months?|years?|yrs?|yr|y)/
  );
  if (rangeMatch) {
    const startUnit = rangeMatch[2] || inferMissingStartUnit(rangeMatch[1], rangeMatch[4]);
    return [durationToDays(rangeMatch[1], startUnit), durationToDays(rangeMatch[3], rangeMatch[4])];
  }

  const exactDays = durationSegmentToDays(text);
  if (exactDays !== null) return [exactDays, exactDays];
  return [null, null];
}

function durationSegmentToDays(segment: string) {
  let total = 0;
  const matches = segment.matchAll(/(\d+(?:\.\d+)?)\s*(days?|months?|years?|yrs?|yr|y)/g);
  for (const match of matches) total += durationToDays(match[1], match[2]);
  return total || null;
}

function durationToDays(amount: string, unit: string) {
  const value = Number(amount);
  if (unit.startsWith("year") || unit.startsWith("yr") || unit === "y") return Math.trunc(value * 365);
  if (unit.startsWith("month")) return Math.trunc(value * 30);
  return Math.trunc(value);
}

function inferMissingStartUnit(amount: string, endUnit: string) {
  if ((endUnit.startsWith("year") || endUnit.startsWith("yr") || endUnit === "y") && Number(amount) > 31) {
    return "days";
  }
  return endUnit;
}

function firstNumber(text: string) {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : null;
}

function firstDurationUnit(text: string) {
  const match = text.match(/(days?|months?|years?|yrs?|yr|y)/);
  return match ? match[1] : null;
}

function amountApplies(row: RawFdRateRow, amountInr: number) {
  const minAmount = intValue(firstValue(row, "llm_amount_min_inr"));
  const maxAmount = intValue(firstValue(row, "llm_amount_max_inr"));
  if (minAmount == null && maxAmount == null) return true;
  if (minAmount != null && amountInr < minAmount) return false;
  if (maxAmount != null && amountInr > maxAmount) return false;
  return true;
}

function rateApplies(row: RawFdRateRow) {
  const rate = rowRate(row);
  return rate > 0 && rate <= 12;
}

function rowRate(row: RawFdRateRow) {
  const value = firstValue(row, "rate_pa", "ratePercent");
  const rate = Number(value);
  return Number.isFinite(rate) ? rate : 0;
}

function reportToSyncStatus(report: RawRunReport | null, fallbackRowCount: number): FdRatesSyncStatus {
  const successCount = Number(report?.success_count ?? 0);
  const failureCount = Number(report?.failure_count ?? 0);
  const skippedCount = Number(report?.skipped_count ?? 0);
  const status: FdRatesSyncStatus["status"] = successCount && failureCount ? "partial_success" : successCount ? "success" : failureCount ? "failed" : "idle";
  return {
    status,
    started_at: report?.started_at ?? null,
    finished_at: report?.finished_at ?? null,
    success_count: successCount,
    failure_count: failureCount,
    row_count: Number(report?.row_count ?? fallbackRowCount),
    message: statusMessage(status, successCount, failureCount, skippedCount),
    banks: (report?.banks ?? []).map((bank) => (typeof bank === "string" ? bank : bank.bank_name || bank.bank_id || "")).filter(Boolean)
  };
}

function statusMessage(status: FdRatesSyncStatus["status"], successCount: number, failureCount: number, skippedCount: number) {
  if (status === "partial_success") return `Synced ${successCount} bank(s), ${failureCount} failed, ${skippedCount} skipped`;
  if (status === "success") return `Synced ${successCount} bank(s)${skippedCount ? `, ${skippedCount} skipped` : ""}`;
  if (status === "failed") return `${failureCount} bank(s) failed`;
  if (skippedCount) return `${skippedCount} bank(s) skipped`;
  return "Using bundled FD scraper output";
}

function firstValue(row: RawFdRateRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return undefined;
}

function intValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(value));
}
