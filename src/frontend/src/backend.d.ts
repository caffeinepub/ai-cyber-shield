import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ModuleCount {
    moduleName: string;
    count: bigint;
}
export interface PlatformStats {
    totalScans: bigint;
    activeAlerts: bigint;
    threatsDetected: bigint;
}
export interface ThreatEntry {
    id: bigint;
    description: string;
    threatType: string;
    timestamp: bigint;
    severity: string;
    location: string;
}
export interface ScanRecord {
    id: bigint;
    inputSummary: string;
    resultScore: bigint;
    moduleName: string;
    timestamp: bigint;
    riskLevel: RiskLevel;
}
export enum RiskLevel {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export interface backendInterface {
    analyzeText(text: string): Promise<bigint>;
    checkPasswordStrength(password: string): Promise<bigint>;
    getPlatformStats(): Promise<PlatformStats>;
    getScanCountsByModule(): Promise<Array<ModuleCount>>;
    getScanHistory(): Promise<Array<ScanRecord>>;
    getThreatFeed(): Promise<Array<ThreatEntry>>;
    submitScan(moduleName: string, inputSummary: string, resultScore: bigint, riskLevel: RiskLevel): Promise<bigint>;
}
