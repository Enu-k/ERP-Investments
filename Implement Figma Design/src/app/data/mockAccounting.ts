import {
  AccountingProvider,
  Ledger,
  PortfolioHolding,
  TreasuryTransaction,
  AccountingEntry,
  LedgerLine,
} from "../types/accounting";

// Mock Accounting Provider
export const mockProvider: AccountingProvider = {
  id: "prov-1",
  type: "tally",
  name: "Tally Prime",
  company: "Kodo Technologies Private Limited",
  connected: true,
  lastSync: "2026-05-27T06:30:00Z",
  health: "healthy",
  syncStats: {
    total: 156,
    synced: 142,
    failed: 3,
  },
};

// Mock Ledgers
export const mockLedgers: Ledger[] = [
  // Asset Ledgers
  {
    id: "led-1",
    name: "Aditya Birla Mutual Fund Investments",
    group: "Investments",
    provider: "tally",
    balance: 10000000,
    confidence: "high",
  },
  {
    id: "led-2",
    name: "Axis Mutual Fund Holdings",
    group: "Investments",
    provider: "tally",
    balance: 74127680,
    confidence: "high",
  },
  {
    id: "led-3",
    name: "Franklin Templeton Investments",
    group: "Investments",
    provider: "tally",
    balance: 1500000,
    confidence: "medium",
  },
  {
    id: "led-4",
    name: "ICICI Prudential MF",
    group: "Investments",
    provider: "tally",
    balance: 100000000,
    confidence: "high",
  },
  {
    id: "led-5",
    name: "JM Financial Mutual Fund",
    group: "Investments",
    provider: "tally",
    balance: 2000000,
    confidence: "low",
  },
  // Bank Ledgers
  {
    id: "led-bank-1",
    name: "HDFC Bank Current Account",
    group: "Bank Accounts",
    provider: "tally",
    balance: 50000000,
    confidence: "high",
  },
  {
    id: "led-bank-2",
    name: "ICICI Bank Treasury Account",
    group: "Bank Accounts",
    provider: "tally",
    balance: 120000000,
    confidence: "high",
  },
  {
    id: "led-bank-3",
    name: "Axis Bank Clearing Account",
    group: "Bank Accounts",
    provider: "tally",
    balance: 5000000,
    confidence: "medium",
  },
  // Income/Expense Ledgers
  {
    id: "led-inc-1",
    name: "Gain on Mutual Fund Investments",
    group: "Direct Income",
    provider: "tally",
    confidence: "high",
  },
  {
    id: "led-exp-1",
    name: "Loss on Mutual Fund Investments",
    group: "Direct Expenses",
    provider: "tally",
    confidence: "high",
  },
  {
    id: "led-inc-2",
    name: "Dividend Income - Mutual Funds",
    group: "Direct Income",
    provider: "tally",
    confidence: "high",
  },
  {
    id: "led-exp-2",
    name: "Mutual Fund Exit Load",
    group: "Direct Expenses",
    provider: "tally",
    confidence: "medium",
  },
  {
    id: "led-exp-3",
    name: "Investment Management Charges",
    group: "Direct Expenses",
    provider: "tally",
    confidence: "medium",
  },
  // Clearing Ledgers
  {
    id: "led-clear-1",
    name: "Treasury Clearing Account",
    group: "Current Liabilities",
    provider: "tally",
    confidence: "high",
  },
];

