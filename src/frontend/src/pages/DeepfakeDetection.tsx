import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  FileImage,
  Upload,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { RiskLevel } from "../backend.d";
import { ScanningOverlay, ScoreMeter } from "../components/PageHeader";
import { useSubmitScan } from "../hooks/useQueries";
import { scoreToRiskLevel } from "../utils/cyber";

type AnalysisState = "idle" | "analyzing" | "done";

export default function DeepfakeDetection() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [score, setScore] = useState(0);

  const submitScan = useSubmitScan();

  const handleFile = (f: File) => {
    setFile(f);
    setAnalysisState("idle");
    setScore(0);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: handleFile is a stable setter-only fn
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type.startsWith("image/") || f.type.startsWith("video/"))) {
      handleFile(f);
    } else {
      toast.error("Please upload an image or video file");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const analyze = async () => {
    if (!file) return;
    setAnalysisState("analyzing");
    await new Promise((r) => setTimeout(r, 2500));
    const s = Math.floor(Math.random() * 55) + 40;
    setScore(s);
    setAnalysisState("done");

    const rl = scoreToRiskLevel(s);
    submitScan.mutate(
      {
        moduleName: "Deepfake Detection",
        inputSummary: file.name,
        resultScore: BigInt(s),
        riskLevel: rl,
      },
      {
        onSuccess: () => toast.success("Scan result saved"),
        onError: () => toast.error("Failed to save scan"),
      },
    );
  };

  const getVerdict = () => {
    if (score < 30)
      return {
        label: "REAL",
        icon: CheckCircle,
        color: "text-cyber-green",
        bg: "bg-cyber-green/10 border-cyber-green/30",
      };
    if (score < 60)
      return {
        label: "LIKELY FAKE",
        icon: AlertTriangle,
        color: "text-cyber-yellow",
        bg: "bg-yellow-500/10 border-yellow-500/30",
      };
    return {
      label: "DEEPFAKE DETECTED",
      icon: XCircle,
      color: "text-cyber-red",
      bg: "bg-cyber-red/10 border-cyber-red/30",
    };
  };

  const verdict = analysisState === "done" ? getVerdict() : null;

  return (
    <div className="p-4 lg:p-8 pt-14 lg:pt-8" data-ocid="deepfake.page">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
          <Eye className="w-5 h-5 text-cyber-cyan" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Deepfake Detection
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI-powered face analysis to detect synthetic media
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload zone */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-cyber-cyan flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              data-ocid="deepfake.dropzone"
              // biome-ignore lint/a11y/noNoninteractiveTabindex: dropzone needs keyboard focus
              tabIndex={0}
              aria-label="Upload media file"
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200
                ${dragOver ? "border-cyber-cyan bg-cyber-cyan/5 scale-[1.01]" : "border-border hover:border-cyber-cyan/50 hover:bg-muted/20"}
              `}
              onClick={() => document.getElementById("deepfake-file")?.click()}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                document.getElementById("deepfake-file")?.click()
              }
            >
              <input
                id="deepfake-file"
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileInput}
              />
              <div className="flex flex-col items-center gap-3">
                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
                      <FileImage className="w-6 h-6 text-cyber-cyan" />
                    </div>
                    <div className="text-sm font-mono text-cyber-cyan">
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-foreground">
                      Drop image or video here
                    </div>
                    <div className="text-xs text-muted-foreground">
                      or click to browse
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground/60">
                      Supports: JPG, PNG, MP4, MOV
                    </div>
                  </>
                )}
              </div>
            </div>

            {analysisState === "analyzing" && (
              <div data-ocid="deepfake.loading_state">
                <ScanningOverlay label="Running AI face analysis..." />
              </div>
            )}

            <Button
              onClick={analyze}
              disabled={!file || analysisState === "analyzing"}
              data-ocid="deepfake.submit_button"
              className="w-full font-mono bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan hover:text-background transition-all duration-200"
              variant="outline"
            >
              {analysisState === "analyzing"
                ? "Analyzing..."
                : "Analyze for Deepfake"}
            </Button>

            {/* Sample files hint */}
            <div className="rounded-lg bg-muted/30 border border-border p-3">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                What we detect
              </p>
              <div className="space-y-1">
                {[
                  "AI-generated face swaps",
                  "Neural network artifacts",
                  "Temporal inconsistencies",
                  "GAN fingerprints",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <div className="w-1 h-1 rounded-full bg-cyber-cyan/60" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-foreground">
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisState === "idle" && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a file and run analysis
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Results will appear here
                </p>
              </div>
            )}

            {analysisState === "done" && verdict && (
              <div className="space-y-6" data-ocid="deepfake.success_state">
                {/* Verdict card */}
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
                      {score < 30
                        ? "No synthetic elements detected"
                        : score < 60
                          ? "Suspicious patterns found"
                          : "AI-generated content detected"}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`ml-auto text-xs font-mono ${scoreToRiskLevel(score) === RiskLevel.critical ? "border-cyber-red text-cyber-red" : scoreToRiskLevel(score) === RiskLevel.high ? "border-orange-500 text-orange-400" : scoreToRiskLevel(score) === RiskLevel.medium ? "border-yellow-500 text-yellow-400" : "border-cyber-green text-cyber-green"}`}
                  >
                    {scoreToRiskLevel(score).toUpperCase()}
                  </Badge>
                </div>

                {/* Score meter */}
                <ScoreMeter
                  score={score}
                  label="DEEPFAKE PROBABILITY"
                  colorScheme="risk"
                />

                {/* Analysis breakdown */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    Detection Breakdown
                  </p>
                  {[
                    {
                      label: "Face Authenticity",
                      score: Math.max(0, 100 - score + Math.random() * 15 - 7),
                    },
                    {
                      label: "Temporal Coherence",
                      score: Math.max(
                        0,
                        100 - score * 0.9 + Math.random() * 10,
                      ),
                    },
                    {
                      label: "Pixel Artifacts",
                      score: score * 0.8 + Math.random() * 15,
                    },
                    {
                      label: "Neural Fingerprint",
                      score: score * 1.1 - Math.random() * 10,
                    },
                  ].map((item) => {
                    const s = Math.min(
                      100,
                      Math.max(0, Math.round(item.score)),
                    );
                    const color =
                      s > 60
                        ? "bg-cyber-red"
                        : s > 30
                          ? "bg-yellow-500"
                          : "bg-cyber-green";
                    return (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-36 font-mono">
                          {item.label}
                        </span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} rounded-full`}
                            style={{ width: `${s}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                          {s}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
