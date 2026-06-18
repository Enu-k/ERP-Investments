import { ArrowLeft, ArrowLeftRight, ArrowRight, Check, ChevronDown, Landmark, Search } from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  inferSchemeTaxonomy,
  vrEnabledTaxonomy,
  type VrSchemeSubCategory
} from "../data/vrTaxonomy";
import type { InstrumentType, YieldComparisonRow } from "../types/yield";
import { Sheet } from "./Shared";

const methodologyCopy =
  "Mutual fund estimates are calculated using historical rolling NAV returns for the selected tenure. Conservative, balanced, and aggressive estimates represent the 25th, 50th, and 75th percentile historical outcomes. Actual returns may vary.";

type SortOrder = "desc" | "asc";
type CategoryOption = "Fixed Deposit" | VrSchemeSubCategory;
interface BenchmarkCategoryDefinition {
  label: string;
  description: string;
  schemeSubCategory?: VrSchemeSubCategory;
  instrument?: InstrumentType;
  dummy?: {
    min: BenchmarkDisplayRow;
    max: BenchmarkDisplayRow;
  };
}

const fixedDepositCategory = "Fixed Deposit" as const;
const mutualFundCategoryOptions = vrEnabledTaxonomy.map((entry) => entry.subCategory) as VrSchemeSubCategory[];
const categoryOptions: CategoryOption[] = [fixedDepositCategory, ...mutualFundCategoryOptions];
const defaultBenchmarkCategories: CategoryOption[] = [fixedDepositCategory, "Liquid", "Overnight", "Money Market"];
const defaultDeploymentCategories: CategoryOption[] = [...categoryOptions];

const subCategoryBenchmarkFallbacks: Partial<Record<VrSchemeSubCategory, { dummy: { min: BenchmarkDisplayRow; max: BenchmarkDisplayRow } }>> = {
  "Dynamic Bond": {
    dummy: {
      max: { annualisedReturn: 0.0785, label: "HDFC Dynamic Bond Fund" },
      min: { annualisedReturn: 0.0615, label: "ICICI Medium Duration Fund" }
    }
  },
  "Medium Duration": {
    dummy: {
      max: { annualisedReturn: 0.0785, label: "HDFC Dynamic Bond Fund" },
      min: { annualisedReturn: 0.0615, label: "ICICI Medium Duration Fund" }
    }
  },
  "Medium to Long Duration": {
    dummy: {
      max: { annualisedReturn: 0.0785, label: "HDFC Dynamic Bond Fund" },
      min: { annualisedReturn: 0.0615, label: "ICICI Medium Duration Fund" }
    }
  },
  Contra: {
    dummy: {
      max: { annualisedReturn: 0.142, label: "Nippon India Large & Mid Cap Fund" },
      min: { annualisedReturn: 0.089, label: "UTI Nifty Index Fund" }
    }
  },
  ELSS: {
    dummy: {
      max: { annualisedReturn: 0.142, label: "Nippon India Large & Mid Cap Fund" },
      min: { annualisedReturn: 0.089, label: "UTI Nifty Index Fund" }
    }
  },
  "Large & MidCap": {
    dummy: {
      max: { annualisedReturn: 0.142, label: "Nippon India Large & Mid Cap Fund" },
      min: { annualisedReturn: 0.089, label: "UTI Nifty Index Fund" }
    }
  },
  "Sectoral / Thematic": {
    dummy: {
      max: { annualisedReturn: 0.142, label: "Nippon India Large & Mid Cap Fund" },
      min: { annualisedReturn: 0.089, label: "UTI Nifty Index Fund" }
    }
  },
  "Aggressive Hybrid": {
    dummy: {
      max: { annualisedReturn: 0.1075, label: "ICICI Balanced Advantage Fund" },
      min: { annualisedReturn: 0.0735, label: "SBI Conservative Hybrid Fund" }
    }
  },
  "Conservative Hybrid": {
    dummy: {
      max: { annualisedReturn: 0.1075, label: "ICICI Balanced Advantage Fund" },
      min: { annualisedReturn: 0.0735, label: "SBI Conservative Hybrid Fund" }
    }
  },
  "Dynamic Asset Allocation or Balanced Advantage": {
    dummy: {
      max: { annualisedReturn: 0.1075, label: "ICICI Balanced Advantage Fund" },
      min: { annualisedReturn: 0.0735, label: "SBI Conservative Hybrid Fund" }
    }
  },
  "Multi Asset Allocation": {
    dummy: {
      max: { annualisedReturn: 0.1075, label: "ICICI Balanced Advantage Fund" },
      min: { annualisedReturn: 0.0735, label: "SBI Conservative Hybrid Fund" }
    }
  },
  "Children's": {
    dummy: {
      max: { annualisedReturn: 0.092, label: "HDFC Retirement Savings Fund" },
      min: { annualisedReturn: 0.0685, label: "Tata Young Citizens Fund" }
    }
  },
  Retirement: {
    dummy: {
      max: { annualisedReturn: 0.092, label: "HDFC Retirement Savings Fund" },
      min: { annualisedReturn: 0.0685, label: "Tata Young Citizens Fund" }
    }
  },
  "Index Funds / ETFs": {
    dummy: {
      max: { annualisedReturn: 0.089, label: "UTI Nifty Index Fund" },
      min: { annualisedReturn: 0.056, label: "Index Fund Sample" }
    }
  },
  "FoFs (Overseas/Domestic)": {
    dummy: {
      max: { annualisedReturn: 0.084, label: "Domestic Fund of Funds Sample" },
      min: { annualisedReturn: 0.0595, label: "International Fund of Funds Sample" }
    }
  }
};

