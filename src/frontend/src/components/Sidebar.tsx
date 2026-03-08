import {
  Briefcase,
  ChevronRight,
  Eye,
  LayoutDashboard,
  Lock,
  Map as MapIcon,
  Menu,
  MessageSquareWarning,
  QrCode,
  Shield,
  Wifi,
  X,
} from "lucide-react";
import type { PageId } from "../App";

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview & stats",
  },
  {
    id: "deepfake",
    label: "Deepfake Detection",
    icon: Eye,
    description: "AI face analysis",
  },
  {
    id: "fakejob",
    label: "Job Scam Detector",
    icon: Briefcase,
    description: "Scam email analysis",
  },
  {
    id: "password",
    label: "Password Checker",
    icon: Lock,
    description: "Breach & strength",
  },
  {
    id: "qrscanner",
    label: "QR Code Scanner",
    icon: QrCode,
    description: "Malicious QR detect",
  },
  {
    id: "cyberbullying",
    label: "Cyberbullying",
    icon: MessageSquareWarning,
    description: "Toxicity analysis",
  },
  {
    id: "wifi",
    label: "WiFi Scanner",
    icon: Wifi,
    description: "Network security",
  },
  {
    id: "threatmap",
    label: "Threat Map",
    icon: MapIcon,
    description: "Live India threats",
  },
];

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  activePage,
  onNavigate,
  isOpen,
  onToggle,
}: SidebarProps) {
  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-md bg-card border border-border text-cyber-cyan hover:bg-accent transition-colors"
        data-ocid="nav.toggle"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full z-30 w-64 flex flex-col
          bg-sidebar border-r border-sidebar-border
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/40 flex items-center justify-center animate-pulse-glow">
              <Shield className="w-5 h-5 text-cyber-cyan" />
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-sm text-foreground leading-none">
              AI Cyber Shield
            </div>
            <div className="text-[10px] text-cyber-cyan font-mono mt-0.5 flex items-center gap-1">
              <span className="status-dot-green w-1.5 h-1.5 rounded-full bg-cyber-green inline-block" />
              SYSTEM ACTIVE
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest px-2 py-2">
            Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.id)}
                data-ocid={`nav.${item.id}.link`}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left
                  transition-all duration-150 group relative
                  ${
                    isActive
                      ? "bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 shadow-glow-sm-cyan"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyber-cyan rounded-r" />
                )}
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-cyber-cyan" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"}`}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-medium leading-none ${isActive ? "text-cyber-cyan" : ""}`}
                  >
                    {item.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-3 h-3 text-cyber-cyan flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="text-[10px] text-muted-foreground/50 font-mono">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-cyber-red">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyber-cyan hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
