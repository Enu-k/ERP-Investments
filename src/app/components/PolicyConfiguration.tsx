import {
  AlertCircle,
  FileClock,
  HelpCircle,
  Plus,
  RotateCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  dimensionLabels,
  dimensionSearchLabels,
  initialTreasuryPolicy,
  overrideRoles,
  policyMasterData,
  preferenceLabels
} from "../data/policyData";
import type { PolicyDimension, PolicyEntity, PreferenceType, TreasuryPolicyState, ValidationMessage } from "../types/policy";
import { HeaderTabs } from "./Shared";

const moduleTabs = ["Risk Profile", "Treasury Policy"] as const;
type ModuleTab = (typeof moduleTabs)[number];

const dimensions: PolicyDimension[] = ["amcs", "categories", "subCategories", "funds"];
const preferenceOrder: PreferenceType[] = ["exclusive", "preferred", "excluded"];
const optionDisplayLimit = 100;
const sampleCashPosition = {
  totalPayables: 50000,
  totalReceivables: 120000,
  currentAccountBalance: 60000
};
const preferenceDescriptions: Record<PreferenceType, { summary: string; detail: string }> = {
  exclusive: {
    summary: "Restricts eligible results to selected values.",
    detail:
      "Exclusive rules act as an allowlist. For funds, the platform should only recommend or execute within the selected funds, subject to exclusions and suitability checks."
  },
  preferred: {
    summary: "Prioritises selected values without blocking others.",
    detail:
      "Preferred rules boost ranking and display priority. For funds, selected funds should be highlighted or sorted higher when they are otherwise eligible."
  },
  excluded: {
    summary: "Blocks selected values from compliant results.",
    detail:
      "Excluded rules act as a blocklist. For funds, selected funds should not be recommended or executed unless policy override is enabled and approved."
  }
};

export function PolicyConfiguration() {
  const [activeTab, setActiveTab] = useState<ModuleTab>("Risk Profile");

  return (
    <div className="policy-page">
      <div className="policy-page-head">
        <div>
          <h1>Policy Configuration</h1>
          <p>Company controls for suitability, treasury policy, and investment preferences.</p>
        </div>
        <div className="policy-owner-card">
          <ShieldCheck size={19} />
          <div>
            <span>Policy Owner</span>
            <strong>A. Mehta</strong>
          </div>
        </div>
      </div>

      <HeaderTabs tabs={[...moduleTabs]} active={activeTab} onChange={(tab) => setActiveTab(tab as ModuleTab)} />

      {activeTab === "Risk Profile" ? <RiskProfilePanel /> : <TreasuryPolicyEditor onViewRiskProfile={() => setActiveTab("Risk Profile")} />}
    </div>
  );
}

