import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, NavLink } from "react-router";
import { Home, Briefcase, Compass, Receipt, Grid, Settings, ChevronLeft, X, CheckCircle, Clock, Database } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ERPIntegration } from "./components/ERPIntegration";
import { PortfolioAccounting } from "./components/PortfolioAccounting";
import { TransactionsAccounting } from "./components/TransactionsAccounting";

// Types
type TransactionStatus = "all" | "pending-approval" | "pending-payment" | "in-process" | "processed" | "cancelled";

interface Transaction {
  id: string;
  fundName: string;
  fundIcon: string;
  type: "Purchase" | "Switch" | "Redeem";
  raisedBy: string;
  submittedOn: string;
  amountUnits: string;
  status: "Executed" | "Pending Approval";
  statusColor: string;
}

interface Holding {
  id: string;
  name: string;
  currentValue: number;
  currentlyInvested: number;
  xirr: string;
}

// Data
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

const allTransactions: Transaction[] = [
  {
    id: "1",
    fundName: "ADITYA BIRLA SUN LIFE CRISIL IBX 60:40 SDL + AAA",
    fundIcon: "AB",
    type: "Purchase",
    raisedBy: "admin admin",
    submittedOn: "26 May 2026",
    amountUnits: "₹500",
    status: "Pending Approval",
    statusColor: "text-orange-600 bg-orange-50"
  },
  {
    id: "2",
    fundName: "ADITYA BIRLA SUN LIFE NIFTY NEXT 50 INDEX FUND",
    fundIcon: "AB",
    type: "Redeem",
    raisedBy: "Primary O",
    submittedOn: "26 May 2026",
    amountUnits: "₹50",
    status: "Pending Approval",
    statusColor: "text-orange-600 bg-orange-50"
  },
  {
    id: "3",
    fundName: "HDFC ARBITRAGE FUND-WHOLESALE PLAN - REGUL",
    fundIcon: "HD",
    type: "Purchase",
    raisedBy: "Deva Wiraths",
    submittedOn: "25 May 2026",
    amountUnits: "₹25,000",
    status: "Pending Approval",
    statusColor: "text-orange-600 bg-orange-50"
  },
  {
    id: "4",
    fundName: "ADITYA BIRLA SUN LIFE NIFTY NEXT 50 INDEX FUND",
    fundIcon: "AB",
    type: "Purchase",
    raisedBy: "Apurv",
    submittedOn: "25 May 2026",
    amountUnits: "₹50,000",
    status: "Pending Approval",
    statusColor: "text-orange-600 bg-orange-50"
  },
  {
    id: "5",
    fundName: "HDFC NIFTY G SEC APR 2029 INDEX FUND REGULA",
    fundIcon: "HD",
    type: "Purchase",
    raisedBy: "Apurv",
    submittedOn: "25 May 2026",
    amountUnits: "₹100",
    status: "Pending Approval",
    statusColor: "text-orange-600 bg-orange-50"
  },
  {
    id: "6",
    fundName: "DSP SAVINGS FUND - GROWTH",
    fundIcon: "DS",
    type: "Purchase",
    raisedBy: "Apurv",
    submittedOn: "25 May 2026",
    amountUnits: "₹20,000,000",
    status: "Pending Approval",
    statusColor: "text-orange-600 bg-orange-50"
  },
  {
    id: "7",
    fundName: "DSP SAVINGS FUND - GROWTH",
    fundIcon: "DS",
    type: "Purchase",
    raisedBy: "Apurv",
    submittedOn: "25 May 2026",
    amountUnits: "₹20,000,000",
    status: "Pending Approval",
    statusColor: "text-orange-600 bg-orange-50"
  },
  {
    id: "8",
    fundName: "AXIS MONEY MARKET FUND REGULAR GROWTH",
    fundIcon: "AX",
    type: "Purchase",
    raisedBy: "Apurv",
    submittedOn: "25 May 2026",
    amountUnits: "₹10,00,000",
    status: "Pending Approval",
    statusColor: "text-orange-600 bg-orange-50"
  }
];

