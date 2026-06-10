import type { PolicyDimension, PolicyEntity, TreasuryPolicyState } from "../types/policy";
import { amfiFundMasterData } from "./amfiFundData";

export const dimensionLabels: Record<PolicyDimension, string> = {
  amcs: "AMCs",
  categories: "Scheme Categories",
  subCategories: "Scheme Sub-Categories",
  funds: "Specific Funds"
};

export const dimensionSearchLabels: Record<PolicyDimension, string> = {
  amcs: "AMC",
  categories: "category",
  subCategories: "sub-category",
  funds: "fund"
};

export const preferenceLabels = {
  exclusive: "Exclusive",
  preferred: "Preferred",
  excluded: "Excluded"
} as const;

export const overrideRoles = ["TREASURY_ADMIN", "FINANCE_ADMIN", "PRIMARY_OWNER"];

export const policyMasterData: Record<PolicyDimension, PolicyEntity[]> = {
  amcs: [
    { id: "amc-hdfc", name: "HDFC Mutual Fund", dimension: "amcs" },
    { id: "amc-icici", name: "ICICI Prudential Mutual Fund", dimension: "amcs" },
    { id: "amc-axis", name: "Axis Mutual Fund", dimension: "amcs" },
    { id: "amc-kotak", name: "Kotak Mahindra Mutual Fund", dimension: "amcs" },
    { id: "amc-sbi", name: "SBI Mutual Fund", dimension: "amcs" },
    { id: "amc-dsp", name: "DSP Mutual Fund", dimension: "amcs" },
    { id: "amc-aditya", name: "Aditya Birla Sun Life Mutual Fund", dimension: "amcs" },
    { id: "amc-franklin", name: "Franklin Templeton Mutual Fund", dimension: "amcs" }
  ],
  categories: [
    { id: "cat-equity", name: "Equity Schemes", dimension: "categories" },
    { id: "cat-debt", name: "Debt Schemes", dimension: "categories" },
    { id: "cat-hybrid", name: "Hybrid Schemes", dimension: "categories" },
    { id: "cat-solution", name: "Solution Oriented Schemes", dimension: "categories" },
    { id: "cat-other", name: "Other Schemes", dimension: "categories" }
  ],
  subCategories: [
    { id: "sub-multi-cap", name: "Multi-Cap Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-flexi-cap", name: "Flexi Cap Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-large-cap", name: "Large Cap Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-large-mid-cap", name: "Large and Mid Cap Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-mid-cap", name: "Mid Cap Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-small-cap", name: "Small Cap Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-dividend-yield", name: "Dividend Yield Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-value", name: "Value Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-contra", name: "Contra Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-focused", name: "Focused Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-sectoral-thematic", name: "Sectoral/Thematic Fund", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-elss", name: "ELSS", dimension: "subCategories", categoryId: "cat-equity", categoryName: "Equity Schemes" },
    { id: "sub-overnight", name: "Overnight Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-liquid", name: "Liquid Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-ultra-short", name: "Ultra Short Duration Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-low-duration", name: "Low Duration Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-money-market", name: "Money Market Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-short-duration", name: "Short Duration Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-medium-duration", name: "Medium Duration Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-medium-long-duration", name: "Medium to Long Duration Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-long-duration", name: "Long Duration Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-dynamic-bond", name: "Dynamic Bond Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-corporate-bond", name: "Corporate Bond Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-credit-risk", name: "Credit Risk Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-banking-psu", name: "Banking and PSU Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-gilt", name: "Gilt Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-gilt-10-year", name: "Gilt Fund with 10 Year Constant Duration", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-floater", name: "Floater Fund", dimension: "subCategories", categoryId: "cat-debt", categoryName: "Debt Schemes" },
    { id: "sub-conservative-hybrid", name: "Conservative Hybrid Fund", dimension: "subCategories", categoryId: "cat-hybrid", categoryName: "Hybrid Schemes" },
    { id: "sub-balanced-hybrid", name: "Balanced Hybrid Fund", dimension: "subCategories", categoryId: "cat-hybrid", categoryName: "Hybrid Schemes" },
    { id: "sub-aggressive-hybrid", name: "Aggressive Hybrid Fund", dimension: "subCategories", categoryId: "cat-hybrid", categoryName: "Hybrid Schemes" },
    { id: "sub-dynamic-asset-allocation", name: "Dynamic Asset Allocation or Balanced Advantage Fund", dimension: "subCategories", categoryId: "cat-hybrid", categoryName: "Hybrid Schemes" },
    { id: "sub-multi-asset-allocation", name: "Multi Asset Allocation Fund", dimension: "subCategories", categoryId: "cat-hybrid", categoryName: "Hybrid Schemes" },
    { id: "sub-arbitrage", name: "Arbitrage Fund", dimension: "subCategories", categoryId: "cat-hybrid", categoryName: "Hybrid Schemes" },
    { id: "sub-equity-savings", name: "Equity Savings", dimension: "subCategories", categoryId: "cat-hybrid", categoryName: "Hybrid Schemes" },
    { id: "sub-retirement", name: "Retirement Fund", dimension: "subCategories", categoryId: "cat-solution", categoryName: "Solution Oriented Schemes" },
    { id: "sub-childrens", name: "Children's Fund", dimension: "subCategories", categoryId: "cat-solution", categoryName: "Solution Oriented Schemes" },
    { id: "sub-index-etf", name: "Index Fund/ETFs", dimension: "subCategories", categoryId: "cat-other", categoryName: "Other Schemes" },
    { id: "sub-fof", name: "Fund of Funds (Overseas/Domestic)", dimension: "subCategories", categoryId: "cat-other", categoryName: "Other Schemes" }
  ],
  funds: [
    {
      id: "fund-axis-overnight",
      name: "Axis Overnight Fund Regular Plan - Growth",
      dimension: "funds",
      amcId: "amc-axis",
      amcName: "Axis Mutual Fund",
      categoryId: "cat-debt",
      categoryName: "Debt Schemes",
      subCategoryId: "sub-overnight",
      subCategoryName: "Overnight Fund",
      status: "Active"
    },
    {
      id: "fund-icici-liquid",
      name: "ICICI Prudential Liquid Fund - Direct Growth",
      dimension: "funds",
      amcId: "amc-icici",
      amcName: "ICICI Prudential Mutual Fund",
      categoryId: "cat-debt",
      categoryName: "Debt Schemes",
      subCategoryId: "sub-liquid",
      subCategoryName: "Liquid Fund",
      status: "Active"
    },
    {
      id: "fund-hdfc-liquid",
      name: "HDFC Liquid Fund - Direct Growth",
      dimension: "funds",
      amcId: "amc-hdfc",
      amcName: "HDFC Mutual Fund",
      categoryId: "cat-debt",
      categoryName: "Debt Schemes",
      subCategoryId: "sub-liquid",
      subCategoryName: "Liquid Fund",
      status: "Active"
    },
    {
      id: "fund-kotak-money",
      name: "Kotak Money Market Fund - Direct Growth",
      dimension: "funds",
      amcId: "amc-kotak",
      amcName: "Kotak Mahindra Mutual Fund",
      categoryId: "cat-debt",
      categoryName: "Debt Schemes",
      subCategoryId: "sub-money-market",
      subCategoryName: "Money Market Fund",
      status: "Active"
    },
    {
      id: "fund-dsp-savings",
      name: "DSP Savings Fund - Growth",
      dimension: "funds",
      amcId: "amc-dsp",
      amcName: "DSP Mutual Fund",
      categoryId: "cat-debt",
      categoryName: "Debt Schemes",
      subCategoryId: "sub-money-market",
      subCategoryName: "Money Market Fund",
      status: "Active"
    },
    {
      id: "fund-sbi-corporate",
      name: "SBI Corporate Bond Fund - Direct Growth",
      dimension: "funds",
      amcId: "amc-sbi",
      amcName: "SBI Mutual Fund",
      categoryId: "cat-debt",
      categoryName: "Debt Schemes",
      subCategoryId: "sub-corporate-bond",
      subCategoryName: "Corporate Bond Fund",
      status: "Active"
    },
    {
      id: "fund-aditya-index",
      name: "Aditya Birla Sun Life Nifty Next 50 Index Fund",
      dimension: "funds",
      amcId: "amc-aditya",
      amcName: "Aditya Birla Sun Life Mutual Fund",
      categoryId: "cat-other",
      categoryName: "Other Schemes",
      subCategoryId: "sub-index-etf",
      subCategoryName: "Index Fund/ETFs",
      status: "Active"
    },
    {
      id: "fund-franklin-pension",
      name: "Franklin Pension Plan - Growth",
      dimension: "funds",
      amcId: "amc-franklin",
      amcName: "Franklin Templeton Mutual Fund",
      categoryId: "cat-solution",
      categoryName: "Solution Oriented Schemes",
      subCategoryId: "sub-retirement",
      subCategoryName: "Retirement Fund",
      status: "Active"
    },
    {
      id: "fund-credit-risk",
      name: "HDFC Credit Risk Debt Fund - Direct Growth",
      dimension: "funds",
      amcId: "amc-hdfc",
      amcName: "HDFC Mutual Fund",
      categoryId: "cat-debt",
      categoryName: "Debt Schemes",
      subCategoryId: "sub-credit-risk",
      subCategoryName: "Credit Risk Fund",
      status: "Active"
    },
    ...amfiFundMasterData
  ]
};

const pick = (dimension: PolicyDimension, ids: string[]) =>
  ids.map((id) => {
    const entity = policyMasterData[dimension].find((item) => item.id === id);
    if (!entity) throw new Error(`Missing policy master data: ${id}`);
    return entity;
  });

export const initialTreasuryPolicy: TreasuryPolicyState = {
  policyId: "policy_456",
  tenantId: "tenant_123",
  status: "ACTIVE",
  version: 3,
  enforcementMode: "ABSOLUTE",
  overrideAllowedRoles: ["TREASURY_ADMIN", "FINANCE_ADMIN"],
  overrideRequiresConfirmation: true,
  overrideReasonRequired: true,
  minimumOperatingThresholdAmount: 50000,
  maximumFundAumPercent: 20,
  updatedAt: "10 Jun 2026, 10:00 AM",
  updatedBy: "A. Mehta",
  preferences: {
    amcs: {
      exclusive: [],
      preferred: pick("amcs", ["amc-icici", "amc-hdfc"]),
      excluded: pick("amcs", ["amc-franklin"])
    },
    categories: {
      exclusive: pick("categories", ["cat-debt"]),
      preferred: [],
      excluded: pick("categories", ["cat-equity"])
    },
    subCategories: {
      exclusive: [],
      preferred: pick("subCategories", ["sub-liquid", "sub-money-market"]),
      excluded: pick("subCategories", ["sub-credit-risk"])
    },
    funds: {
      exclusive: [],
      preferred: pick("funds", ["fund-icici-liquid", "fund-axis-overnight"]),
      excluded: pick("funds", ["fund-franklin-pension"])
    }
  }
};
