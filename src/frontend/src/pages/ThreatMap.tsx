import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle, Filter, Map as MapIcon } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useThreatFeed } from "../hooks/useQueries";
import {
  THREAT_FEED_SAMPLE,
  formatTimestamp,
  severityBadgeClass,
} from "../utils/cyber";

interface CityMarker {
  name: string;
  x: number;
  y: number;
  threats: number;
  severity: "critical" | "high" | "medium" | "low";
}

const CITY_MARKERS: CityMarker[] = [
  { name: "Delhi", x: 44, y: 22, threats: 28, severity: "critical" },
  { name: "Mumbai", x: 30, y: 52, threats: 34, severity: "critical" },
  { name: "Bangalore", x: 36, y: 72, threats: 19, severity: "high" },
  { name: "Chennai", x: 42, y: 78, threats: 12, severity: "medium" },
  { name: "Hyderabad", x: 40, y: 62, threats: 22, severity: "high" },
  { name: "Kolkata", x: 65, y: 38, threats: 15, severity: "high" },
  { name: "Pune", x: 33, y: 56, threats: 11, severity: "medium" },
  { name: "Ahmedabad", x: 26, y: 38, threats: 8, severity: "medium" },
  { name: "Jaipur", x: 36, y: 28, threats: 6, severity: "low" },
];

const THREAT_TYPES_DATA = [
  { name: "Phishing", value: 34 },
  { name: "Malware", value: 22 },
  { name: "QR Fraud", value: 18 },
  { name: "Job Scam", value: 14 },
  { name: "WiFi Attack", value: 12 },
];

const PIE_COLORS = [
  "oklch(0.75 0.18 198)",
  "oklch(0.62 0.24 25)",
  "oklch(0.78 0.19 68)",
  "oklch(0.72 0.2 145)",
  "oklch(0.62 0.2 295)",
];

const TIME_DATA = [
  { time: "00:00", threats: 8, phishing: 3, malware: 2 },
  { time: "04:00", threats: 4, phishing: 1, malware: 1 },
  { time: "08:00", threats: 18, phishing: 7, malware: 5 },
  { time: "12:00", threats: 32, phishing: 12, malware: 8 },
  { time: "16:00", threats: 28, phishing: 10, malware: 7 },
  { time: "20:00", threats: 24, phishing: 9, malware: 6 },
  { time: "Now", threats: 38, phishing: 14, malware: 10 },
];