function TreasuryPolicyEditor({ onViewRiskProfile }: { onViewRiskProfile: () => void }) {
  const [policy, setPolicy] = useState<TreasuryPolicyState>(initialTreasuryPolicy);
  const [saveNotice, setSaveNotice] = useState("");
  const messages = useMemo(() => validatePolicy(policy), [policy]);
  const blockingMessages = messages.filter((message) => message.type === "BLOCKING");

  function addPreference(dimension: PolicyDimension, preferenceType: PreferenceType, entity: PolicyEntity) {
    if (!isSelectableOption(policy, dimension, preferenceType, entity)) return;
    setPolicy((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [dimension]: {
          ...current.preferences[dimension],
          [preferenceType]: [...current.preferences[dimension][preferenceType], entity]
        }
      }
    }));
    setSaveNotice("");
  }

  function removePreference(dimension: PolicyDimension, preferenceType: PreferenceType, entityId: string) {
    setPolicy((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [dimension]: {
          ...current.preferences[dimension],
          [preferenceType]: current.preferences[dimension][preferenceType].filter((entity) => entity.id !== entityId)
        }
      }
    }));
    setSaveNotice("");
  }

  function setEnforcementMode(mode: TreasuryPolicyState["enforcementMode"]) {
    setPolicy((current) => ({ ...current, enforcementMode: mode }));
    setSaveNotice("");
  }

  function toggleOverrideRole(role: string) {
    setPolicy((current) => {
      const roleSet = new Set(current.overrideAllowedRoles);
      if (roleSet.has(role)) {
        roleSet.delete(role);
      } else {
        roleSet.add(role);
      }

      return { ...current, overrideAllowedRoles: [...roleSet] };
    });
    setSaveNotice("");
  }

  function updatePolicyNumber(field: "minimumOperatingThresholdAmount" | "maximumFundAumPercent", value: string) {
    const parsed = Number(value);
    setPolicy((current) => ({
      ...current,
      [field]: Number.isFinite(parsed) && parsed > 0 ? parsed : 0
    }));
    setSaveNotice("");
  }

  function savePolicy() {
    if (blockingMessages.length) return;
    setPolicy((current) => ({
      ...current,
      version: current.version + 1,
      updatedAt: "Just now",
      updatedBy: "A. Mehta"
    }));
    setSaveNotice("Treasury policy saved and active policy version updated.");
  }

  return (
    <div className="treasury-policy-grid">
      <section className="policy-card risk-profile-cta">
        <div>
          <span className="policy-kicker">Suitability Context</span>
          <h2>Risk Profile</h2>
          <p>Conservative profile, Score 9. Valid until 13 Jun 2026.</p>
        </div>
        <button className="figma-secondary" type="button" onClick={onViewRiskProfile}>
          View risk profile
        </button>
      </section>

      <section className="policy-card enforcement-card">
        <div className="policy-card-title">
          <div>
            <span className="policy-kicker">Policy Enforcement Mode</span>
            <h2>Agent conflict handling</h2>
          </div>
          <SlidersHorizontal size={21} />
        </div>

        <div className="enforcement-choice-grid">
          <button
            className={`enforcement-choice ${policy.enforcementMode === "ABSOLUTE" ? "active" : ""}`}
            onClick={() => setEnforcementMode("ABSOLUTE")}
          >
            <strong>Absolute Policy</strong>
            <span>Blocks advisory and trades that violate treasury policy.</span>
          </button>
          <button
            className={`enforcement-choice ${policy.enforcementMode === "OVERRIDABLE" ? "active" : ""}`}
            onClick={() => setEnforcementMode("OVERRIDABLE")}
          >
            <strong>Overridable with Warning</strong>
            <span>Allows authorised exceptions after confirmation and audit logging.</span>
          </button>
        </div>

        {policy.enforcementMode === "OVERRIDABLE" && (
          <div className="override-settings">
            <div className="override-role-list">
              <span>Override roles</span>
              {overrideRoles.map((role) => (
                <label key={role}>
                  <input
                    type="checkbox"
                    checked={policy.overrideAllowedRoles.includes(role)}
                    onChange={() => toggleOverrideRole(role)}
                  />
                  {formatRole(role)}
                </label>
              ))}
            </div>
            <label className="policy-toggle-row">
              <input
                type="checkbox"
                checked={policy.overrideReasonRequired}
                onChange={() => {
                  setPolicy((current) => ({ ...current, overrideReasonRequired: !current.overrideReasonRequired }));
                  setSaveNotice("");
                }}
              />
              Override reason required
            </label>
          </div>
        )}
      </section>

      <section className="policy-card threshold-card">
        <div className="policy-card-title">
          <div>
            <span className="policy-kicker">Cash Deployment Guardrails</span>
            <h2>Operating threshold and concentration limit</h2>
          </div>
        </div>

        <div className="threshold-grid">
          <label className="threshold-field">
            <span>Minimum Operating Threshold Amount</span>
            <div>
              <strong>₹</strong>
              <input
                type="number"
                min="0"
                step="1000"
                value={policy.minimumOperatingThresholdAmount}
                onChange={(event) => updatePolicyNumber("minimumOperatingThresholdAmount", event.target.value)}
              />
            </div>
            <em>Cash buffer the Agent must preserve before suggesting investments.</em>
          </label>

          <label className="threshold-field">
            <span>Maximum AUM % Threshold</span>
            <div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={policy.maximumFundAumPercent}
                onChange={(event) => updatePolicyNumber("maximumFundAumPercent", event.target.value)}
              />
              <strong>%</strong>
            </div>
            <em>Maximum portfolio AUM exposure allowed in any single mutual fund.</em>
          </label>
        </div>

        <CashThresholdPreview threshold={policy.minimumOperatingThresholdAmount} />
      </section>

      <section className="preference-section-list">
        {dimensions.map((dimension) => (
          <PreferenceSection
            key={dimension}
            dimension={dimension}
            policy={policy}
            onAdd={addPreference}
            onRemove={removePreference}
          />
        ))}
      </section>

      <section className="policy-save-bar">
        <div className="policy-save-bar-inner">
          <div>
            <strong>Active treasury policy</strong>
            <span>Save publishes this draft for advisory, recommendations, and execution checks.</span>
            {saveNotice && <em>{saveNotice}</em>}
          </div>
          <div className="policy-save-actions">
            <button className="figma-secondary" type="button">
              <FileClock size={17} />
              Audit log
            </button>
            <button className="figma-primary" type="button" disabled={blockingMessages.length > 0} onClick={savePolicy}>
              <Save size={17} />
              Save policy
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreferenceSection({
  dimension,
  policy,
  onAdd,
  onRemove
}: {
  dimension: PolicyDimension;
  policy: TreasuryPolicyState;
  onAdd: (dimension: PolicyDimension, preferenceType: PreferenceType, entity: PolicyEntity) => void;
  onRemove: (dimension: PolicyDimension, preferenceType: PreferenceType, entityId: string) => void;
}) {
  const [searches, setSearches] = useState<Record<PreferenceType, string>>({
    exclusive: "",
    preferred: "",
    excluded: ""
  });
  const [openPicker, setOpenPicker] = useState<PreferenceType | null>(null);

  function selectOption(preferenceType: PreferenceType, entity: PolicyEntity) {
    onAdd(dimension, preferenceType, entity);
    setOpenPicker(null);
    setSearches((current) => ({ ...current, [preferenceType]: "" }));
  }

  return (
    <article className="policy-card preference-section">
      <div className="preference-section-head">
        <div>
          <span className="policy-kicker">Investment Preferences</span>
          <h2>{dimensionLabels[dimension]}</h2>
        </div>
        <span>{policyMasterData[dimension].length} master records</span>
      </div>

      <div className="preference-lane-list">
        {preferenceOrder.map((preferenceType) => {
          const query = searches[preferenceType];
          const selected = policy.preferences[dimension][preferenceType];
          const optionState = getOptionState(policy, dimension, preferenceType, query, selected);
          const options = optionState.options;

          return (
            <div className={`preference-lane preference-${preferenceType}`} key={preferenceType}>
              <div className="preference-lane-info">
                <div className="preference-lane-title">
                  <span>{preferenceLabels[preferenceType]}</span>
                  <button
                    className="preference-help"
                    type="button"
                    aria-label={`${preferenceLabels[preferenceType]} preference explanation`}
                    title={preferenceDescriptions[preferenceType].detail}
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>
                <p>{preferenceDescriptions[preferenceType].summary}</p>
              </div>

              <div className="preference-lane-values">
                <div className="selected-chip-list">
                  {selected.map((entity) => (
                    <span className="selected-chip" key={entity.id}>
                      {entity.name}
                      <button
                        type="button"
                        aria-label={`Remove ${entity.name}`}
                        onClick={() => onRemove(dimension, preferenceType, entity.id)}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  {!selected.length && <span className="empty-chip">No values selected</span>}
                </div>
              </div>

              <div className="preference-lane-action">
                <span>{selected.length}</span>
                <button
                  className="policy-add-control"
                  type="button"
                  onClick={() => setOpenPicker((current) => (current === preferenceType ? null : preferenceType))}
                >
                  <Plus size={15} />
                  Add
                </button>
              </div>

              {openPicker === preferenceType && (
                <div className="policy-picker-panel">
                  <label className="policy-search-field">
                    <Search size={15} />
                    <input
                      autoFocus
                      value={query}
                      placeholder={`Search ${dimensionSearchLabels[dimension]}`}
                      onChange={(event) => setSearches((current) => ({ ...current, [preferenceType]: event.target.value }))}
                    />
                  </label>
                  {optionState.usingDefaults && <p className="policy-option-helper">Showing defaults from Exclusive policy rules.</p>}
                  {optionState.resultMessage && <p className="policy-option-helper">{optionState.resultMessage}</p>}

                  <div className="policy-option-list">
                    {options.map((entity) => (
                      <button
                        className="policy-option-row"
                        key={entity.id}
                        type="button"
                        onClick={() => selectOption(preferenceType, entity)}
                      >
                        <Plus size={14} />
                        <span>
                          <strong>{entity.name}</strong>
                          <em>{entityMeta(entity)}</em>
                        </span>
                      </button>
                    ))}
                    {!options.length && <p className="policy-option-empty">{optionState.emptyMessage}</p>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function RiskProfilePanel() {
  return (
    <div className="risk-profile-wrap">
      <section className="risk-card">
        <div className="risk-expiry-banner">
          <AlertCircle size={17} />
          <span>Your risk profile expires in 7 days - retake to keep investing</span>
        </div>
        <div className="risk-card-body">
          <div className="risk-title-row">
            <div>
              <h2>Your risk profile</h2>
              <p>SEBI-mandated suitability assessment.</p>
            </div>
            <span className="risk-score">Conservative - Score 9</span>
          </div>

          <div className="risk-scale">
            <span className="risk-scale-active" />
            <span />
            <span />
          </div>
          <div className="risk-legend">
            <span><i className="risk-dot conservative" />Conservative (5-10)</span>
            <span><i className="risk-dot moderate" />Moderate (11-18)</span>
            <span><i className="risk-dot aggressive" />Aggressive (19-25)</span>
          </div>

          <div className="risk-detail-list">
            <DetailRow label="Relevant fund categories" value="Overnight funds & liquid funds" />
            <DetailRow label="Valid until" value="13 Jun 2026 (7 days)" />
            <DetailRow label="Last assessed" value="13 Apr 2026" />
          </div>

          <div className="risk-actions">
            <button className="figma-primary" type="button">
              <RotateCw size={16} />
              Retake assessment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="risk-detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CashThresholdPreview({ threshold }: { threshold: number }) {
  const totalDeployableCash =
    sampleCashPosition.totalReceivables - sampleCashPosition.totalPayables + sampleCashPosition.currentAccountBalance;
  const investableFunds = Math.max(0, totalDeployableCash - threshold);

  return (
    <div className="cash-preview">
      <div>
        <span>Illustrative cash position</span>
        <strong>{formatCurrency(investableFunds)} investable</strong>
      </div>
      <div className="cash-preview-formula">
        <span>Receivables {formatCurrency(sampleCashPosition.totalReceivables)}</span>
        <span>- Payables {formatCurrency(sampleCashPosition.totalPayables)}</span>
        <span>+ Current account {formatCurrency(sampleCashPosition.currentAccountBalance)}</span>
        <span>- Operating threshold {formatCurrency(threshold)}</span>
      </div>
    </div>
  );
}

function getOptionState(
  policy: TreasuryPolicyState,
  dimension: PolicyDimension,
  preferenceType: PreferenceType,
  query: string,
  selected: PolicyEntity[]
) {
  const selectedIds = new Set(selected.map((entity) => entity.id));
  const parents = resolveParentFilters(policy, dimension, preferenceType);
  const normalizedQuery = query.trim().toLowerCase();
  const searchAcrossAllFunds = dimension === "funds" && normalizedQuery.length > 0;
  const matchingOptions = policyMasterData[dimension].filter((entity) => {
    if (selectedIds.has(entity.id)) return false;
    if (!searchAcrossAllFunds && !matchesParentFilters(entity, parents)) return false;
    if (!isSelectableOption(policy, dimension, preferenceType, entity)) return false;
    return matchesQuery(entity, normalizedQuery);
  });
  const options = matchingOptions.slice(0, optionDisplayLimit);

  return {
    options,
    usingDefaults: !searchAcrossAllFunds && parents.usingDefaults,
    resultMessage:
      matchingOptions.length > options.length
        ? `Showing first ${options.length} of ${matchingOptions.length.toLocaleString("en-IN")} matches. Refine search to narrow results.`
        : "",
    emptyMessage:
      dimension === "funds"
        ? searchAcrossAllFunds
          ? "No funds match your search."
          : "No funds match selected AMC/category/sub-category filters."
        : dimension === "subCategories"
          ? "No sub-categories match selected category filters."
          : "No matching master data."
  };
}

function resolveParentFilters(policy: TreasuryPolicyState, dimension: PolicyDimension, preferenceType: PreferenceType) {
  if (dimension === "subCategories") {
    const sameColumnCategories = policy.preferences.categories[preferenceType];
    const categoryParents = sameColumnCategories.length ? sameColumnCategories : policy.preferences.categories.exclusive;

    return {
      amcIds: new Set<string>(),
      categoryIds: new Set(categoryParents.map((category) => category.id)),
      subCategoryIds: new Set<string>(),
      usingDefaults: !sameColumnCategories.length && preferenceType !== "exclusive" && policy.preferences.categories.exclusive.length > 0
    };
  }

  if (dimension === "funds") {
    const sameColumnAmcs = policy.preferences.amcs[preferenceType];
    const sameColumnCategories = policy.preferences.categories[preferenceType];
    const sameColumnSubCategories = policy.preferences.subCategories[preferenceType];
    const amcParents = sameColumnAmcs.length ? sameColumnAmcs : policy.preferences.amcs.exclusive;
    const categoryParents = sameColumnCategories.length ? sameColumnCategories : policy.preferences.categories.exclusive;
    const subCategoryParents = sameColumnSubCategories.length ? sameColumnSubCategories : policy.preferences.subCategories.exclusive;

    return {
      amcIds: new Set(amcParents.map((amc) => amc.id)),
      categoryIds: new Set(categoryParents.map((category) => category.id)),
      subCategoryIds: new Set(subCategoryParents.map((subCategory) => subCategory.id)),
      usingDefaults:
        preferenceType !== "exclusive" &&
        ((!sameColumnAmcs.length && policy.preferences.amcs.exclusive.length > 0) ||
          (!sameColumnCategories.length && policy.preferences.categories.exclusive.length > 0) ||
          (!sameColumnSubCategories.length && policy.preferences.subCategories.exclusive.length > 0))
    };
  }

  return {
    amcIds: new Set<string>(),
    categoryIds: new Set<string>(),
    subCategoryIds: new Set<string>(),
    usingDefaults: false
  };
}

function matchesParentFilters(
  entity: PolicyEntity,
  parents: { amcIds: Set<string>; categoryIds: Set<string>; subCategoryIds: Set<string>; usingDefaults: boolean }
) {
  if (entity.dimension === "subCategories") {
    return !parents.categoryIds.size || Boolean(entity.categoryId && parents.categoryIds.has(entity.categoryId));
  }

  if (entity.dimension === "funds") {
    const matchesAmc = !parents.amcIds.size || Boolean(entity.amcId && parents.amcIds.has(entity.amcId));
    const matchesCategory = !parents.categoryIds.size || Boolean(entity.categoryId && parents.categoryIds.has(entity.categoryId));
    const matchesSubCategory = !parents.subCategoryIds.size || Boolean(entity.subCategoryId && parents.subCategoryIds.has(entity.subCategoryId));
    return matchesAmc && matchesCategory && matchesSubCategory;
  }

  return true;
}

function matchesQuery(entity: PolicyEntity, normalizedQuery: string) {
  if (!normalizedQuery) return true;

  return [entity.name, entity.amcName, entity.categoryName, entity.subCategoryName, entity.status, getSchemeCode(entity)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function isSelectableOption(policy: TreasuryPolicyState, dimension: PolicyDimension, preferenceType: PreferenceType, entity: PolicyEntity) {
  const selectedHardFunds = [...policy.preferences.funds.exclusive, ...policy.preferences.funds.preferred];

  if (preferenceType === "excluded") {
    if (hasEntity(policy, dimension, "exclusive", entity.id) || hasEntity(policy, dimension, "preferred", entity.id)) return false;
  } else if (hasEntity(policy, dimension, "excluded", entity.id)) {
    return false;
  }

  if (dimension === "funds" && preferenceType !== "excluded") {
    if (entity.amcId && hasEntity(policy, "amcs", "excluded", entity.amcId)) return false;
    if (entity.categoryId && hasEntity(policy, "categories", "excluded", entity.categoryId)) return false;
    if (entity.subCategoryId && hasEntity(policy, "subCategories", "excluded", entity.subCategoryId)) return false;
  }

  if (dimension === "subCategories" && preferenceType !== "excluded") {
    if (entity.categoryId && hasEntity(policy, "categories", "excluded", entity.categoryId)) return false;
  }

  if (preferenceType === "excluded") {
    if (dimension === "amcs" && selectedHardFunds.some((fund) => fund.amcId === entity.id)) return false;
    if (dimension === "categories" && selectedHardFunds.some((fund) => fund.categoryId === entity.id)) return false;
    if (dimension === "subCategories" && selectedHardFunds.some((fund) => fund.subCategoryId === entity.id)) return false;
  }

  return true;
}

function validatePolicy(policy: TreasuryPolicyState): ValidationMessage[] {
  const messages: ValidationMessage[] = [];

  for (const dimension of dimensions) {
    const preferredOrExclusiveIds = new Set([
      ...policy.preferences[dimension].exclusive.map((entity) => entity.id),
      ...policy.preferences[dimension].preferred.map((entity) => entity.id)
    ]);

    for (const entity of policy.preferences[dimension].excluded) {
      if (preferredOrExclusiveIds.has(entity.id)) {
        messages.push({
          type: "BLOCKING",
          code: `EXCLUDED_OVERLAP_${dimension}_${entity.id}`,
          message: `${entity.name} cannot be Excluded while it is also marked Preferred or Exclusive.`
        });
      }
    }
  }

  const preferredOrExclusiveFunds = [...policy.preferences.funds.preferred, ...policy.preferences.funds.exclusive];
  for (const fund of preferredOrExclusiveFunds) {
    if (fund.amcId && hasEntity(policy, "amcs", "excluded", fund.amcId)) {
      messages.push(blockingFundMessage(fund, "AMC", fund.amcName));
    }
    if (fund.categoryId && hasEntity(policy, "categories", "excluded", fund.categoryId)) {
      messages.push(blockingFundMessage(fund, "category", fund.categoryName));
    }
    if (fund.subCategoryId && hasEntity(policy, "subCategories", "excluded", fund.subCategoryId)) {
      messages.push(blockingFundMessage(fund, "sub-category", fund.subCategoryName));
    }
  }

  for (const subCategory of [...policy.preferences.subCategories.preferred, ...policy.preferences.subCategories.exclusive]) {
    if (subCategory.categoryId && hasEntity(policy, "categories", "excluded", subCategory.categoryId)) {
      messages.push({
        type: "BLOCKING",
        code: `SUBCATEGORY_UNDER_EXCLUDED_CATEGORY_${subCategory.id}`,
        message: `${subCategory.name} cannot remain selected because its parent category is excluded.`
      });
    }
  }

  const exclusiveDimensions = dimensions.filter((dimension) => policy.preferences[dimension].exclusive.length > 0);
  if (exclusiveDimensions.length >= 2) {
    messages.push({
      type: "WARNING",
      code: "LOW_ELIGIBLE_UNIVERSE",
      message: "Multiple Exclusive rules may significantly reduce eligible recommendations."
    });
  }

  const exclusionCount = dimensions.reduce((total, dimension) => total + policy.preferences[dimension].excluded.length, 0);
  if (exclusionCount >= 5) {
    messages.push({
      type: "WARNING",
      code: "MANY_EXCLUSIONS",
      message: "Several exclusion rules are active. Review whether enough compliant funds remain."
    });
  }

  return dedupeMessages(messages);
}

function blockingFundMessage(fund: PolicyEntity, dimensionLabel: string, conflictingName?: string): ValidationMessage {
  return {
    type: "BLOCKING",
    code: `FUND_UNDER_EXCLUDED_${dimensionLabel.toUpperCase().replaceAll("-", "_")}_${fund.id}`,
    message: `${fund.name} cannot remain Preferred or Exclusive because ${conflictingName || `its ${dimensionLabel}`} is excluded.`
  };
}

function hasEntity(policy: TreasuryPolicyState, dimension: PolicyDimension, preferenceType: PreferenceType, entityId: string) {
  return policy.preferences[dimension][preferenceType].some((entity) => entity.id === entityId);
}

function dedupeMessages(messages: ValidationMessage[]) {
  const seen = new Set<string>();
  return messages.filter((message) => {
    const key = `${message.code}-${message.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function entityMeta(entity: PolicyEntity) {
  if (entity.dimension === "funds") {
    const schemeCode = getSchemeCode(entity);
    return [schemeCode ? `AMFI ${schemeCode}` : "", entity.amcName, entity.categoryName, entity.subCategoryName, entity.status]
      .filter(Boolean)
      .join(" / ");
  }
  if (entity.dimension === "subCategories") return entity.categoryName ? `Parent: ${entity.categoryName}` : "Scheme sub-category";
  if (entity.dimension === "categories") return "Scheme category";
  return "Asset management company";
}

function getSchemeCode(entity: PolicyEntity) {
  return entity.schemeCode || (entity.id.startsWith("amfi-") ? entity.id.replace("amfi-", "") : "");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
