import {
  AlertCircle,
  Check,
  FileClock,
  HelpCircle,
  Pencil,
  Plus,
  RotateCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
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
import type {
  MutualFundPreferenceRule,
  PolicyDimension,
  PolicyEntity,
  PreferenceType,
  TreasuryPolicyState,
  ValidationMessage
} from "../types/policy";
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
    summary: "Limits eligible options to funds that match at least one rule.",
    detail:
      "Exclusive rules define the eligible investment universe. The platform and Agent should only surface funds that match these rules, after risk and exclusion checks."
  },
  preferred: {
    summary: "Ranks matching funds higher when they are otherwise eligible.",
    detail:
      "Preferred rules guide ranking and display priority. They do not block other compliant options, and they can overlap with Exclusive rules."
  },
  excluded: {
    summary: "Removes matching funds from compliant results and recommendations.",
    detail:
      "Excluded rules are hard blocks. Matching funds should not appear in compliant search, recommendations, or trades unless an authorised override is used."
  }
};
const attributeDescriptions: Record<PolicyDimension, string> = {
  amcs: "Choose the fund houses this rule should allow, prioritise, or block.",
  categories: "Choose high-level scheme groups such as Debt, Equity, Hybrid, Solution Oriented, or Other.",
  subCategories: "Choose scheme sub-categories; options follow any category values already selected in this rule.",
  funds: "Search official AMFI-backed schemes when the rule needs fund-level precision."
};
const emptySearches: Record<PolicyDimension, string> = {
  amcs: "",
  categories: "",
  subCategories: "",
  funds: ""
};

