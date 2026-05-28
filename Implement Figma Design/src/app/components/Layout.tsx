import { Outlet, NavLink } from "react-router";
import { Home, Briefcase, Compass, Receipt, Grid, Settings } from "lucide-react";

export function Layout() {
  return (
    <div className="flex h-screen bg-[#f8f8fa]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">Kodo</span>
            <span className="text-lg text-muted-foreground">North</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={Grid} to="/agent" label="Agent" />
          <NavItem icon={Home} to="/home" label="Home" />
          <NavItem icon={Briefcase} to="/portfolio" label="Portfolio" />
          <NavItem icon={Compass} to="/explore" label="Explore" />
          <NavItem icon={Receipt} to="/transactions" label="Transactions" />
          <div className="pt-4">
            <NavItem icon={Settings} to="/integrations" label="Integrations" collapsible />
          </div>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-border">
          <NavItem icon={Settings} to="/settings" label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon: Icon,
  to,
  label,
  collapsible = false
}: {
  icon: React.ElementType;
  to: string;
  label: string;
  collapsible?: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-accent"
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {collapsible && <span className="ml-auto text-xs">›</span>}
    </NavLink>
  );
}