// Mock Portfolio Holdings with Accounting
export const mockPortfolioHoldings: PortfolioHolding[] = [
  {
    id: "hold-1",
    schemeName: "Aditya Birla Sun Life Nifty Next 50 Index Fund - Regular - Growth",
    schemeIcon: "AB",
    assetClass: "Equity",
    currentValue: 100.0,
    mappingStatus: "mapped",
    ledgerMappings: [
      {
        type: "asset",
        ledger: mockLedgers[0],
        required: true,
      },
      {
        type: "bank",
        ledger: mockLedgers[5],
        required: true,
      },
      {
        type: "gainLoss",
        ledger: mockLedgers[8],
        required: true,
      },
      {
        type: "dividend",
        ledger: mockLedgers[10],
        required: false,
      },
      {
        type: "charges",
        ledger: mockLedgers[11],
        required: false,
      },
      {
        type: "clearing",
        ledger: mockLedgers[13],
        required: false,
      },
    ],
    lastUpdated: "2026-05-27T06:00:00Z",
  },
  {
    id: "hold-2",
    schemeName: "Axis Overnight Fund Regular Plan - Growth",
    schemeIcon: "AO",
    assetClass: "Debt",
    currentValue: 7412768,
    mappingStatus: "partial",
    ledgerMappings: [
      {
        type: "asset",
        ledger: mockLedgers[1],
        required: true,
      },
      {
        type: "bank",
        ledger: mockLedgers[6],
        required: true,
      },
      {
        type: "gainLoss",
        ledger: null,
        required: true,
      },
      {
        type: "dividend",
        ledger: null,
        required: false,
      },
      {
        type: "charges",
        ledger: null,
        required: false,
      },
      {
        type: "clearing",
        ledger: null,
        required: false,
      },
    ],
  },
  {
    id: "hold-3",
    schemeName: "Franklin Pension Plan - Growth",
    schemeIcon: "FP",
    assetClass: "Hybrid",
    currentValue: 150000,
    mappingStatus: "unmapped",
    ledgerMappings: [
      {
        type: "asset",
        ledger: null,
        required: true,
      },
      {
        type: "bank",
        ledger: null,
        required: true,
      },
      {
        type: "gainLoss",
        ledger: null,
        required: true,
      },
      {
        type: "dividend",
        ledger: null,
        required: false,
      },
      {
        type: "charges",
        ledger: null,
        required: false,
      },
      {
        type: "clearing",
        ledger: null,
        required: false,
      },
    ],
  },
  {
    id: "hold-4",
    schemeName: "Icici Prudential Child Care Fund (Gift Plan)",
    schemeIcon: "IP",
    assetClass: "Equity",
    currentValue: 10000000,
    mappingStatus: "mapped",
    ledgerMappings: [
      {
        type: "asset",
        ledger: mockLedgers[3],
        required: true,
      },
      {
        type: "bank",
        ledger: mockLedgers[6],
        required: true,
      },
      {
        type: "gainLoss",
        ledger: mockLedgers[8],
        required: true,
      },
      {
        type: "dividend",
        ledger: mockLedgers[10],
        required: false,
      },
      {
        type: "charges",
        ledger: mockLedgers[12],
        required: false,
      },
      {
        type: "clearing",
        ledger: mockLedgers[13],
        required: false,
      },
    ],
    lastUpdated: "2026-05-20T10:00:00Z",
  },
  {
    id: "hold-5",
    schemeName: "Jm Overnight Fund - Regular - Growth",
    schemeIcon: "JO",
    assetClass: "Debt",
    currentValue: 200000,
    mappingStatus: "unmapped",
    ledgerMappings: [
      {
        type: "asset",
        ledger: null,
        required: true,
      },
      {
        type: "bank",
        ledger: null,
        required: true,
      },
      {
        type: "gainLoss",
        ledger: null,
        required: true,
      },
      {
        type: "dividend",
        ledger: null,
        required: false,
      },
      {
        type: "charges",
        ledger: null,
        required: false,
      },
      {
        type: "clearing",
        ledger: null,
        required: false,
      },
    ],
  },
];

