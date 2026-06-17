import { ArrowLeft, Check, Plus, RefreshCw, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  activeInvestmentBalance,
  activeInvestmentLedgersFromSuggestions,
  formatInstrumentType,
  formatMoney,
  investmentLedgerSuggestions,
  instrumentTypeLabels,
  ledgerToManualInvestmentLedger,
  ledgers
} from "../data/accountingData";
import type {
  ConfirmedInvestmentLedger,
  InvestmentInstrumentType,
  InvestmentLedgerSuggestion,
  Ledger,
  SourceSystem
} from "../types/accounting";
import { EmptyIcon, HeaderTabs, Sheet } from "./Shared";

type ErpTab = "Payables" | "Receivables" | "Investments";
type InvestmentView = "dashboard" | "review";

interface InvestmentListingRow {
  id: string;
  ledgerId: string;
  ledgerName: string;
  ledgerGroup: string;
  instrumentType: InvestmentInstrumentType;
  sourceSystem: SourceSystem;
  closingBalance: number;
  order: number;
}

const payables = [
  {
    vendor: "LivQuick Account",
    billNumber: "#029384",
    billDate: "12 Feb, 2025",
    dueDate: "15 Mar, 2026",
    balancePayable: 2110,
    totalPayable: 3580,
    status: "Pending",
    overdue: true
  },
  {
    vendor: "SwiftPay Plus",
    billNumber: "#045672",
    billDate: "22 Mar, 2025",
    dueDate: "30 Apr, 2026",
    balancePayable: 4500,
    totalPayable: 7200,
    status: "Active"
  },
  {
    vendor: "EasyFund Saver",
    billNumber: "#078934",
    billDate: "05 Jan, 2025",
    dueDate: "10 Feb, 2026",
    balancePayable: 3200,
    totalPayable: 5100,
    status: "Processing"
  }
];

const syncedOnlyInvestments: InvestmentListingRow[] = [
  {
    id: "synced-icici-balanced-fund",
    ledgerId: "icici-balanced-fund",
    ledgerName: "ICICI Balanced Fund",
    ledgerGroup: "Mixed Assets",
    instrumentType: "HYBRID_MUTUAL_FUND",
    sourceSystem: "TALLY",
    closingBalance: 8150,
    order: 4
  }
];

const instrumentOptions = Object.keys(instrumentTypeLabels) as InvestmentInstrumentType[];

