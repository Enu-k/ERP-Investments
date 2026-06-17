import type {
  AccountingEntry,
  AccountingProvider,
  AccountingStatus,
  ConfirmedInvestmentLedger,
  InvestmentInstrumentType,
  InvestmentLedgerSuggestion,
  Ledger,
  LedgerLine,
  LedgerMapping,
  LedgerRole,
  PortfolioHolding,
  ProviderName,
  Scenario,
  TreasuryTransaction
} from "../types/accounting";

export const providers: AccountingProvider[] = [
  {
    id: "tally",
    name: "Tally",
    company: "Kodo Technologies Private Limited",
    status: "Connected",
    health: "TCP loaded, active company matched",
    lastSync: "27 May 2026, 11:42 AM",
    synced: 142,
    failed: 3
  },
  {
    id: "zoho",
    name: "Zoho Books",
    company: "Kodo Technologies Private Limited",
    status: "Connected",
    health: "OAuth active, organization matched",
    lastSync: "27 May 2026, 10:58 AM",
    synced: 38,
    failed: 1
  }
];

export const ledgers: Ledger[] = [
  { id: "hdfc-liquid-fund", name: "HDFC Liquid Fund", group: "Other Assets", provider: "Zoho Books", confidence: "HIGH", balance: 3580 },
  { id: "sbi-equity-fund", name: "SBI Equity Fund", group: "Mutual Funds", provider: "Zoho Books", confidence: "MEDIUM", balance: 7450 },
  { id: "axis-corporate-bond-fund", name: "Axis Corporate Bond Fund", group: "Debt Assets", provider: "Tally", confidence: "LOW", balance: 12300 },
  { id: "icici-balanced-fund", name: "ICICI Balanced Fund", group: "Mixed Assets", provider: "Tally", confidence: "HIGH", balance: 8150 },
  { id: "liquid", name: "Investments - Liquid Mutual Funds", group: "Investments", provider: "Tally", confidence: "HIGH", balance: 5000000 },
  { id: "overnight", name: "Investments - Overnight Funds", group: "Investments", provider: "Tally", confidence: "HIGH", balance: 2240000 },
  { id: "debt", name: "Investments - Debt Funds", group: "Investments", provider: "Tally", confidence: "MEDIUM", balance: 1800000 },
  { id: "hdfc", name: "HDFC Bank Current Account", group: "Bank Accounts", provider: "Tally", confidence: "HIGH", balance: 6250000 },
  { id: "icici", name: "ICICI Bank Treasury Account", group: "Bank Accounts", provider: "Tally", confidence: "HIGH", balance: 2500000 },
  { id: "gain", name: "Treasury Income - Realized Gains", group: "Direct Income", provider: "Tally", confidence: "HIGH" },
  { id: "loss", name: "Treasury Loss - Redemption Loss", group: "Direct Expenses", provider: "Tally", confidence: "HIGH" },
  { id: "dividend", name: "Treasury Income - Dividend Income", group: "Direct Income", provider: "Tally", confidence: "HIGH" },
  { id: "charges", name: "Investment Charges / Exit Load", group: "Direct Expenses", provider: "Tally", confidence: "MEDIUM" },
  { id: "clearing", name: "Treasury Clearing Account", group: "Current Liabilities", provider: "Tally", confidence: "HIGH" },
  { id: "zoho-liquid", name: "Mutual Fund Investments", group: "Other Current Assets", provider: "Zoho Books", confidence: "HIGH", balance: 4750000 },
  { id: "zoho-bank", name: "HDFC Bank - Zoho Books", group: "Bank", provider: "Zoho Books", confidence: "HIGH", balance: 3880000 },
  { id: "zoho-gain", name: "Realized Gain on Investments", group: "Other Income", provider: "Zoho Books", confidence: "HIGH" },
  { id: "zoho-loss", name: "Investment Redemption Loss", group: "Expense", provider: "Zoho Books", confidence: "MEDIUM" },
  { id: "zoho-clearing", name: "Treasury Transfer Clearing", group: "Other Current Liability", provider: "Zoho Books", confidence: "HIGH" }
];

