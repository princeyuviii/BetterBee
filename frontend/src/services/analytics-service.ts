import { authenticatedRequest } from "@/lib/api";

export interface DocumentStatusCount {
  status: string;
  count: number;
}

export interface RecentQuery {
  id: string;
  workspace_name: string;
  workspace_id: string;
  query: string;
  created_at: string;
  latency_ms: number;
}

export interface RecentUpload {
  id: string;
  workspace_name: string;
  workspace_id: string;
  filename: string;
  file_size: number;
  created_at: string;
  status: string;
}

export interface RAGAnalyticsResponse {
  total_workspaces: number;
  total_documents: number;
  total_chunks: number;
  total_storage_bytes: number;
  total_queries: number;
  total_tokens: number;
  avg_latency_ms: number;
  document_statuses: DocumentStatusCount[];
  recent_queries: RecentQuery[];
  recent_uploads: RecentUpload[];
}

export const analyticsService = {
  async getAnalytics(getToken: () => Promise<string | null>): Promise<RAGAnalyticsResponse> {
    return authenticatedRequest<RAGAnalyticsResponse>(
      {
        url: "/analytics",
        method: "GET",
      },
      getToken,
    );
  },
};