function IndiaMap() {
  const markerColor = {
    critical: "oklch(0.62 0.24 25)",
    high: "oklch(0.72 0.2 52)",
    medium: "oklch(0.82 0.18 92)",
    low: "oklch(0.72 0.2 145)",
  };

  return (
    <div className="relative w-full" style={{ paddingBottom: "110%" }}>
      <div className="absolute inset-0">
        {/* Simple India SVG outline */}
        <svg
          viewBox="0 0 100 110"
          className="w-full h-full"
          role="img"
          aria-label="India cyber threat map"
        >
          <title>India Cyber Threat Map</title>
          {/* India approximate polygon */}
          <path
            d="M 22 5 L 30 4 L 38 6 L 48 5 L 56 8 L 62 12 L 68 18 L 72 26 L 74 34 L 76 40 L 74 46 L 70 52 L 72 58 L 68 62 L 62 68 L 58 74 L 54 80 L 50 86 L 46 90 L 42 86 L 38 82 L 34 78 L 30 72 L 26 64 L 22 58 L 18 52 L 16 44 L 14 36 L 16 28 L 18 20 L 20 12 Z"
            fill="oklch(0.18 0.02 250)"
            stroke="oklch(0.72 0.18 198 / 0.25)"
            strokeWidth="0.8"
          />
          {/* State lines (approximate) */}
          <line
            x1="22"
            y1="35"
            x2="68"
            y2="35"
            stroke="oklch(0.28 0.025 240 / 0.3)"
            strokeWidth="0.3"
            strokeDasharray="1,2"
          />
          <line
            x1="22"
            y1="55"
            x2="68"
            y2="55"
            stroke="oklch(0.28 0.025 240 / 0.3)"
            strokeWidth="0.3"
            strokeDasharray="1,2"
          />
          <line
            x1="40"
            y1="5"
            x2="40"
            y2="90"
            stroke="oklch(0.28 0.025 240 / 0.3)"
            strokeWidth="0.3"
            strokeDasharray="1,2"
          />

          {/* City markers */}
          {CITY_MARKERS.map((city) => (
            <g key={city.name} data-ocid="threatmap.map_marker">
              {/* Pulse ring */}
              <circle
                cx={city.x}
                cy={city.y}
                r={city.threats / 8}
                fill="none"
                stroke={markerColor[city.severity]}
                strokeWidth="0.5"
                opacity="0.5"
                className="animate-map-ping"
                style={{ animationDelay: `${Math.random() * 2}s` }}
              />
              {/* Center dot */}
              <circle
                cx={city.x}
                cy={city.y}
                r={2}
                fill={markerColor[city.severity]}
                opacity="0.9"
              />
              {/* City label */}
              <text
                x={city.x + 3}
                y={city.y + 1}
                fontSize="3"
                fill="oklch(0.75 0.01 210)"
                fontFamily="JetBrains Mono, monospace"
              >
                {city.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
        {payload.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-2 text-xs font-mono"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-muted-foreground">{p.name}:</span>
            <span style={{ color: p.color }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ThreatMap() {
  const { data: threatFeed, isLoading } = useThreatFeed();
  const [severityFilter, setSeverityFilter] = useState("all");

  const displayThreats =
    !threatFeed || threatFeed.length === 0 ? THREAT_FEED_SAMPLE : threatFeed;
  const filtered =
    severityFilter === "all"
      ? displayThreats
      : displayThreats.filter((t) => t.severity === severityFilter);

  return (
    <div className="p-4 lg:p-8 pt-14 lg:pt-8" data-ocid="threatmap.page">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
            <MapIcon className="w-5 h-5 text-cyber-cyan" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              Cyber Threat Map
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live threat intelligence — India focus
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-red animate-threat-pulse" />
          <span className="text-xs font-mono text-cyber-red">
            {displayThreats.length} ACTIVE THREATS
          </span>
        </div>
      </div>

      {/* Ticker */}
      <div className="rounded-lg border border-border bg-muted/20 overflow-hidden mb-6 flex items-center">
        <div className="bg-cyber-red/10 border-r border-border px-3 py-2 flex-shrink-0">
          <span className="text-[10px] font-mono text-cyber-red font-bold">
            LIVE
          </span>
        </div>
        <div className="overflow-hidden flex-1 py-2 px-4">
          <div className="animate-ticker whitespace-nowrap text-xs font-mono text-muted-foreground">
            {displayThreats
              .map(
                (t) =>
                  `⚠ [${t.severity.toUpperCase()}] ${t.location}: ${t.description}   |   `,
              )
              .join("")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* India Map */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-cyber-cyan" />
              <span>India Threat Map</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IndiaMap />
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Critical", color: "bg-cyber-red" },
                { label: "High", color: "bg-cyber-orange" },
                { label: "Medium", color: "bg-yellow-400" },
                { label: "Low", color: "bg-cyber-green" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Line chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-cyan" />
                <span>Threats Over Time (24h)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart
                  data={TIME_DATA}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.28 0.025 240 / 0.3)"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{
                      fontSize: 9,
                      fill: "oklch(0.58 0.03 220)",
                      fontFamily: "JetBrains Mono",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 9,
                      fill: "oklch(0.58 0.03 220)",
                      fontFamily: "JetBrains Mono",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="threats"
                    stroke="oklch(0.72 0.18 198)"
                    strokeWidth={2}
                    dot={false}
                    name="Total"
                    data-ocid="threatmap.chart_point"
                  />
                  <Line
                    type="monotone"
                    dataKey="phishing"
                    stroke="oklch(0.62 0.24 25)"
                    strokeWidth={1.5}
                    dot={false}
                    name="Phishing"
                  />
                  <Line
                    type="monotone"
                    dataKey="malware"
                    stroke="oklch(0.72 0.2 145)"
                    strokeWidth={1.5}
                    dot={false}
                    name="Malware"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyber-red" />
                <span>Threats by Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie
                      data={THREAT_TYPES_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      dataKey="value"
                    >
                      {THREAT_TYPES_DATA.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {THREAT_TYPES_DATA.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: PIE_COLORS[idx] }}
                      />
                      <span className="text-xs font-mono text-muted-foreground flex-1">
                        {item.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-foreground">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Threat feed */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-cyber-red" />
              <span>Threat Intelligence Feed</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger
                  data-ocid="threatmap.select"
                  className="w-32 h-7 text-[11px] font-mono bg-muted/30 border-border"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all" className="font-mono text-xs">
                    All Severity
                  </SelectItem>
                  <SelectItem value="critical" className="font-mono text-xs">
                    Critical
                  </SelectItem>
                  <SelectItem value="high" className="font-mono text-xs">
                    High
                  </SelectItem>
                  <SelectItem value="medium" className="font-mono text-xs">
                    Medium
                  </SelectItem>
                  <SelectItem value="low" className="font-mono text-xs">
                    Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-12 bg-muted" />
              ))}
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="divide-y divide-border">
                {filtered.map((threat, _idx) => (
                  <div
                    key={String(threat.id)}
                    className="px-4 py-3 hover:bg-muted/20 transition-colors flex items-start gap-3"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-threat-pulse ${
                        threat.severity === "critical"
                          ? "bg-cyber-red"
                          : threat.severity === "high"
                            ? "bg-cyber-orange"
                            : threat.severity === "medium"
                              ? "bg-yellow-400"
                              : "bg-cyber-green"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono ${severityBadgeClass(threat.severity)}`}
                        >
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono border-border text-muted-foreground"
                        >
                          {threat.threatType}
                        </Badge>
                        <span className="text-[10px] font-mono text-cyber-cyan">
                          {threat.location}
                        </span>
                      </div>
                      <p className="text-xs text-foreground">
                        {threat.description}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                        {formatTimestamp(threat.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div
                    className="p-8 text-center text-sm text-muted-foreground font-mono"
                    data-ocid="threatmap.empty_state"
                  >
                    No threats matching filter
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