export const scenarioLabels: Record<Scenario, string> = {
  INITIAL_INVESTMENT: "Purchase",
  REDEMPTION_WITH_GAIN: "Redeem",
  REDEMPTION_WITH_LOSS: "Redeem",
  PARTIAL_REDEMPTION: "Redeem",
  SWITCH_BETWEEN_FUNDS: "Switch",
  IDCW_DIVIDEND_RECEIPT: "Dividend",
  EXIT_LOAD_CHARGES: "Exit load",
  MARK_TO_MARKET_GAIN: "MTM gain",
  AUTO_SWEEP_OUT: "Sweep out",
  REVERSE_SWEEP_IN: "Sweep in"
};

export const roleLabels: Record<LedgerRole, string> = {
  investmentAsset: "Asset Ledger",
  bank: "Bank Ledger",
  gain: "Realized Gain Ledger",
  loss: "Realized Loss Ledger",
  dividend: "Dividend Ledger",
  charges: "Charges Ledger",
  clearing: "Clearing Ledger"
};

export const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export const instrumentTypeLabels: Record<InvestmentInstrumentType, string> = {
  LIQUID_MUTUAL_FUND: "Liquid MF",
  OVERNIGHT_MUTUAL_FUND: "Overnight MF",
  DEBT_MUTUAL_FUND: "Debt MF",
  EQUITY_MUTUAL_FUND: "Equity MF",
  BOND_MUTUAL_FUND: "Bond MF",
  HYBRID_MUTUAL_FUND: "Hybrid MF",
  FIXED_DEPOSIT: "Fixed Deposit",
  BOND: "Bond",
  EQUITY: "Equity",
  OTHER_INVESTMENT: "Other Investment"
};

export const formatInstrumentType = (type: InvestmentInstrumentType) => instrumentTypeLabels[type];

export const investmentLedgerSuggestions: InvestmentLedgerSuggestion[] = [
  {
    suggestionId: "SUGG-001",
    ledgerId: "hdfc-liquid-fund",
    ledgerName: "HDFC Liquid Fund",
    sourceSystem: "ZOHO_BOOKS",
    accountType: "other_current_assets",
    ledgerGroup: "Other Assets",
    parentLedgerGroup: "Assets",
    closingBalance: 3580,
    currencyCode: "INR",
    suggestedLedgerCategory: "INVESTMENT",
    suggestedInstrumentType: "LIQUID_MUTUAL_FUND",
    confidence: "HIGH",
    confidenceScore: 0.92,
    reason: "Ledger name contains Liquid Fund and the account type is other current assets.",
    matchedSignals: ["ledger_name: liquid fund", "account_type: other_current_assets"],
    reviewStatus: "PENDING_CONFIRMATION",
    lastSyncedAt: "2026-05-28T12:00:00Z"
  },
  {
    suggestionId: "SUGG-002",
    ledgerId: "sbi-equity-fund",
    ledgerName: "SBI Equity Fund",
    sourceSystem: "ZOHO_BOOKS",
    accountType: "current_asset",
    ledgerGroup: "Mutual Funds",
    parentLedgerGroup: "Assets",
    closingBalance: 7450,
    currencyCode: "INR",
    suggestedLedgerCategory: "INVESTMENT",
    suggestedInstrumentType: "EQUITY_MUTUAL_FUND",
    confidence: "MEDIUM",
    confidenceScore: 0.72,
    reason: "Ledger name includes Equity Fund and the ledger group maps to mutual funds.",
    matchedSignals: ["ledger_name: equity fund", "ledger_group: mutual funds"],
    reviewStatus: "PENDING_CONFIRMATION",
    lastSyncedAt: "2026-05-28T12:00:00Z"
  },
  {
    suggestionId: "SUGG-003",
    ledgerId: "axis-corporate-bond-fund",
    ledgerName: "Axis Corporate Bond Fund",
    sourceSystem: "TALLY",
    accountType: "current_asset",
    ledgerGroup: "Debt Assets",
    parentLedgerGroup: "Assets",
    closingBalance: 12300,
    currencyCode: "INR",
    suggestedLedgerCategory: "INVESTMENT",
    suggestedInstrumentType: "BOND_MUTUAL_FUND",
    confidence: "LOW",
    confidenceScore: 0.48,
    reason: "Ledger name includes Corporate Bond Fund, but the accounting group needs confirmation.",
    matchedSignals: ["ledger_name: corporate bond fund", "ledger_group: debt assets"],
    reviewStatus: "PENDING_CONFIRMATION",
    lastSyncedAt: "2026-05-28T12:00:00Z"
  }
];