// Mock Treasury Transactions with Accounting Status
export const mockTreasuryTransactions: TreasuryTransaction[] = [
  {
    id: "txn-1",
    fundName: "ADITYA BIRLA SUN LIFE NIFTY NEXT 50 INDEX FUND",
    fundIcon: "AB",
    scenario: "purchase",
    amount: 100,
    units: 6,
    transactionDate: "2026-05-21",
    executionStatus: "executed",
    accountingStatus: "synced",
    portfolioId: "hold-1",
    raisedBy: "Nilima Wadal",
  },
  {
    id: "txn-2",
    fundName: "AXIS OVERNIGHT FUND REGULAR PLAN - GROWTH",
    fundIcon: "AX",
    scenario: "redemption",
    amount: 60000,
    units: 1500,
    transactionDate: "2026-05-20",
    executionStatus: "executed",
    accountingStatus: "ready",
    portfolioId: "hold-2",
    raisedBy: "Nilima Wadal",
  },
  {
    id: "txn-3",
    fundName: "SBI EQUITY HYBRID FUND REGULAR GROWTH",
    fundIcon: "SB",
    scenario: "purchase",
    amount: 200000,
    units: 5000,
    transactionDate: "2026-05-18",
    executionStatus: "executed",
    accountingStatus: "synced",
    portfolioId: "hold-4",
    raisedBy: "Nilima Wadal",
  },
  {
    id: "txn-4",
    fundName: "FRANKLIN PENSION PLAN - GROWTH",
    fundIcon: "FR",
    scenario: "purchase",
    amount: 1000,
    units: 50,
    transactionDate: "2026-05-18",
    executionStatus: "executed",
    accountingStatus: "unmapped",
    portfolioId: "hold-3",
    raisedBy: "Nilima Wadal",
  },
  {
    id: "txn-5",
    fundName: "ICICI PRUDENTIAL CHILD CARE FUND",
    fundIcon: "IP",
    scenario: "dividend",
    amount: 5000,
    transactionDate: "2026-05-15",
    executionStatus: "executed",
    accountingStatus: "ready",
    portfolioId: "hold-4",
    raisedBy: "System",
  },
  {
    id: "txn-6",
    fundName: "ADITYA BIRLA SUN LIFE NIFTY NEXT 50 INDEX FUND",
    fundIcon: "AB",
    scenario: "exit_load",
    amount: 50,
    transactionDate: "2026-05-14",
    executionStatus: "executed",
    accountingStatus: "failed",
    portfolioId: "hold-1",
    raisedBy: "System",
  },
  {
    id: "txn-7",
    fundName: "AXIS OVERNIGHT FUND REGULAR PLAN - GROWTH",
    fundIcon: "AX",
    scenario: "purchase",
    amount: 7400000,
    units: 185000,
    transactionDate: "2026-04-01",
    executionStatus: "executed",
    accountingStatus: "duplicate",
    portfolioId: "hold-2",
    raisedBy: "Ankit Gawande",
  },
  {
    id: "txn-8",
    fundName: "JM OVERNIGHT FUND - REGULAR - GROWTH",
    fundIcon: "JO",
    scenario: "purchase",
    amount: 200000,
    units: 10000,
    transactionDate: "2026-03-15",
    executionStatus: "executed",
    accountingStatus: "unmapped",
    portfolioId: "hold-5",
    raisedBy: "Deva Wiraths",
  },
];

