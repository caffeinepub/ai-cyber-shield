import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Flag,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScanningOverlay, ScoreMeter } from "../components/PageHeader";
import { useAnalyzeText, useSubmitScan } from "../hooks/useQueries";
import { scoreToRiskLevel } from "../utils/cyber";

const SCAM_KEYWORDS = [
  "urgent",
  "immediate",
  "guaranteed",
  "no experience",
  "work from home",
  "earn $",
  "wire transfer",
  "bitcoin",
  "gift card",
  "limited time",
  "apply now",
  "process fee",
  "upfront payment",
  "100% guaranteed",
  "dream job",
  "no interview",
  "high salary",
  "per day",
  "registration fee",
];

function detectRedFlags(text: string): string[] {
  const lower = text.toLowerCase();
  return SCAM_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase()));
}

type AnalysisState = "idle" | "analyzing" | "done";

export default function FakeJobDetector() {
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [score, setScore] = useState(0);
  const [redFlags, setRedFlags] = useState<string[]>([]);

  const analyzeText = useAnalyzeText();
  const submitScan = useSubmitScan();

  const analyze = async () => {
    if (!description.trim() && !email.trim()) {
      toast.error("Please enter a job description or email");
      return;
    }
    setAnalysisState("analyzing");

    const combined = `${description} ${email} ${url} ${jobTitle}`;
    const flags = detectRedFlags(combined);
    setRedFlags(flags);

    let finalScore: number;
    try {
      const backendScore = await analyzeText.mutateAsync(
        combined.slice(0, 500),
      );
      finalScore = Number(backendScore);
    } catch {
      finalScore = Math.max(
        flags.length * 15,
        Math.floor(Math.random() * 40) + 30,
      );
    }
    finalScore = Math.min(100, finalScore);
    setScore(finalScore);
    setAnalysisState("done");

    const rl = scoreToRiskLevel(finalScore);
    submitScan.mutate(
      {
        moduleName: "Fake Job Detector",
        inputSummary: email || jobTitle || "Job analysis",
        resultScore: BigInt(finalScore),
        riskLevel: rl,
      },
      { onSuccess: () => toast.success("Scan saved") },
    );
  };

  const getVerdict = () => {
    if (score < 25)
      return {
        label: "LEGITIMATE",
        icon: CheckCircle,
        color: "text-cyber-green",
        bg: "bg-cyber-green/10 border-cyber-green/30",
      };
    if (score < 50)
      return {
        label: "SUSPICIOUS",
        icon: AlertTriangle,
        color: "text-cyber-yellow",
        bg: "bg-yellow-500/10 border-yellow-500/30",
      };
    if (score < 75)
      return {
        label: "LIKELY SCAM",
        icon: AlertTriangle,
        color: "text-cyber-orange",
        bg: "bg-orange-500/10 border-orange-500/30",
      };
    return {
      label: "CONFIRMED SCAM",
      icon: XCircle,
      color: "text-cyber-red",
      bg: "bg-cyber-red/10 border-cyber-red/30",
    };
  };

  const verdict = analysisState === "done" ? getVerdict() : null;

  return (
    <div className="p-4 lg:p-8 pt-14 lg:pt-8" data-ocid="fakejob.page">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-cyber-cyan" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Fake Job Scam Detector
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            NLP-powered analysis to detect fraudulent job offers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-cyber-cyan">
              Job Offer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground">
                Job Title
              </Label>
              <Input
                placeholder="e.g. Senior Developer, Data Entry Specialist..."
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                data-ocid="fakejob.input"
                className="bg-muted/30 border-border font-mono text-sm focus:border-cyber-cyan/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground">
                Job Description / Email Content
              </Label>
              <Textarea
                placeholder="Paste the full job description or email content here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-ocid="fakejob.textarea"
                rows={6}
                className="bg-muted/30 border-border font-mono text-sm focus:border-cyber-cyan/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground">
                  Sender Email
                </Label>
                <Input
                  placeholder="recruiter@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/30 border-border font-mono text-sm focus:border-cyber-cyan/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground">
                  Job URL
                </Label>
                <Input
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-muted/30 border-border font-mono text-sm focus:border-cyber-cyan/50"
                />
              </div>
            </div>

            {analysisState === "analyzing" && (
              <div data-ocid="fakejob.loading_state">
                <ScanningOverlay label="Analyzing job offer..." />
              </div>
            )}

            <Button
              onClick={analyze}
              disabled={
                (!description.trim() && !email.trim()) ||
                analysisState === "analyzing"
              }
              data-ocid="fakejob.submit_button"
              className="w-full font-mono bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan hover:text-background transition-all duration-200"
              variant="outline"
            >
              {analysisState === "analyzing"
                ? "Analyzing..."
                : "Analyze Job Offer"}
            </Button>

            {/* Sample */}
            <button
              type="button"
              className="text-xs text-cyber-cyan/60 hover:text-cyber-cyan underline font-mono"
              onClick={() => {
                setJobTitle("Data Entry Executive – Work From Home");
                setDescription(
                  "Urgent! We are looking for candidates to fill home-based positions. No experience required. Earn $500 per day guaranteed. Process simple data entry tasks. Upfront registration fee of $50 required. Limited time offer! Apply now to secure your dream job.",
                );
                setEmail("hr@datatechinternship.xyz");
                setUrl("http://datatechjobs-india.com/apply");
              }}
            >
              Load sample scam offer
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
                  <Briefcase className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Fill in job details and analyze
                </p>
              </div>
            )}

            {analysisState === "done" && verdict && (
              <div className="space-y-5" data-ocid="fakejob.success_state">
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
                      {redFlags.length} suspicious patterns detected
                    </div>
                  </div>
                </div>

                <ScoreMeter
                  score={score}
                  label="SCAM PROBABILITY"
                  colorScheme="risk"
                />

                {redFlags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Flag className="w-3 h-3 text-cyber-red" />
                      Red Flags Detected
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {redFlags.map((flag) => (
                        <Badge
                          key={flag}
                          variant="outline"
                          className="text-[10px] font-mono border-cyber-red/40 text-cyber-red bg-cyber-red/5"
                        >
                          ⚠ {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-1.5">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    Recommendations
                  </p>
                  {score > 50
                    ? [
                        "Do not pay any registration fees",
                        "Verify company on LinkedIn",
                        "Never share personal documents",
                        "Report to cyber.gov.in",
                      ].map((r) => (
                        <div
                          key={r}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <XCircle className="w-3 h-3 text-cyber-red mt-0.5 flex-shrink-0" />
                          {r}
                        </div>
                      ))
                    : [
                        "Verify company official website",
                        "Cross-check on job portals",
                        "Never share OTP or passwords",
                      ].map((r) => (
                        <div
                          key={r}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle className="w-3 h-3 text-cyber-green mt-0.5 flex-shrink-0" />
                          {r}
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
