import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useTickets = () => useQuery({ queryKey: ["tickets"], queryFn: api.getTickets });
export const useTicket = (id: string) => useQuery({ queryKey: ["tickets", id], queryFn: () => api.getTicket(id) });
export const useStats = () => useQuery({ queryKey: ["stats"], queryFn: api.getStats });
export const usePostReleaseImpacts = () => useQuery({ queryKey: ["post-release-impact"], queryFn: api.getPostReleaseImpacts });
export const useClusters = () => useQuery({ queryKey: ["clusters"], queryFn: api.getClusters });
export const useReports = (ticketId?: string) =>
  useQuery({ queryKey: ["reports", ticketId ?? "all"], queryFn: () => api.getReports(ticketId) });
export const useReport = (id: string) => useQuery({ queryKey: ["report", id], queryFn: () => api.getReport(id) });
export const useSchedulerStatus = () =>
  useQuery({
    queryKey: ["scheduler"],
    queryFn: api.getSchedulerStatus,
    refetchInterval: (q) => (q.state.data?.ruleazaAcum ? 1500 : 15000),
  });

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}

export const useRunVerification = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: (ticketIds?: string[]) => api.runVerification(ticketIds), onSuccess: inv });
};
export const useImport = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: (file: File) => api.importExcel(file), onSuccess: inv });
};
export const useImportPostReleaseFeedback = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: (file: File) => api.importPostReleaseFeedback(file), onSuccess: inv });
};
export const useClearDemoData = () => {
  const inv = useInvalidateAll();
  return useMutation({ mutationFn: () => api.clearDemoData(), onSuccess: inv });
};