// Mock Accounting Entries
export const mockAccountingEntries: AccountingEntry[] = [
  {
    id: "entry-1",
    transactionId: "txn-1",
    voucherType: "journal",
    voucherDate: "2026-05-21",
    scenario: "purchase",
    narration: "Purchase of 6 units of Aditya Birla Sun Life Nifty Next 50 Index Fund",
    ledgerLines: [
      {
        ledger: mockLedgers[0],
        debit: 100,
        credit: 0,
        narration: "Investment asset",
      },
      {
        ledger: mockLedgers[5],
        debit: 0,
        credit: 100,
        narration: "Payment from bank",
      },
    ],
    totalDebit: 100,
    totalCredit: 100,
    provider: "tally",
    portfolioSource: "Aditya Birla Sun Life",
    syncMetadata: {
      syncedAt: "2026-05-21T10:30:00Z",
      voucherNumber: "JV-2026-001234",
      reference: "TXN-AB-210526",
    },
    status: "synced",
    canEdit: false,
  },
  {
    id: "entry-2",
    transactionId: "txn-2",
    voucherType: "journal",
    voucherDate: "2026-05-20",
    scenario: "redemption",
    narration:
      "Redemption of 1500 units of Axis Overnight Fund with gain of ₹2,000",
    ledgerLines: [
      {
        ledger: mockLedgers[6],
        debit: 60000,
        credit: 0,
        narration: "Redemption proceeds",
      },
      {
        ledger: mockLedgers[1],
        debit: 0,
        credit: 58000,
        narration: "Investment cost",
      },
      {
        ledger: mockLedgers[8],
        debit: 0,
        credit: 2000,
        narration: "Gain on redemption",
      },
    ],
    totalDebit: 60000,
    totalCredit: 60000,
    provider: "tally",
    portfolioSource: "Axis Overnight Fund",
    status: "ready",
    canEdit: true,
  },
  {
    id: "entry-3",
    transactionId: "txn-5",
    voucherType: "receipt",
    voucherDate: "2026-05-15",
    scenario: "dividend",
    narration: "Dividend received from ICICI Prudential Child Care Fund",
    ledgerLines: [
      {
        ledger: mockLedgers[6],
        debit: 5000,
        credit: 0,
        narration: "Dividend credited to bank",
      },
      {
        ledger: mockLedgers[10],
        debit: 0,
        credit: 5000,
        narration: "Dividend income",
      },
    ],
    totalDebit: 5000,
    totalCredit: 5000,
    provider: "tally",
    portfolioSource: "ICICI Prudential",
    status: "ready",
    canEdit: true,
  },
  {
    id: "entry-4",
    transactionId: "txn-6",
    voucherType: "payment",
    voucherDate: "2026-05-14",
    scenario: "exit_load",
    narration: "Exit load charged on early redemption",
    ledgerLines: [
      {
        ledger: mockLedgers[11],
        debit: 50,
        credit: 0,
        narration: "Exit load expense",
      },
      {
        ledger: mockLedgers[5],
        debit: 0,
        credit: 50,
        narration: "Payment from bank",
      },
    ],
    totalDebit: 50,
    totalCredit: 50,
    provider: "tally",
    portfolioSource: "Aditya Birla Sun Life",
    syncMetadata: {
      error: "Ledger 'Mutual Fund Exit Load' not found in Tally",
    },
    status: "failed",
    canEdit: true,
  },
  {
    id: "entry-5",
    transactionId: "txn-7",
    voucherType: "journal",
    voucherDate: "2026-04-01",
    scenario: "purchase",
    narration: "Purchase of 185000 units of Axis Overnight Fund",
    ledgerLines: [
      {
        ledger: mockLedgers[1],
        debit: 7400000,
        credit: 0,
        narration: "Investment asset",
      },
      {
        ledger: mockLedgers[6],
        debit: 0,
        credit: 7400000,
        narration: "Payment from bank",
      },
    ],
    totalDebit: 7400000,
    totalCredit: 7400000,
    provider: "tally",
    portfolioSource: "Axis Overnight Fund",
    syncMetadata: {
      error:
        "Duplicate voucher detected: JV-2026-000789 with same amount and date",
    },
    status: "duplicate",
    canEdit: true,
  },
];

// Helper function to get suggested ledgers for a mapping type
export function getSuggestedLedgers(
  type: string,
  assetClass?: string
): Ledger[] {
  switch (type) {
    case "asset":
      return mockLedgers.filter((l) => l.group === "Investments");
    case "bank":
      return mockLedgers.filter((l) => l.group === "Bank Accounts");
    case "gainLoss":
      return mockLedgers.filter(
        (l) => l.group === "Direct Income" || l.group === "Direct Expenses"
      );
    case "dividend":
      return mockLedgers.filter(
        (l) => l.group === "Direct Income" && l.name.includes("Dividend")
      );
    case "charges":
      return mockLedgers.filter(
        (l) => l.group === "Direct Expenses" && l.name.includes("Charges")
      );
    case "clearing":
      return mockLedgers.filter((l) => l.name.includes("Clearing"));
    default:
      return [];
  }
}

// Helper function to get accounting entry for transaction
export function getAccountingEntry(transactionId: string): AccountingEntry | undefined {
  return mockAccountingEntries.find((e) => e.transactionId === transactionId);
}
