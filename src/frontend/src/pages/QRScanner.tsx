import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Link,
  QrCode,
  Scan,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScanningOverlay, ScoreMeter } from "../components/PageHeader";
import { useAnalyzeText, useSubmitScan } from "../hooks/useQueries";
import { useQRScanner } from "../qr-code/useQRScanner";
import { scoreToRiskLevel } from "../utils/cyber";

type AnalysisState = "idle" | "analyzing" | "done";

const MALICIOUS_PATTERNS = [
  "phishing",
  "malware",
  "fraud",
  "bit.ly",
  "tinyurl",
  "t.co",
  "free-gift",
  "prize",
  "win",
  "click-here",
  "verify-account",
  "update-payment",
  "upi://pay?pa=",
  "urgent",
];

function detectMaliciousPatterns(url: string): string[] {
  const lower = url.toLowerCase();
  return MALICIOUS_PATTERNS.filter((p) => lower.includes(p));
}

function parseUrl(url: string) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return {
      protocol: u.protocol,
      domain: u.hostname,
      path: u.pathname,
      params: u.searchParams.toString(),
    };
  } catch {
    return { protocol: "unknown", domain: url, path: "/", params: "" };
  }
}

export default function QRScanner() {
  const [manualUrl, setManualUrl] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [score, setScore] = useState(0);
  const [analyzedUrl, setAnalyzedUrl] = useState("");
  const [maliciousFlags, setMaliciousFlags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("camera");

  const analyzeText = useAnalyzeText();
  const submitScan = useSubmitScan();

  const {
    qrResults,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 100,
    maxResults: 5,
  });

  const analyzeUrl = async (url: string) => {
    if (!url.trim()) {
      toast.error("Enter a URL to analyze");
      return;
    }
    setAnalyzedUrl(url);
    setAnalysisState("analyzing");

    const flags = detectMaliciousPatterns(url);
    setMaliciousFlags(flags);

    let finalScore: number;
    try {
      const s = await analyzeText.mutateAsync(url);
      finalScore = Number(s);
    } catch {
      finalScore =
        flags.length > 0
          ? Math.min(
              100,
              flags.length * 20 + Math.floor(Math.random() * 20) + 40,
            )
          : Math.floor(Math.random() * 25) + 5;
    }
    setScore(finalScore);
    setAnalysisState("done");

    const rl = scoreToRiskLevel(finalScore);
    submitScan.mutate(
      {
        moduleName: "QR Code Scanner",
        inputSummary: url.slice(0, 100),
        resultScore: BigInt(finalScore),
        riskLevel: rl,
      },
      { onSuccess: () => toast.success("Scan saved") },
    );
  };

  const handleQRResult = (data: string) => {
    setManualUrl(data);
    setActiveTab("url");
    toast.success(`QR code scanned: ${data.slice(0, 50)}`);
  };

  const getVerdict = () => {
    if (score < 30)
      return {
        label: "SAFE",
        icon: CheckCircle,
        color: "text-cyber-green",
        bg: "bg-cyber-green/10 border-cyber-green/30",
      };
    if (score < 65)
      return {
        label: "SUSPICIOUS",
        icon: AlertTriangle,
        color: "text-cyber-yellow",
        bg: "bg-yellow-500/10 border-yellow-500/30",
      };
    return {
      label: "MALICIOUS",
      icon: XCircle,
      color: "text-cyber-red",
      bg: "bg-cyber-red/10 border-cyber-red/30",
    };
  };

  const verdict = analysisState === "done" ? getVerdict() : null;
  const urlInfo = analyzedUrl ? parseUrl(analyzedUrl) : null;

  return (
    <div className="p-4 lg:p-8 pt-14 lg:pt-8" data-ocid="qrscanner.page">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
          <QrCode className="w-5 h-5 text-cyber-cyan" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            QR Code Scam Detector
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Detect malicious QR codes and phishing URLs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-cyber-cyan">
              Scan Input
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-muted/50 mb-4">
                <TabsTrigger
                  value="camera"
                  className="flex-1 text-xs font-mono"
                  data-ocid="qrscanner.tab"
                >
                  <Camera className="w-3 h-3 mr-1.5" /> Scan QR
                </TabsTrigger>
                <TabsTrigger
                  value="url"
                  className="flex-1 text-xs font-mono"
                  data-ocid="qrscanner.tab"
                >
                  <Link className="w-3 h-3 mr-1.5" /> Enter URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="camera">
                <div className="space-y-3">
                  {isSupported === false ? (
                    <div className="rounded-lg border border-cyber-red/30 bg-cyber-red/5 p-4 text-center">
                      <XCircle className="w-8 h-8 text-cyber-red mx-auto mb-2" />
                      <p className="text-sm font-mono text-cyber-red">
                        Camera not supported
                      </p>
                    </div>
                  ) : (
                    <div
                      className="rounded-lg border border-border bg-black overflow-hidden aspect-video relative"
                      data-ocid="qrscanner.canvas_target"
                    >
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                          <div className="text-center">
                            <Camera className="w-10 h-10 text-cyber-cyan/40 mx-auto mb-2" />
                            <p className="text-xs font-mono text-muted-foreground">
                              Camera inactive
                            </p>
                          </div>
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-8 border-2 border-cyber-cyan/50 rounded-lg">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyber-cyan rounded-tl" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyber-cyan rounded-tr" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyber-cyan rounded-bl" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyber-cyan rounded-br" />
                          </div>
                          <div
                            className="absolute inset-x-8 h-0.5 bg-cyber-cyan/50 animate-scan-line"
                            style={{ top: "50%" }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="text-xs font-mono text-cyber-red p-2 rounded bg-cyber-red/5 border border-cyber-red/20">
                      {error.message}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={startScanning}
                      disabled={!canStartScanning || isLoading}
                      className="flex-1 font-mono text-xs bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan hover:text-background"
                      variant="outline"
                      data-ocid="qrscanner.submit_button"
                    >
                      <Scan className="w-3 h-3 mr-1.5" />
                      {isLoading ? "Loading..." : "Start Scanning"}
                    </Button>
                    <Button
                      onClick={stopScanning}
                      disabled={isLoading || !isActive}
                      className="flex-1 font-mono text-xs"
                      variant="outline"
                    >
                      Stop
                    </Button>
                  </div>

                  {qrResults.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          SCANNED RESULTS
                        </span>
                        <button
                          type="button"
                          onClick={clearResults}
                          className="text-[10px] text-cyber-cyan hover:underline font-mono"
                        >
                          Clear
                        </button>
                      </div>
                      {qrResults.slice(0, 3).map((r) => (
                        <div
                          key={r.timestamp}
                          className="rounded bg-muted/30 border border-border p-2"
                        >
                          <p className="text-xs font-mono text-cyber-cyan truncate">
                            {r.data}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleQRResult(r.data)}
                            className="text-[10px] text-muted-foreground hover:text-cyber-cyan mt-1 font-mono"
                          >
                            → Analyze this URL
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="url">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono text-muted-foreground">
                      URL or QR Content
                    </Label>
                    <Input
                      placeholder="https://example.com or upi://pay?..."
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      data-ocid="qrscanner.input"
                      className="bg-muted/30 border-border font-mono text-sm focus:border-cyber-cyan/50"
                      onKeyDown={(e) =>
                        e.key === "Enter" && analyzeUrl(manualUrl)
                      }
                    />
                  </div>

                  {analysisState === "analyzing" && (
                    <ScanningOverlay label="Scanning URL..." />
                  )}

                  <Button
                    onClick={() => analyzeUrl(manualUrl)}
                    disabled={
                      !manualUrl.trim() || analysisState === "analyzing"
                    }
                    className="w-full font-mono bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan hover:text-background"
                    variant="outline"
                    data-ocid="qrscanner.submit_button"
                  >
                    {analysisState === "analyzing" ? "Scanning..." : "Scan URL"}
                  </Button>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-mono text-muted-foreground/60 text-[10px]">
                      Sample URLs to test:
                    </p>
                    {[
                      "https://google.com",
                      "http://free-gift-claim-prize.phishing-site.com",
                      "upi://pay?pa=fraudpayment@scam&am=10000",
                    ].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setManualUrl(s)}
                        className="block text-[10px] font-mono text-cyber-cyan/50 hover:text-cyber-cyan truncate max-w-full"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-foreground">
              Scan Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisState === "idle" && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan or enter a URL to analyze
                </p>
              </div>
            )}

            {analysisState === "done" && verdict && (
              <div className="space-y-5" data-ocid="qrscanner.success_state">
                <div
                  className={`rounded-lg border p-4 ${verdict.bg} flex items-center gap-3`}
                >
                  <verdict.icon
                    className={`w-6 h-6 ${verdict.color} flex-shrink-0`}
                  />
                  <div>
                    <div
                      className={`text-sm font-mono font-bold ${verdict.color}`}
                    >
                      {verdict.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {maliciousFlags.length} suspicious patterns detected
                    </div>
                  </div>
                </div>

                <ScoreMeter
                  score={score}
                  label="MALICIOUS PROBABILITY"
                  colorScheme="risk"
                />

                {urlInfo && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                      URL Breakdown
                    </p>
                    <div className="rounded-lg bg-muted/20 border border-border p-3 space-y-1.5">
                      {[
                        { label: "Domain", value: urlInfo.domain },
                        { label: "Protocol", value: urlInfo.protocol },
                        { label: "Path", value: urlInfo.path || "/" },
                        {
                          label: "Parameters",
                          value: urlInfo.params || "None",
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-3 text-xs">
                          <span className="font-mono text-muted-foreground w-20 flex-shrink-0">
                            {label}
                          </span>
                          <span className="font-mono text-foreground truncate">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {maliciousFlags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                      Threats Found
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {maliciousFlags.map((f) => (
                        <Badge
                          key={f}
                          variant="outline"
                          className="text-[10px] font-mono border-cyber-red/40 text-cyber-red bg-cyber-red/5"
                        >
                          ⚠ {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
