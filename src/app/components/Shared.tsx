import {
  ArrowLeftRight,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  Database,
  Grid2X2,
  Home,
  Link2,
  Search,
  Settings,
  ShieldCheck,
  X
} from "lucide-react";
import type { AccountingStatus, Scenario } from "../types/accounting";
import { scenarioLabels } from "../data/accountingData";

export type Section = "portfolio" | "transactions" | "erp" | "policy";

export function Layout({
  section,
  setSection,
  children
}: {
  section: Section;
  setSection: (section: Section) => void;
  children: React.ReactNode;
}) {
  const nav = [
    { id: "home", label: "Home", icon: Home },
    { id: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
    { id: "explore", label: "Explore", icon: Search },
    { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
    { id: "erp", label: "Integrations", icon: Link2, caret: true },
    { id: "policy", label: "Policy Configuration", icon: ShieldCheck },
    { id: "settings", label: "Settings", icon: Settings }
  ] as const;

  return (
    <div className="figma-shell">
      <aside className="figma-sidebar">
        <div className="figma-logo">
          <span className="figma-logo-mark" />
          <strong>Platform Name</strong>
        </div>
        <nav className="figma-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.id === section;
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.id === "portfolio" || item.id === "transactions" || item.id === "erp" || item.id === "policy") {
                      setSection(item.id);
                    }
                  }}
                  className={`figma-nav-item ${active ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {"caret" in item && item.caret && <ChevronDown size={15} className="nav-caret" />}
                </button>
                {item.id === "erp" && active && (
                  <div className="figma-subnav">
                    <button>Business Accounts</button>
                    <button className="active">ERP</button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <main className="figma-main">
        <header className="figma-topbar">
          <span>Kodo Technologies Private Limited</span>
          <div className="figma-topbar-actions">
            <button className="notification-button" aria-label="Notifications">
              <Bell size={22} />
              <span />
            </button>
            <div className="figma-user">
              <div className="user-initials">AM</div>
              <div>
                <strong>A. Mehta</strong>
                <span>Primary Owner</span>
              </div>
            </div>
          </div>
        </header>
        <div className="figma-content">{children}</div>
      </main>
    </div>
  );
}

export function PagePanel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="page-panel">
      <div className="page-panel-header">
        <h1>{title}</h1>
        {action}
      </div>
      {children}
    </section>
  );
}

export function NewTransactionDropdown({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <div className="new-transaction">
      <button className="figma-primary" onClick={() => setOpen(!open)}>
        New transaction <ChevronDown size={18} className={open ? "rotate" : ""} />
      </button>
      {open && (
        <div className="transaction-menu">
          <button>Purchase</button>
          <button>Switch</button>
          <button>Redeem</button>
        </div>
      )}
    </div>
  );
}

export function FundAvatar({ icon }: { icon: string }) {
  return <span className={`fund-avatar avatar-${icon.toLowerCase()}`}>{icon}</span>;
}

export function AccountingPill({ status }: { status: AccountingStatus }) {
  return <span className={`status-chip ${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}

export function ScenarioChip({ scenario }: { scenario: Scenario }) {
  const label = scenarioLabels[scenario];
  return <span className={`type-chip type-${label.toLowerCase().split(" ")[0]}`}>{label}</span>;
}

export function Sheet({
  width = 600,
  children,
  onClose
}: {
  width?: number;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="sheet-overlay">
      <div className="sheet-backdrop" onClick={onClose} />
      <aside className="figma-sheet" style={{ width: `min(${width}px, 100vw)` }}>
        <button className="sheet-x" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        {children}
      </aside>
    </div>
  );
}

export function HeaderTabs({
  tabs,
  active,
  onChange
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="header-tabs">
      {tabs.map((tab) => (
        <button key={tab} onClick={() => onChange(tab)} className={active === tab ? "active" : ""}>
          {tab}
        </button>
      ))}
    </div>
  );
}

export function Metric({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

export function EmptyIcon() {
  return (
    <div className="empty-icon">
      <Grid2X2 size={18} />
    </div>
  );
}

export function ProviderIcon() {
  return (
    <div className="provider-icon">
      <Database size={24} />
    </div>
  );
}
