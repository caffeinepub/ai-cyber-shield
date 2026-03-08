import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ModuleCount,
  PlatformStats,
  RiskLevel,
  ScanRecord,
  ThreatEntry,
} from "../backend.d";
import { useActor } from "./useActor";

export function usePlatformStats() {
  const { actor, isFetching } = useActor();
  return useQuery<PlatformStats>({
    queryKey: ["platformStats"],
    queryFn: async () => {
      if (!actor)
        return { totalScans: 0n, activeAlerts: 0n, threatsDetected: 0n };
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useScanCountsByModule() {
  const { actor, isFetching } = useActor();
  return useQuery<ModuleCount[]>({
    queryKey: ["scanCountsByModule"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getScanCountsByModule();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useThreatFeed() {
  const { actor, isFetching } = useActor();
  return useQuery<ThreatEntry[]>({
    queryKey: ["threatFeed"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getThreatFeed();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useScanHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<ScanRecord[]>({
    queryKey: ["scanHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getScanHistory();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useAnalyzeText() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.analyzeText(text);
    },
  });
}

export function useCheckPasswordStrength() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.checkPasswordStrength(password);
    },
  });
}

export function useSubmitScan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      moduleName,
      inputSummary,
      resultScore,
      riskLevel,
    }: {
      moduleName: string;
      inputSummary: string;
      resultScore: bigint;
      riskLevel: RiskLevel;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitScan(moduleName, inputSummary, resultScore, riskLevel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanHistory"] });
      queryClient.invalidateQueries({ queryKey: ["platformStats"] });
      queryClient.invalidateQueries({ queryKey: ["scanCountsByModule"] });
    },
  });
}
