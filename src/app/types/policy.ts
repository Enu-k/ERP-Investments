export type PolicyDimension = "amcs" | "categories" | "subCategories" | "funds";

export type PreferenceType = "exclusive" | "preferred" | "excluded";

export type EnforcementMode = "ABSOLUTE" | "OVERRIDABLE";

export interface PolicyEntity {
  id: string;
  name: string;
  dimension: PolicyDimension;
  amcId?: string;
  amcName?: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  schemeCode?: string;
  status?: string;
}

export interface MutualFundPreferenceRule {
  id: string;
  ruleType: PreferenceType;
  amcs: PolicyEntity[];
  categories: PolicyEntity[];
  subCategories: PolicyEntity[];
  funds: PolicyEntity[];
}

export type MutualFundPreferenceRules = Record<PreferenceType, MutualFundPreferenceRule[]>;

export interface TreasuryPolicyState {
  policyId: string;
  tenantId: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  version: number;
  enforcementMode: EnforcementMode;
  overrideAllowedRoles: string[];
  overrideRequiresConfirmation: boolean;
  overrideReasonRequired: boolean;
  minimumOperatingThresholdAmount: number;
  maximumFundAumPercent: number;
  mutualFundPreferenceRules: MutualFundPreferenceRules;
  updatedAt: string;
  updatedBy: string;
}

export interface ValidationMessage {
  type: "BLOCKING" | "WARNING";
  code: string;
  message: string;
}
