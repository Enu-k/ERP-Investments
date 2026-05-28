import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  formatMoney,
  getProviderLedgers,
  ledgerName,
  scenarioLabels
} from "../data/accountingData";
import type { LedgerLine, TreasuryTransaction } from "../types/accounting";
import { AccountingPill, FundAvatar, HeaderTabs, NewTransactionDropdown, ScenarioChip, Sheet } from "./Shared";

const tabs = ["All", "Pending Approval", "Pending Payment", "In-Process", "Processed", "Cancelled"];

export function TransactionsAccounting({
  transactions,
  activeTransaction,
  selectedIds,
  setSelectedIds,
  onOpenTransaction,
  onCloseTransaction,
  onSyncTransactions,
  onUpdateLine
}: {
  transactions: TreasuryTransaction[];
  activeTransaction?: TreasuryTransaction;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  onOpenTransaction: (id: string) => void;
  onCloseTransaction: () => void;
  onSyncTransactions: (ids: string[]) => void;
  onUpdateLine: (transactionId: string, lineId: string, ledgerId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("Processed");
  const [menuOpen, setMenuOpen] = useState(false);
  const [providerFilter, setProviderFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [syncSelectionOpen, setSyncSelectionOpen] = useState(false);

  const processedAccountingRows = useMemo(() => {
    return transactions.filter((txn) => {
      if (txn.executionStatus !== "Executed") return false;
      const matchesProvider = providerFilter === "All" || txn.provider === providerFilter;
      const needle = search.toLowerCase();
      const matchesSearch =
        !needle ||
        txn.fundName.toLowerCase().includes(needle) ||
        txn.refId.toLowerCase().includes(needle) ||
        scenarioLabels[txn.scenario].toLowerCase().includes(needle);
      return matchesProvider && matchesSearch;
    });
  }, [transactions, providerFilter, search]);

  const isProcessedTab = activeTab === "Processed";
  const displayRows = isProcessedTab
    ? processedAccountingRows
    : transactions.filter((txn) => activeTab === "All" || txn.executionStatus === "Pending");

  const readyIds = processedAccountingRows.filter((txn) => txn.accountingStatus === "Ready to sync").map((txn) => txn.id);
  const selectedReadyIds = selectedIds.filter((id) => readyIds.includes(id));

  function toggleReady(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function startAccountingSync() {
    setSelectedIds(readyIds);
    setSyncSelectionOpen(true);
  }

  function cancelAccountingSync() {
    setSelectedIds([]);
    setSyncSelectionOpen(false);
  }

  function syncSelectedAccounting() {
    onSyncTransactions(selectedReadyIds);
    setSyncSelectionOpen(false);
  }

  return (
    <>
      <div className="transactions-title-row">
        <h1>Transactions</h1>
        <NewTransactionDropdown open={menuOpen} setOpen={setMenuOpen} />
      </div>

      <HeaderTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {isProcessedTab && (
        <div className="accounting-toolbar processed-sync-toolbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search fund, reference ID, scenario" />
          <select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}>
            <option>All</option>
            <option>Tally</option>
            <option>Zoho Books</option>
          </select>
          <button className="figma-primary" disabled={!readyIds.length} onClick={startAccountingSync}>
            <RefreshCw size={18} /> Sync Accounting
          </button>
        </div>
      )}

      <section className="figma-section no-top">
        <div className="table-wrap">
          <table className="figma-table transactions-table">
            <thead>
              <tr>
                {isProcessedTab && (
                  <th className="check-col">
                    {syncSelectionOpen ? "Sync" : ""}
                  </th>
                )}
                <th>Fund Name</th>
                <th>Type</th>
                <th>Raised By</th>
                <th>Submitted On</th>
                <th className="align-right">Amount/Units</th>
                <th>{isProcessedTab ? "Accounting Status" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((txn) => {
                const selectable = txn.accountingStatus === "Ready to sync";
                return (
                  <tr key={txn.id} onClick={() => onOpenTransaction(txn.id)}>
                    {isProcessedTab && (
                      <td className="check-col" onClick={(event) => event.stopPropagation()}>
                        {syncSelectionOpen && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(txn.id)}
                            disabled={!selectable}
                            onChange={() => toggleReady(txn.id)}
                            aria-label={`Select ${txn.refId}`}
                          />
                        )}
                      </td>
                    )}
                    <td>
                      <div className="fund-cell">
                        <FundAvatar icon={txn.fundIcon} />
                        <span>{txn.fundName}</span>
                      </div>
                    </td>
                    <td><ScenarioChip scenario={txn.scenario} /></td>
                    <td>{txn.raisedBy}</td>
                    <td>{txn.submittedOn}</td>
                    <td className="align-right">{txn.units && scenarioLabels[txn.scenario] === "Switch" ? `${txn.units} units` : formatMoney(txn.amount)}</td>
                    <td>{isProcessedTab ? <AccountingPill status={txn.accountingStatus} /> : <span className="executed">{txn.executionStatus}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {isProcessedTab && syncSelectionOpen && (
        <div className="bulk-bar">
          <span>{selectedReadyIds.length} processed transactions selected for accounting sync</span>
          <div className="bulk-actions">
            <button className="figma-secondary" onClick={cancelAccountingSync}>Cancel</button>
            <button className="figma-primary" disabled={!selectedReadyIds.length} onClick={syncSelectedAccounting}>
              <RefreshCw size={18} /> Sync now
            </button>
          </div>
        </div>
      )}

      {activeTransaction && (
        <TransactionAccountingSheet
          transaction={activeTransaction}
          onClose={onCloseTransaction}
          onSync={() => onSyncTransactions([activeTransaction.id])}
          onUpdateLine={(lineId, ledgerId) => onUpdateLine(activeTransaction.id, lineId, ledgerId)}
        />
      )}
    </>
  );
}

function TransactionAccountingSheet({
  transaction,
  onClose,
  onSync,
  onUpdateLine
}: {
  transaction: TreasuryTransaction;
  onClose: () => void;
  onSync: () => void;
  onUpdateLine: (lineId: string, ledgerId: string) => void;
}) {
  const debits = transaction.entry.lines.filter((line) => line.side === "Dr").reduce((sum, line) => sum + line.amount, 0);
  const credits = transaction.entry.lines.filter((line) => line.side === "Cr").reduce((sum, line) => sum + line.amount, 0);
  const canSync = transaction.accountingStatus === "Ready to sync";

  return (
    <Sheet width={700} onClose={onClose}>
      <div className="sheet-header">
        <div className="sheet-fund-title">
          <FundAvatar icon={transaction.fundIcon} />
          <div>
            <h2>{transaction.fundName}</h2>
            <span>{scenarioLabels[transaction.scenario]} · {transaction.refId}</span>
          </div>
        </div>
      </div>

      <div className="sheet-body">
        {transaction.accountingStatus === "Synced" && transaction.entry.voucherNumber && (
          <Banner tone="success" title="Successfully Synced" text={`Voucher ${transaction.entry.voucherNumber} · ${transaction.entry.reference ?? transaction.refId}`} />
        )}
        {transaction.accountingStatus === "Failed" && transaction.entry.error && (
          <Banner tone="danger" title="Sync Failed" text={transaction.entry.error} />
        )}
        {transaction.accountingStatus === "Duplicate conflict" && transaction.entry.error && (
          <Banner tone="warning" title="Duplicate Detected" text={transaction.entry.error} />
        )}
        {transaction.accountingStatus === "Unmapped" && (
          <Banner tone="warning" title="Unmapped Portfolio" text="This transaction cannot be synced until required portfolio ledgers are mapped." />
        )}

        <div className="amount-hero">
          <span>Amount</span>
          <strong>{formatMoney(transaction.amount)}</strong>
        </div>

        <div className="detail-grid">
          <Detail label="Voucher Type" value={transaction.entry.voucherType} />
          <Detail label="Provider" value={transaction.provider} />
          <Detail label="Voucher Date" value={transaction.entry.voucherDate} />
          <Detail label="Status" value={transaction.accountingStatus} />
          <Detail label="Requested By" value={transaction.raisedBy} />
          <Detail label="Submitted On" value={transaction.submittedOn} />
        </div>

        <div>
          <h3 className="sheet-section-heading">Narration</h3>
          <div className="narration-box">{transaction.entry.narration}</div>
        </div>

        <div>
          <div className="section-title compact">
            <h2>Ledger Entries</h2>
            <span>{transaction.entry.lines.length} lines</span>
          </div>
          <div className="voucher-table-wrap">
            <table className="voucher-table">
              <thead>
                <tr>
                  <th>Ledger</th>
                  <th className="align-right">Debit</th>
                  <th className="align-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {transaction.entry.lines.map((line) => (
                  <LedgerRow key={line.id} line={line} provider={transaction.provider} onUpdateLine={onUpdateLine} />
                ))}
                <tr className="total-row">
                  <td>Total</td>
                  <td className="align-right">{formatMoney(debits)}</td>
                  <td className="align-right">{formatMoney(credits)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="sheet-actions">
          <button className="figma-secondary" onClick={onClose}>Close</button>
          <button className="figma-primary" onClick={onSync} disabled={!canSync}>Sync to {transaction.provider}</button>
        </div>
      </div>
    </Sheet>
  );
}

function LedgerRow({
  line,
  provider,
  onUpdateLine
}: {
  line: LedgerLine;
  provider: TreasuryTransaction["provider"];
  onUpdateLine: (lineId: string, ledgerId: string) => void;
}) {
  return (
    <tr>
      <td>
        <select value={line.ledgerId ?? ""} onChange={(event) => onUpdateLine(line.id, event.target.value)}>
          <option value="">Select ledger...</option>
          {getProviderLedgers(provider).map((ledger) => (
            <option key={ledger.id} value={ledger.id}>{ledger.name}</option>
          ))}
        </select>
        <span>{line.component}</span>
        <em>{line.narration || ledgerName(line.ledgerId)}</em>
      </td>
      <td className="align-right">{line.side === "Dr" ? formatMoney(line.amount) : "—"}</td>
      <td className="align-right">{line.side === "Cr" ? formatMoney(line.amount) : "—"}</td>
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

function Banner({ tone, title, text }: { tone: "success" | "danger" | "warning"; title: string; text: string }) {
  return (
    <div className={`sheet-banner ${tone}`}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}
