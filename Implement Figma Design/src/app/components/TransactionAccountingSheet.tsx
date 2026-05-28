import { useState } from "react";
import { X, AlertCircle, CheckCircle, Edit2 } from "lucide-react";
import { getAccountingEntry, mockLedgers } from "../data/mockAccounting";
import type { TreasuryTransaction, AccountingEntry, LedgerLine } from "../types/accounting";

interface TransactionAccountingSheetProps {
  transaction: TreasuryTransaction;
  onClose: () => void;
  onSync: (transactionId: string) => void;
}

export function TransactionAccountingSheet({
  transaction,
  onClose,
  onSync,
}: TransactionAccountingSheetProps) {
  const accountingEntry = getAccountingEntry(transaction.id);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!accountingEntry) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
        <div className="fixed top-0 right-0 h-full w-[700px] bg-white shadow-2xl z-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="font-semibold">Transaction Details</h2>
            <button onClick={onClose} className="p-1 hover:bg-accent rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Unmapped Portfolio</h3>
                <p className="text-sm text-yellow-800">
                  This transaction cannot be synced because the portfolio scheme does not have ledger
                  mappings configured. Please map ledgers in the Portfolio Accounting section first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleSync = () => {
    if (accountingEntry.status !== "ready" && accountingEntry.status !== "failed") return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onSync(transaction.id);
    }, 1500);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-[700px] bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-medium flex-shrink-0">
              {transaction.fundIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm leading-tight mb-1">{transaction.fundName}</h2>
              <span className="text-xs text-muted-foreground capitalize">
                {transaction.scenario.replace("_", " ")}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="ml-4 p-1 hover:bg-accent rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          {accountingEntry.status === "synced" && accountingEntry.syncMetadata && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">Successfully Synced</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <div>
                    Voucher Number:{" "}
                    <span className="font-medium">{accountingEntry.syncMetadata.voucherNumber}</span>
                  </div>
                  <div>
                    Reference:{" "}
                    <span className="font-medium">{accountingEntry.syncMetadata.reference}</span>
                  </div>
                  <div>
                    Synced on:{" "}
                    {new Date(accountingEntry.syncMetadata.syncedAt!).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {accountingEntry.status === "failed" && accountingEntry.syncMetadata?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Sync Failed</h3>
                <p className="text-sm text-red-800">{accountingEntry.syncMetadata.error}</p>
              </div>
            </div>
          )}

          {accountingEntry.status === "duplicate" && accountingEntry.syncMetadata?.error && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Duplicate Detected</h3>
                <p className="text-sm text-orange-800">{accountingEntry.syncMetadata.error}</p>
              </div>
            </div>
          )}

          {/* Voucher Details */}
          <div>
            <h3 className="font-semibold mb-3">Voucher Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Voucher Type" value={accountingEntry.voucherType.toUpperCase()} />
              <DetailItem label="Voucher Date" value={accountingEntry.voucherDate} />
              <DetailItem label="Provider" value={accountingEntry.provider.toUpperCase()} />
              <DetailItem
                label="Portfolio Source"
                value={accountingEntry.portfolioSource || "—"}
              />
            </div>
          </div>

          {/* Narration */}
          <div>
            <h3 className="font-semibold mb-2">Narration</h3>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              {accountingEntry.narration}
            </div>
          </div>

          {/* Ledger Lines */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Ledger Entries</h3>
              {accountingEntry.canEdit && (
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" />
                  Edit Ledgers
                </button>
              )}
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8f8fa] border-b border-border">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                      Ledger
                    </th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                      Debit
                    </th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                      Credit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accountingEntry.ledgerLines.map((line, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{line.ledger.name}</div>
                        <div className="text-xs text-muted-foreground">{line.ledger.group}</div>
                        {line.narration && (
                          <div className="text-xs text-gray-600 mt-1 italic">{line.narration}</div>
                        )}
                      </td>
                      <td className="text-right px-4 py-3">
                        {line.debit > 0 ? (
                          <span className="text-sm font-medium">
                            ₹{line.debit.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="text-right px-4 py-3">
                        {line.credit > 0 ? (
                          <span className="text-sm font-medium">
                            ₹{line.credit.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Totals */}
                  <tr className="bg-[#f8f8fa] font-semibold">
                    <td className="px-4 py-3 text-sm">Total</td>
                    <td className="text-right px-4 py-3 text-sm">
                      ₹{accountingEntry.totalDebit.toLocaleString("en-IN")}
                    </td>
                    <td className="text-right px-4 py-3 text-sm">
                      ₹{accountingEntry.totalCredit.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold mb-3">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Raised By" value={transaction.raisedBy} />
              <DetailItem label="Transaction Date" value={transaction.transactionDate} />
              {transaction.units && (
                <DetailItem label="Units" value={transaction.units.toLocaleString("en-IN")} />
              )}
              <DetailItem
                label="Amount"
                value={`₹${transaction.amount.toLocaleString("en-IN")}`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Close
            </button>
            {(accountingEntry.status === "ready" || accountingEntry.status === "failed") && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSyncing ? "Syncing..." : "Sync to " + accountingEntry.provider.toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