export const confirmedInvestmentLedgersFromSuggestions = (
  suggestions: InvestmentLedgerSuggestion[]
): ConfirmedInvestmentLedger[] =>
  suggestions
    .filter((suggestion) => suggestion.reviewStatus === "CONFIRMED" || suggestion.reviewStatus === "EDITED")
    .map((suggestion) => ({
      investmentLedgerId: `INV-${suggestion.ledgerId}`,
      ledgerId: suggestion.ledgerId,
      ledgerName: suggestion.ledgerName,
      sourceSystem: suggestion.sourceSystem,
      accountType: suggestion.accountType,
      ledgerGroup: suggestion.ledgerGroup,
      investmentInstrumentType: suggestion.selectedInstrumentType ?? suggestion.suggestedInstrumentType,
      closingBalance: suggestion.closingBalance,
      currencyCode: suggestion.currencyCode,
      lastSyncedAt: suggestion.lastSyncedAt,
      confirmedAt: suggestion.reviewedAt ?? "2026-05-28T13:00:00Z",
      confirmedBy: suggestion.reviewedBy ?? "A. Mehta",
      lifecycleStatus: "ACTIVE",
      reviewSource: "SUGGESTED",
      notes: suggestion.notes
    }));

export const confirmedInvestmentBalance = (suggestions: InvestmentLedgerSuggestion[]) =>
  confirmedInvestmentLedgersFromSuggestions(suggestions).reduce((sum, ledger) => sum + ledger.closingBalance, 0);

export const activeInvestmentLedgersFromSuggestions = confirmedInvestmentLedgersFromSuggestions;

export const activeInvestmentBalance = (ledgers: ConfirmedInvestmentLedger[]) =>
  ledgers.reduce((sum, ledger) => sum + ledger.closingBalance, 0);

export const providerToSourceSystem = (provider: ProviderName) => (provider === "Tally" ? "TALLY" : "ZOHO_BOOKS");

export const ledgerToManualInvestmentLedger = (
  ledger: Ledger,
  investmentInstrumentType: InvestmentInstrumentType,
  notes: string,
  confirmedAt = new Date().toISOString()
): ConfirmedInvestmentLedger => ({
  investmentLedgerId: `MANUAL-${ledger.id}`,
  ledgerId: ledger.id,
  ledgerName: ledger.name,
  sourceSystem: providerToSourceSystem(ledger.provider),
  accountType: ledger.group.toLowerCase().replaceAll(" ", "_"),
  ledgerGroup: ledger.group,
  investmentInstrumentType,
  closingBalance: ledger.balance ?? 0,
  currencyCode: "INR",
  lastSyncedAt: confirmedAt,
  confirmedAt,
  confirmedBy: "A. Mehta",
  lifecycleStatus: "ACTIVE",
  reviewSource: "MANUAL",
  notes
});

export const ledgerName = (id?: string) => ledgers.find((ledger) => ledger.id === id)?.name ?? "Not mapped";

export const getProviderLedgers = (provider: ProviderName) => ledgers.filter((ledger) => ledger.provider === provider);

export const getSuggestedLedgers = (role: LedgerRole, provider: ProviderName) => {
  const providerLedgers = getProviderLedgers(provider);
  if (role === "investmentAsset") return providerLedgers.filter((ledger) => ledger.group.includes("Investment") || ledger.group.includes("Asset"));
  if (role === "bank") return providerLedgers.filter((ledger) => ledger.group.includes("Bank"));
  if (role === "gain") return providerLedgers.filter((ledger) => ledger.name.toLowerCase().includes("gain") || ledger.group.includes("Income"));
  if (role === "loss") return providerLedgers.filter((ledger) => ledger.name.toLowerCase().includes("loss") || ledger.group.includes("Expense"));
  if (role === "dividend") return providerLedgers.filter((ledger) => ledger.name.toLowerCase().includes("dividend"));
  if (role === "charges") return providerLedgers.filter((ledger) => ledger.name.toLowerCase().includes("charge") || ledger.name.toLowerCase().includes("load"));
  return providerLedgers.filter((ledger) => ledger.name.toLowerCase().includes("clearing"));
};

