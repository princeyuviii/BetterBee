import { authenticatedRequest } from "@/lib/api";

export interface SearchMatch {
  chunk_id: string;
  content: string;
  score: number;
  page_number?: number;
  sheet_name?: string;
  slide_number?: number;
  chunk_index?: number;
}

export interface SearchDocumentResult {
  document_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  s3_key: string;
  matches: SearchMatch[];
}

export interface SearchResponse {
  query: string;
  search_type: "semantic" | "keyword";
  results: SearchDocumentResult[];
}

export const searchService = {
  /**
   * Search workspace document contents and metadata.
   */
  searchWorkspace: async (
    workspaceId: string,
    query: string,
    type: "semantic" | "keyword",
    getToken: () => Promise<string | null>,
    limit = 20,
  ): Promise<SearchResponse> => {
    return authenticatedRequest<SearchResponse>(
      {
        url: `/workspaces/${workspaceId}/search`,
        method: "GET",
        params: {
          q: query,
          type,
          limit,
        },
      },
      getToken,
    );
  },
};
