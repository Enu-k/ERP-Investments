import { X } from "lucide-react";

interface Holding {
  id: string;
  name: string;
  currentValue: number;
  currentlyInvested: number;
  xirr: string;
}

interface PortfolioDetailsProps {
  holding: Holding;
  onClose: () => void;
}

const transactions = [
  { date: "21 May 2026", type: "Purchase", units: 6, amount: 100.00 }
];

export function PortfolioDetails({ holding, onClose }: PortfolioDetailsProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-medium flex-shrink-0">
              {holding.id}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm leading-tight mb-1">{holding.name}</h2>
              <span className="text-xs text-muted-foreground">Direct</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Value & XIRR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Current Value</div>
              <div className="text-2xl font-semibold">₹{holding.currentValue.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">XIRR</div>
              <div className="text-2xl font-semibold text-green-600">{holding.xirr}</div>
            </div>
          </div>

          {/* Units & Unrealized P&L */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Currently invested</div>
              <div className="text-lg font-semibold">₹{holding.currentlyInvested.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Unrealized P&L</div>
              <div className="text-lg font-semibold">₹0.00</div>
            </div>
          </div>

          {/* Booked P&L */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Booked P&L</div>
              <div className="text-lg font-semibold">0</div>
            </div>
          </div>

          {/* Holding Details */}
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold mb-4">Holding details</h3>
            <div className="space-y-3">
              <DetailRow label="Plan Number" value="dummy-X09CGEEE5JI" />
              <DetailRow label="Units held" value="5.93" />
              <DetailRow label="Current NAV" value="₹16.85 (30 Apr 2021)" />
              <DetailRow label="Avg buy price" value="₹16.85" />
              <DetailRow label="Size" value="0" />
              <DetailRow label="Exit load" value="—" />
            </div>
          </div>

          {/* Transaction History */}
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold mb-4">Transaction history</h3>
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm">{transaction.date}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                      {transaction.type}
                    </span>
                    <span className="text-sm">{transaction.units}</span>
                    <span className="text-sm font-medium">₹{transaction.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
              Switch
            </button>
            <button className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
              Redeem
            </button>
            <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              Purchase
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