export const starterPortfolios: PortfolioHolding[] = [
  {
    id: "abc-liquid",
    scheme: "Aditya Birla Sun Life Nifty Next 50 Index Fund - Regular - Growth",
    icon: "AB",
    assetClass: "Liquid Mutual Fund",
    currentValue: 5075000,
    currentlyInvested: 5000000,
    bookedPnl: 75000,
    xirr: "0.01%",
    units: 100000,
    nav: 50.75,
    provider: "Tally",
    ledgerMapping: { investmentAsset: "liquid", bank: "hdfc", gain: "gain", loss: "loss", dividend: "dividend", charges: "charges", clearing: "clearing" },
    lastUpdated: "27 May 2026"
  },
  {
    id: "abc-overnight",
    scheme: "Axis Overnight Fund Regular Plan - Growth",
    icon: "AO",
    assetClass: "Overnight Fund",
    currentValue: 2240000,
    currentlyInvested: 2240000,
    bookedPnl: 0,
    xirr: "0.00%",
    units: 44800,
    nav: 50,
    provider: "Tally",
    ledgerMapping: { investmentAsset: "overnight", bank: "hdfc", gain: "gain", loss: "loss", dividend: "dividend", charges: "charges", clearing: "clearing" },
    lastUpdated: "27 May 2026"
  },
  {
    id: "axis-debt",
    scheme: "Franklin Pension Plan - Growth",
    icon: "FP",
    assetClass: "Debt Mutual Fund",
    currentValue: 1800000,
    currentlyInvested: 1800000,
    bookedPnl: 0,
    xirr: "0.00%",
    units: 36000,
    nav: 50,
    provider: "Tally",
    ledgerMapping: { investmentAsset: "debt" }
  },
  {
    id: "icici-child",
    scheme: "Icici Prudential Child Care Fund (Gift Plan)",
    icon: "IP",
    assetClass: "Hybrid Mutual Fund",
    currentValue: 10000000,
    currentlyInvested: 10000000,
    bookedPnl: 0,
    xirr: "—",
    units: 95000,
    nav: 105.26,
    provider: "Tally",
    ledgerMapping: { investmentAsset: "liquid", bank: "icici", gain: "gain", loss: "loss", dividend: "dividend", charges: "charges", clearing: "clearing" },
    lastUpdated: "20 May 2026"
  },
  {
    id: "zoho-liquid",
    scheme: "Jm Overnight Fund - Regular - Growth",
    icon: "JO",
    assetClass: "Liquid Mutual Fund",
    currentValue: 4750000,
    currentlyInvested: 4750000,
    bookedPnl: 0,
    xirr: "-0.01%",
    units: 95000,
    nav: 50,
    provider: "Zoho Books",
    ledgerMapping: { investmentAsset: "zoho-liquid", bank: "zoho-bank", gain: "zoho-gain", loss: "zoho-loss", clearing: "zoho-clearing" },
    lastUpdated: "25 May 2026"
  }
];

const makeLine = (id: string, role: LedgerRole, amount: number, side: "Dr" | "Cr", component: string, narration: string, ledgerId?: string): LedgerLine => ({
  id,
  role,
  amount,
  side,
  component,
  narration,
  ledgerId
});

