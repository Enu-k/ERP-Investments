import { useState } from "react";
import { ChevronLeft, X, Check } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { mockPortfolioHoldings, getSuggestedLedgers } from "../data/mockAccounting";
import type { PortfolioHolding, Ledger, LedgerMappingType, PortfolioLedgerMapping } from "../types/accounting";

export function PortfolioAccounting() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(mockPortfolioHoldings);
  const [selectedHolding, setSelectedHolding] = useState<PortfolioHolding | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSaveMappings = (holdingId: string, mappings: PortfolioLedgerMapping[]) => {
    setHoldings((prev) =>
      prev.map((h) => {
        if (h.id === holdingId) {
          const requiredMapped = mappings.filter((m) => m.required).every((m) => m.ledger !== null);
          return {
            ...h,
            ledgerMappings: mappings,
            mappingStatus: requiredMapped ? "mapped" : "partial",
            lastUpdated: new Date().toISOString(),
          };
        }
        return h;
      })
    );
    setSelectedHolding(null);
  };

  const mappedCount = holdings.filter((h) => h.mappingStatus === "mapped").length;
  const partialCount = holdings.filter((h) => h.mappingStatus === "partial").length;
  const unmappedCount = holdings.filter((h) => h.mappingStatus === "unmapped").length;

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
            <h1 className="text-3xl font-semibold mb-2">Portfolio Accounting</h1>
            <p className="text-sm text-muted-foreground">
              Map ledgers for each investment scheme to enable accounting sync
            </p>
          </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard label="Mapped" value={mappedCount} color="green" />
          <StatCard label="Partially Mapped" value={partialCount} color="yellow" />
          <StatCard label="Unmapped" value={unmappedCount} color="gray" />
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-lg border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">Portfolio Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[#f8f8fa]">
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Scheme Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Asset Class
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">
                    Current Value
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Mapping Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr
                    key={holding.id}
                    className="border-b border-border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedHolding(holding)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-medium">
                          {holding.schemeIcon}
                        </div>
                        <span className="text-sm">{holding.schemeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{holding.assetClass}</span>
                    </td>
                    <td className="text-right px-6 py-4 text-sm">
                      ₹{holding.currentValue.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs ${getMappingStatusColor(
                          holding.mappingStatus
                        )}`}
                      >
                        {holding.mappingStatus === "mapped"
                          ? "Mapped"
                          : holding.mappingStatus === "partial"
                          ? "Partially Mapped"
                          : "Unmapped"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {holding.lastUpdated
                        ? new Date(holding.lastUpdated).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ledger Mapping Side Panel */}
      {selectedHolding && (
        <LedgerMappingSheet
          holding={selectedHolding}
          onClose={() => setSelectedHolding(null)}
          onSave={handleSaveMappings}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    gray: "bg-gray-50 text-gray-700",
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

function getMappingStatusColor(status: string) {
  switch (status) {
    case "mapped":
      return "bg-green-50 text-green-700";
    case "partial":
      return "bg-yellow-50 text-yellow-700";
    case "unmapped":
      return "bg-gray-50 text-gray-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

function LedgerMappingSheet({
  holding,
  onClose,
  onSave,
}: {
  holding: PortfolioHolding;
  onClose: () => void;
  onSave: (holdingId: string, mappings: PortfolioLedgerMapping[]) => void;
}) {
  const [mappings, setMappings] = useState<PortfolioLedgerMapping[]>(holding.ledgerMappings);

  const handleLedgerSelect = (type: LedgerMappingType, ledger: Ledger) => {
    setMappings((prev) =>
      prev.map((m) => (m.type === type ? { ...m, ledger } : m))
    );
  };

  const handleSave = () => {
    onSave(holding.id, mappings);
  };

  const getLedgerTypeLabel = (type: LedgerMappingType) => {
    const labels = {
      asset: "Asset Ledger",
      bank: "Bank Ledger",
      gainLoss: "Gain/Loss Income Ledger",
      dividend: "Dividend Ledger",
      charges: "Charges Ledger",
      clearing: "Clearing Ledger",
    };
    return labels[type];
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-medium flex-shrink-0">
              {holding.schemeIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm leading-tight mb-1">{holding.schemeName}</h2>
              <span className="text-xs text-muted-foreground">{holding.assetClass}</span>
            </div>
          </div>
          <button onClick={onClose} className="ml-4 p-1 hover:bg-accent rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-1">Ledger Mapping</h3>
            <p className="text-sm text-muted-foreground">
              Map ERP ledgers to enable automatic accounting entry generation
            </p>
          </div>

          {/* Ledger Mappings */}
          <div className="space-y-4">
            {mappings.map((mapping) => (
              <LedgerMappingRow
                key={mapping.type}
                mapping={mapping}
                label={getLedgerTypeLabel(mapping.type)}
                suggestions={getSuggestedLedgers(mapping.type, holding.assetClass)}
                onSelect={(ledger) => handleLedgerSelect(mapping.type, ledger)}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Save Mappings
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function LedgerMappingRow({
  mapping,
  label,
  suggestions,
  onSelect,
}: {
  mapping: PortfolioLedgerMapping;
  label: string;
  suggestions: Ledger[];
  onSelect: (ledger: Ledger) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">
          {label}
          {mapping.required && <span className="text-destructive ml-1">*</span>}
        </label>
      </div>
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <button className="w-full px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-left flex items-center justify-between">
            <span className={`text-sm ${mapping.ledger ? "" : "text-muted-foreground"}`}>
              {mapping.ledger ? mapping.ledger.name : "Select ledger..."}
            </span>
            <span className="text-xs">▼</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="bg-white rounded-lg shadow-lg border border-border p-1 w-[550px] max-h-[300px] overflow-y-auto"
            align="start"
            sideOffset={4}
          >
            {suggestions.map((ledger) => (
              <DropdownMenu.Item
                key={ledger.id}
                className="px-3 py-2 rounded hover:bg-accent cursor-pointer outline-none"
                onSelect={() => onSelect(ledger)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{ledger.name}</div>
                    <div className="text-xs text-muted-foreground">{ledger.group}</div>
                  </div>
                  {ledger.confidence && (
                    <span
                      className={`px-2 py-1 rounded text-xs ml-2 ${
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
                </div>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
