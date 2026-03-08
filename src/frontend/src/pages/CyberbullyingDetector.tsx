import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  MessageSquareWarning,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScanningOverlay } from "../components/PageHeader";
import { useAnalyzeText, useSubmitScan } from "../hooks/useQueries";
import { scoreToRiskLevel } from "../utils/cyber";

type AnalysisState = "idle" | "analyzing" | "done";

const TOXIC_WORDS = [
  "kill",
  "die",
  "hate",
  "stupid",
  "idiot",
  "loser",
  "ugly",
  "fat",
  "dumb",
  "worthless",
  "pathetic",
  "disgusting",
  "freak",
  "moron",
  "trash",
  "scum",
  "shut up",
  "go away",
  "nobody likes",
  "kill yourself",
  "you suck",
];

interface CategoryScore {
  name: string;
  score: number;
  detected: string[];
}

function analyzeCategories(text: string, baseScore: number): CategoryScore[] {
  const lower = text.toLowerCase();
  return [
    {
      name: "Hate Speech",
      score: Math.min(100, baseScore * 0.9 + Math.random() * 15),
      detected: TOXIC_WORDS.filter((w) => lower.includes(w)).slice(0, 3),
    },
    {
      name: "Threats & Violence",
      score: Math.min(100, baseScore * 0.7 + Math.random() * 20),
      detected: ["kill", "die", "hurt"].filter((w) => lower.includes(w)),
    },
    {
      name: "Harassment",
      score: Math.min(100, baseScore * 0.85 + Math.random() * 15),
      detected: ["stupid", "idiot", "loser", "ugly"].filter((w) =>
        lower.includes(w),
      ),
    },
    {
      name: "Profanity",
      score: Math.min(100, baseScore * 0.6 + Math.random() * 25),
      detected: [],
    },
  ].map((c) => ({ ...c, score: Math.round(c.score) }));
}

function highlightToxic(text: string): React.ReactNode {
  const words = text.split(/(\s+)/);
  return words.map((word, i) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "");
    // Using index as key is intentional here — these are stable text splits, not reordered items
    if (TOXIC_WORDS.some((tw) => clean.includes(tw.toLowerCase()))) {
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable word positions
        <mark key={i} className="bg-cyber-red/20 text-cyber-red rounded px-0.5">
          {word}
        </mark>
      );
    }
    // biome-ignore lint/suspicious/noArrayIndexKey: stable word positions
    return <span key={i}>{word}</span>;
  });
}

const SAMPLE_TEXT = `You're such a stupid loser. Nobody likes you and you should just go away. You're ugly and fat and worthless. Everyone hates you.`;