export function entryFromScenario(scenario: Scenario, mapping: LedgerMapping, amount: number, date = "2026-05-25"): AccountingEntry {
  const common = { voucherDate: date };
  switch (scenario) {
    case "INITIAL_INVESTMENT":
      return {
        ...common,
        voucherType: "Journal",
        narration: "Purchase investment posted via Kodo Treasury",
        lines: [
          makeLine("asset-dr", "investmentAsset", amount, "Dr", "TREASURY_INVESTMENT_ASSET", "Investment asset", mapping.investmentAsset),
          makeLine("bank-cr", "bank", amount, "Cr", "TREASURY_BANK", "Payment from bank", mapping.bank)
        ]
      };
    case "REDEMPTION_WITH_GAIN":
      return {
        ...common,
        voucherType: "Receipt",
        narration: "Redemption with realized gain posted via Kodo Treasury",
        lines: [
          makeLine("bank-dr", "bank", amount, "Dr", "TREASURY_BANK", "Redemption proceeds", mapping.bank),
          makeLine("asset-cr", "investmentAsset", amount - 75000, "Cr", "TREASURY_INVESTMENT_ASSET", "Investment cost", mapping.investmentAsset),
          makeLine("gain-cr", "gain", 75000, "Cr", "TREASURY_REALIZED_GAIN", "Realized gain", mapping.gain)
        ]
      };
    case "REDEMPTION_WITH_LOSS":
      return {
        ...common,
        voucherType: "Receipt",
        narration: "Redemption with realized loss posted via Kodo Treasury",
        lines: [
          makeLine("bank-dr", "bank", amount, "Dr", "TREASURY_BANK", "Redemption proceeds", mapping.bank),
          makeLine("loss-dr", "loss", 20000, "Dr", "TREASURY_REDEMPTION_LOSS", "Realized loss", mapping.loss),
          makeLine("asset-cr", "investmentAsset", amount + 20000, "Cr", "TREASURY_INVESTMENT_ASSET", "Investment cost", mapping.investmentAsset)
        ]
      };
    case "PARTIAL_REDEMPTION":
      return {
        ...common,
        voucherType: "Receipt",
        narration: "Partial redemption posted via Kodo Treasury",
        lines: [
          makeLine("bank-dr", "bank", amount, "Dr", "TREASURY_BANK", "Partial proceeds", mapping.bank),
          makeLine("asset-cr", "investmentAsset", amount - 10000, "Cr", "TREASURY_INVESTMENT_ASSET", "Allocated cost", mapping.investmentAsset),
          makeLine("gain-cr", "gain", 10000, "Cr", "TREASURY_REALIZED_GAIN", "Realized gain", mapping.gain)
        ]
      };
    case "SWITCH_BETWEEN_FUNDS":
      return {
        ...common,
        voucherType: "Journal",
        narration: "Switch between funds posted via Kodo Treasury",
        lines: [
          makeLine("clear-dr", "clearing", amount, "Dr", "TREASURY_TRANSFER_CLEARING", "Switch clearing debit", mapping.clearing),
          makeLine("asset-cr", "investmentAsset", amount, "Cr", "TREASURY_INVESTMENT_ASSET", "From fund", mapping.investmentAsset),
          makeLine("asset-dr", "investmentAsset", amount, "Dr", "TREASURY_INVESTMENT_ASSET", "To fund", mapping.investmentAsset),
          makeLine("clear-cr", "clearing", amount, "Cr", "TREASURY_TRANSFER_CLEARING", "Switch clearing credit", mapping.clearing)
        ]
      };
    case "IDCW_DIVIDEND_RECEIPT":
      return {
        ...common,
        voucherType: "Receipt",
        narration: "IDCW dividend receipt posted via Kodo Treasury",
        lines: [
          makeLine("bank-dr", "bank", amount, "Dr", "TREASURY_BANK", "Dividend credited to bank", mapping.bank),
          makeLine("dividend-cr", "dividend", amount, "Cr", "TREASURY_DIVIDEND_INCOME", "Dividend income", mapping.dividend)
        ]
      };
    case "EXIT_LOAD_CHARGES":
      return {
        ...common,
        voucherType: "Journal",
        narration: "Exit load charges posted via Kodo Treasury",
        lines: [
          makeLine("charges-dr", "charges", amount, "Dr", "TREASURY_EXIT_LOAD_EXPENSE", "Exit load expense", mapping.charges),
          makeLine("bank-cr", "bank", amount, "Cr", "TREASURY_BANK", "Payment from bank", mapping.bank)
        ]
      };
    case "MARK_TO_MARKET_GAIN":
      return {
        ...common,
        voucherType: "Journal",
        narration: "Mark-to-market gain posted via Kodo Treasury",
        lines: [
          makeLine("asset-dr", "investmentAsset", amount, "Dr", "TREASURY_INVESTMENT_ASSET", "NAV appreciation", mapping.investmentAsset),
          makeLine("gain-cr", "gain", amount, "Cr", "TREASURY_UNREALIZED_GAIN", "Unrealized gain", mapping.gain)
        ]
      };
    case "AUTO_SWEEP_OUT":
      return {
        ...common,
        voucherType: "Contra",
        narration: "Auto sweep out posted via Kodo Treasury",
        lines: [
          makeLine("asset-dr", "investmentAsset", amount, "Dr", "TREASURY_SWEEP_INVESTMENT", "Sweep investment", mapping.investmentAsset),
          makeLine("bank-cr", "bank", amount, "Cr", "TREASURY_BANK", "Sweep from bank", mapping.bank)
        ]
      };
    case "REVERSE_SWEEP_IN":
      return {
        ...common,
        voucherType: "Contra",
        narration: "Reverse sweep in posted via Kodo Treasury",
        lines: [
          makeLine("bank-dr", "bank", amount, "Dr", "TREASURY_BANK", "Sweep to bank", mapping.bank),
          makeLine("asset-cr", "investmentAsset", amount, "Cr", "TREASURY_SWEEP_INVESTMENT", "Sweep investment reversal", mapping.investmentAsset)
        ]
      };
  }
}

