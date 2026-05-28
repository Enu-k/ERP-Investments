import { useState } from "react";
import {
  formatMoney,
  getProviderLedgers,
  ledgerName,
  portfolioMappingComplete,
  roleLabels,
  scenarioLabels
} from "../data/accountingData";
import type { LedgerRole, PortfolioHolding, TreasuryTransaction } from "../types/accounting";
import { AccountingPill, FundAvatar, Metric, NewTransactionDropdown, PagePanel, Sheet } from "./Shared";

const mappingRoles: LedgerRole[] = ["investmentAsset", "bank", "gain", "loss", "dividend", "charges", "clearing"];

export function PortfolioAccounting({
  portfolios,
  transactions,
  onOpenPortfolio,
  selectedPortfolio,
  onClosePortfolio,
  onMapLedger
}: {
  portfolios: PortfolioHolding[];
  transactions: TreasuryTransaction[];
  onOpenPortfolio: (id: string) => void;
  selectedPortfolio?: PortfolioHolding;
  onClosePortfolio: () => void;
  onMapLedger: (portfolioId: string, role: LedgerRole, ledgerId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalInvested = portfolios.reduce((sum, portfolio) => sum + portfolio.currentlyInvested, 0);
  const currentValue = portfolios.reduce((sum, portfolio) => sum + portfolio.currentValue, 0);
  const bookedPnl = portfolios.reduce((sum, portfolio) => sum + portfolio.bookedPnl, 0);

  return (
    <>
      <PagePanel title="Portfolio" action={<NewTransactionDropdown open={menuOpen} setOpen={setMenuOpen} />}>
        <div className="portfolio-metrics">
          <Metric label="Total Invested" value="₹12.73 Cr" />
          <Metric label="Current Value" value="₹12.76 Cr" />
          <Metric label="Currently Invested" value={formatMoney(totalInvested)} />
          <Metric label="Booked P&L" value={formatMoney(bookedPnl || currentValue - totalInvested)} />
        </div>
      </PagePanel>

      <section className="figma-section">
        <div className="section-title">
          <h2>Holdings</h2>
          <span>{portfolios.filter(portfolioMappingComplete).length} mapped</span>
        </div>
        <div className="table-wrap">
          <table className="figma-table holdings-table">
            <thead>
              <tr>
                <th>Fund Name</th>
                <th className="align-right">Current value</th>
                <th className="align-right">Currently invested</th>
                <th>XIRR</th>
                <th>Asset ledger</th>
                <th>Accounting</th>
              </tr>
            </thead>
            <tbody>
              {portfolios.map((portfolio) => {
                const pending = transactions.filter((txn) => txn.portfolioId === portfolio.id && txn.accountingStatus !== "Synced").length;
                const mapped = portfolioMappingComplete(portfolio);
                return (
                  <tr key={portfolio.id} onClick={() => onOpenPortfolio(portfolio.id)}>
                    <td>
                      <div className="fund-cell">
                        <FundAvatar icon={portfolio.icon} />
                        <span>{portfolio.scheme}</span>
                      </div>
                    </td>
                    <td className="align-right">{formatMoney(portfolio.currentValue)}</td>
                    <td className="align-right">{formatMoney(portfolio.currentlyInvested)}</td>
                    <td className={portfolio.xirr.startsWith("-") ? "danger" : "success"}>{portfolio.xirr}</td>
                    <td>{ledgerName(portfolio.ledgerMapping.investmentAsset)}</td>
                    <td><AccountingPill status={mapped ? (pending ? "Ready to sync" : "Synced") : "Unmapped"} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {selectedPortfolio && (
        <PortfolioMappingSheet
          portfolio={selectedPortfolio}
          transactions={transactions.filter((txn) => txn.portfolioId === selectedPortfolio.id)}
          onClose={onClosePortfolio}
          onMapLedger={(role, ledgerId) => onMapLedger(selectedPortfolio.id, role, ledgerId)}
        />
      )}
    </>
  );
}

function PortfolioMappingSheet({
  portfolio,
  transactions,
  onClose,
  onMapLedger
}: {
  portfolio: PortfolioHolding;
  transactions: TreasuryTransaction[];
  onClose: () => void;
  onMapLedger: (role: LedgerRole, ledgerId: string) => void;
}) {
  const [activeSheetTab, setActiveSheetTab] = useState<"investments" | "accounting">("investments");
  const unrealisedPnl = portfolio.currentValue - portfolio.currentlyInvested;
  const avgBuyPrice = portfolio.units ? portfolio.currentlyInvested / portfolio.units : 0;

  return (
    <Sheet width={700} onClose={onClose}>
      <div className="holding-sheet-header">
        <div className="holding-title-row">
          <FundAvatar icon={portfolio.icon} />
          <div>
            <h2>{portfolio.scheme}</h2>
            <span className="asset-class-chip">{portfolio.assetClass.replace(" Mutual Fund", "")}</span>
          </div>
        </div>
      </div>

      <div className="holding-sheet-body">
        <div className="holding-sheet-tabs">
          <button className={activeSheetTab === "investments" ? "active" : ""} onClick={() => setActiveSheetTab("investments")}>Investments</button>
          <button className={activeSheetTab === "accounting" ? "active" : ""} onClick={() => setActiveSheetTab("accounting")}>Accounting</button>
        </div>

        {activeSheetTab === "investments" ? (
          <>
            <section className="holding-summary-grid">
              <Detail label="Current Value" value={formatMoney(portfolio.currentValue)} />
              <Detail label="Currently Invested" value={formatMoney(portfolio.currentlyInvested)} />
              <Detail label="Total Invested" value={formatMoney(portfolio.currentlyInvested)} />
              <Detail label="XIRR" value={portfolio.xirr} />
              <Detail label="Booked P&L" value={formatMoney(portfolio.bookedPnl)} />
              <Detail label="Unrealised P&L" value={`${unrealisedPnl >= 0 ? "+ " : ""}${formatMoney(unrealisedPnl)}`} accent={unrealisedPnl >= 0 ? "success" : "danger"} />
            </section>

            <section className="holding-section">
              <h2>Holding details</h2>
              <div className="holding-details-grid">
                <Detail label="Folio Number" value={`dummy-${portfolio.id.toUpperCase()}`} />
                <Detail label="Units held" value={portfolio.units.toLocaleString("en-IN")} />
                <Detail label="Current NAV" value={`₹${portfolio.nav.toFixed(2)}  (25 May 2026)`} />
                <Detail label="Avg buy price" value={`₹${avgBuyPrice.toFixed(2)}`} />
                <Detail label="Risk" value={portfolio.assetClass.includes("Debt") ? "Moderate" : portfolio.assetClass.includes("Hybrid") ? "High" : "Very high"} />
                <Detail label="Exit load" value={portfolio.ledgerMapping.charges ? "Mapped" : "0"} />
              </div>
            </section>

            <section className="holding-section">
              <h2>Transaction history</h2>
              <div className="holding-history-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th className="align-right">Amount</th>
                      <th className="align-right">Units</th>
                      <th className="align-right">NAV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length ? transactions.map((txn) => (
                      <tr key={txn.id}>
                        <td>{txn.submittedOn}</td>
                        <td><span className={`type-chip type-${scenarioLabels[txn.scenario].split(" ")[0].toLowerCase()}`}>{scenarioLabels[txn.scenario]}</span></td>
                        <td className="align-right">{formatMoney(txn.amount)}</td>
                        <td className="align-right">{txn.units ?? "—"}</td>
                        <td className="align-right">₹{portfolio.nav.toFixed(2)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5}>No transactions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="holding-actions">
              <button className="figma-secondary">Switch</button>
              <button className="figma-secondary">Redeem</button>
              <button className="figma-secondary">Purchase</button>
            </div>
          </>
        ) : (
          <section className="holding-section accounting-config-section">
            <div className="section-title compact">
              <h2>Ledger Mapping</h2>
              <span>{portfolio.provider} · Last updated {portfolio.lastUpdated ?? "not saved"}</span>
            </div>
            <p className="sheet-copy">Review the AI-mapped ERP ledgers for this holding. You can override any ledger before transactions are synced.</p>

            <div className="mapping-stack">
              {mappingRoles.map((role) => {
                const selectedLedger = getProviderLedgers(portfolio.provider).find((ledger) => ledger.id === portfolio.ledgerMapping[role]);
                const required = ["investmentAsset", "bank", "gain", "loss"].includes(role);

                return (
                  <label className="mapping-control" key={role}>
                    <span>{roleLabels[role]}{required && <b>*</b>}</span>
                    <div className="mapping-field">
                      <select
                        aria-label={`${roleLabels[role]}${required ? "*" : ""}`}
                        value={portfolio.ledgerMapping[role] ?? ""}
                        onChange={(event) => onMapLedger(role, event.target.value)}
                      >
                        <option value="">Select ledger...</option>
                        {getProviderLedgers(portfolio.provider).map((ledger) => (
                          <option key={ledger.id} value={ledger.id}>{ledger.name}</option>
                        ))}
                      </select>
                      <div className="mapping-ledger-meta">
                        <span>{selectedLedger ? selectedLedger.group : "User review required"}</span>
                        {selectedLedger?.confidence ? (
                          <span className={`confidence confidence-${selectedLedger.confidence.toLowerCase()}`}>
                            AI {selectedLedger.confidence}
                          </span>
                        ) : (
                          <span className="confidence confidence-low">AI PENDING</span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="accounting-config-actions">
              <button className="figma-secondary" onClick={() => setActiveSheetTab("investments")}>Cancel</button>
              <button className="figma-primary" onClick={() => setActiveSheetTab("investments")}>Save Mapping</button>
            </div>
          </section>
        )}
      </div>
    </Sheet>
  );
}

function Detail({ label, value, accent }: { label: string; value: string; accent?: "success" | "danger" }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong className={accent}>{value}</strong>
    </div>
  );
}
