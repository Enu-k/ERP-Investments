import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { formatMoney, ledgers, providers } from "../data/accountingData";
import { PagePanel, ProviderIcon } from "./Shared";

export function ERPIntegration() {
  const [importedAt, setImportedAt] = useState("27 May 2026, 11:42 AM");
  const [refreshing, setRefreshing] = useState(false);

  function refreshLedgers() {
    setRefreshing(true);
    window.setTimeout(() => {
      setImportedAt("Just now");
      setRefreshing(false);
    }, 550);
  }

  return (
    <div>
      <PagePanel
        title="ERP Integration"
        action={
          <button className="figma-primary" onClick={refreshLedgers} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Ledgers"}
          </button>
        }
      >
        <div className="erp-grid">
          {providers.map((provider) => (
            <article className="erp-card" key={provider.id}>
              <div className="erp-card-head">
                <ProviderIcon />
                <span className="connected">{provider.status}</span>
              </div>
              <h2>{provider.name}</h2>
              <p>{provider.company}</p>
              <div className="erp-stats">
                <div><span>Health</span><strong>{provider.health}</strong></div>
                <div><span>Last Synced</span><strong>{provider.lastSync}</strong></div>
                <div><span>Total Synced</span><strong>{provider.synced}</strong></div>
                <div><span>Failed</span><strong className="danger">{provider.failed}</strong></div>
              </div>
            </article>
          ))}
          <article className="erp-card imported">
            <div className="erp-card-head">
              <ProviderIcon />
              <span className="connected">Imported</span>
            </div>
            <h2>{ledgers.length} ledgers</h2>
            <p>Investment, bank, income, charges and clearing ledgers imported for treasury accounting.</p>
            <div className="erp-stats two">
              <div><span>Imported</span><strong>{importedAt}</strong></div>
              <div><span>High confidence</span><strong>{ledgers.filter((ledger) => ledger.confidence === "HIGH").length}</strong></div>
            </div>
          </article>
        </div>
      </PagePanel>

      <section className="figma-section">
        <div className="section-title">
          <h2>Imported Ledgers</h2>
          <span>{ledgers.length} ledgers</span>
        </div>
        <div className="table-wrap">
          <table className="figma-table">
            <thead>
              <tr>
                <th>Ledger Name</th>
                <th>Group</th>
                <th>Provider</th>
                <th className="align-right">Balance</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.map((ledger) => (
                <tr key={ledger.id}>
                  <td>{ledger.name}</td>
                  <td>{ledger.group}</td>
                  <td>{ledger.provider}</td>
                  <td className="align-right">{ledger.balance === undefined ? "—" : formatMoney(ledger.balance)}</td>
                  <td>{ledger.confidence ? <span className={`confidence confidence-${ledger.confidence.toLowerCase()}`}>{ledger.confidence}</span> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