const processedTransactions: Transaction[] = [
  {
    id: "101",
    fundName: "ADITYA BIRLA SUN LIFE NIFTY NEXT 50 INDEX FUND",
    fundIcon: "AB",
    type: "Purchase",
    raisedBy: "Nilima Wadal",
    submittedOn: "21 May 2026",
    amountUnits: "₹100",
    status: "Executed",
    statusColor: "text-green-600 bg-green-50"
  },
  {
    id: "102",
    fundName: "KOTAK EQUITY HYBRID FUND - REGULAR PLAN GRO",
    fundIcon: "KO",
    type: "Switch",
    raisedBy: "Ankit Gawande",
    submittedOn: "21 May 2026",
    amountUnits: "3 units",
    status: "Executed",
    statusColor: "text-green-600 bg-green-50"
  },
  {
    id: "103",
    fundName: "KOTAK EQUITY HYBRID FUND - REGULAR PLAN GRO",
    fundIcon: "KO",
    type: "Purchase",
    raisedBy: "Ankit Gawande",
    submittedOn: "21 May 2026",
    amountUnits: "₹25,000",
    status: "Executed",
    statusColor: "text-green-600 bg-green-50"
  },
  {
    id: "104",
    fundName: "AXIS OVERNIGHT FUND REGULAR PLAN - GROWTH",
    fundIcon: "AX",
    type: "Redeem",
    raisedBy: "Nilima Wadal",
    submittedOn: "20 May 2026",
    amountUnits: "₹60,000",
    status: "Executed",
    statusColor: "text-green-600 bg-green-50"
  },
  {
    id: "105",
    fundName: "SBI EQUITY HYBRID FUND REGULAR GROWTH",
    fundIcon: "SB",
    type: "Purchase",
    raisedBy: "Nilima Wadal",
    submittedOn: "18 May 2026",
    amountUnits: "₹2,00,000",
    status: "Executed",
    statusColor: "text-green-600 bg-green-50"
  },
  {
    id: "106",
    fundName: "FRANKLIN PENSION PLAN - GROWTH",
    fundIcon: "FR",
    type: "Purchase",
    raisedBy: "Nilima Wadal",
    submittedOn: "18 May 2026",
    amountUnits: "₹1,000",
    status: "Executed",
    statusColor: "text-green-600 bg-green-50"
  },
  {
    id: "107",
    fundName: "KOTAK EQUITY HYBRID FUND - REGULAR PLAN GRO",
    fundIcon: "KO",
    type: "Purchase",
    raisedBy: "Ankit Gawande",
    submittedOn: "18 May 2026",
    amountUnits: "₹101",
    status: "Executed",
    statusColor: "text-green-600 bg-green-50"
  },
  {
    id: "108",
    fundName: "FRANKLIN PENSION PLAN - GROWTH",
    fundIcon: "FR",
    type: "Purchase",
    raisedBy: "user user",
    submittedOn: "18 May 2026",
    amountUnits: "₹600",
    status: "Executed",
    statusColor: "text-green-600 bg-green-50"
  }
];

const portfolioTransactions = [
  { date: "21 May 2026", type: "Purchase", units: 6, amount: 100.00 }
];

// Components
function Layout() {
  return (
    <div className="flex h-screen bg-[#f8f8fa]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">Kodo</span>
            <span className="text-lg text-muted-foreground">North</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={Grid} to="/agent" label="Agent" />
          <NavItem icon={Home} to="/home" label="Home" />
          <NavItem icon={Briefcase} to="/portfolio" label="Portfolio" />
          <NavItem icon={Compass} to="/explore" label="Explore" />
          <NavItem icon={Receipt} to="/transactions" label="Transactions" />
          <NavItem icon={Database} to="/erp-integration" label="ERP Integration" />
          <div className="pt-4">
            <NavItem icon={Settings} to="/integrations" label="Integrations" collapsible />
          </div>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-border">
          <NavItem icon={Settings} to="/settings" label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon: Icon,
  to,
  label,
  collapsible = false
}: {
  icon: React.ElementType;
  to: string;
  label: string;
  collapsible?: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-accent"
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {collapsible && <span className="ml-auto text-xs">›</span>}
    </NavLink>
  );
}

