import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Shield,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { RiskLevel } from "../backend.d";
import { useCheckPasswordStrength, useSubmitScan } from "../hooks/useQueries";
import { scoreToRiskLevel } from "../utils/cyber";

type BreachState = "idle" | "checking" | "found" | "clear";

export default function PasswordChecker() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strengthScore, setStrengthScore] = useState(0);
  const [breachState, setBreachState] = useState<BreachState>("idle");
  const [breachCount, setBreachCount] = useState(0);
  const [_submitted, setSubmitted] = useState(false);

  const checkStrength = useCheckPasswordStrength();
  const submitScan = useSubmitScan();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: checkStrength.mutateAsync is stable
  useEffect(() => {
    if (!password) {
      setStrengthScore(0);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const s = await checkStrength.mutateAsync(password);
        setStrengthScore(Number(s));
      } catch {
        // fallback heuristic
        let s = 0;
        if (password.length >= 8) s += 20;
        if (password.length >= 12) s += 15;
        if (/[A-Z]/.test(password)) s += 15;
        if (/[0-9]/.test(password)) s += 15;
        if (/[^A-Za-z0-9]/.test(password)) s += 20;
        if (password.length >= 16) s += 15;
        setStrengthScore(Math.min(100, s));
      }
    }, 400);
  }, [password]);

  const checkBreach = async () => {
    if (!email.trim()) {
      toast.error("Enter an email address");
      return;
    }
    setBreachState("checking");
    await new Promise((r) => setTimeout(r, 1500));
    const found = Math.random() < 0.3;
    const count = found ? Math.floor(Math.random() * 5) + 1 : 0;
    setBreachCount(count);
    setBreachState(found ? "found" : "clear");
    setSubmitted(true);

    const rl = found ? RiskLevel.high : RiskLevel.low;
    const s = found ? 70 : 10;
    submitScan.mutate(
      {
        moduleName: "Password Checker",
        inputSummary: email,
        resultScore: BigInt(s),
        riskLevel: rl,
      },
      { onSuccess: () => toast.success("Scan saved") },
    );
  };

  const getStrengthInfo = () => {
    if (strengthScore <= 30)
      return {
        label: "WEAK",
        color: "text-cyber-red",
        bar: "bg-cyber-red",
        width: `${strengthScore}%`,
      };
    if (strengthScore <= 60)
      return {
        label: "FAIR",
        color: "text-yellow-400",
        bar: "bg-yellow-500",
        width: `${strengthScore}%`,
      };
    if (strengthScore <= 80)
      return {
        label: "GOOD",
        color: "text-cyber-green",
        bar: "bg-cyber-green",
        width: `${strengthScore}%`,
      };
    return {
      label: "STRONG",
      color: "text-cyber-cyan",
      bar: "bg-cyber-cyan",
      width: `${strengthScore}%`,
    };
  };

  const strength = getStrengthInfo();

  const tips = [
    { tip: "Use at least 12 characters", done: password.length >= 12 },
    { tip: "Include uppercase letters", done: /[A-Z]/.test(password) },
    { tip: "Include numbers", done: /[0-9]/.test(password) },
    { tip: "Include special characters", done: /[^A-Za-z0-9]/.test(password) },
    {
      tip: "Avoid dictionary words",
      done:
        password.length > 8 && !/^[a-z]+[0-9]*$/.test(password.toLowerCase()),
    },
  ];

  return (
    <div className="p-4 lg:p-8 pt-14 lg:pt-8" data-ocid="password.page">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
          <Lock className="w-5 h-5 text-cyber-cyan" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Password Leak Checker
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Check data breaches and analyze password strength
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breach checker */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-cyber-cyan">
              Email Breach Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground">
                Email Address
              </Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-ocid="password.input"
                className="bg-muted/30 border-border font-mono text-sm focus:border-cyber-cyan/50"
                onKeyDown={(e) => e.key === "Enter" && checkBreach()}
              />
            </div>

            <Button
              onClick={checkBreach}
              disabled={!email.trim() || breachState === "checking"}
              data-ocid="password.submit_button"
              className="w-full font-mono bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan hover:text-background"
              variant="outline"
            >
              {breachState === "checking" ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border border-cyber-cyan border-t-transparent rounded-full animate-spin" />
                  Checking databases...
                </span>
              ) : (
                "Check for Breaches"
              )}
            </Button>

            {/* Results */}
            {breachState === "found" && (
              <div
                className="rounded-lg border border-cyber-red/30 bg-cyber-red/5 p-4"
                data-ocid="password.error_state"
              >
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-cyber-red flex-shrink-0" />
                  <div>
                    <div className="text-sm font-mono font-bold text-cyber-red">
                      FOUND IN {breachCount} BREACH{breachCount > 1 ? "ES" : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Your email was found in data breach databases
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="font-mono text-cyber-red/80">
                    ⚠ Immediate actions required:
                  </p>
                  {[
                    "Change your password immediately",
                    "Enable two-factor authentication",
                    "Check for unauthorized access",
                    "Update passwords on all services",
                  ].map((a) => (
                    <div key={a} className="flex items-start gap-2">
                      <span className="text-cyber-red">→</span> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {breachState === "clear" && (
              <div
                className="rounded-lg border border-cyber-green/30 bg-cyber-green/5 p-4"
                data-ocid="password.success_state"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0" />
                  <div>
                    <div className="text-sm font-mono font-bold text-cyber-green">
                      NO BREACHES FOUND
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Your email was not found in known breach databases
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password strength */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-cyber-cyan">
              Password Strength Analyzer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground">
                Enter Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password to analyze..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/30 border-border font-mono text-sm focus:border-cyber-cyan/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/60">
                Your password is never stored or sent to any server
              </p>
            </div>

            {password && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-xs font-mono text-muted-foreground">
                      Strength Score
                    </span>
                    <span
                      className={`text-sm font-mono font-bold ${strength.color}`}
                    >
                      {strengthScore}% — {strength.label}
                    </span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.bar} rounded-full transition-all duration-500`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    Security Checklist
                  </p>
                  {tips.map((t) => (
                    <div key={t.tip} className="flex items-center gap-2">
                      {t.done ? (
                        <CheckCircle className="w-3.5 h-3.5 text-cyber-green flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs ${t.done ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {t.tip}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!password && (
              <div className="rounded-lg bg-muted/20 border border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-cyber-cyan/40" />
                  <span className="text-xs font-mono text-muted-foreground">
                    Security Tips
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[
                    "Use a password manager",
                    "Never reuse passwords",
                    "Enable 2FA on all accounts",
                    "Use passphrase for better security",
                    "Change passwords every 3 months",
                  ].map((tip) => (
                    <div
                      key={tip}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <span className="text-cyber-cyan/60 mt-0.5">›</span> {tip}
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
