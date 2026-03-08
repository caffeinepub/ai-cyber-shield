import { RiskLevel } from "../backend.d";

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 30) return RiskLevel.low;
  if (score <= 60) return RiskLevel.medium;
  if (score <= 80) return RiskLevel.high;
  return RiskLevel.critical;
}

export function riskLevelColor(level: RiskLevel | string): string {
  switch (level) {
    case RiskLevel.low:
    case "low":
      return "text-cyber-green";
    case RiskLevel.medium:
    case "medium":
      return "text-cyber-yellow";
    case RiskLevel.high:
    case "high":
      return "text-cyber-orange";
    case RiskLevel.critical:
    case "critical":
      return "text-cyber-red";
    default:
      return "text-muted-foreground";
  }
}

export function riskLevelBadgeClass(level: RiskLevel | string): string {
  switch (level) {
    case RiskLevel.low:
    case "low":
      return "border-cyber-green text-cyber-green bg-cyber-green/10";
    case RiskLevel.medium:
    case "medium":
      return "border-yellow-500 text-yellow-400 bg-yellow-500/10";
    case RiskLevel.high:
    case "high":
      return "border-orange-500 text-orange-400 bg-orange-500/10";
    case RiskLevel.critical:
    case "critical":
      return "border-cyber-red text-cyber-red bg-cyber-red/10";
    default:
      return "border-border text-muted-foreground";
  }
}

export function severityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical":
      return "text-cyber-red";
    case "high":
      return "text-cyber-orange";
    case "medium":
      return "text-cyber-yellow";
    case "low":
      return "text-cyber-green";
    default:
      return "text-muted-foreground";
  }
}

export function severityBadgeClass(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical":
      return "border-cyber-red text-cyber-red bg-cyber-red/10";
    case "high":
      return "border-orange-500 text-orange-400 bg-orange-500/10";
    case "medium":
      return "border-yellow-500 text-yellow-400 bg-yellow-500/10";
    case "low":
      return "border-cyber-green text-cyber-green bg-cyber-green/10";
    default:
      return "border-border text-muted-foreground";
  }
}

export function formatTimestamp(timestamp: bigint | number): string {
  const ms =
    typeof timestamp === "bigint" ? Number(timestamp) / 1_000_000 : timestamp;
  const date = new Date(ms);
  // If invalid date from nanoseconds already handled, try seconds
  if (Number.isNaN(date.getTime())) {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  }
  return date.toLocaleString();
}

export function simulateAnalysis(min = 40, max = 95): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const SCAN_HISTORY_SAMPLE: Array<{
  id: bigint;
  inputSummary: string;
  resultScore: bigint;
  moduleName: string;
  timestamp: bigint;
  riskLevel: RiskLevel;
}> = [
  {
    id: 1n,
    inputSummary: "video_interview.mp4",
    resultScore: 78n,
    moduleName: "Deepfake Detection",
    timestamp: BigInt(Date.now() - 3600000) * 1_000_000n,
    riskLevel: RiskLevel.high,
  },
  {
    id: 2n,
    inputSummary: "job@techinternship.xyz",
    resultScore: 91n,
    moduleName: "Fake Job Detector",
    timestamp: BigInt(Date.now() - 7200000) * 1_000_000n,
    riskLevel: RiskLevel.critical,
  },
  {
    id: 3n,
    inputSummary: "user@gmail.com",
    resultScore: 20n,
    moduleName: "Password Checker",
    timestamp: BigInt(Date.now() - 14400000) * 1_000_000n,
    riskLevel: RiskLevel.low,
  },
  {
    id: 4n,
    inputSummary: "upi://pay?pa=fraud@paytm&am=5000",
    resultScore: 95n,
    moduleName: "QR Code Scanner",
    timestamp: BigInt(Date.now() - 28800000) * 1_000_000n,
    riskLevel: RiskLevel.critical,
  },
  {
    id: 5n,
    inputSummary: "Free WiFi - Airport",
    resultScore: 62n,
    moduleName: "WiFi Scanner",
    timestamp: BigInt(Date.now() - 86400000) * 1_000_000n,
    riskLevel: RiskLevel.medium,
  },
];

export const THREAT_FEED_SAMPLE: Array<{
  id: bigint;
  description: string;
  threatType: string;
  timestamp: bigint;
  severity: string;
  location: string;
}> = [
  {
    id: 1n,
    description: "Mass phishing campaign targeting Indian banking customers",
    threatType: "Phishing",
    timestamp: BigInt(Date.now() - 900000) * 1_000_000n,
    severity: "critical",
    location: "Mumbai",
  },
  {
    id: 2n,
    description: "Deepfake CEO fraud targeting mid-size enterprises",
    threatType: "Deepfake Scam",
    timestamp: BigInt(Date.now() - 1800000) * 1_000_000n,
    severity: "high",
    location: "Bangalore",
  },
  {
    id: 3n,
    description: "Fake internship offers circulating on LinkedIn",
    threatType: "Job Scam",
    timestamp: BigInt(Date.now() - 3600000) * 1_000_000n,
    severity: "medium",
    location: "Delhi",
  },
  {
    id: 4n,
    description: "Malicious QR codes placed at public payment terminals",
    threatType: "QR Fraud",
    timestamp: BigInt(Date.now() - 7200000) * 1_000_000n,
    severity: "high",
    location: "Chennai",
  },
  {
    id: 5n,
    description: "Rogue WiFi hotspots detected near IT corridors",
    threatType: "WiFi Attack",
    timestamp: BigInt(Date.now() - 10800000) * 1_000_000n,
    severity: "medium",
    location: "Hyderabad",
  },
  {
    id: 6n,
    description: "Data breach exposing 2.3M records from fintech startup",
    threatType: "Data Breach",
    timestamp: BigInt(Date.now() - 21600000) * 1_000_000n,
    severity: "critical",
    location: "Pune",
  },
];