export function ERPIntegration() {
  const [activeTab, setActiveTab] = useState<ErpTab>("Investments");
  const [investmentView, setInvestmentView] = useState<InvestmentView>("dashboard");
  const [investmentsSynced, setInvestmentsSynced] = useState(false);
  const [suggestions, setSuggestions] = useState<InvestmentLedgerSuggestion[]>(investmentLedgerSuggestions);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState("Not synced yet");
  const [manualLedgers, setManualLedgers] = useState<ConfirmedInvestmentLedger[]>([]);
  const [manualSheetOpen, setManualSheetOpen] = useState(false);

  const suggestedActiveLedgers = useMemo(() => activeInvestmentLedgersFromSuggestions(suggestions), [suggestions]);
  const activeLedgers = useMemo(() => {
    const suggestedIds = new Set(suggestedActiveLedgers.map((ledger) => ledger.ledgerId));
    return [...suggestedActiveLedgers, ...manualLedgers.filter((ledger) => !suggestedIds.has(ledger.ledgerId))];
  }, [manualLedgers, suggestedActiveLedgers]);
  const pendingSuggestions = useMemo(
    () => suggestions.filter((suggestion) => suggestion.reviewStatus === "PENDING_CONFIRMATION"),
    [suggestions]
  );
  const investmentBalance = activeInvestmentBalance(activeLedgers);
  const syncedInvestmentRows = useMemo(() => {
    if (!investmentsSynced) return [];

    const activeRows = activeLedgers.map((ledger, index) => ({
      id: ledger.investmentLedgerId,
      ledgerId: ledger.ledgerId,
      ledgerName: ledger.ledgerName,
      ledgerGroup: ledger.ledgerGroup,
      instrumentType: ledger.investmentInstrumentType,
      sourceSystem: ledger.sourceSystem,
      closingBalance: ledger.closingBalance,
      order: orderForLedger(ledger.ledgerId, index + 10)
    }));
    const pendingRows = pendingSuggestions.map((suggestion, index) => ({
      id: suggestion.suggestionId,
      ledgerId: suggestion.ledgerId,
      ledgerName: suggestion.ledgerName,
      ledgerGroup: suggestion.ledgerGroup,
      instrumentType: suggestion.selectedInstrumentType ?? suggestion.suggestedInstrumentType,
      sourceSystem: suggestion.sourceSystem,
      closingBalance: suggestion.closingBalance,
      order: orderForLedger(suggestion.ledgerId, index)
    }));
    const usedLedgerIds = new Set([...activeRows, ...pendingRows].map((row) => row.ledgerId));
    return [...pendingRows, ...activeRows, ...syncedOnlyInvestments.filter((row) => !usedLedgerIds.has(row.ledgerId))].sort(
      (left, right) => left.order - right.order
    );
  }, [activeLedgers, investmentsSynced, pendingSuggestions]);

  function syncInvestments() {
    setActiveTab("Investments");
    setInvestmentView("dashboard");
    setRefreshing(true);
    window.setTimeout(() => {
      setInvestmentsSynced(true);
      setLastSyncedAt("Just now");
      setRefreshing(false);
    }, 650);
  }

  function refreshCurrentTab() {
    if (activeTab === "Investments") {
      syncInvestments();
      return;
    }
    setRefreshing(true);
    window.setTimeout(() => {
      setLastSyncedAt("Just now");
      setRefreshing(false);
    }, 650);
  }

  function reviewSuggestion(suggestionId: string, action: "CONFIRM" | "REJECT") {
    const shouldReturnToDashboard = pendingSuggestions.length <= 1;
    setSuggestions((current) =>
      current.map((suggestion) => {
        if (suggestion.suggestionId !== suggestionId) return suggestion;
        return {
          ...suggestion,
          selectedInstrumentType: suggestion.selectedInstrumentType ?? suggestion.suggestedInstrumentType,
          reviewStatus: action === "REJECT" ? "REJECTED" : "CONFIRMED",
          reviewedBy: "A. Mehta",
          reviewedAt: new Date().toISOString(),
          notes: action === "REJECT" ? "Rejected during investment ledger review." : "Confirmed during investment ledger review."
        };
      })
    );
    if (shouldReturnToDashboard) setInvestmentView("dashboard");
  }

  function addManualLedger(ledger: Ledger, investmentInstrumentType: InvestmentInstrumentType, notes: string) {
    setManualLedgers((current) => {
      if (current.some((item) => item.ledgerId === ledger.id) || activeLedgers.some((item) => item.ledgerId === ledger.id)) return current;
      return [...current, ledgerToManualInvestmentLedger(ledger, investmentInstrumentType, notes)];
    });
    setSuggestions((current) =>
      current.map((suggestion) =>
        suggestion.ledgerId === ledger.id && suggestion.reviewStatus === "PENDING_CONFIRMATION"
          ? {
              ...suggestion,
              reviewStatus: "REJECTED",
              reviewedBy: "A. Mehta",
              reviewedAt: new Date().toISOString(),
              notes: "Handled through manual investment ledger mapping."
            }
          : suggestion
      )
    );
    setInvestmentsSynced(true);
    setActiveTab("Investments");
    setInvestmentView("dashboard");
    setManualSheetOpen(false);
  }

  if (activeTab === "Investments" && investmentView === "review") {
    return (
      <div className="erp-dashboard">
        <ReviewInvestmentsPage
          pendingSuggestions={pendingSuggestions}
          onBack={() => setInvestmentView("dashboard")}
          onConfirm={(suggestion) => reviewSuggestion(suggestion.suggestionId, "CONFIRM")}
          onReject={(suggestion) => reviewSuggestion(suggestion.suggestionId, "REJECT")}
        />
      </div>
    );
  }

  return (
    <div className="erp-dashboard">
      <div className="erp-page-head">
        <div>
          <h1>ERP</h1>
          <p>Last synced {lastSyncedAt}</p>
        </div>
        <button className="figma-secondary erp-sync-button" onClick={refreshCurrentTab} disabled={refreshing}>
          <RefreshCw size={17} className={refreshing ? "spin" : ""} />
          {refreshing ? "Syncing" : "Sync"}
        </button>
      </div>

      <div className="erp-overview-grid">
        <OverviewCard
          label="Total Payables"
          value={investmentsSynced ? "₹50,830" : "₹0"}
          primaryMeta={investmentsSynced ? "Current - ₹12,01,100" : undefined}
          secondaryMeta={investmentsSynced ? "Overdue - ₹12,000" : undefined}
          emptyMeta={!investmentsSynced ? "No outstanding payables" : undefined}
          currentTone={investmentsSynced ? "green" : "blue"}
        />
        <OverviewCard
          label="Total Receivables"
          value={investmentsSynced ? "₹50,830" : "₹0"}
          primaryMeta={investmentsSynced ? "Current - ₹12,01,100" : undefined}
          secondaryMeta={investmentsSynced ? "Overdue - ₹12,000" : undefined}
          emptyMeta={!investmentsSynced ? "No outstanding receivables" : undefined}
          currentTone={investmentsSynced ? "green" : "blue"}
        />
        <OverviewCard
          label="Total Investments"
          value={formatMoney(investmentBalance)}
          primaryMeta={investmentsSynced && investmentBalance > 0 ? `Current - ${formatMoney(investmentBalance)}` : undefined}
          secondaryMeta={investmentsSynced && investmentBalance > 0 ? "Overdue - ₹0" : undefined}
          emptyMeta={!investmentsSynced || investmentBalance === 0 ? "No investments available" : undefined}
        />
      </div>

      <HeaderTabs tabs={["Payables", "Receivables", "Investments"]} active={activeTab} onChange={(tab) => setActiveTab(tab as ErpTab)} />

      {activeTab === "Payables" && <PayablesTable />}
      {activeTab === "Receivables" && (
        <DashboardEmptyState
          title="No receivables yet"
          copy="Invoices you've sent to customers will appear here once created or imported. Track what's owed to you in one place."
          primaryAction="Sync"
          onPrimaryAction={refreshCurrentTab}
        />
      )}
      {activeTab === "Investments" && (
        <InvestmentsDashboard
          synced={investmentsSynced}
          refreshing={refreshing}
          rows={syncedInvestmentRows}
          pendingCount={pendingSuggestions.length}
          onSync={syncInvestments}
          onAddManual={() => setManualSheetOpen(true)}
          onOpenReview={() => setInvestmentView("review")}
        />
      )}

      {manualSheetOpen && (
        <ManualInvestmentLedgerSheet
          activeLedgerIds={activeLedgers.map((ledger) => ledger.ledgerId)}
          onClose={() => setManualSheetOpen(false)}
          onAdd={addManualLedger}
        />
      )}
    </div>
  );
}

