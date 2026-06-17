import { ArrowLeft, ArrowLeftRight, ArrowRight, Check, ChevronDown, Landmark, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildYieldRows,
  calculateFdReturn,
  formatCurrency,
  formatIndianAmountInput,
  formatPercent,
  parseAmount,
  tenureOptions
} from "../data/yieldData";
import {
  fetchLatestFdRates,
  hasFdRatesApi,
  type FdRateApiRow,
  type FdRatesSyncStatus
} from "../data/fdRatesApi";
import {
  fetchLatestMfRates,
  hasMfRatesApi,
  type MfRateApiRow,
  type MfRatesSyncStatus
} from "../data/mfRatesApi";
import type { InstrumentType, YieldComparisonRow } from "../types/yield";
import { Sheet } from "./Shared";

const methodologyCopy =
  "Mutual fund estimates are calculated using historical rolling NAV returns for the selected tenure. Conservative, balanced, and aggressive estimates represent the 25th, 50th, and 75th percentile historical outcomes. Actual returns may vary.";

type SortOrder = "desc" | "asc";
type CategoryFilter = "All" | InstrumentType;
type ProviderFilter = "All" | string;

const categoryOptions: CategoryFilter[] = ["All", "Money Market Fund", "Liquid Mutual Fund", "Overnight Fund", "Fixed Deposit"];
const benchmarkInstruments: InstrumentType[] = ["Money Market Fund", "Liquid Mutual Fund", "Overnight Fund", "Fixed Deposit"];

