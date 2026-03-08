import { Menu } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onMobileMenuToggle?: () => void;
}

export default function PageHeader({
  title,
  description,
  icon,
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      )}
      <div>
        <h1 className="font-display font-bold text-xl text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

export function SocCard({
  children,
  className = "",
  glowColor = "cyan",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "red" | "green" | "none";
}) {
  const glowClass = {
    cyan: "hover:border-cyber-cyan/40 hover:shadow-glow-sm-cyan",
    red: "hover:border-cyber-red/40 hover:shadow-glow-red",
    green: "hover:border-cyber-green/40 hover:shadow-glow-green",
    none: "",
  }[glowColor];

  return (
    <div
      className={`
        bg-card border border-border rounded-lg
        transition-all duration-200
        ${glowClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function ScoreMeter({
  score,
  label,
  colorScheme = "risk",
}: {
  score: number;
  label: string;
  colorScheme?: "risk" | "strength";
}) {
  const getColor = () => {
    if (colorScheme === "strength") {
      if (score <= 30)
        return { bar: "bg-cyber-red", text: "text-cyber-red", label: "WEAK" };
      if (score <= 60)
        return { bar: "bg-yellow-500", text: "text-yellow-400", label: "FAIR" };
      if (score <= 80)
        return {
          bar: "bg-cyber-green",
          text: "text-cyber-green",
          label: "GOOD",
        };
      return { bar: "bg-cyber-cyan", text: "text-cyber-cyan", label: "STRONG" };
    }
    if (score < 30)
      return { bar: "bg-cyber-green", text: "text-cyber-green", label: "SAFE" };
    if (score < 60)
      return {
        bar: "bg-yellow-500",
        text: "text-yellow-400",
        label: "SUSPICIOUS",
      };
    return {
      bar: "bg-cyber-red",
      text: "text-cyber-red",
      label: "THREAT DETECTED",
    };
  };

  const colors = getColor();

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground font-mono">{label}</span>
        <span className={`text-2xl font-mono font-bold ${colors.text}`}>
          {score}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className={`text-xs font-mono font-bold ${colors.text}`}>
        {colors.label}
      </div>
    </div>
  );
}

export function ScanningOverlay({
  label = "Analyzing...",
}: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-cyber-cyan/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-cyber-cyan rounded-full animate-spin" />
        <div className="absolute inset-2 border border-cyber-cyan/30 rounded-full animate-ping" />
      </div>
      <div className="text-sm font-mono text-cyber-cyan animate-pulse">
        {label}
      </div>
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-cyber-cyan rounded-full animate-scan-progress" />
      </div>
    </div>
  );
}

export { Menu };
