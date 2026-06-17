export type ProviderName = "Tally" | "Zoho Books";

export type SourceSystem = "TALLY" | "ZOHO_BOOKS";

export type InvestmentInstrumentType =
  | "LIQUID_MUTUAL_FUND"
  | "OVERNIGHT_MUTUAL_FUND"
  | "DEBT_MUTUAL_FUND"
  | "EQUITY_MUTUAL_FUND"
  | "BOND_MUTUAL_FUND"
  | "HYBRID_MUTUAL_FUND"
  | "FIXED_DEPOSIT"
  | "BOND"
  | "EQUITY"
  | "OTHER_INVESTMENT";

export type InvestmentLedgerReviewStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "REJECTED"
  | "EDITED";

export type InvestmentLedgerLifecycleStatus = "ACTIVE";

export type InvestmentLedgerReviewSource = "SUGGESTED" | "MANUAL";

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

export interface InvestmentLedgerSuggestion {
  suggestionId: string;
  ledgerId: string;
  ledgerName: string;
  sourceSystem: SourceSystem;
  accountType: string;
  ledgerGroup: string;
  parentLedgerGroup: string;
  closingBalance: number;
  currencyCode: "INR";
  suggestedLedgerCategory: "INVESTMENT";
  suggestedInstrumentType: InvestmentInstrumentType;
  selectedInstrumentType?: InvestmentInstrumentType;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidenceScore: number;
  reason: string;
  matchedSignals: string[];
  reviewStatus: InvestmentLedgerReviewStatus;
  lastSyncedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface ConfirmedInvestmentLedger {
  investmentLedgerId: string;
  ledgerId: string;
  ledgerName: string;
  sourceSystem: SourceSystem;
  accountType: string;
  ledgerGroup: string;
  investmentInstrumentType: InvestmentInstrumentType;
  closingBalance: number;
  currencyCode: "INR";
  lastSyncedAt: string;
  confirmedAt: string;
  confirmedBy: string;
  lifecycleStatus: InvestmentLedgerLifecycleStatus;
  reviewSource: InvestmentLedgerReviewSource;
  notes?: string;
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