export function YieldVisualisation({ onBack }: { onBack?: () => void }) {
  const [amountInput, setAmountInput] = useState("1,00,000");
  const [selectedTenure, setSelectedTenure] = useState(30);
  const [customTenure, setCustomTenure] = useState("120");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [activeRow, setActiveRow] = useState<YieldComparisonRow | null>(null);
  const [liveFdRows, setLiveFdRows] = useState<YieldComparisonRow[]>([]);
  const [liveMfRows, setLiveMfRows] = useState<YieldComparisonRow[]>([]);
  const [syncStatus, setSyncStatus] = useState<FdRatesSyncStatus | null>(null);
  const [mfSyncStatus, setMfSyncStatus] = useState<MfRatesSyncStatus | null>(null);
  const [fdApiError, setFdApiError] = useState<string | null>(hasFdRatesApi() ? null : "FD rates API not configured");
  const [mfApiError, setMfApiError] = useState<string | null>(hasMfRatesApi() ? null : "MF rates API not configured");

  const principal = parseAmount(amountInput);
  const tenureDays = selectedTenure === -1 ? Math.max(1, Number(customTenure) || 1) : selectedTenure;
  const rows = useMemo(() => buildYieldRows(principal, tenureDays), [principal, tenureDays]);

  const mockFdRows = rows.filter((row) => row.instrument === "Fixed Deposit");
  const fdRows = liveFdRows.length ? liveFdRows : mockFdRows;
  const mockMfRows = rows.filter((row) => isMutualFundInstrument(row.instrument));
  const mfRows = liveMfRows.length ? liveMfRows : mockMfRows;
  const deploymentRows = useMemo(
    () => [...mfRows, ...fdRows].filter((row) => row.available),
    [mfRows, fdRows]
  );
  const providerOptions = useMemo(
    () => Array.from(new Set(deploymentRows.map((row) => row.provider))).sort(),
    [deploymentRows]
  );
  const filteredRows = useMemo(() => {
    return deploymentRows
      .filter((row) => categoryFilter === "All" || row.instrument === categoryFilter)
      .filter((row) => providerFilter === "All" || row.provider === providerFilter)
      .sort((a, b) => sortDeploymentRows(a, b, sortOrder));
  }, [deploymentRows, categoryFilter, providerFilter, sortOrder]);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const benchmarkColumns = useMemo(() => buildBenchmarkColumns(deploymentRows), [deploymentRows]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, providerFilter, sortOrder, amountInput, selectedTenure, customTenure]);

  useEffect(() => {
    if (providerFilter !== "All" && !providerOptions.includes(providerFilter)) {
      setProviderFilter("All");
    }
  }, [providerFilter, providerOptions]);

  const loadLiveFdRows = useCallback(async () => {
    if (!hasFdRatesApi()) return;
    const response = await fetchLatestFdRates(principal, tenureDays);
    setSyncStatus(response.sync);
    setLiveFdRows(response.rows.map((row) => mapApiFdRow(row, principal, tenureDays)));
    setFdApiError(null);
  }, [principal, tenureDays]);

  const loadLiveMfRows = useCallback(async () => {
    if (!hasMfRatesApi()) return;
    const response = await fetchLatestMfRates(principal, tenureDays);
    setMfSyncStatus(response.sync);
    setLiveMfRows(response.rows.map((row) => mapApiMfRow(row, principal, tenureDays)));
    setMfApiError(null);
  }, [principal, tenureDays]);

  useEffect(() => {
    let cancelled = false;
    if (!hasFdRatesApi()) return;
    fetchLatestFdRates(principal, tenureDays)
      .then((response) => {
        if (cancelled) return;
        setSyncStatus(response.sync);
        setLiveFdRows(response.rows.map((row) => mapApiFdRow(row, principal, tenureDays)));
        setFdApiError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLiveFdRows([]);
        setFdApiError(error instanceof Error ? error.message : "FD rates API unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [principal, tenureDays]);

  useEffect(() => {
    let cancelled = false;
    if (!hasMfRatesApi()) return;
    fetchLatestMfRates(principal, tenureDays)
      .then((response) => {
        if (cancelled) return;
        setMfSyncStatus(response.sync);
        setLiveMfRows(response.rows.map((row) => mapApiMfRow(row, principal, tenureDays)));
        setMfApiError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLiveMfRows([]);
        setMfApiError(error instanceof Error ? error.message : "MF rates API unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [principal, tenureDays]);

  const handleCalculate = async () => {
    await Promise.allSettled([loadLiveFdRows(), loadLiveMfRows()]);
  };

  return (
    <div className="yield-final-page">
      <header className="yield-final-hero">
        <div className="yield-title-row">
          <button className="yield-back-button" aria-label="Back to explore funds" onClick={onBack}>
            <ArrowLeft size={28} />
          </button>
          <div>
            <h1>Compare yield</h1>
            <p>Compare returns across FDs, liquid funds, and other treasury instruments</p>
          </div>
        </div>
        <div className="yield-final-controls">
          <label className="outline-field">
            <span>Amount</span>
            <input
              value={`₹${amountInput}`}
              onChange={(event) => setAmountInput(formatIndianAmountInput(parseAmount(event.target.value)))}
              aria-label="Amount"
            />
          </label>
          <label className="outline-field">
            <span>Tenure</span>
            <select value={selectedTenure} onChange={(event) => setSelectedTenure(Number(event.target.value))}>
              {tenureOptions.map((option) => (
                <option key={option.days} value={option.days}>{option.label}</option>
              ))}
              <option value={-1}>Custom</option>
            </select>
          </label>
          {selectedTenure === -1 && (
            <label className="outline-field compact">
              <span>Days</span>
              <input value={customTenure} onChange={(event) => setCustomTenure(event.target.value.replace(/\D/g, ""))} />
            </label>
          )}
          <button className="yield-calculate-button" onClick={handleCalculate}>Calculate</button>
        </div>
      </header>

      <section className="yield-category-summary">
        <h2>Top funds by category</h2>
        <div className="yield-benchmark-card">
          <table>
            <thead>
              <tr>
                <th />
                {benchmarkColumns.map((column) => (
                  <th key={column.instrument}>
                    <span>{displayInstrument(column.instrument)}</span>
                    <small>{isMutualFundInstrument(column.instrument) ? `Last ${tenureDays} days` : "-"}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Max returns</th>
                {benchmarkColumns.map((column) => <BenchmarkCell key={`${column.instrument}-max`} row={column.max} />)}
              </tr>
              <tr>
                <th>Min returns</th>
                {benchmarkColumns.map((column) => <BenchmarkCell key={`${column.instrument}-min`} row={column.min} />)}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="yield-deployment-section">
        <div className="yield-table-heading">
          <h2>{String(filteredRows.length).padStart(2, "0")} deployment options</h2>
          <div className="yield-final-filters">
            <SelectMenu
              label="Category"
              value={categoryFilter}
              options={categoryOptions}
              getLabel={displayCategoryFilter}
              onChange={(value) => setCategoryFilter(value)}
            />
            <SelectMenu
              label="AMC"
              value={providerFilter}
              options={["All", ...providerOptions]}
              getLabel={(value) => value}
              onChange={(value) => setProviderFilter(value)}
            />
          </div>
        </div>

        <div className="yield-final-table-card">
          <table className="yield-final-table">
            <thead>
              <tr>
                <th>Fund Name</th>
                <th>Instrument Type</th>
                <th>
                  <button onClick={() => setSortOrder((current) => current === "asc" ? "desc" : "asc")}>
                    Annualised returns <ArrowLeftRight size={15} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length ? (
                pageRows.map((row) => (
                  <DeploymentOptionRow key={row.id} row={row} tenureDays={tenureDays} onClick={() => setActiveRow(row)} />
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="yield-empty-row">No options match the selected filters</td>
                </tr>
              )}
            </tbody>
          </table>
          <footer className="yield-pagination">
            <button className="yield-page-size">10 Per Page <ChevronDown size={16} /></button>
            <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page">
              <ArrowLeft size={22} />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} aria-label="Next page">
              <ArrowRight size={22} />
            </button>
          </footer>
        </div>
        <p className="yield-methodology">
          Mutual fund rows use {liveMfRows.length ? "AMFI NAV history" : "mock fallback NAV history"}. FD rows use {liveFdRows.length ? "scraper output" : "mock fallback rates"}.
          {" "}{syncStatusLabel(syncStatus, fdApiError)} · {mfSyncStatusLabel(mfSyncStatus, mfApiError)}
        </p>
      </section>

      {activeRow && <YieldDetailSheet row={activeRow} onClose={() => setActiveRow(null)} />}
    </div>
  );
}

function DeploymentOptionRow({ row, tenureDays, onClick }: { row: YieldComparisonRow; tenureDays: number; onClick: () => void }) {
  const isMfRow = isMutualFundInstrument(row.instrument);

  return (
    <tr onClick={onClick}>
      <td>
        <div className="yield-fund-name-cell">
          <YieldIcon row={row} />
          <div>
            <strong>{getDisplayName(row)}</strong>
            <span>{row.provider}</span>
          </div>
        </div>
      </td>
      <td>
        <span className="yield-instrument-pill">{displayInstrument(row.instrument)}</span>
      </td>
      <td className="align-right">
        <div className="yield-rate-stack">
          <strong>{formatAnnualisedValue(row)}</strong>
          <span>{isMfRow ? `Last ${tenureDays} days` : "-"}</span>
        </div>
      </td>
    </tr>
  );
}

interface BenchmarkColumn {
  instrument: InstrumentType;
  min?: YieldComparisonRow;
  max?: YieldComparisonRow;
}

function buildBenchmarkColumns(rows: YieldComparisonRow[]): BenchmarkColumn[] {
  return benchmarkInstruments.map((instrument) => {
    const sourceRows = rows
      .filter((row) => row.instrument === instrument && row.available)
      .sort((a, b) => getRankingAnnualisedReturn(a) - getRankingAnnualisedReturn(b));
    return {
      instrument,
      min: sourceRows[0],
      max: sourceRows[sourceRows.length - 1]
    };
  });
}

function BenchmarkCell({ row }: { row?: YieldComparisonRow }) {
  if (!row) {
    return (
      <td>
        <strong>-</strong>
        <span>Unavailable</span>
      </td>
    );
  }

  return (
    <td>
      <strong>{formatAnnualisedValue(row)}</strong>
      <span>{row.instrument === "Fixed Deposit" ? row.provider : cleanFundName(row.provider || row.name)}</span>
    </td>
  );
}

function SelectMenu<T extends string>({
  label,
  value,
  options,
  getLabel,
  onChange
}: {
  label: string;
  value: T;
  options: T[];
  getLabel: (value: T) => string;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="yield-select-menu" ref={menuRef}>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        {label}
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="yield-select-options">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={option === value ? "selected" : ""}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              <span>{getLabel(option)}</span>
              {option === value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExploreFunds({ onCompareYield }: { onCompareYield: () => void }) {
  const cards = exploreCards;

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explore funds</h1>
        <button className="explore-compare-button" onClick={onCompareYield}>Compare yield</button>
      </div>
      <div className="explore-toolbar">
        <label className="explore-search">
          <Search size={18} />
          <input placeholder="Search funds by name" />
        </label>
        <div className="explore-filters">
          <button>Scheme type <ChevronDown size={16} /></button>
          <button>AMC <ChevronDown size={16} /></button>
          <button>Risk level <ChevronDown size={16} /></button>
        </div>
      </div>
      <div className="explore-card-grid">
        {cards.map((card) => (
          <article className="explore-fund-card" key={card.id}>
            <div className="explore-card-title">
              <YieldIcon row={card.row} />
              <div>
                <h2>{card.name}</h2>
                <span>Debt</span>
              </div>
            </div>
            <div className="explore-return">
              <span>Annualized Return</span>
              <strong>7.8%</strong>
              <button>1Y <ChevronDown size={13} /></button>
            </div>
            <div className="explore-card-metrics">
              <div>
                <span>Risk</span>
                <strong>Moderate</strong>
              </div>
              <div>
                <span>AUM</span>
                <strong>₹14,200 Cr</strong>
              </div>
            </div>
            <div className="explore-card-actions">
              <button>Know more</button>
              <button>Invest Now</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function sortDeploymentRows(a: YieldComparisonRow, b: YieldComparisonRow, sortOrder: SortOrder) {
  const left = getRankingAnnualisedReturn(a);
  const right = getRankingAnnualisedReturn(b);
  const delta = left - right;
  return sortOrder === "asc" ? delta : -delta;
}

function getRankingAnnualisedReturn(row: YieldComparisonRow) {
  return row.annualisedReturn ?? 0;
}

function mapApiFdRow(row: FdRateApiRow, principal: number, tenureDays: number): YieldComparisonRow {
  const annualRate = row.rate_pa / 100;
  const estimatedReturn = calculateFdReturn(principal, annualRate, tenureDays);
  const periodReturn = annualRate * tenureDays / 365;

  return {
    id: `live-fd-${row.bank_id}`,
    instrument: "Fixed Deposit",
    name: `${row.bank_name} FD`,
    provider: row.bank_name,
    returnType: "Fixed",
    selectedTenureDays: tenureDays,
    periodReturnLabel: formatPercent(periodReturn),
    estimatedReturnLabel: row.estimated_return_label || formatCurrency(estimatedReturn),
    annualisedReturnLabel: row.annualised_return_label || `${formatPercent(annualRate)} p.a.`,
    liquidity: "Premature withdrawal penalty applicable",
    minimumInvestment: 0,
    available: true,
    dataSufficient: true,
    lastUpdated: formatTimestamp(row.fetched_at) ?? row.last_sync_status ?? "Scraper output",
    periodReturn,
    estimatedReturn: row.estimated_return ?? estimatedReturn,
    annualisedReturn: annualRate,
    sourceUrl: row.source_url,
    fetchedAt: row.fetched_at,
    effectiveFrom: row.effective_from,
    amountSlab: row.amount_slab,
    tenureLabel: row.tenure_label,
    lastSyncStatus: row.last_sync_status,
    isLive: true
  };
}

function mapApiMfRow(row: MfRateApiRow, principal: number, tenureDays: number): YieldComparisonRow {
  return {
    id: `amfi-mf-${row.scheme_code}`,
    instrument: row.instrument,
    name: row.scheme_name,
    provider: row.amc,
    returnType: "Indicative Range",
    selectedTenureDays: tenureDays,
    periodReturnLabel: row.period_return_range_label ?? row.period_return_label ?? "Insufficient NAV history",
    estimatedReturnLabel: row.estimated_return_range_label ?? row.estimated_return_label,
    annualisedReturnLabel: row.annualised_return_label,
    liquidity: row.settlement,
    minimumInvestment: row.minimum_investment,
    available: row.data_sufficient && principal >= row.minimum_investment,
    dataSufficient: row.data_sufficient,
    dataMessage: row.data_message,
    lastUpdated: row.nav_date ?? row.last_sync_status ?? "AMFI NAV",
    periodReturn: row.period_return,
    estimatedReturn: row.estimated_return,
    annualisedReturn: row.annualised_return,
    scenarios: row.scenarios,
    estimatedScenarios: row.estimated_scenarios,
    annualisedScenarios: row.annualised_scenarios,
    sourceUrl: row.source_url,
    schemeCode: row.scheme_code,
    navDate: row.nav_date,
    navValue: row.nav_value,
    dataSource: "AMFI",
    historyPoints: row.history_points,
    lastSyncStatus: row.last_sync_status,
    isLive: true
  };
}

function syncStatusLabel(status: FdRatesSyncStatus | null, error: string | null) {
  if (status?.status === "running") return "Syncing FD rates";
  if (status?.status === "partial_success") return `Partial FD sync`;
  if (status?.status === "failed") return "FD sync failed";
  if (status?.finished_at) return `FD synced ${formatTimestamp(status.finished_at)}`;
  if (error) return "Using mock FD rates";
  return "Live FD sync ready";
}

function mfSyncStatusLabel(status: MfRatesSyncStatus | null, error: string | null) {
  if (status?.status === "running") return "Syncing AMFI NAVs";
  if (status?.status === "failed") return "AMFI sync failed";
  if (status?.row_count) return `AMFI ${status.row_count} schemes`;
  if (status?.finished_at) return `AMFI synced ${formatTimestamp(status.finished_at)}`;
  if (error) return "Using mock MF data";
  return "AMFI sync ready";
}

function formatTimestamp(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function isMutualFundInstrument(instrument: InstrumentType) {
  return instrument === "Money Market Fund" || instrument === "Liquid Mutual Fund" || instrument === "Overnight Fund";
}

function displayInstrument(instrument: InstrumentType) {
  if (instrument === "Liquid Mutual Fund") return "Liquid funds";
  if (instrument === "Money Market Fund") return "Money Market fund";
  if (instrument === "Overnight Fund") return "Overnight funds";
  if (instrument === "Fixed Deposit") return "Fixed deposit";
  return "Current account";
}

function displayCategoryFilter(value: CategoryFilter) {
  return value === "All" ? "All" : displayInstrument(value);
}

function getDisplayName(row: YieldComparisonRow) {
  if (row.instrument === "Fixed Deposit") return `${row.provider} FD`;
  return cleanFundName(row.name);
}

function cleanFundName(value: string) {
  return value.replace(/\s*-\s*Direct\s+Growth/i, "").replace(/\s*Direct\s+Growth/i, "");
}

function formatAnnualisedValue(row: YieldComparisonRow) {
  if (row.annualisedReturn === undefined) return "Not available";
  return `~${formatPercent(row.annualisedReturn)}`;
}

function YieldIcon({ row }: { row: YieldComparisonRow }) {
  const key = row.provider || row.name;
  const initials = key
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (row.instrument === "Fixed Deposit") {
    return <span className="yield-logo yield-logo-bank"><Landmark size={18} /></span>;
  }
  if (row.instrument === "Overnight Fund") {
    return <span className="yield-logo yield-logo-blue">{initials.slice(0, 2)}</span>;
  }
  if (row.instrument === "Liquid Mutual Fund") {
    return <span className="yield-logo yield-logo-magenta">{initials.slice(0, 2)}</span>;
  }
  return <span className="yield-logo yield-logo-red">{initials.slice(0, 2)}</span>;
}

const exploreRows = buildYieldRows(100000, 30).filter((row) => row.instrument !== "Current Account").slice(0, 6);
const exploreCards = exploreRows.map((row, index) => ({
  id: `explore-card-${index}`,
  row,
  name: index % 2 === 0 ? "HDFC Corporate Bond Fund" : cleanFundName(row.name)
}));

function YieldDetailSheet({ row, onClose }: { row: YieldComparisonRow; onClose: () => void }) {
  return (
    <Sheet width={650} onClose={onClose}>
      <div className="sheet-header">
        <div className="sheet-fund-title">
          <YieldIcon row={row} />
          <div>
            <h2>{getDisplayName(row)}</h2>
            <span>{row.provider} · {displayInstrument(row.instrument)}</span>
          </div>
        </div>
      </div>
      <div className="sheet-body">
        <div className="amount-hero">
          <span>Estimated return for selected tenure</span>
          <strong>{row.estimatedReturnLabel}</strong>
        </div>
        <div className="detail-grid">
          <Detail label="Return Type" value={row.returnType} />
          <Detail label="Selected Tenure" value={`${row.selectedTenureDays} days`} />
          <Detail label="Period Return" value={row.periodReturnLabel} />
          <Detail label="Annualised Return" value={row.annualisedReturnLabel} />
          <Detail label="Liquidity" value={row.liquidity} />
          <Detail label="Last Updated" value={row.lastUpdated} />
          {row.schemeCode && <Detail label="AMFI Scheme Code" value={row.schemeCode} />}
          {row.navDate && <Detail label="Latest NAV Date" value={row.navDate} />}
          {row.navValue !== undefined && <Detail label="Latest NAV" value={`₹${row.navValue.toFixed(4)}`} />}
          {row.historyPoints !== undefined && <Detail label="History Coverage" value={`${row.historyPoints} NAV points`} />}
          {row.tenureLabel && <Detail label="Scraped Tenure" value={row.tenureLabel} />}
          {row.amountSlab && <Detail label="Amount Slab" value={row.amountSlab} />}
          {row.effectiveFrom && <Detail label="Effective From" value={row.effectiveFrom} />}
          {row.lastSyncStatus && <Detail label="Sync Status" value={row.lastSyncStatus.replaceAll("_", " ")} />}
        </div>
        {row.sourceUrl && (
          <a className="yield-source-link" href={row.sourceUrl} target="_blank" rel="noreferrer">
            View scraped source
          </a>
        )}
        {row.scenarios && row.estimatedScenarios && <ScenarioTable scenarios={row.scenarios} estimatedScenarios={row.estimatedScenarios} />}
        <p className="yield-methodology sheet-copy">
          {row.returnType === "Indicative Range"
            ? methodologyCopy
            : "Fixed deposits use the selected amount, quoted annual FD rate, and selected tenure."}
        </p>
        <div className="sheet-actions">
          <button className="figma-secondary" onClick={onClose}>Close</button>
          <button className="figma-primary" disabled>Proceed later</button>
        </div>
      </div>
    </Sheet>
  );
}

function ScenarioTable({ scenarios, estimatedScenarios }: Pick<YieldComparisonRow, "scenarios" | "estimatedScenarios">) {
  if (!scenarios || !estimatedScenarios) return null;

  return (
    <div className="voucher-table-wrap">
      <table className="voucher-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Period Return</th>
            <th className="align-right">Estimated Return</th>
          </tr>
        </thead>
        <tbody>
          <ScenarioRow label="Conservative estimate" value={scenarios.conservative} amount={estimatedScenarios.conservative} />
          <ScenarioRow label="Balanced estimate" value={scenarios.balanced} amount={estimatedScenarios.balanced} />
          <ScenarioRow label="Aggressive estimate" value={scenarios.aggressive} amount={estimatedScenarios.aggressive} />
        </tbody>
      </table>
    </div>
  );
}

function ScenarioRow({ label, value, amount }: { label: string; value: number; amount: number }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{(value * 100).toFixed(2)}%</td>
      <td className="align-right">{formatCurrency(amount)}</td>
    </tr>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