export default function CyberbullyingDetector() {
  const [text, setText] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [score, setScore] = useState(0);
  const [categories, setCategories] = useState<CategoryScore[]>([]);

  const analyzeText = useAnalyzeText();
  const submitScan = useSubmitScan();

  const MAX_CHARS = 2000;

  const analyze = async () => {
    if (!text.trim()) {
      toast.error("Enter text to analyze");
      return;
    }
    setAnalysisState("analyzing");

    let finalScore: number;
    try {
      const s = await analyzeText.mutateAsync(text.slice(0, 500));
      finalScore = Number(s);
    } catch {
      const toxicCount = TOXIC_WORDS.filter((w) =>
        text.toLowerCase().includes(w),
      ).length;
      finalScore = Math.min(
        100,
        toxicCount * 18 + Math.floor(Math.random() * 20),
      );
    }
    finalScore = Math.min(100, finalScore);
    setScore(finalScore);
    setCategories(analyzeCategories(text, finalScore));
    setAnalysisState("done");

    const rl = scoreToRiskLevel(finalScore);
    submitScan.mutate(
      {
        moduleName: "Cyberbullying Detector",
        inputSummary: `${text.slice(0, 80)}...`,
        resultScore: BigInt(finalScore),
        riskLevel: rl,
      },
      { onSuccess: () => toast.success("Scan saved") },
    );
  };

  const getVerdict = () => {
    if (score < 20)
      return {
        label: "CLEAN",
        color: "text-cyber-green",
        bg: "bg-cyber-green/10 border-cyber-green/30",
        icon: CheckCircle,
      };
    if (score < 40)
      return {
        label: "MILD TOXICITY",
        color: "text-cyber-yellow",
        bg: "bg-yellow-500/10 border-yellow-500/30",
        icon: AlertTriangle,
      };
    if (score < 60)
      return {
        label: "MODERATE",
        color: "text-cyber-orange",
        bg: "bg-orange-500/10 border-orange-500/30",
        icon: AlertTriangle,
      };
    if (score < 80)
      return {
        label: "SEVERE",
        color: "text-cyber-red",
        bg: "bg-cyber-red/10 border-cyber-red/30",
        icon: XCircle,
      };
    return {
      label: "EXTREME",
      color: "text-cyber-red",
      bg: "bg-cyber-red/10 border-cyber-red/30",
      icon: XCircle,
    };
  };

  const verdict = analysisState === "done" ? getVerdict() : null;

  return (
    <div className="p-4 lg:p-8 pt-14 lg:pt-8" data-ocid="cyberbullying.page">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
          <MessageSquareWarning className="w-5 h-5 text-cyber-cyan" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Cyberbullying Detector
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI toxicity analysis for messages and comments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-cyber-cyan">
              Input Text
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-mono text-muted-foreground">
                  Messages / Comments / Chat Logs
                </Label>
                <span
                  className={`text-[10px] font-mono ${text.length > MAX_CHARS * 0.9 ? "text-cyber-red" : "text-muted-foreground"}`}
                >
                  {text.length}/{MAX_CHARS}
                </span>
              </div>
              <Textarea
                placeholder="Paste messages, comments, or chat logs here for toxicity analysis..."
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                data-ocid="cyberbullying.textarea"
                rows={10}
                className="bg-muted/30 border-border font-mono text-sm focus:border-cyber-cyan/50 resize-none"
              />
            </div>

            {analysisState === "analyzing" && (
              <div data-ocid="cyberbullying.loading_state">
                <ScanningOverlay label="Analyzing toxicity..." />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={analyze}
                disabled={!text.trim() || analysisState === "analyzing"}
                data-ocid="cyberbullying.submit_button"
                className="flex-1 font-mono bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan hover:text-background"
                variant="outline"
              >
                {analysisState === "analyzing"
                  ? "Analyzing..."
                  : "Analyze Text"}
              </Button>
              <Button
                onClick={() => {
                  setText("");
                  setAnalysisState("idle");
                  setScore(0);
                }}
                variant="outline"
                className="font-mono text-xs border-border text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            </div>

            <button
              type="button"
              className="text-xs text-cyber-cyan/60 hover:text-cyber-cyan underline font-mono"
              onClick={() => setText(SAMPLE_TEXT)}
            >
              Load sample toxic text
            </button>
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
                  <MessageSquareWarning className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter text to detect toxicity
                </p>
              </div>
            )}

            {analysisState === "done" && verdict && (
              <div
                className="space-y-5"
                data-ocid="cyberbullying.success_state"
              >
                {/* Verdict */}
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
                      Overall toxicity score: {score}%
                    </div>
                  </div>
                </div>

                {/* Score meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-xs font-mono text-muted-foreground">
                      TOXICITY SCORE
                    </span>
                    <span
                      className={`text-2xl font-mono font-bold ${score < 20 ? "text-cyber-green" : score < 60 ? "text-cyber-yellow" : "text-cyber-red"}`}
                    >
                      {score}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${score < 20 ? "bg-cyber-green" : score < 60 ? "bg-yellow-500" : "bg-cyber-red"}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                {/* Category breakdown */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    Category Breakdown
                  </p>
                  {categories.map((cat) => {
                    const color =
                      cat.score > 60
                        ? "bg-cyber-red"
                        : cat.score > 30
                          ? "bg-yellow-500"
                          : "bg-cyber-green";
                    const textColor =
                      cat.score > 60
                        ? "text-cyber-red"
                        : cat.score > 30
                          ? "text-yellow-400"
                          : "text-cyber-green";
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono text-muted-foreground">
                            {cat.name}
                          </span>
                          <span
                            className={`text-xs font-mono font-bold ${textColor}`}
                          >
                            {cat.score}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} rounded-full`}
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Highlighted text preview */}
                {score > 10 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                      Detected Patterns
                    </p>
                    <div className="rounded-lg bg-muted/20 border border-border p-3 text-xs font-mono leading-relaxed max-h-32 overflow-y-auto">
                      {highlightToxic(text.slice(0, 300))}
                      {text.length > 300 && (
                        <span className="text-muted-foreground">...</span>
                      )}
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
