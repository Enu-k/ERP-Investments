import { Check, ClipboardList, Eye, Plus, RefreshCw, Search, X } from "lucide-react";
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
import type { ConfirmedInvestmentLedger, InvestmentInstrumentType, InvestmentLedgerSuggestion, Ledger } from "../types/accounting";
import { EmptyIcon, HeaderTabs, Sheet } from "./Shared";

type ErpTab = "Payables" | "Receivables" | "Investment Ledgers";

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

const instrumentOptions = Object.keys(instrumentTypeLabels) as InvestmentInstrumentType[];

export function ERPIntegration() {
  const [activeTab, setActiveTab] = useState<ErpTab>("Investment Ledgers");
  const [suggestions, setSuggestions] = useState<InvestmentLedgerSuggestion[]>(investmentLedgerSuggestions);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState("28 May 2026, 12:00 PM");
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const [manualLedgers, setManualLedgers] = useState<ConfirmedInvestmentLedger[]>([]);
  const [manualSheetOpen, setManualSheetOpen] = useState(false);

  const suggestedActiveLedgers = useMemo(() => activeInvestmentLedgersFromSuggestions(suggestions), [suggestions]);
  const activeLedgers = useMemo(() => {
    const suggestedIds = new Set(suggestedActiveLedgers.map((ledger) => ledger.ledgerId));
    return [...suggestedActiveLedgers, ...manualLedgers.filter((ledger) => !suggestedIds.has(ledger.ledgerId))];
  }, [manualLedgers, suggestedActiveLedgers]);
  const pendingSuggestions = suggestions.filter((suggestion) => suggestion.reviewStatus === "PENDING_CONFIRMATION");
  const selectedSuggestion = suggestions.find((suggestion) => suggestion.suggestionId === selectedSuggestionId);
  const activeBalance = activeInvestmentBalance(activeLedgers);
  const payableBalance = payables.reduce((sum, payable) => sum + payable.balancePayable, 0);

  function refreshSuggestions() {
    setRefreshing(true);
    window.setTimeout(() => {
      setLastSyncedAt("Just now");
      setRefreshing(false);
    }, 650);
  }

  function reviewSuggestion(
    suggestionId: string,
    action: "CONFIRM" | "REJECT" | "EDIT_AND_CONFIRM",
    investmentInstrumentType?: InvestmentInstrumentType,
    notes?: string
  ) {
    setSuggestions((current) =>
      current.map((suggestion) => {
        if (suggestion.suggestionId !== suggestionId) return suggestion;
        const selectedInstrumentType = investmentInstrumentType ?? suggestion.suggestedInstrumentType;

        return {
          ...suggestion,
          selectedInstrumentType,
          reviewStatus: action === "REJECT" ? "REJECTED" : action === "EDIT_AND_CONFIRM" ? "EDITED" : "CONFIRMED",
          reviewedBy: "A. Mehta",
          reviewedAt: new Date().toISOString(),
          notes
        };
      })
    );
    setSelectedSuggestionId(null);
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
              notes: "Handled through manual active ledger mapping."
            }
          : suggestion
      )
    );
    setManualSheetOpen(false);
  }

  return (
    <div className="erp-dashboard">
      <div className="erp-page-head">
        <div>
          <h1>ERP</h1>
          <p>Last synced {lastSyncedAt}</p>
        </div>
        <button className="figma-secondary erp-sync-button" onClick={refreshSuggestions} disabled={refreshing}>
          <RefreshCw size={17} className={refreshing ? "spin" : ""} />
          {refreshing ? "Syncing" : "Sync"}
        </button>
      </div>

      <div className="erp-overview-grid">
        <OverviewCard
          label="Total Payables"
          value={formatMoney(payableBalance)}
          primaryMeta={`Current - ${formatMoney(payableBalance - 12000 > 0 ? payableBalance - 12000 : payableBalance)}`}
          secondaryMeta="Overdue - ₹12,000"
        />
        <OverviewCard label="Total Receivables" value="₹0" primaryMeta="Current - ₹0" secondaryMeta="Overdue - ₹0" />
        <OverviewCard
          label="Confirmed Investments"
          value={formatMoney(activeBalance)}
          primaryMeta={`${activeLedgers.length} active`}
          secondaryMeta={`${pendingSuggestions.length} pending review`}
          investment
        />
      </div>

      <HeaderTabs
        tabs={["Payables", "Receivables", "Investment Ledgers"]}
        active={activeTab}
        onChange={(tab) => setActiveTab(tab as ErpTab)}
      />

      {activeTab === "Payables" && <PayablesTable />}
      {activeTab === "Receivables" && (
        <DashboardEmptyState
          title="No receivables yet"
          copy="Invoices you've sent to customers will appear here once created or imported. Track what's owed to you in one place."
          action="Sync"
          onAction={refreshSuggestions}
        />
      )}
      {activeTab === "Investment Ledgers" && (
        <InvestmentLedgerReview
          activeLedgers={activeLedgers}
          pendingSuggestions={pendingSuggestions}
          onOpenReview={setSelectedSuggestionId}
          onConfirm={(suggestion) => reviewSuggestion(suggestion.suggestionId, "CONFIRM")}
          onReject={(suggestion) => reviewSuggestion(suggestion.suggestionId, "REJECT", undefined, "Rejected from dashboard table.")}
          onRefresh={refreshSuggestions}
          onAddLedger={() => setManualSheetOpen(true)}
        />
      )}

      {selectedSuggestion && (
        <InvestmentLedgerSheet
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestionId(null)}
          onConfirm={(type, notes) => reviewSuggestion(selectedSuggestion.suggestionId, "CONFIRM", type, notes)}
          onEditAndConfirm={(type, notes) => reviewSuggestion(selectedSuggestion.suggestionId, "EDIT_AND_CONFIRM", type, notes)}
          onReject={(notes) => reviewSuggestion(selectedSuggestion.suggestionId, "REJECT", undefined, notes)}
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
  investment
}: {
  label: string;
  value: string;
  primaryMeta: string;
  secondaryMeta: string;
  investment?: boolean;
}) {
  return (
    <article className="erp-overview-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className={`erp-card-bar ${investment ? "investment" : ""}`}>
        <i />
        <b />
      </div>
      <div className="erp-card-meta">
        <span><i className="dot-blue" />{primaryMeta}</span>
        <span><i className={investment ? "dot-green" : "dot-orange"} />{secondaryMeta}</span>
      </div>
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
      <div className="erp-pagination">
        <button>10 Per Page</button>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}

function InvestmentLedgerReview({
  activeLedgers,
  pendingSuggestions,
  onOpenReview,
  onConfirm,
  onReject,
  onRefresh,
  onAddLedger
}: {
  activeLedgers: ConfirmedInvestmentLedger[];
  pendingSuggestions: InvestmentLedgerSuggestion[];
  onOpenReview: (suggestionId: string) => void;
  onConfirm: (suggestion: InvestmentLedgerSuggestion) => void;
  onReject: (suggestion: InvestmentLedgerSuggestion) => void;
  onRefresh: () => void;
  onAddLedger: () => void;
}) {
  if (!activeLedgers.length && !pendingSuggestions.length) {
    return (
      <DashboardEmptyState
        title="No investment ledgers active"
        copy="Add an ERP ledger manually or refresh suggestions after the next ERP sync to classify investment accounts."
        action="Add Investment Ledger"
        onAction={onAddLedger}
      />
    );
  }

  return (
    <div className="erp-ledger-sections">
      <section className="figma-section erp-investment-section">
        <div className="section-title">
          <div>
            <h2>Active Investment Ledgers</h2>
            <p>{activeLedgers.length} ledgers are available to the Treasury Agent.</p>
          </div>
          <button className="figma-primary erp-add-ledger-button" onClick={onAddLedger}>
            <Plus size={17} />
            Add Investment Ledger
          </button>
        </div>
        <ActiveInvestmentLedgerTable activeLedgers={activeLedgers} />
      </section>

      <section className="figma-section erp-investment-section">
        <div className="section-title">
          <div>
            <h2>Pending Confirmation</h2>
            <p>{pendingSuggestions.length ? `${pendingSuggestions.length} suggestions need confirmation before the Agent can use them.` : "No pending suggestions after the latest review."}</p>
          </div>
          <button className="figma-secondary erp-compact-button" onClick={onRefresh}>
            <RefreshCw size={15} />
            Refresh Suggestions
          </button>
        </div>
        {pendingSuggestions.length ? (
          <PendingInvestmentLedgerTable
            pendingSuggestions={pendingSuggestions}
            onOpenReview={onOpenReview}
            onConfirm={onConfirm}
            onReject={onReject}
          />
        ) : (
          <div className="erp-compact-empty">
            <EmptyIcon />
            <div>
              <strong>No suggestions pending</strong>
              <span>Active ledgers remain visible above while Kodo waits for new ERP ledger classifications.</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ActiveInvestmentLedgerTable({ activeLedgers }: { activeLedgers: ConfirmedInvestmentLedger[] }) {
  if (!activeLedgers.length) {
    return (
      <div className="erp-compact-empty">
        <EmptyIcon />
        <div>
          <strong>No active ledgers yet</strong>
          <span>Confirm a suggestion or add a synced ledger manually to activate it.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrap erp-table-card">
      <table className="figma-table erp-active-ledger-table">
        <thead>
          <tr>
            <th>Ledger Name</th>
            <th>Source</th>
            <th>Ledger Group</th>
            <th>Instrument Type</th>
            <th className="align-right">Closing Balance</th>
            <th>Added On</th>
            <th>Added From</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activeLedgers.map((ledger) => (
            <tr key={ledger.investmentLedgerId}>
              <td>{ledger.ledgerName}</td>
              <td>{formatSource(ledger.sourceSystem)}</td>
              <td>{ledger.ledgerGroup}</td>
              <td>{formatInstrumentType(ledger.investmentInstrumentType)}</td>
              <td className="align-right">{formatMoney(ledger.closingBalance)}</td>
              <td>{formatDate(ledger.confirmedAt)}</td>
              <td>{ledger.reviewSource === "MANUAL" ? "Manual" : "Suggested"}</td>
              <td><span className="erp-active-status">Active</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PendingInvestmentLedgerTable({
  pendingSuggestions,
  onOpenReview,
  onConfirm,
  onReject
}: {
  pendingSuggestions: InvestmentLedgerSuggestion[];
  onOpenReview: (suggestionId: string) => void;
  onConfirm: (suggestion: InvestmentLedgerSuggestion) => void;
  onReject: (suggestion: InvestmentLedgerSuggestion) => void;
}) {
  return (
    <div className="table-wrap erp-table-card">
      <table className="figma-table erp-ledger-table">
        <thead>
          <tr>
            <th>Ledger Name</th>
            <th>Account Type</th>
            <th>Ledger Group</th>
            <th>Source</th>
            <th className="align-right">Closing Balance</th>
            <th>Suggested Type</th>
            <th>Confidence</th>
            <th>Reason</th>
            <th className="align-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingSuggestions.map((suggestion) => (
            <tr key={suggestion.suggestionId}>
              <td>
                <button className="erp-link-button" onClick={() => onOpenReview(suggestion.suggestionId)}>
                  {suggestion.ledgerName}
                </button>
              </td>
              <td>{prettySnake(suggestion.accountType)}</td>
              <td>{suggestion.ledgerGroup}</td>
              <td>{formatSource(suggestion.sourceSystem)}</td>
              <td className="align-right">{formatMoney(suggestion.closingBalance)}</td>
              <td>{formatInstrumentType(suggestion.suggestedInstrumentType)}</td>
              <td><span className={`confidence confidence-${suggestion.confidence.toLowerCase()}`}>{suggestion.confidence}</span></td>
              <td><span className="erp-reason">{suggestion.reason}</span></td>
              <td>
                <div className="erp-row-actions">
                  <button className="icon-button" onClick={() => onOpenReview(suggestion.suggestionId)} aria-label={`Review ${suggestion.ledgerName}`}>
                    <Eye size={16} />
                  </button>
                  <button className="icon-button success" onClick={() => onConfirm(suggestion)} aria-label={`Confirm ${suggestion.ledgerName}`}>
                    <Check size={16} />
                  </button>
                  <button className="icon-button danger" onClick={() => onReject(suggestion)} aria-label={`Reject ${suggestion.ledgerName}`}>
                    <X size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvestmentLedgerSheet({
  suggestion,
  onClose,
  onConfirm,
  onEditAndConfirm,
  onReject
}: {
  suggestion: InvestmentLedgerSuggestion;
  onClose: () => void;
  onConfirm: (type: InvestmentInstrumentType, notes: string) => void;
  onEditAndConfirm: (type: InvestmentInstrumentType, notes: string) => void;
  onReject: (notes: string) => void;
}) {
  const [instrumentType, setInstrumentType] = useState<InvestmentInstrumentType>(
    suggestion.selectedInstrumentType ?? suggestion.suggestedInstrumentType
  );
  const [notes, setNotes] = useState("Confirmed by finance admin.");
  const isEdited = instrumentType !== suggestion.suggestedInstrumentType;

  return (
    <Sheet width={680} onClose={onClose}>
      <div className="sheet-header erp-review-header">
        <div className="sheet-fund-title">
          <span className="erp-review-icon"><ClipboardList size={22} /></span>
          <div>
            <h2>{suggestion.ledgerName}</h2>
            <span>{formatSource(suggestion.sourceSystem)} · Synced {formatDate(suggestion.lastSyncedAt)}</span>
          </div>
        </div>
      </div>
      <div className="sheet-body erp-review-body">
        <div className="erp-review-summary">
          <Detail label="Closing Balance" value={formatMoney(suggestion.closingBalance)} />
          <Detail label="Account Type" value={prettySnake(suggestion.accountType)} />
          <Detail label="Ledger Group" value={suggestion.ledgerGroup} />
          <Detail label="Parent Group" value={suggestion.parentLedgerGroup} />
        </div>

        <label className="erp-review-field">
          <span>Investment Instrument Type</span>
          <select value={instrumentType} onChange={(event) => setInstrumentType(event.target.value as InvestmentInstrumentType)}>
            {instrumentOptions.map((option) => (
              <option key={option} value={option}>{formatInstrumentType(option)}</option>
            ))}
          </select>
        </label>

        <div className="sheet-banner warning">
          <strong>Why Kodo suggested this ledger</strong>
          <span>{suggestion.reason}</span>
        </div>

        <div className="erp-signal-list">
          <h3>Matched Signals</h3>
          {suggestion.matchedSignals.map((signal) => (
            <span key={signal}>{signal}</span>
          ))}
        </div>

        <label className="erp-review-field">
          <span>Review Notes</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
        </label>

        <div className="sheet-actions erp-review-actions">
          <button className="figma-secondary" onClick={() => onReject(notes)}>Reject</button>
          <button className="figma-secondary" onClick={() => onConfirm(instrumentType, notes)}>Confirm</button>
          <button className="figma-primary" onClick={() => onEditAndConfirm(instrumentType, notes)} disabled={!isEdited}>
            Edit & Confirm
          </button>
        </div>
      </div>
    </Sheet>
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
              <span>{ledger.provider} · {ledger.group} · {ledger.balance === undefined ? "No balance synced" : formatMoney(ledger.balance)}</span>
            </button>
          )) : (
            <div className="erp-picker-empty">No available ledgers match this search.</div>
          )}
        </div>

        {selectedLedger && (
          <div className="erp-review-summary">
            <Detail label="Source" value={selectedLedger.provider} />
            <Detail label="Ledger Group" value={selectedLedger.group} />
            <Detail label="Closing Balance" value={selectedLedger.balance === undefined ? "₹0" : formatMoney(selectedLedger.balance)} />
            <Detail label="AI Confidence" value={selectedLedger.confidence ?? "Not classified"} />
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
  action,
  onAction
}: {
  title: string;
  copy: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <section className="erp-empty-state">
      <EmptyIcon />
      <h2>{title}</h2>
      <p>{copy}</p>
      <button className="figma-secondary" onClick={onAction}>
        <RefreshCw size={13} />
        {action}
      </button>
    </section>
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

function prettySnake(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSource(source: InvestmentLedgerSuggestion["sourceSystem"]) {
  return source === "TALLY" ? "Tally" : "Zoho Books";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