const benchmarkCategoryDefinitions: BenchmarkCategoryDefinition[] = [
  {
    label: "Fixed Deposit",
    description: "Baseline",
    instrument: "Fixed Deposit"
  },
  ...vrEnabledTaxonomy.map((entry) => ({
    label: entry.subCategory,
    description: entry.category,
    schemeSubCategory: entry.subCategory,
    dummy: subCategoryBenchmarkFallbacks[entry.subCategory]?.dummy
  }))
];

export function YieldVisualisation({ onBack }: { onBack?: () => void }) {
  const [amountInput, setAmountInput] = useState("1,00,000");
  const [selectedTenure, setSelectedTenure] = useState(30);
  const [customTenure, setCustomTenure] = useState("120");
  const [selectedBenchmarkCategories, setSelectedBenchmarkCategories] = useState<CategoryOption[]>(() => [...defaultBenchmarkCategories]);
  const [selectedDeploymentCategories, setSelectedDeploymentCategories] = useState<CategoryOption[]>(() => [...defaultDeploymentCategories]);
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
  const filteredRows = useMemo(() => {
    return deploymentRows
      .filter((row) => matchesCategoryFilter(row, selectedDeploymentCategories))
      .sort((a, b) => sortDeploymentRows(a, b, sortOrder));
  }, [deploymentRows, selectedDeploymentCategories, sortOrder]);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const benchmarkColumns = useMemo(() => buildBenchmarkColumns(deploymentRows), [deploymentRows]);
  const orderedBenchmarkColumns = useMemo(() => {
    const selectedOrder = new Map(selectedBenchmarkCategories.map((category, index) => [category, index]));
    return benchmarkColumns
      .filter((column) => selectedOrder.has(column.label as CategoryOption))
      .sort((left, right) => {
        if (left.label === fixedDepositCategory) return -1;
        if (right.label === fixedDepositCategory) return 1;
        return (selectedOrder.get(left.label as CategoryOption) ?? 0) - (selectedOrder.get(right.label as CategoryOption) ?? 0);
      });
  }, [benchmarkColumns, selectedBenchmarkCategories]);
  const benchmarkTableStyle = {
    "--yield-benchmark-table-min-width": `${150 + orderedBenchmarkColumns.length * 220}px`
  } as CSSProperties;

  useEffect(() => {
    setPage(1);
  }, [selectedDeploymentCategories, sortOrder, amountInput, selectedTenure, customTenure]);

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
        <div className="yield-category-summary-heading">
          <h2>Category Benchmarks</h2>
          <MultiSelectMenu
            label="Category"
            allLabel="All categories"
            defaultLabel="Default"
            defaultValues={defaultBenchmarkCategories}
            fixedFirstOptions={[fixedDepositCategory]}
            limitMessage="Select up to 6 categories"
            maxSelected={6}
            options={categoryOptions}
            selectedValues={selectedBenchmarkCategories}
            getLabel={displayCategoryOption}
            onChange={setSelectedBenchmarkCategories}
          />
        </div>
        <div className="yield-benchmark-card">
          <table className="yield-benchmark-table" style={benchmarkTableStyle}>
            <thead>
              <tr>
                <th className="yield-benchmark-row-head" aria-hidden="true" />
                {orderedBenchmarkColumns.map((column) => (
                  <th
                    className={`yield-benchmark-category-head${column.label === "Fixed Deposit" ? " yield-benchmark-fixed-deposit" : ""}`}
                    key={column.label}
                  >
                    <span>{column.label}</span>
                    <small>{column.description}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="yield-benchmark-row-head">Max returns</th>
                {orderedBenchmarkColumns.map((column) => (
                  <BenchmarkCell
                    className={column.label === "Fixed Deposit" ? "yield-benchmark-fixed-deposit" : undefined}
                    key={`${column.label}-max`}
                    row={column.max}
                  />
                ))}
              </tr>
              <tr>
                <th className="yield-benchmark-row-head">Min returns</th>
                {orderedBenchmarkColumns.map((column) => (
                  <BenchmarkCell
                    className={column.label === "Fixed Deposit" ? "yield-benchmark-fixed-deposit" : undefined}
                    key={`${column.label}-min`}
                    row={column.min}
                  />
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="yield-deployment-section">
        <div className="yield-table-heading">
          <h2>{String(filteredRows.length).padStart(2, "0")} deployment options</h2>
          <div className="yield-final-filters">
            <MultiSelectMenu
              label="Category"
              allLabel="All categories"
              fixedFirstOptions={[fixedDepositCategory]}
              options={categoryOptions}
              selectedValues={selectedDeploymentCategories}
              getLabel={displayCategoryOption}
              onChange={setSelectedDeploymentCategories}
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
  label: string;
  description: string;
  min?: BenchmarkDisplayRow;
  max?: BenchmarkDisplayRow;
}

interface BenchmarkDisplayRow {
  annualisedReturn: number;
  label: string;
}

function buildBenchmarkColumns(rows: YieldComparisonRow[]): BenchmarkColumn[] {
  return benchmarkCategoryDefinitions.map((definition) => {
    const sourceRows = rows
      .filter((row) => row.available && matchesBenchmarkDefinition(row, definition))
      .sort((a, b) => getRankingAnnualisedReturn(a) - getRankingAnnualisedReturn(b));

    return {
      label: definition.label,
      description: definition.description,
      min: sourceRows[0] ? benchmarkDisplayRowFromYieldRow(sourceRows[0]) : definition.dummy?.min,
      max: sourceRows[sourceRows.length - 1] ? benchmarkDisplayRowFromYieldRow(sourceRows[sourceRows.length - 1]) : definition.dummy?.max
    };
  });
}

function matchesBenchmarkDefinition(row: YieldComparisonRow, definition: BenchmarkCategoryDefinition) {
  if (definition.instrument) return row.instrument === definition.instrument;
  if (definition.schemeSubCategory) return row.schemeSubCategory === definition.schemeSubCategory;
  return false;
}

function benchmarkDisplayRowFromYieldRow(row: YieldComparisonRow): BenchmarkDisplayRow {
  return {
    annualisedReturn: row.annualisedReturn ?? 0,
    label: row.instrument === "Fixed Deposit" ? row.provider : cleanFundName(row.provider || row.name)
  };
}

function BenchmarkCell({ className, row }: { className?: string; row?: BenchmarkDisplayRow }) {
  if (!row) {
    return (
      <td className={className}>
        <strong>-</strong>
        <span>Unavailable</span>
      </td>
    );
  }

  return (
    <td className={className}>
      <strong>{`~${formatPercent(row.annualisedReturn)}`}</strong>
      <span>{row.label}</span>
    </td>
  );
}

function MultiSelectMenu<T extends string>({
  label,
  allLabel,
  defaultLabel,
  defaultValues,
  fixedFirstOptions,
  limitMessage,
  maxSelected,
  searchPlaceholder,
  options,
  selectedValues,
  getLabel,
  onChange
}: {
  label: string;
  allLabel: string;
  defaultLabel?: string;
  defaultValues?: T[];
  fixedFirstOptions?: T[];
  limitMessage?: string;
  maxSelected?: number;
  searchPlaceholder?: string;
  options: T[];
  selectedValues: T[];
  getLabel: (value: T) => string;
  onChange: (value: T[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const allSelected = options.length > 0 && selectedValues.length === options.length;
  const summary = options.length === 0 ? "None" : allSelected ? "All" : selectedValues.length ? `${selectedValues.length} selected` : "None";
  const normalizedSearchValue = searchValue.trim().toLowerCase();
  const displayOptions = orderedOptions(options, fixedFirstOptions);
  const fixedValues = new Set(fixedFirstOptions ?? []);
  const visibleOptions = normalizedSearchValue
    ? displayOptions.filter((option) => fixedValues.has(option) || getLabel(option).toLowerCase().includes(normalizedSearchValue))
    : displayOptions;
  const selectedLimitReached = maxSelected !== undefined && selectedValues.length >= maxSelected;
  const helperMessage = selectedLimitReached && limitMessage ? limitMessage : undefined;

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) setSearchValue("");
  }, [open]);

  const toggleOption = (option: T) => {
    if (!selectedValues.includes(option) && selectedLimitReached) return;
    const nextValues = selectedValues.includes(option)
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];
    onChange(nextValues);
  };

  return (
    <div className="yield-select-menu yield-multi-select-menu" ref={menuRef}>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        <span>
          <small>{label}</small>
          {summary}
        </span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="yield-select-options yield-multi-select-options">
          <div className="yield-multi-select-top">
            <label className="yield-multi-select-search">
              <Search size={15} />
              <input
                aria-label={`Search ${label}`}
                placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}`}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </label>
            {options.length ? (
              <button
                type="button"
                className={allSelected ? "selected" : ""}
                onClick={() => onChange(maxSelected ? displayOptions.slice(0, maxSelected) : [...displayOptions])}
              >
                <span>{allLabel}</span>
                {allSelected && <Check size={16} />}
              </button>
            ) : null}
            {defaultLabel && defaultValues?.length ? (
              <button
                type="button"
                className={sameSelection(selectedValues, defaultValues) ? "selected" : ""}
                onClick={() => onChange([...defaultValues])}
              >
                <span>{defaultLabel}</span>
                {sameSelection(selectedValues, defaultValues) && <Check size={16} />}
              </button>
            ) : null}
          </div>
          <div className="yield-multi-select-list">
            {visibleOptions.length ? (
              visibleOptions.map((option) => {
                const selected = selectedValues.includes(option);
                const disabled = !selected && selectedLimitReached;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-disabled={disabled}
                    className={`${selected ? "selected" : ""}${disabled ? " disabled" : ""}`}
                    onClick={() => toggleOption(option)}
                  >
                    <span>{getLabel(option)}</span>
                    {selected && <Check size={16} />}
                  </button>
                );
              })
            ) : normalizedSearchValue ? (
              <div className="yield-select-empty">No matches found</div>
            ) : (
              <div className="yield-select-empty">No options available</div>
            )}
          </div>
          {helperMessage && <div className="yield-multi-select-helper">{helperMessage}</div>}
          {options.length > 0 && (
            <div className="yield-multi-select-footer">
              <button
                type="button"
                className="yield-select-clear"
                onClick={() => onChange([])}
              >
                <span>Clear all</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function sameSelection<T extends string>(left: T[], right: T[]) {
  if (left.length !== right.length) return false;
  const rightValues = new Set(right);
  return left.every((value) => rightValues.has(value));
}

function orderedOptions<T extends string>(options: T[], fixedFirstOptions?: T[]) {
  if (!fixedFirstOptions?.length) return options;
  const fixedValues = new Set(fixedFirstOptions);
  return [
    ...fixedFirstOptions.filter((option) => options.includes(option)),
    ...options.filter((option) => !fixedValues.has(option))
  ];
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

function matchesCategoryFilter(row: YieldComparisonRow, selectedCategories: CategoryOption[]) {
  if (row.instrument === "Fixed Deposit") {
    return selectedCategories.includes(fixedDepositCategory);
  }
  if (!row.schemeSubCategory) return false;
  return selectedCategories.includes(row.schemeSubCategory as VrSchemeSubCategory);
}

function displayCategoryOption(value: CategoryOption) {
  if (value === "Fixed Deposit") return "Fixed deposit";
  return value;
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
  const schemeTaxonomy = inferSchemeTaxonomy(row.instrument, row.scheme_name, row.scheme_category, row.scheme_sub_category);

  return {
    id: `amfi-mf-${row.scheme_code}`,
    instrument: row.instrument,
    name: row.scheme_name,
    provider: row.amc,
    schemeCategory: schemeTaxonomy.schemeCategory,
    schemeSubCategory: schemeTaxonomy.schemeSubCategory,
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
          {row.schemeCategory && <Detail label="Scheme Category" value={row.schemeCategory} />}
          {row.schemeSubCategory && <Detail label="Scheme Sub-Category" value={row.schemeSubCategory} />}
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
