export type ProviderName = "Tally" | "Zoho Books";

export type LedgerRole =
  | "investmentAsset"
  | "bank"
  | "gain"
  | "loss"
  | "dividend"
  | "charges"
  | "clearing";

export type AccountingStatus =
  | "Unmapped"
  | "Ready to sync"
  | "Sync initiated"
  | "Synced"
  | "Failed"
  | "Duplicate conflict";

export type Scenario =
  | "INITIAL_INVESTMENT"
  | "REDEMPTION_WITH_GAIN"
  | "REDEMPTION_WITH_LOSS"
  | "PARTIAL_REDEMPTION"
  | "SWITCH_BETWEEN_FUNDS"
  | "IDCW_DIVIDEND_RECEIPT"
  | "EXIT_LOAD_CHARGES"
  | "MARK_TO_MARKET_GAIN"
  | "AUTO_SWEEP_OUT"
  | "REVERSE_SWEEP_IN";

export interface AccountingProvider {
  id: string;
  name: ProviderName;
  company: string;
  status: "Connected" | "Warning" | "Action needed";
  health: string;
  lastSync: string;
  synced: number;
  failed: number;
}

export interface Ledger {
  id: string;
  name: string;
  group: string;
  provider: ProviderName;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  balance?: number;
}

export type LedgerMapping = Partial<Record<LedgerRole, string>>;

export interface PortfolioHolding {
  id: string;
  scheme: string;
  icon: string;
  assetClass: string;
  currentValue: number;
  currentlyInvested: number;
  bookedPnl: number;
  xirr: string;
  units: number;
  nav: number;
  provider: ProviderName;
  ledgerMapping: LedgerMapping;
  lastUpdated?: string;
}

export interface LedgerLine {
  id: string;
  role: LedgerRole;
  ledgerId?: string;
  amount: number;
  side: "Dr" | "Cr";
  component: string;
  narration: string;
}

export interface AccountingEntry {
  voucherType: "Journal" | "Receipt" | "Contra";
  voucherDate: string;
  narration: string;
  lines: LedgerLine[];
  voucherNumber?: string;
  reference?: string;
  syncedAt?: string;
  error?: string;
}

export interface TreasuryTransaction {
  id: string;
  refId: string;
  portfolioId: string;
  fundName: string;
  fundIcon: string;
  scenario: Scenario;
  amount: number;
  units?: number;
  raisedBy: string;
  transactionStatus: "Approved" | "Pending Approval";
  executionStatus: "Executed" | "Pending";
  submittedOn: string;
  accountingStatus: AccountingStatus;
  provider: ProviderName;
  entry: AccountingEntry;
}
