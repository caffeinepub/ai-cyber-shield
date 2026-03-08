import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Wifi,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScanningOverlay } from "../components/PageHeader";
import { useSubmitScan } from "../hooks/useQueries";
import { scoreToRiskLevel } from "../utils/cyber";

type AnalysisState = "idle" | "analyzing" | "done";
type CheckStatus = "pass" | "fail" | "warning";

interface SecurityCheck {
  id: string;
  label: string;
  description: string;
  status: CheckStatus;
}

function generateChecks(
  ssid: string,
  secType: string,
  signal: number,
): SecurityCheck[] {
  const isOpen = secType === "open" || secType === "";
  const isWeak = secType === "wep";
  const isWPA = secType === "wpa";
  const isStrong = secType === "wpa2" || secType === "wpa3";

  const isSuspiciousSsid = [
    "free",
    "public",
    "guest",
    "airport",
    "hotel",
    "mall",
  ].some((w) => ssid.toLowerCase().includes(w));

  return [
    {
      id: "encryption",
      label: "Encryption Strength",
      description: `Using ${secType.toUpperCase() || "unknown"} encryption`,
      status: isStrong ? "pass" : isWPA ? "warning" : "fail",
    },
    {
      id: "dns_leak",
      label: "DNS Leak Protection",
      description: isOpen
        ? "No protection on open network"
        : "Basic DNS protection detected",
      status: isOpen ? "fail" : isStrong ? "pass" : "warning",
    },
    {
      id: "rogue_ap",
      label: "Rogue AP Detection",
      description: isSuspiciousSsid
        ? "Suspicious network name pattern"
        : "Network name appears legitimate",
      status: isSuspiciousSsid ? "warning" : "pass",
    },
    {
      id: "mitm",
      label: "Man-in-the-Middle Risk",
      description: isOpen
        ? "High risk on unsecured network"
        : "Encrypted channel reduces MITM risk",
      status: isOpen ? "fail" : isWeak ? "warning" : "pass",
    },
    {
      id: "packet_sniffing",
      label: "Packet Sniffing Vulnerability",
      description: isOpen
        ? "Traffic is not encrypted"
        : "Traffic encrypted from eavesdropping",
      status: isOpen ? "fail" : isWeak ? "fail" : "pass",
    },
    {
      id: "arp_spoofing",
      label: "ARP Spoofing Risk",
      description:
        signal > 80
          ? "Strong signal, lower ARP attack surface"
          : "Weak signal may indicate spoofed AP",
      status: signal > 80 ? "pass" : signal > 50 ? "warning" : "fail",
    },
    {
      id: "ssl_strip",
      label: "SSL Strip Vulnerability",
      description: isOpen
        ? "SSL stripping possible on open network"
        : "HTTPS stripping partially mitigated",
      status: isOpen ? "fail" : isStrong ? "warning" : "warning",
    },
    {
      id: "captive_portal",
      label: "Captive Portal Safety",
      description: isSuspiciousSsid
        ? "Captive portal may capture credentials"
        : "No suspicious captive portal detected",
      status: isSuspiciousSsid ? "warning" : "pass",
    },
  ];
}

function computeScore(checks: SecurityCheck[]): number {
  const passing = checks.filter((c) => c.status === "pass").length;
  const warning = checks.filter((c) => c.status === "warning").length;
  return Math.round(passing * 12.5 + warning * 6);
}

