import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  Scan,
  Shield,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  usePlatformStats,
  useScanCountsByModule,
  useScanHistory,
  useThreatFeed,
} from "../hooks/useQueries";
import {
  SCAN_HISTORY_SAMPLE,
  THREAT_FEED_SAMPLE,
  formatTimestamp,
  riskLevelBadgeClass,
  severityBadgeClass,
} from "../utils/cyber";

function StatCard({
  icon: Icon,
  title,
  value,
  color,
  isLoading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  color: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="bg-card border-border overflow-hidden relative">
      <div
        className={`absolute inset-0 opacity-5 ${color === "cyan" ? "bg-cyber-cyan" : color === "red" ? "bg-cyber-red" : "bg-cyber-green"}`}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="w-20 h-8 mt-2 bg-muted" />
            ) : (
              <p
                className={`text-3xl font-mono font-bold mt-1 ${color === "cyan" ? "text-cyber-cyan" : color === "red" ? "text-cyber-red" : "text-cyber-green"}`}
              >
                {value}
              </p>
            )}
          </div>
          <div
            className={`p-2 rounded-lg ${color === "cyan" ? "bg-cyber-cyan/10 text-cyber-cyan" : color === "red" ? "bg-cyber-red/10 text-cyber-red" : "bg-cyber-green/10 text-cyber-green"}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-mono text-muted-foreground">{label}</p>
        <p className="text-sm font-mono font-bold text-cyber-cyan">
          {payload[0].value} scans
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: moduleCounts, isLoading: countsLoading } =
    useScanCountsByModule();
  const { data: threatFeed, isLoading: threatLoading } = useThreatFeed();
  const { data: scanHistory, isLoading: historyLoading } = useScanHistory();

  const displayThreatFeed =
    !threatFeed || threatFeed.length === 0 ? THREAT_FEED_SAMPLE : threatFeed;
  const displayScanHistory =
    !scanHistory || scanHistory.length === 0
      ? SCAN_HISTORY_SAMPLE
      : scanHistory;

  const chartData =
    moduleCounts && moduleCounts.length > 0
      ? moduleCounts.map((m) => ({
          name: m.moduleName
            .replace(" Detection", "")
            .replace(" Detector", "")
            .replace(" Checker", "")
            .replace(" Scanner", ""),
          scans: Number(m.count),
        }))
      : [
          { name: "Deepfake", scans: 142 },
          { name: "Job Scam", scans: 89 },
          { name: "Password", scans: 234 },
          { name: "QR Code", scans: 67 },
          { name: "Bully", scans: 45 },
          { name: "WiFi", scans: 78 },
        ];

  return (
    <div className="p-4 lg:p-8 pt-14 lg:pt-8" data-ocid="dashboard.page">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-cyber-cyan" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Security Operations Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            AI Cyber Shield — Real-time threat detection dashboard
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-threat-pulse" />
          <span className="text-xs font-mono text-cyber-green">LIVE</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Scan}
          title="Total Scans"
          value={stats ? Number(stats.totalScans).toLocaleString() : "0"}
          color="cyan"
          isLoading={statsLoading}
        />
        <StatCard
          icon={AlertTriangle}
          title="Threats Detected"
          value={stats ? Number(stats.threatsDetected).toLocaleString() : "0"}
          color="red"
          isLoading={statsLoading}
        />
        <StatCard
          icon={Activity}
          title="Active Alerts"
          value={stats ? Number(stats.activeAlerts).toLocaleString() : "0"}
          color="green"
          isLoading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        {/* Bar chart */}
        <Card className="bg-card border-border lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyber-cyan" />
              <span className="text-foreground">Scans by Module</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {countsLoading ? (
              <Skeleton className="w-full h-48 bg-muted" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.28 0.025 240 / 0.3)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fill: "oklch(0.58 0.03 220)",
                      fontFamily: "JetBrains Mono",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "oklch(0.58 0.03 220)",
                      fontFamily: "JetBrains Mono",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="scans"
                    fill="oklch(0.72 0.18 198)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Threat Feed */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-cyber-red" />
              <span className="text-foreground">Live Threat Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {threatLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="w-full h-12 bg-muted" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[220px]">
                <div className="divide-y divide-border">
                  {displayThreatFeed.slice(0, 8).map((threat, _idx) => (
                    <div
                      key={String(threat.id)}
                      className="px-4 py-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 font-mono ${severityBadgeClass(threat.severity)}`}
                        >
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {threat.location}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-tight line-clamp-2">
                        {threat.description}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                        {formatTimestamp(threat.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan History */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyber-cyan" />
            <span className="text-foreground">Recent Scan History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-10 bg-muted" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2.5 font-mono text-muted-foreground font-normal">
                      Module
                    </th>
                    <th className="text-left px-4 py-2.5 font-mono text-muted-foreground font-normal hidden md:table-cell">
                      Input
                    </th>
                    <th className="text-left px-4 py-2.5 font-mono text-muted-foreground font-normal">
                      Score
                    </th>
                    <th className="text-left px-4 py-2.5 font-mono text-muted-foreground font-normal">
                      Risk
                    </th>
                    <th className="text-left px-4 py-2.5 font-mono text-muted-foreground font-normal hidden lg:table-cell">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayScanHistory.slice(0, 8).map((scan, idx) => (
                    <tr
                      key={String(scan.id)}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`dashboard.scan.item.${idx + 1}`}
                    >
                      <td className="px-4 py-2.5 font-mono text-foreground">
                        {scan.moduleName}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[150px] hidden md:table-cell">
                        {scan.inputSummary}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-cyber-cyan">
                        {String(scan.resultScore)}%
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono ${riskLevelBadgeClass(scan.riskLevel)}`}
                        >
                          {scan.riskLevel.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">
                        {formatTimestamp(scan.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
