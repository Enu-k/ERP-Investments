import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TransactionDetails } from "./TransactionDetails";

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

export function Transactions() {
  const [activeTab, setActiveTab] = useState<TransactionStatus>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentTransactions = activeTab === "processed" ? processedTransactions : allTransactions;

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
