import { apiClient } from "@/lib/api";

export interface ServiceStatus {
  status: string;
  latency_ms: number | null;
  error: string | null;
}

export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  uptime_seconds: number;
  timestamp: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    chromadb: ServiceStatus;
    ollama: ServiceStatus;
  };
}

export const healthService = {
  async checkHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>("/health");
    return response.data;
  },
};