export const allRequiredLedgers = (mapping: LedgerMapping, entry: AccountingEntry) =>
  entry.lines.every((line) => line.ledgerId || mapping[line.role]);

export function portfolioMappingComplete(portfolio: PortfolioHolding) {
  return ["investmentAsset", "bank", "gain", "loss"].every((role) => portfolio.ledgerMapping[role as LedgerRole]);
}

export function starterTransactions(portfolios: PortfolioHolding[]): TreasuryTransaction[] {
  const portfolioById = (id: string) => portfolios.find((portfolio) => portfolio.id === id)!;
  const rows: Array<[string, string, string, Scenario, number, AccountingStatus, string, ProviderName, string, string, number?]> = [
    ["txn-1", "KODO-TREASURY-INV-0001", "abc-liquid", "INITIAL_INVESTMENT", 5000000, "Ready to sync", "Nilima Wadal", "Tally", "21 May 2026", "2026-05-21", 100000],
    ["txn-2", "KODO-TREASURY-RED-0001", "abc-liquid", "REDEMPTION_WITH_GAIN", 5075000, "Ready to sync", "Nilima Wadal", "Tally", "21 May 2026", "2026-05-21", 100000],
    ["txn-3", "KODO-TREASURY-RED-0002", "abc-liquid", "REDEMPTION_WITH_LOSS", 4980000, "Failed", "System", "Tally", "20 May 2026", "2026-05-20"],
    ["txn-4", "KODO-TREASURY-RED-0003", "abc-liquid", "PARTIAL_REDEMPTION", 260000, "Duplicate conflict", "Nilima Wadal", "Tally", "20 May 2026", "2026-05-20", 25000],
    ["txn-5", "KODO-TREASURY-SWITCH-0001", "abc-overnight", "SWITCH_BETWEEN_FUNDS", 5000000, "Ready to sync", "Ankit Gawande", "Tally", "19 May 2026", "2026-05-19", 3],
    ["txn-6", "KODO-TREASURY-IDCW-0001", "icici-child", "IDCW_DIVIDEND_RECEIPT", 15000, "Ready to sync", "System", "Tally", "18 May 2026", "2026-05-18"],
    ["txn-7", "KODO-TREASURY-FEE-0001", "abc-liquid", "EXIT_LOAD_CHARGES", 2000, "Ready to sync", "System", "Tally", "18 May 2026", "2026-05-18"],
    ["txn-8", "KODO-TREASURY-MTM-0001", "axis-debt", "MARK_TO_MARKET_GAIN", 40000, "Unmapped", "System", "Tally", "18 May 2026", "2026-05-18"],
    ["txn-9", "KODO-TREASURY-SWEEP-0001", "axis-debt", "AUTO_SWEEP_OUT", 1000000, "Unmapped", "Deva Wiraths", "Tally", "17 May 2026", "2026-05-17"],
    ["txn-10", "KODO-TREASURY-ZOHO-0001", "zoho-liquid", "INITIAL_INVESTMENT", 950000, "Ready to sync", "Primary O", "Zoho Books", "17 May 2026", "2026-05-17", 95000]
  ];

  return rows.map(([id, refId, portfolioId, scenario, amount, status, raisedBy, provider, submittedOn, voucherDate, units]) => {
    const portfolio = portfolioById(portfolioId);
    return {
      id,
      refId,
      portfolioId,
      fundName: portfolio.scheme.toUpperCase(),
      fundIcon: portfolio.icon,
      scenario,
      amount,
      units,
      raisedBy,
      transactionStatus: "Approved",
      executionStatus: "Executed",
      submittedOn,
      accountingStatus: status,
      provider,
      entry: {
        ...entryFromScenario(scenario, portfolio.ledgerMapping, amount, voucherDate),
        error:
          status === "Failed"
            ? "LEDGER_NOT_FOUND: Ledger 'Investment Charges / Exit Load' not found in Tally."
            : status === "Duplicate conflict"
              ? "DUPLICATE_CONFLICT: Existing voucher reference differs from this payload."
              : undefined
      }
    };
  });
}
