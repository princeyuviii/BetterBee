/**
 * BetterBee — Application Constants.
 *
 * Centralized constants for routes, API paths, limits, and display values.
 */

// --- Route Paths ---
export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  DASHBOARD: "/workspaces",
  WORKSPACE: (id: string) => `/workspaces/${id}`,
  CHAT: (workspaceId: string) => `/workspaces/${workspaceId}/chat`,
  CHAT_SESSION: (workspaceId: string, sessionId: string) =>
    `/workspaces/${workspaceId}/chat/${sessionId}`,
  DOCUMENTS: (workspaceId: string) => `/workspaces/${workspaceId}/documents`,
  SEARCH: (workspaceId: string) => `/workspaces/${workspaceId}/search`,
  WORKSPACE_SETTINGS: (workspaceId: string) => `/workspaces/${workspaceId}/settings`,
  SETTINGS: "/settings",
  ADMIN: "/admin",
} as const;

// --- API Paths ---
export const API = {
  AUTH: {
    SYNC: "/auth/sync",
    ME: "/auth/me",
  },
  WORKSPACES: {
    LIST: "/workspaces",
    CREATE: "/workspaces",
    DETAIL: (id: string) => `/workspaces/${id}`,
    UPDATE: (id: string) => `/workspaces/${id}`,
    DELETE: (id: string) => `/workspaces/${id}`,
  },
  DOCUMENTS: {
    UPLOAD_URL: (wid: string) => `/workspaces/${wid}/documents/upload-url`,
    CONFIRM: (wid: string) => `/workspaces/${wid}/documents/confirm`,
    LIST: (wid: string) => `/workspaces/${wid}/documents`,
    DETAIL: (wid: string, did: string) => `/workspaces/${wid}/documents/${did}`,
    DELETE: (wid: string, did: string) => `/workspaces/${wid}/documents/${did}`,
    STATUS: (wid: string, did: string) => `/workspaces/${wid}/documents/${did}/status`,
  },
  CHAT: {
    SEND: (wid: string) => `/workspaces/${wid}/chat`,
    SESSIONS: (wid: string) => `/workspaces/${wid}/chat/sessions`,
    SESSION: (wid: string, sid: string) => `/workspaces/${wid}/chat/sessions/${sid}`,
    EXPLAIN: (wid: string, sid: string, mid: string) =>
      `/workspaces/${wid}/chat/sessions/${sid}/messages/${mid}/explain`,
  },
  SEARCH: (wid: string) => `/workspaces/${wid}/search`,
  ADMIN: {
    STATS: "/admin/stats",
    QUEUE: "/admin/queue",
    FAILED_JOBS: "/admin/failed-jobs",
  },
  HEALTH: "/health",
} as const;

// --- Upload Limits ---
export const UPLOAD = {
  MAX_FILE_SIZE_MB: 50,
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024,
  ALLOWED_TYPES: ["pdf", "docx", "md", "txt", "xlsx", "pptx"] as const,
  ALLOWED_MIME_TYPES: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/markdown",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ] as const,
} as const;

// --- UI Constants ---
export const UI = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  CITATION_PANEL_WIDTH: 360,
  DEFAULT_PAGE_SIZE: 50,
  STATUS_POLL_INTERVAL_MS: 3000,
} as const;

// --- Document Status ---
export const DOC_STATUS = {
  UPLOADED: "uploaded",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
} as const;
