// Accounting Provider Types
export type ProviderType = "tally" | "zoho";

export interface AccountingProvider {
  id: string;
  type: ProviderType;
  name: string;
  company: string;
  orgId?: string;
  connected: boolean;
  lastSync: string;
  health: "healthy" | "warning" | "error";
  syncStats?: {
    total: number;
    synced: number;
    failed: number;
  };
}

// Ledger Types
export interface Ledger {
  id: string;
  name: string;
  group: string;
  provider: ProviderType;
  balance?: number;
  confidence?: "high" | "medium" | "low";
}

export type LedgerMappingType =
  | "asset"
  | "bank"
  | "gainLoss"
  | "dividend"
  | "charges"
  | "clearing";

export interface PortfolioLedgerMapping {
  type: LedgerMappingType;
  ledger: Ledger | null;
  required: boolean;
}

// Portfolio Types
export type MappingStatus = "unmapped" | "partial" | "mapped";

export interface PortfolioHolding {
  id: string;
  schemeName: string;
  schemeIcon: string;
  assetClass: string;
  currentValue: number;
  mappingStatus: MappingStatus;
  ledgerMappings: PortfolioLedgerMapping[];
  lastUpdated?: string;
}

// Transaction Accounting Types
export type AccountingStatus =
  | "unmapped"
  | "ready"
  | "initiated"
  | "synced"
  | "failed"
  | "duplicate";

export type TransactionScenario =
  | "purchase"
  | "redemption"
  | "partial_redemption"
  | "switch"
  | "dividend"
  | "exit_load"
  | "mtm"
  | "sweep_in"
  | "sweep_out";

export interface TreasuryTransaction {
  id: string;
  fundName: string;
  fundIcon: string;
  scenario: TransactionScenario;
  amount: number;
  units?: number;
  transactionDate: string;
  executionStatus: "executed" | "pending";
  accountingStatus: AccountingStatus;
  portfolioId: string;
  raisedBy: string;
}

// Accounting Entry Types
export type VoucherType =
  | "journal"
  | "payment"
  | "receipt"
  | "contra"
  | "sales"
  | "purchase";

export interface LedgerLine {
  ledger: Ledger;
  debit: number;
  credit: number;
  narration?: string;
}

export interface AccountingEntry {
  id: string;
  transactionId: string;
  voucherType: VoucherType;
  voucherDate: string;
  scenario: TransactionScenario;
  narration: string;
  ledgerLines: LedgerLine[];
  totalDebit: number;
  totalCredit: number;
  provider: ProviderType;
  portfolioSource?: string;
  syncMetadata?: {
    syncedAt?: string;
    voucherNumber?: string;
    reference?: string;
    error?: string;
  };
  status: AccountingStatus;
  canEdit: boolean;
}
