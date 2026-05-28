import { useState } from "react";
import { ChevronLeft, RefreshCw, CheckCircle, AlertCircle, Database } from "lucide-react";
import { mockProvider, mockLedgers } from "../data/mockAccounting";
import type { AccountingProvider, Ledger } from "../types/accounting";

export function ERPIntegration() {
  const [provider] = useState<AccountingProvider>(mockProvider);
  const [ledgers] = useState<Ledger[]>(mockLedgers);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshLedgers = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  return (
    <div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">ERP Integration</h1>
          <p className="text-sm text-muted-foreground">
            Manage accounting provider connection and ledger synchronization
          </p>
        </div>

        {/* Provider Status Card */}
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">{provider.name}</h2>
                <p className="text-sm text-muted-foreground">{provider.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {provider.health === "healthy" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  provider.health === "healthy" ? "text-green-600" : "text-orange-500"
                }`}
              >
                {provider.health === "healthy" ? "Connected" : "Warning"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Last Synced</div>
              <div className="text-sm font-medium">
                {new Date(provider.lastSync).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total Synced</div>
              <div className="text-sm font-medium">{provider.syncStats?.synced || 0}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Failed</div>
              <div className="text-sm font-medium text-destructive">
                {provider.syncStats?.failed || 0}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleRefreshLedgers}
              disabled={isRefreshing}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh Ledgers"}
            </button>
            <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
              Configure Connection
            </button>
          </div>
        </div>

        {/* Ledgers Table */}
        <div className="bg-white rounded-lg border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">Imported Ledgers</h2>
            <div className="text-sm text-muted-foreground">{ledgers.length} ledgers</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[#f8f8fa]">
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Ledger Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Group
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">
                    Balance
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledgers.map((ledger) => (
                  <tr key={ledger.id} className="border-b border-border hover:bg-accent transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm">{ledger.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{ledger.group}</span>
                    </td>
                    <td className="text-right px-6 py-4">
                      <span className="text-sm">
                        {ledger.balance !== undefined
                          ? `₹${ledger.balance.toLocaleString("en-IN")}`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ledger.confidence && (
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            ledger.confidence === "high"
                              ? "bg-green-50 text-green-700"
                              : ledger.confidence === "medium"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {ledger.confidence}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