function OverviewCard({
  label,
  value,
  primaryMeta,
  secondaryMeta,
  emptyMeta,
  currentTone = "blue"
}: {
  label: string;
  value: string;
  primaryMeta?: string;
  secondaryMeta?: string;
  emptyMeta?: string;
  currentTone?: "blue" | "green";
}) {
  return (
    <article className="erp-overview-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className="erp-card-bar">
        <i className={currentTone === "green" ? "bar-green" : ""} />
        <b />
      </div>
      {emptyMeta ? (
        <p className="erp-card-empty-meta">{emptyMeta}</p>
      ) : (
        <div className="erp-card-meta">
          <span><i className={currentTone === "green" ? "dot-green" : "dot-blue"} />{primaryMeta}</span>
          <span><i className="dot-orange" />{secondaryMeta}</span>
        </div>
      )}
    </article>
  );
}

function PayablesTable() {
  return (
    <div className="table-wrap erp-table-card">
      <table className="figma-table erp-record-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Bill Number</th>
            <th>Bill Date</th>
            <th>Due Date</th>
            <th className="align-right">Balance Payable</th>
            <th className="align-right">Total Payable</th>
            <th className="align-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {payables.map((payable) => (
            <tr key={payable.billNumber}>
              <td>{payable.vendor}</td>
              <td>{payable.billNumber}</td>
              <td>{payable.billDate}</td>
              <td>
                {payable.dueDate}
                {payable.overdue && <em className="erp-overdue">Overdue</em>}
              </td>
              <td className="align-right">{formatMoney(payable.balancePayable)}</td>
              <td className="align-right">{formatMoney(payable.totalPayable)}</td>
              <td className="align-right"><span className="erp-soft-status">{payable.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationFooter />
    </div>
  );
}

function InvestmentsDashboard({
  synced,
  refreshing,
  rows,
  pendingCount,
  onSync,
  onAddManual,
  onOpenReview
}: {
  synced: boolean;
  refreshing: boolean;
  rows: InvestmentListingRow[];
  pendingCount: number;
  onSync: () => void;
  onAddManual: () => void;
  onOpenReview: () => void;
}) {
  if (!synced && !rows.length) {
    return (
      <DashboardEmptyState
        title="No Investment yet"
        copy="We couldn't find any investments from your Zoho account. Sync again to retry, or add one manually."
        primaryAction={refreshing ? "Syncing" : "Sync Again"}
        secondaryAction="Add manually"
        onPrimaryAction={onSync}
        onSecondaryAction={onAddManual}
        primaryDisabled={refreshing}
        darkSecondary
      />
    );
  }

  return (
    <div className="table-wrap erp-table-card erp-investments-table-card">
      {pendingCount > 0 && (
        <button className="erp-review-banner" onClick={onOpenReview}>
          <span className="erp-banner-icon">!</span>
          <strong>{pendingCount} investment requires review.</strong>
          <span>Check now to confirm</span>
          <span aria-hidden="true">→</span>
        </button>
      )}
      <InvestmentListingTable rows={rows} />
      <PaginationFooter />
    </div>
  );
}

function InvestmentListingTable({ rows }: { rows: InvestmentListingRow[] }) {
  return (
    <table className="figma-table erp-investment-list-table">
      <thead>
        <tr>
          <th>Ledger Name</th>
          <th>Ledger Group</th>
          <th>Instrument Type</th>
          <th>Source</th>
          <th className="align-right">Closing Balance</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.ledgerName}</td>
            <td>{row.ledgerGroup}</td>
            <td>{formatInstrumentType(row.instrumentType)}</td>
            <td>{formatSource(row.sourceSystem)}</td>
            <td className="align-right">{formatMoneyDecimal(row.closingBalance)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReviewInvestmentsPage({
  pendingSuggestions,
  onBack,
  onConfirm,
  onReject
}: {
  pendingSuggestions: InvestmentLedgerSuggestion[];
  onBack: () => void;
  onConfirm: (suggestion: InvestmentLedgerSuggestion) => void;
  onReject: (suggestion: InvestmentLedgerSuggestion) => void;
}) {
  return (
    <section className="erp-review-page">
      <div className="erp-review-page-head">
        <button className="erp-back-button" onClick={onBack} aria-label="Back to ERP investments">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1>Review and confirm investments</h1>
          <p>{pendingSuggestions.length} investments requires confirmation</p>
        </div>
      </div>

      <div className="table-wrap erp-table-card">
        <table className="figma-table erp-review-confirm-table">
          <thead>
            <tr>
              <th>Ledger Name</th>
              <th>Ledger Group</th>
              <th>Instrument Type</th>
              <th>Source</th>
              <th className="align-right">Closing Balance</th>
              <th>Confidence ⓘ</th>
              <th className="align-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingSuggestions.map((suggestion) => (
              <tr key={suggestion.suggestionId}>
                <td>{suggestion.ledgerName}</td>
                <td>{suggestion.ledgerGroup}</td>
                <td>{formatInstrumentType(suggestion.selectedInstrumentType ?? suggestion.suggestedInstrumentType)}</td>
                <td>{formatSource(suggestion.sourceSystem)}</td>
                <td className="align-right">{formatMoneyDecimal(suggestion.closingBalance)}</td>
                <td><span className={`confidence confidence-${suggestion.confidence.toLowerCase()}`}>{prettyConfidence(suggestion.confidence)}</span></td>
                <td>
                  <div className="erp-review-row-actions">
                    <button className="erp-square-action" onClick={() => onConfirm(suggestion)} aria-label={`Confirm ${suggestion.ledgerName}`}>
                      <Check size={18} />
                    </button>
                    <button className="erp-square-action" onClick={() => onReject(suggestion)} aria-label={`Reject ${suggestion.ledgerName}`}>
                      <X size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationFooter />
      </div>
    </section>
  );
}

function ManualInvestmentLedgerSheet({
  activeLedgerIds,
  onClose,
  onAdd
}: {
  activeLedgerIds: string[];
  onClose: () => void;
  onAdd: (ledger: Ledger, investmentInstrumentType: InvestmentInstrumentType, notes: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedLedgerId, setSelectedLedgerId] = useState("");
  const [instrumentType, setInstrumentType] = useState<InvestmentInstrumentType>("LIQUID_MUTUAL_FUND");
  const [notes, setNotes] = useState("Manually mapped by finance admin.");
  const activeIds = new Set(activeLedgerIds);
  const availableLedgers = ledgers.filter((ledger) => !activeIds.has(ledger.id));
  const filteredLedgers = availableLedgers.filter((ledger) => {
    const haystack = `${ledger.name} ${ledger.group} ${ledger.provider}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const selectedLedger = availableLedgers.find((ledger) => ledger.id === selectedLedgerId);

  return (
    <Sheet width={720} onClose={onClose}>
      <div className="sheet-header erp-review-header">
        <div className="sheet-fund-title">
          <span className="erp-review-icon"><Plus size={22} /></span>
          <div>
            <h2>Add Investment Ledger</h2>
            <span>Search synced accounting ledgers and activate one for treasury planning.</span>
          </div>
        </div>
      </div>

      <div className="sheet-body erp-review-body">
        <label className="erp-review-field">
          <span>Search Ledger</span>
          <div className="erp-search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by ledger, group, or source"
            />
          </div>
        </label>

        <div className="erp-ledger-picker" role="listbox" aria-label="Synced accounting ledgers">
          {filteredLedgers.length ? filteredLedgers.map((ledger) => (
            <button
              type="button"
              key={ledger.id}
              className={selectedLedgerId === ledger.id ? "selected" : ""}
              onClick={() => setSelectedLedgerId(ledger.id)}
            >
              <strong>{ledger.name}</strong>
              <span>{ledger.provider} · {ledger.group} · {ledger.balance === undefined ? "No balance synced" : formatMoneyDecimal(ledger.balance)}</span>
            </button>
          )) : (
            <div className="erp-picker-empty">No available ledgers match this search.</div>
          )}
        </div>

        {selectedLedger && (
          <div className="erp-review-summary">
            <Detail label="Source" value={selectedLedger.provider} />
            <Detail label="Ledger Group" value={selectedLedger.group} />
            <Detail label="Closing Balance" value={selectedLedger.balance === undefined ? "₹0.00" : formatMoneyDecimal(selectedLedger.balance)} />
            <Detail label="AI Confidence" value={selectedLedger.confidence ? prettyConfidence(selectedLedger.confidence) : "Not classified"} />
          </div>
        )}

        <label className="erp-review-field">
          <span>Investment Instrument Type</span>
          <select value={instrumentType} onChange={(event) => setInstrumentType(event.target.value as InvestmentInstrumentType)}>
            {instrumentOptions.map((option) => (
              <option key={option} value={option}>{formatInstrumentType(option)}</option>
            ))}
          </select>
        </label>

        <label className="erp-review-field">
          <span>Review Notes</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
        </label>

        <div className="sheet-actions erp-manual-actions">
          <button className="figma-secondary" onClick={onClose}>Cancel</button>
          <button
            className="figma-primary"
            disabled={!selectedLedger}
            onClick={() => {
              if (selectedLedger) onAdd(selectedLedger, instrumentType, notes);
            }}
          >
            Add as Active
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function DashboardEmptyState({
  title,
  copy,
  primaryAction,
  secondaryAction,
  onPrimaryAction,
  onSecondaryAction,
  primaryDisabled,
  darkSecondary
}: {
  title: string;
  copy: string;
  primaryAction: string;
  secondaryAction?: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  primaryDisabled?: boolean;
  darkSecondary?: boolean;
}) {
  return (
    <section className="erp-empty-state">
      <EmptyIcon />
      <h2>{title}</h2>
      <p>{copy}</p>
      <div className="erp-empty-actions">
        <button className="figma-secondary" onClick={onPrimaryAction} disabled={primaryDisabled}>
          <RefreshCw size={13} className={primaryDisabled ? "spin" : ""} />
          {primaryAction}
        </button>
        {secondaryAction && onSecondaryAction && (
          <button className={darkSecondary ? "figma-primary erp-dark-button" : "figma-secondary"} onClick={onSecondaryAction}>
            {secondaryAction}
          </button>
        )}
      </div>
    </section>
  );
}

function PaginationFooter() {
  return (
    <div className="erp-pagination">
      <button>10 Per Page</button>
      <button className="erp-pagination-icon" aria-label="Previous page">←</button>
      <span>Page 1 of 1</span>
      <button className="erp-pagination-icon" aria-label="Next page">→</button>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function orderForLedger(ledgerId: string, fallback: number) {
  const order: Record<string, number> = {
    "hdfc-liquid-fund": 1,
    "sbi-equity-fund": 2,
    "axis-corporate-bond-fund": 3,
    "icici-balanced-fund": 4
  };
  return order[ledgerId] ?? fallback;
}

function formatSource(source: SourceSystem) {
  return source === "TALLY" ? "Tally ERP" : "Zoho Books";
}

function formatMoneyDecimal(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function prettyConfidence(value: "HIGH" | "MEDIUM" | "LOW") {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
