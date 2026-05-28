import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PortfolioDetails } from "./PortfolioDetails";

const holdings = [
  {
    id: "AB",
    name: "Aditya Birla Sun Life Nifty Next 50 Index Fund - Regular - Growth",
    currentValue: 100.00,
    currentlyInvested: 100.00,
    xirr: "0.01%"
  },
  {
    id: "AO",
    name: "Axis Overnight Fund Regular Plan - Growth",
    currentValue: 7412768,
    currentlyInvested: 74000000,
    xirr: "0.00%"
  },
  {
    id: "FP",
    name: "Franklin Pension Plan - Growth",
    currentValue: 150000,
    currentlyInvested: 150000,
    xirr: "0.00%"
  },
  {
    id: "IP",
    name: "Icici Prudential Child Care Fund (Gift Plan)",
    currentValue: 10000000,
    currentlyInvested: 10000000,
    xirr: "—"
  },
  {
    id: "JO",
    name: "Jm Overnight Fund - Regular - Growth",
    currentValue: 200000,
    currentlyInvested: 200000,
    xirr: "-0.01%"
  }
];

export function Portfolio() {
  const [selectedHolding, setSelectedHolding] = useState<typeof holdings[0] | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalInvested = 12.73;
  const currentValue = 12.76;
  const currentlyInvested = 12.73;
  const bookedPnl = 0.00;

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
          <h1 className="text-3xl font-semibold">Portfolio</h1>
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
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Invested" value={`₹${totalInvested} Cr`} />
          <StatCard label="Current Value" value={`₹${currentValue} Cr`} />
          <StatCard label="Currently Invested" value={`₹${currentlyInvested} Cr`} />
          <StatCard label="Booked P&L" value={`₹${bookedPnl.toFixed(2)}`} />
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-lg border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[#f8f8fa]">
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Fund Name</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Current value</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Currently invested</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">XIRR</th>
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
                          {holding.id}
                        </div>
                        <span className="text-sm">{holding.name}</span>
                      </div>
                    </td>
                    <td className="text-right px-6 py-4 text-sm">₹{holding.currentValue.toLocaleString()}</td>
                    <td className="text-right px-6 py-4 text-sm">₹{holding.currentlyInvested.toLocaleString()}</td>
                    <td className="text-right px-6 py-4">
                      <span className={`text-sm ${holding.xirr.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>
                        {holding.xirr}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Portfolio Details Side Panel */}
      {selectedHolding && (
        <PortfolioDetails
          holding={selectedHolding}
          onClose={() => setSelectedHolding(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="text-sm text-muted-foreground mb-2">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