export function PolicyConfiguration() {
  const [activeTab, setActiveTab] = useState<ModuleTab>("Risk Profile");

  return (
    <div className="policy-page">
      <div className="policy-page-head">
        <div>
          <h1>Policy Configuration</h1>
          <p>Set how suitability, cash limits, and fund preferences guide investment recommendations and trades.</p>
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
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState("");
  const messages = useMemo(() => validatePolicy(policy), [policy]);
  const blockingMessages = messages.filter((message) => message.type === "BLOCKING");

  function addPreferenceRule(ruleType: PreferenceType) {
    const rule = createEmptyRule(ruleType);
    setPolicy((current) => ({
      ...current,
      mutualFundPreferenceRules: {
        ...current.mutualFundPreferenceRules,
        [ruleType]: [...current.mutualFundPreferenceRules[ruleType], rule]
      }
    }));
    setEditingRuleId(rule.id);
    setSaveNotice("");
  }

  function deletePreferenceRule(ruleType: PreferenceType, ruleId: string) {
    setPolicy((current) => ({
      ...current,
      mutualFundPreferenceRules: {
        ...current.mutualFundPreferenceRules,
        [ruleType]: current.mutualFundPreferenceRules[ruleType].filter((rule) => rule.id !== ruleId)
      }
    }));
    setEditingRuleId((current) => (current === ruleId ? null : current));
    setSaveNotice("");
  }

  function addRuleValue(ruleType: PreferenceType, ruleId: string, dimension: PolicyDimension, entity: PolicyEntity) {
    const rule = findRule(policy, ruleType, ruleId);
    if (!rule || rule[dimension].some((selected) => selected.id === entity.id)) return;
    if (!isSelectableOption(policy, rule, dimension, entity)) return;

    updateRule(ruleType, ruleId, (currentRule) => ({
      ...currentRule,
      [dimension]: [...currentRule[dimension], entity]
    }));
  }

  function removeRuleValue(ruleType: PreferenceType, ruleId: string, dimension: PolicyDimension, entityId: string) {
    updateRule(ruleType, ruleId, (currentRule) => ({
      ...currentRule,
      [dimension]: currentRule[dimension].filter((entity) => entity.id !== entityId)
    }));
  }

  function updateRule(
    ruleType: PreferenceType,
    ruleId: string,
    updater: (rule: MutualFundPreferenceRule) => MutualFundPreferenceRule
  ) {
    setPolicy((current) => ({
      ...current,
      mutualFundPreferenceRules: {
        ...current.mutualFundPreferenceRules,
        [ruleType]: current.mutualFundPreferenceRules[ruleType].map((rule) => (rule.id === ruleId ? updater(rule) : rule))
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
          <p>Suitability is applied before treasury rules. Current profile: Conservative, Score 9, valid until 13 Jun 2026.</p>
        </div>
        <button className="figma-secondary" type="button" onClick={onViewRiskProfile}>
          View risk profile
        </button>
      </section>

      <section className="policy-card enforcement-card">
        <div className="policy-card-title">
          <div>
            <span className="policy-kicker">Policy Enforcement Mode</span>
            <h2>Policy Enforcement Mode</h2>
            <p>Choose how strictly treasury policy is enforced across the platform and Agent workflows.</p>
          </div>
          <SlidersHorizontal size={21} />
        </div>

        <div className="enforcement-choice-grid">
          <button
            className={`enforcement-choice ${policy.enforcementMode === "ABSOLUTE" ? "active" : ""}`}
            onClick={() => setEnforcementMode("ABSOLUTE")}
          >
            <strong>Absolute Policy</strong>
            <span>Blocks non-compliant platform actions, search results, Agent recommendations, and trades.</span>
          </button>
          <button
            className={`enforcement-choice ${policy.enforcementMode === "OVERRIDABLE" ? "active" : ""}`}
            onClick={() => setEnforcementMode("OVERRIDABLE")}
          >
            <strong>Overridable with Warning</strong>
            <span>Warns on policy conflicts and allows authorised override after confirmation, reason capture, and audit logging.</span>
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
            <h2>Operating threshold</h2>
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
            <em>Minimum cash buffer to keep available before the platform or Agent proposes investments.</em>
          </label>
        </div>

        <CashThresholdPreview threshold={policy.minimumOperatingThresholdAmount} />
      </section>

      <section className="policy-card mutual-fund-rules-card">
        <div className="mutual-fund-rules-head">
          <div>
            <span className="policy-kicker">Mutual Fund Investment Preferences</span>
            <h2>Preference rules</h2>
            <p>Define which mutual funds are allowed, prioritised, or blocked when the platform and Agent surface investment options.</p>
          </div>
          <div className="rule-logic-pills" aria-label="Rule logic">
            <span>Inside rule: AND</span>
            <span>Values: OR</span>
            <span>Across rules: OR</span>
          </div>
        </div>

        <div className="mf-aum-threshold">
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
            <em>Caps how much of the firm's portfolio can sit in any one mutual fund scheme.</em>
          </label>
        </div>

        <div className="rule-section-list">
          {preferenceOrder.map((ruleType) => (
            <PreferenceRuleSection
              key={ruleType}
              ruleType={ruleType}
              rules={policy.mutualFundPreferenceRules[ruleType]}
              policy={policy}
              editingRuleId={editingRuleId}
              onAddRule={addPreferenceRule}
              onSetEditingRule={setEditingRuleId}
              onDeleteRule={deletePreferenceRule}
              onAddValue={addRuleValue}
              onRemoveValue={removeRuleValue}
            />
          ))}
        </div>
      </section>

      <section className="policy-save-bar">
        <div className="policy-save-bar-inner">
          <div>
            <strong>Active treasury policy</strong>
            <span>Saving applies these rules to platform search, Agent recommendations, and execution checks.</span>
            {saveNotice && <em>{saveNotice}</em>}
          </div>
          <div className="policy-save-actions">
            <button className="figma-secondary" type="button">
              <FileClock size={17} />
              Audit log
            </button>
            <button
              className="figma-primary"
              type="button"
              disabled={blockingMessages.length > 0}
              title={blockingMessages[0]?.message}
              onClick={savePolicy}
            >
              <Save size={17} />
              Save policy
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreferenceRuleSection({
  ruleType,
  rules,
  policy,
  editingRuleId,
  onAddRule,
  onSetEditingRule,
  onDeleteRule,
  onAddValue,
  onRemoveValue
}: {
  ruleType: PreferenceType;
  rules: MutualFundPreferenceRule[];
  policy: TreasuryPolicyState;
  editingRuleId: string | null;
  onAddRule: (ruleType: PreferenceType) => void;
  onSetEditingRule: (ruleId: string | null) => void;
  onDeleteRule: (ruleType: PreferenceType, ruleId: string) => void;
  onAddValue: (ruleType: PreferenceType, ruleId: string, dimension: PolicyDimension, entity: PolicyEntity) => void;
  onRemoveValue: (ruleType: PreferenceType, ruleId: string, dimension: PolicyDimension, entityId: string) => void;
}) {
  return (
    <article className={`rule-section rule-section-${ruleType}`}>
      <div className="rule-section-head">
        <div>
          <div className="rule-section-title">
            <h3>{preferenceLabels[ruleType]}</h3>
            <span>{rules.length} {rules.length === 1 ? "rule" : "rules"}</span>
            <button
              className="preference-help"
              type="button"
              aria-label={`${preferenceLabels[ruleType]} rule explanation`}
              title={preferenceDescriptions[ruleType].detail}
            >
              <HelpCircle size={14} />
            </button>
          </div>
          <p>{preferenceDescriptions[ruleType].summary}</p>
        </div>
        <button className="policy-add-control rule-add-control" type="button" onClick={() => onAddRule(ruleType)}>
          <Plus size={15} />
          Add rule
        </button>
      </div>

      <div className="rule-card-list">
        {!rules.length && <div className="rule-empty-state">No {preferenceLabels[ruleType].toLowerCase()} rules configured.</div>}
        {rules.map((rule, index) => {
          const isEditing = editingRuleId === rule.id;
          const isEmpty = isRuleEmpty(rule);
          const matchedCount = countMatchedFunds(rule);

          return (
            <div className={`rule-card rule-card-${ruleType}`} key={rule.id}>
              <div className="rule-card-top">
                <div>
                  <span className="rule-type-badge">{preferenceLabels[ruleType]} rule {index + 1}</span>
                  <p className="rule-sentence">{summarizeRule(rule)}</p>
                  <strong>{isEmpty ? "No fund universe selected" : `${matchedCount.toLocaleString("en-IN")} matched funds in master data`}</strong>
                  {isEmpty && <p className="rule-inline-error">Choose at least one AMC, category, sub-category, or fund value before saving.</p>}
                </div>
                <div className="rule-card-actions">
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={isEditing ? "Done editing rule" : "Edit rule"}
                    title={isEditing ? "Done editing" : "Edit rule"}
                    onClick={() => onSetEditingRule(isEditing ? null : rule.id)}
                  >
                    {isEditing ? <Check size={15} /> : <Pencil size={15} />}
                  </button>
                  <button
                    className="icon-button danger"
                    type="button"
                    aria-label="Delete rule"
                    title="Delete rule"
                    onClick={() => onDeleteRule(ruleType, rule.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {isEditing && (
                <RuleBuilder
                  policy={policy}
                  rule={rule}
                  onAddValue={onAddValue}
                  onRemoveValue={onRemoveValue}
                />
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function RuleBuilder({
  policy,
  rule,
  onAddValue,
  onRemoveValue
}: {
  policy: TreasuryPolicyState;
  rule: MutualFundPreferenceRule;
  onAddValue: (ruleType: PreferenceType, ruleId: string, dimension: PolicyDimension, entity: PolicyEntity) => void;
  onRemoveValue: (ruleType: PreferenceType, ruleId: string, dimension: PolicyDimension, entityId: string) => void;
}) {
  const [searches, setSearches] = useState<Record<PolicyDimension, string>>({ ...emptySearches });
  const [activeDimension, setActiveDimension] = useState<PolicyDimension | "">("");
  const [isValuePickerOpen, setIsValuePickerOpen] = useState(false);

  function selectOption(dimension: PolicyDimension, entity: PolicyEntity) {
    onAddValue(rule.ruleType, rule.id, dimension, entity);
    setSearches((current) => ({ ...current, [dimension]: "" }));
  }

  const selectedDimensions = dimensions.filter((dimension) => rule[dimension].length > 0);
  const activeSelectedValues = activeDimension ? rule[activeDimension] : [];
  const activeOptionState =
    activeDimension && isValuePickerOpen ? getRuleOptionState(policy, rule, activeDimension, searches[activeDimension]) : null;

  return (
    <div className="rule-builder-panel">
      <div className="rule-builder-copy">
        <strong>Add rule attributes</strong>
        <span>Choose an attribute, then add values. Different attributes narrow the rule together; values within one attribute are alternatives.</span>
      </div>

      <div className="rule-attribute-flow">
        <label className="rule-attribute-select">
          <span>Attribute</span>
          <select
            value={activeDimension}
            onChange={(event) => {
              const nextDimension = event.target.value as PolicyDimension | "";
              setActiveDimension(nextDimension);
              setIsValuePickerOpen(false);
              if (nextDimension) {
                setSearches((current) => ({ ...current, [nextDimension]: "" }));
              }
            }}
          >
            <option value="">Select attribute</option>
            {dimensions.map((dimension) => (
              <option key={dimension} value={dimension}>
                {dimensionLabels[dimension]}
              </option>
            ))}
          </select>
        </label>

        <div className={`rule-value-selector ${activeDimension ? "active" : ""}`}>
          <div className="rule-value-selector-head">
            <span>Attribute values</span>
            <em>{activeDimension ? attributeDescriptions[activeDimension] : "Choose an attribute first; then add the values this rule should target."}</em>
          </div>

          {activeDimension ? (
            <>
              <div className="rule-value-closed">
                <div className="rule-value-chip-preview">
                  {activeSelectedValues.map((entity) => (
                    <span className="selected-chip" key={entity.id}>
                      {entity.name}
                      <button
                        type="button"
                        aria-label={`Remove ${entity.name}`}
                        onClick={() => onRemoveValue(rule.ruleType, rule.id, activeDimension, entity.id)}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  {!activeSelectedValues.length && <span className="empty-chip">No values selected</span>}
                </div>
                <button
                  className="policy-add-control rule-value-open"
                  type="button"
                  onClick={() => setIsValuePickerOpen((current) => !current)}
                >
                  <Plus size={15} />
                  {isValuePickerOpen ? "Hide values" : "Select values"}
                </button>
              </div>

              {isValuePickerOpen && (
                <div className="policy-picker-panel rule-picker-panel">
                  <label className="policy-search-field">
                    <Search size={15} />
                    <input
                      autoFocus
                      value={searches[activeDimension]}
                      placeholder={`Search ${dimensionSearchLabels[activeDimension]}`}
                      onChange={(event) => setSearches((current) => ({ ...current, [activeDimension]: event.target.value }))}
                    />
                  </label>
                  {activeOptionState?.helperMessage && <p className="policy-option-helper">{activeOptionState.helperMessage}</p>}
                  {activeOptionState?.resultMessage && <p className="policy-option-helper">{activeOptionState.resultMessage}</p>}

                  <div className="policy-option-list">
                    {activeOptionState?.options.map((entity) => (
                      <button
                        className="policy-option-row"
                        key={entity.id}
                        type="button"
                        onClick={() => selectOption(activeDimension, entity)}
                      >
                        <Plus size={14} />
                        <span>
                          <strong>{entity.name}</strong>
                          <em>{entityMeta(entity)}</em>
                        </span>
                      </button>
                    ))}
                    {activeOptionState && !activeOptionState.options.length && (
                      <p className="policy-option-empty">{activeOptionState.emptyMessage}</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rule-value-disabled">Select an attribute to choose values for this rule.</div>
          )}
        </div>
      </div>

      <div className="rule-selected-conditions">
        {selectedDimensions.map((dimension) => (
          <div className="rule-selected-condition" key={dimension}>
            <div className="rule-selected-condition-head">
              <span>{dimensionLabels[dimension]}</span>
              <em>{rule[dimension].length} {rule[dimension].length === 1 ? "value" : "values"}</em>
            </div>
            <div className="selected-chip-list">
              {rule[dimension].map((entity) => (
                <span className="selected-chip" key={entity.id}>
                  {entity.name}
                  <button
                    type="button"
                    aria-label={`Remove ${entity.name}`}
                    onClick={() => onRemoveValue(rule.ruleType, rule.id, dimension, entity.id)}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
        {!selectedDimensions.length && <div className="rule-selected-empty">No attributes added to this rule yet.</div>}
      </div>
    </div>
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

function getRuleOptionState(policy: TreasuryPolicyState, rule: MutualFundPreferenceRule, dimension: PolicyDimension, query: string) {
  const selectedIds = new Set(rule[dimension].map((entity) => entity.id));
  const parents = resolveRuleParentFilters(policy, rule, dimension);
  const normalizedQuery = query.trim().toLowerCase();
  const searchAcrossAllFunds = dimension === "funds" && normalizedQuery.length > 0;
  const matchingOptions = policyMasterData[dimension].filter((entity) => {
    if (selectedIds.has(entity.id)) return false;
    if (!searchAcrossAllFunds && !matchesParentFilters(entity, parents)) return false;
    if (!isSelectableOption(policy, rule, dimension, entity)) return false;
    return matchesQuery(entity, normalizedQuery);
  });
  const options = matchingOptions.slice(0, optionDisplayLimit);

  return {
    options,
    helperMessage: getOptionHelperMessage(dimension, parents, searchAcrossAllFunds),
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

function getOptionHelperMessage(
  dimension: PolicyDimension,
  parents: { amcIds: Set<string>; categoryIds: Set<string>; subCategoryIds: Set<string>; usingDefaults: boolean },
  searchAcrossAllFunds: boolean
) {
  if (searchAcrossAllFunds) return "";
  if (parents.usingDefaults) return "Showing defaults from Exclusive policy rules.";
  if (dimension === "subCategories" && parents.categoryIds.size) return "Showing sub-categories from selected scheme categories.";
  if (dimension === "funds" && hasParentFilters(parents)) return "Showing funds matching selected rule attributes.";
  return "";
}

function resolveRuleParentFilters(policy: TreasuryPolicyState, rule: MutualFundPreferenceRule, dimension: PolicyDimension) {
  if (dimension === "subCategories") {
    const categoryParents = rule.categories.length ? rule.categories : getExclusiveDefaults(policy, "categories", rule.ruleType);

    return {
      amcIds: new Set<string>(),
      categoryIds: new Set(categoryParents.map((category) => category.id)),
      subCategoryIds: new Set<string>(),
      usingDefaults: !rule.categories.length && rule.ruleType !== "exclusive" && categoryParents.length > 0
    };
  }

  if (dimension === "funds") {
    const amcParents = rule.amcs.length ? rule.amcs : getExclusiveDefaults(policy, "amcs", rule.ruleType);
    const categoryParents = rule.categories.length ? rule.categories : getExclusiveDefaults(policy, "categories", rule.ruleType);
    const subCategoryParents = rule.subCategories.length ? rule.subCategories : getExclusiveDefaults(policy, "subCategories", rule.ruleType);

    return {
      amcIds: new Set(amcParents.map((amc) => amc.id)),
      categoryIds: new Set(categoryParents.map((category) => category.id)),
      subCategoryIds: new Set(subCategoryParents.map((subCategory) => subCategory.id)),
      usingDefaults:
        rule.ruleType !== "exclusive" &&
        ((!rule.amcs.length && amcParents.length > 0) ||
          (!rule.categories.length && categoryParents.length > 0) ||
          (!rule.subCategories.length && subCategoryParents.length > 0))
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
  parents: { amcIds: Set<string>; categoryIds: Set<string>; subCategoryIds: Set<string> }
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

function isSelectableOption(policy: TreasuryPolicyState, rule: MutualFundPreferenceRule, dimension: PolicyDimension, entity: PolicyEntity) {
  if (rule[dimension].some((selected) => selected.id === entity.id)) return false;

  if (rule.ruleType === "excluded") {
    if (hasEntityInRuleTypes(policy, ["exclusive", "preferred"], dimension, entity.id)) return false;
    if (wouldExcludeHardSelection(policy, dimension, entity)) return false;
  } else if (hasEntityInRuleTypes(policy, ["excluded"], dimension, entity.id)) {
    return false;
  }

  if (rule.ruleType !== "excluded") {
    if (dimension === "funds") {
      if (entity.amcId && hasEntityInRuleTypes(policy, ["excluded"], "amcs", entity.amcId)) return false;
      if (entity.categoryId && hasEntityInRuleTypes(policy, ["excluded"], "categories", entity.categoryId)) return false;
      if (entity.subCategoryId && hasEntityInRuleTypes(policy, ["excluded"], "subCategories", entity.subCategoryId)) return false;
    }

    if (dimension === "subCategories" && entity.categoryId && hasEntityInRuleTypes(policy, ["excluded"], "categories", entity.categoryId)) {
      return false;
    }
  }

  return true;
}

function wouldExcludeHardSelection(policy: TreasuryPolicyState, dimension: PolicyDimension, entity: PolicyEntity) {
  const hardFunds = getSelectedEntities(policy, ["exclusive", "preferred"], "funds");
  const hardSubCategories = getSelectedEntities(policy, ["exclusive", "preferred"], "subCategories");

  if (dimension === "amcs") return hardFunds.some((fund) => fund.amcId === entity.id);
  if (dimension === "categories") {
    return hardFunds.some((fund) => fund.categoryId === entity.id) || hardSubCategories.some((subCategory) => subCategory.categoryId === entity.id);
  }
  if (dimension === "subCategories") return hardFunds.some((fund) => fund.subCategoryId === entity.id);
  return false;
}

function validatePolicy(policy: TreasuryPolicyState): ValidationMessage[] {
  const messages: ValidationMessage[] = [];

  for (const ruleType of preferenceOrder) {
    for (const rule of policy.mutualFundPreferenceRules[ruleType]) {
      if (isRuleEmpty(rule)) {
        messages.push({
          type: "BLOCKING",
          code: `EMPTY_RULE_${rule.id}`,
          message: `${preferenceLabels[ruleType]} rule ${rule.id} needs at least one AMC, category, sub-category, or fund value.`
        });
      }
    }
  }

  for (const dimension of dimensions) {
    const preferredOrExclusiveIds = getEntityIdSet(policy, ["exclusive", "preferred"], dimension);

    for (const entity of getSelectedEntities(policy, ["excluded"], dimension)) {
      if (preferredOrExclusiveIds.has(entity.id)) {
        messages.push({
          type: "BLOCKING",
          code: `EXCLUDED_OVERLAP_${dimension}_${entity.id}`,
          message: `${entity.name} cannot be Excluded while it is also marked Preferred or Exclusive.`
        });
      }
    }
  }

  const preferredOrExclusiveFunds = getSelectedEntities(policy, ["preferred", "exclusive"], "funds");
  for (const fund of preferredOrExclusiveFunds) {
    if (fund.amcId && hasEntityInRuleTypes(policy, ["excluded"], "amcs", fund.amcId)) {
      messages.push(blockingFundMessage(fund, "AMC", fund.amcName));
    }
    if (fund.categoryId && hasEntityInRuleTypes(policy, ["excluded"], "categories", fund.categoryId)) {
      messages.push(blockingFundMessage(fund, "category", fund.categoryName));
    }
    if (fund.subCategoryId && hasEntityInRuleTypes(policy, ["excluded"], "subCategories", fund.subCategoryId)) {
      messages.push(blockingFundMessage(fund, "sub-category", fund.subCategoryName));
    }
  }

  for (const subCategory of getSelectedEntities(policy, ["preferred", "exclusive"], "subCategories")) {
    if (subCategory.categoryId && hasEntityInRuleTypes(policy, ["excluded"], "categories", subCategory.categoryId)) {
      messages.push({
        type: "BLOCKING",
        code: `SUBCATEGORY_UNDER_EXCLUDED_CATEGORY_${subCategory.id}`,
        message: `${subCategory.name} cannot remain selected because its parent category is excluded.`
      });
    }
  }

  const exclusiveRules = policy.mutualFundPreferenceRules.exclusive.filter((rule) => !isRuleEmpty(rule));
  if (exclusiveRules.length >= 2 || exclusiveRules.some((rule) => countRuleDimensions(rule) >= 2)) {
    messages.push({
      type: "WARNING",
      code: "LOW_ELIGIBLE_UNIVERSE",
      message: "Exclusive rules with multiple constraints may significantly reduce eligible recommendations."
    });
  }

  const exclusionCount = dimensions.reduce((total, dimension) => total + getSelectedEntities(policy, ["excluded"], dimension).length, 0);
  if (exclusionCount >= 5) {
    messages.push({
      type: "WARNING",
      code: "MANY_EXCLUSIONS",
      message: "Several exclusion values are active. Review whether enough compliant funds remain."
    });
  }

  return dedupeMessages(messages);
}

function createEmptyRule(ruleType: PreferenceType): MutualFundPreferenceRule {
  return {
    id: `rule-${ruleType}-${Date.now()}`,
    ruleType,
    amcs: [],
    categories: [],
    subCategories: [],
    funds: []
  };
}

function findRule(policy: TreasuryPolicyState, ruleType: PreferenceType, ruleId: string) {
  return policy.mutualFundPreferenceRules[ruleType].find((rule) => rule.id === ruleId);
}

function isRuleEmpty(rule: MutualFundPreferenceRule) {
  return dimensions.every((dimension) => rule[dimension].length === 0);
}

function countRuleDimensions(rule: MutualFundPreferenceRule) {
  return dimensions.filter((dimension) => rule[dimension].length > 0).length;
}

function countMatchedFunds(rule: MutualFundPreferenceRule) {
  if (isRuleEmpty(rule)) return 0;

  const amcIds = new Set(rule.amcs.map((entity) => entity.id));
  const categoryIds = new Set(rule.categories.map((entity) => entity.id));
  const subCategoryIds = new Set(rule.subCategories.map((entity) => entity.id));
  const fundIds = new Set(rule.funds.map((entity) => entity.id));

  return policyMasterData.funds.filter((fund) => {
    const matchesAmc = !amcIds.size || Boolean(fund.amcId && amcIds.has(fund.amcId));
    const matchesCategory = !categoryIds.size || Boolean(fund.categoryId && categoryIds.has(fund.categoryId));
    const matchesSubCategory = !subCategoryIds.size || Boolean(fund.subCategoryId && subCategoryIds.has(fund.subCategoryId));
    const matchesFund = !fundIds.size || fundIds.has(fund.id);
    return matchesAmc && matchesCategory && matchesSubCategory && matchesFund;
  }).length;
}

function summarizeRule(rule: MutualFundPreferenceRule) {
  const conditions = [
    formatCondition("AMC", rule.amcs),
    formatCondition("Scheme Category", rule.categories),
    formatCondition("Scheme Sub-Category", rule.subCategories),
    formatCondition("Specific Fund", rule.funds)
  ].filter(Boolean);

  if (!conditions.length) return `${preferenceLabels[rule.ruleType]} rule needs at least one selector.`;
  return `${preferenceLabels[rule.ruleType]} funds where ${conditions.join(" and ")}.`;
}

function formatCondition(label: string, entities: PolicyEntity[]) {
  if (!entities.length) return "";
  return `${label} ${entities.length === 1 ? "is" : "is any of"} ${formatEntityList(entities)}`;
}

function formatEntityList(entities: PolicyEntity[]) {
  const names = entities.map((entity) => entity.name);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} or ${names[1]}`;
  if (names.length === 3) return `${names[0]}, ${names[1]}, or ${names[2]}`;
  return `${names[0]}, ${names[1]}, ${names[2]}, +${names.length - 3} more`;
}

function blockingFundMessage(fund: PolicyEntity, dimensionLabel: string, conflictingName?: string): ValidationMessage {
  return {
    type: "BLOCKING",
    code: `FUND_UNDER_EXCLUDED_${dimensionLabel.toUpperCase().replaceAll("-", "_")}_${fund.id}`,
    message: `${fund.name} cannot remain Preferred or Exclusive because ${conflictingName || `its ${dimensionLabel}`} is excluded.`
  };
}

function getSelectedEntities(policy: TreasuryPolicyState, ruleTypes: PreferenceType[], dimension: PolicyDimension) {
  return ruleTypes.flatMap((ruleType) => policy.mutualFundPreferenceRules[ruleType].flatMap((rule) => rule[dimension]));
}

function getEntityIdSet(policy: TreasuryPolicyState, ruleTypes: PreferenceType[], dimension: PolicyDimension) {
  return new Set(getSelectedEntities(policy, ruleTypes, dimension).map((entity) => entity.id));
}

function hasEntityInRuleTypes(policy: TreasuryPolicyState, ruleTypes: PreferenceType[], dimension: PolicyDimension, entityId: string) {
  return getEntityIdSet(policy, ruleTypes, dimension).has(entityId);
}

function hasParentFilters(parents: { amcIds: Set<string>; categoryIds: Set<string>; subCategoryIds: Set<string> }) {
  return Boolean(parents.amcIds.size || parents.categoryIds.size || parents.subCategoryIds.size);
}

function getExclusiveDefaults(policy: TreasuryPolicyState, dimension: PolicyDimension, ruleType: PreferenceType) {
  if (ruleType === "exclusive") return [];
  return getSelectedEntities(policy, ["exclusive"], dimension);
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
