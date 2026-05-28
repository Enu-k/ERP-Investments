import { X, CheckCircle, Clock } from "lucide-react";

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

interface TransactionDetailsProps {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionDetails({ transaction, onClose }: TransactionDetailsProps) {
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