function Portfolio() {
  const [selectedHolding, setSelectedHolding] = useState<typeof holdings[0] | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalInvested = 12.73;
  const currentValue = 12.76;
  const currentlyInvested = 12.73;
  const bookedPnl = 0.00;

  return (
    <div className="relative">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="px-8 py-4 flex items-center justify-between border-b border-border">
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
        <div className="px-8 flex gap-6 border-b border-border">
          <NavLink
            to="/portfolio"
            className={({ isActive }) =>
              `pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            Holdings
          </NavLink>
          <NavLink
            to="/portfolio-accounting"
            className={({ isActive }) =>
              `pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            Accounting
          </NavLink>
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

function PortfolioDetails({ holding, onClose }: { holding: Holding; onClose: () => void }) {
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
              {portfolioTransactions.map((transaction, index) => (
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

function Transactions() {
  const [activeTab, setActiveTab] = useState<TransactionStatus>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentTransactions = activeTab === "processed" ? processedTransactions : allTransactions;

  return (
    <div className="relative">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="px-8 py-4 flex items-center justify-between border-b border-border">
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
        <div className="px-8 flex gap-6 border-b border-border">
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            All Transactions
          </NavLink>
          <NavLink
            to="/transactions-accounting"
            className={({ isActive }) =>
              `pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            Accounting
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Transactions</h1>
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

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionStatus)}>
          <Tabs.List className="flex gap-6 border-b border-border mb-6">
            <TabTrigger value="all">All</TabTrigger>
            <TabTrigger value="pending-approval">Pending Approval</TabTrigger>
            <TabTrigger value="pending-payment">Pending Payment</TabTrigger>
            <TabTrigger value="in-process">In Process</TabTrigger>
            <TabTrigger value="processed">Processed</TabTrigger>
            <TabTrigger value="cancelled">Cancelled</TabTrigger>
          </Tabs.List>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[#f8f8fa]">
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Fund Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Raised By</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Submitted On</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Amount/Units</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {transaction.fundIcon}
                        </div>
                        <span className="text-sm">{transaction.fundName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{transaction.raisedBy}</td>
                    <td className="px-6 py-4 text-sm">{transaction.submittedOn}</td>
                    <td className="text-right px-6 py-4 text-sm">{transaction.amountUnits}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs ${transaction.statusColor}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Root>
      </div>

      {/* Transaction Details Side Panel */}
      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}

function TabTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <Tabs.Trigger
      value={value}
      className="pb-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
    >
      {children}
    </Tabs.Trigger>
  );
}

function getTypeColor(type: string) {
  switch (type) {
    case "Purchase":
      return "bg-blue-50 text-blue-700";
    case "Switch":
      return "bg-purple-50 text-purple-700";
    case "Redeem":
      return "bg-pink-50 text-pink-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

function TransactionDetails({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  const isExecuted = transaction.status === "Executed";

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
              {transaction.fundIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm leading-tight">{transaction.fundName}</h2>
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
          {/* Amount */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Amount</div>
            <div className="text-3xl font-semibold">{transaction.amountUnits}</div>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Transaction Type</div>
              <span className={`inline-block px-3 py-1 rounded text-xs ${getTypeColor(transaction.type)}`}>
                {transaction.type}
              </span>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <span className={`inline-block px-3 py-1 rounded text-xs ${transaction.statusColor}`}>
                {transaction.status}
              </span>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Raised By</div>
              <div className="text-sm font-medium">{transaction.raisedBy}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Date</div>
              <div className="text-sm font-medium">{transaction.submittedOn}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Risk Level</div>
              <div className="text-sm font-medium">—</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Audit</div>
              <div className="text-sm font-medium">—</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Expense Ratio</div>
              <div className="text-sm font-medium">—</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Returns (1Y)</div>
              <div className="text-sm font-medium text-green-600">8.1%</div>
            </div>
          </div>

          {/* Approval Workflow */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Approval Workflow</h3>
              <span className="text-xs text-muted-foreground">
                {isExecuted ? "0/1 approved" : "0/1 approved"}
              </span>
            </div>
            <div className="space-y-4">
              {isExecuted ? (
                <ApprovalStep
                  name="Nilima Wadal"
                  status="approved"
                  date="21 May 2026, 3:06 am"
                  icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                />
              ) : (
                <>
                  <ApprovalStep
                    name="Nilima Wadal"
                    status="approved"
                    date="21 May 2026, 3:06 am"
                    icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                  />
                  <ApprovalStep
                    name="Level 1"
                    status="pending"
                    date="21 approved · Pending"
                    icon={<Clock className="w-5 h-5 text-orange-500" />}
                    subApprovers={[
                      { name: "Anchal Sethi", status: "pending" },
                      { name: "Ajay S", status: "pending" },
                      { name: "Dravna Cotton", status: "pending" }
                    ]}
                  />
                  <ApprovalStep
                    name="Level 2"
                    status="pending"
                    date="Pending"
                    icon={<div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ApprovalStep({
  name,
  status,
  date,
  icon,
  subApprovers
}: {
  name: string;
  status: "approved" | "pending";
  date: string;
  icon: React.ReactNode;
  subApprovers?: { name: string; status: string }[];
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{name}</span>
          <span className={`text-xs ${status === "approved" ? "text-green-600" : "text-orange-500"}`}>
            {date}
          </span>
        </div>
        {subApprovers && (
          <div className="mt-2 space-y-1">
            {subApprovers.map((approver, index) => (
              <div key={index} className="flex items-center justify-between text-xs text-muted-foreground pl-4">
                <span>{approver.name}</span>
                <span className="text-orange-500">Pending</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/portfolio" replace />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="portfolio-accounting" element={<PortfolioAccounting />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="transactions-accounting" element={<TransactionsAccounting />} />
          <Route path="erp-integration" element={<ERPIntegration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