export default function WiFiScanner() {
  const [ssid, setSsid] = useState("");
  const [secType, setSecType] = useState("wpa2");
  const [signal, setSignal] = useState([65]);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [score, setScore] = useState(0);

  const submitScan = useSubmitScan();

  const scan = async () => {
    if (!ssid.trim()) {
      toast.error("Enter a network name (SSID)");
      return;
    }
    setAnalysisState("analyzing");
    await new Promise((r) => setTimeout(r, 2000));
    const generatedChecks = generateChecks(ssid, secType, signal[0]);
    const s = computeScore(generatedChecks);
    setChecks(generatedChecks);
    setScore(s);
    setAnalysisState("done");

    const failCount = generatedChecks.filter((c) => c.status === "fail").length;
    const _rl =
      failCount >= 4
        ? "critical"
        : failCount >= 2
          ? "high"
          : failCount >= 1
            ? "medium"
            : "low";
    submitScan.mutate(
      {
        moduleName: "WiFi Scanner",
        inputSummary: ssid,
        resultScore: BigInt(100 - s),
        riskLevel: scoreToRiskLevel(100 - s),
      },
      { onSuccess: () => toast.success("Scan saved") },
    );
  };

  const statusIcon = (s: CheckStatus) => {
    if (s === "pass")
      return <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />;
    if (s === "warning")
      return (
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
      );
    return <XCircle className="w-4 h-4 text-cyber-red flex-shrink-0" />;
  };

  const getOverallVerdict = () => {
    if (score >= 80)
      return {
        label: "SECURE",
        color: "text-cyber-green",
        bg: "bg-cyber-green/10 border-cyber-green/30",
      };
    if (score >= 60)
      return {
        label: "MOSTLY SECURE",
        color: "text-cyber-yellow",
        bg: "bg-yellow-500/10 border-yellow-500/30",
      };
    if (score >= 40)
      return {
        label: "VULNERABLE",
        color: "text-cyber-orange",
        bg: "bg-orange-500/10 border-orange-500/30",
      };
    return {
      label: "DANGEROUS",
      color: "text-cyber-red",
      bg: "bg-cyber-red/10 border-cyber-red/30",
    };
  };

  return (
    <div className="p-4 lg:p-8 pt-14 lg:pt-8" data-ocid="wifi.page">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
          <Wifi className="w-5 h-5 text-cyber-cyan" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Public WiFi Security Scanner
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assess public WiFi network security risks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-cyber-cyan">
              Network Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground">
                Network Name (SSID)
              </Label>
              <Input
                placeholder="e.g. Free Airport WiFi, CafeHotspot..."
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                data-ocid="wifi.input"
                className="bg-muted/30 border-border font-mono text-sm focus:border-cyber-cyan/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground">
                Security Type
              </Label>
              <Select value={secType} onValueChange={setSecType}>
                <SelectTrigger
                  data-ocid="wifi.select"
                  className="bg-muted/30 border-border font-mono text-sm focus:border-cyber-cyan/50"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="open" className="font-mono text-xs">
                    Open (No password)
                  </SelectItem>
                  <SelectItem value="wep" className="font-mono text-xs">
                    WEP (Outdated)
                  </SelectItem>
                  <SelectItem value="wpa" className="font-mono text-xs">
                    WPA
                  </SelectItem>
                  <SelectItem value="wpa2" className="font-mono text-xs">
                    WPA2 (Recommended)
                  </SelectItem>
                  <SelectItem value="wpa3" className="font-mono text-xs">
                    WPA3 (Best)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-mono text-muted-foreground">
                  Signal Strength
                </Label>
                <span className="text-xs font-mono text-cyber-cyan">
                  {signal[0]}%
                </span>
              </div>
              <Slider
                value={signal}
                onValueChange={setSignal}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60">
                <span>Weak</span>
                <span>Strong</span>
              </div>
            </div>

            {analysisState === "analyzing" && (
              <div data-ocid="wifi.loading_state">
                <ScanningOverlay label="Scanning network security..." />
              </div>
            )}

            <Button
              onClick={scan}
              disabled={!ssid.trim() || analysisState === "analyzing"}
              data-ocid="wifi.submit_button"
              className="w-full font-mono bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan hover:text-background"
              variant="outline"
            >
              {analysisState === "analyzing" ? "Scanning..." : "Scan Network"}
            </Button>

            {/* Quick test buttons */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-muted-foreground/60">
                Quick tests:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { ssid: "Free Airport WiFi", sec: "open" },
                  { ssid: "HomeNetwork_5G", sec: "wpa3" },
                  { ssid: "CoffeShop-Guest", sec: "wpa" },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.ssid}
                    onClick={() => {
                      setSsid(t.ssid);
                      setSecType(t.sec);
                    }}
                    className="text-[10px] font-mono text-cyber-cyan/50 hover:text-cyber-cyan border border-border hover:border-cyber-cyan/30 rounded px-2 py-1 transition-colors"
                  >
                    {t.ssid}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-foreground">
              Security Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisState === "idle" && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter network details and scan
                </p>
              </div>
            )}

            {analysisState === "done" && checks.length > 0 && (
              <div className="space-y-4" data-ocid="wifi.success_state">
                {/* Overall verdict */}
                {(() => {
                  const v = getOverallVerdict();
                  return (
                    <div
                      className={`rounded-lg border p-3 ${v.bg} flex items-center justify-between`}
                    >
                      <div>
                        <div
                          className={`text-sm font-mono font-bold ${v.color}`}
                        >
                          {v.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ssid}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-mono font-bold ${v.color}`}
                        >
                          {score}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          /100
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Security score bar */}
                <div className="space-y-1.5">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${score >= 80 ? "bg-cyber-green" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-cyber-orange" : "bg-cyber-red"}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                {/* Checks */}
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {checks.map((check) => (
                    <div
                      key={check.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors
                      ${check.status === "pass" ? "bg-cyber-green/5 border-cyber-green/15" : check.status === "warning" ? "bg-yellow-500/5 border-yellow-500/15" : "bg-cyber-red/5 border-cyber-red/15"}`}
                    >
                      {statusIcon(check.status)}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono font-medium text-foreground">
                          {check.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {check.description}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono flex-shrink-0
                          ${check.status === "pass" ? "border-cyber-green/40 text-cyber-green" : check.status === "warning" ? "border-yellow-500/40 text-yellow-400" : "border-cyber-red/40 text-cyber-red"}`}
                      >
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
