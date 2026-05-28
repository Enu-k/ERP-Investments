import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { mockTreasuryTransactions, mockAccountingEntries } from "../data/mockAccounting";
import type { TreasuryTransaction, AccountingEntry, AccountingStatus } from "../types/accounting";
import { TransactionAccountingSheet } from "./TransactionAccountingSheet";

export function TransactionsAccounting() {
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>(mockTreasuryTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<TreasuryTransaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSelectTransaction = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const eligibleIds = transactions
      .filter((t) => t.accountingStatus === "ready")
      .map((t) => t.id);
    if (selectedIds.size === eligibleIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligibleIds));
    }
  };

  const handleBulkSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((t) =>
          selectedIds.has(t.id)
            ? { ...t, accountingStatus: "synced" as AccountingStatus }
            : t
        )
      );
      setSelectedIds(new Set());
      setIsSyncing(false);
    }, 2000);
  };

  const eligibleCount = transactions.filter((t) => t.accountingStatus === "ready").length;
  const syncedCount = transactions.filter((t) => t.accountingStatus === "synced").length;
  const unmappedCount = transactions.filter((t) => t.accountingStatus === "unmapped").length;
  const failedCount = transactions.filter((t) => t.accountingStatus === "failed").length;

  return (
    <div className="relative">
      {/* Header */}
      <div className="bg-white border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-accent rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-muted-foreground">Kodo Technologies Private Limited</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-medium">
            KT
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Primary O</div>
            <div className="text-xs text-muted-foreground">Primary Owner</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Transaction Accounting</h1>
            <p className="text-sm text-muted-foreground">
              Review and sync accounting entries for executed transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSyncing ? "Syncing..." : `Sync ${selectedIds.size} Selected`}
              </button>
            )}
            <DropdownMenu.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenu.Trigger asChild>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                  New transaction
                  <span className="text-xs">▼</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="bg-white rounded-lg shadow-lg border border-border p-1 min-w-[150px]"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer outline-none">
                    Purchase
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer outline-none">
                    Switch
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer outline-none">
                    Redeem
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard label="Ready to Sync" value={eligibleCount} color="blue" />
          <StatCard label="Synced" value={syncedCount} color="green" />
          <StatCard label="Unmapped" value={unmappedCount} color="gray" />
          <StatCard label="Failed" value={failedCount} color="red" />
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Accounting Entries</h2>
              {eligibleCount > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedIds.size === eligibleCount ? "Deselect All" : "Select All Ready"}
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[#f8f8fa]">
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === eligibleCount && eligibleCount > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Fund Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Scenario
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Accounting Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-border hover:bg-accent transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
                        disabled={transaction.accountingStatus !== "ready"}
                        className="rounded disabled:opacity-30"
                      />
                    </td>
                    <td
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {transaction.fundIcon}
                        </div>
                        <span className="text-sm">{transaction.fundName}</span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <span className="text-sm text-muted-foreground capitalize">
                        {transaction.scenario.replace("_", " ")}
                      </span>
                    </td>
                    <td
                      className="text-right px-6 py-4 text-sm cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      ₹{transaction.amount.toLocaleString("en-IN")}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-muted-foreground cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      {new Date(transaction.transactionDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs ${getAccountingStatusColor(
                          transaction.accountingStatus
                        )}`}
                      >
                        {getAccountingStatusLabel(transaction.accountingStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Accounting Detail Sheet */}
      {selectedTransaction && (
        <TransactionAccountingSheet
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onSync={(txnId: string) => {
            setTransactions((prev) =>
              prev.map((t) =>
                t.id === txnId ? { ...t, accountingStatus: "synced" as AccountingStatus } : t
              )
            );
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    gray: "text-gray-600",
    red: "text-destructive",
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="text-sm text-muted-foreground mb-2">{label}</div>
      <div className={`text-2xl font-semibold ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value}
      </div>
    </div>
  );
}

function getAccountingStatusColor(status: AccountingStatus) {
  switch (status) {
    case "synced":
      return "bg-green-50 text-green-700";
    case "ready":
      return "bg-blue-50 text-blue-700";
    case "initiated":
      return "bg-purple-50 text-purple-700";
    case "unmapped":
      return "bg-gray-50 text-gray-700";
    case "failed":
      return "bg-red-50 text-red-700";
    case "duplicate":
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

function getAccountingStatusLabel(status: AccountingStatus) {
  switch (status) {
    case "synced":
      return "Synced";
    case "ready":
      return "Ready to sync";
    case "initiated":
      return "Sync initiated";
    case "unmapped":
      return "Unmapped";
    case "failed":
      return "Failed";
    case "duplicate":
      return "Duplicate conflict";
    default:
      return status;
  }
}
