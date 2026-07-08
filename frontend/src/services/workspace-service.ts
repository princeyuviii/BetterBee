/**
 * BetterBee — Workspace API Services.
 */

import { authenticatedRequest } from "@/lib/api";
import type { Workspace } from "@/stores/workspace-store";

export interface WorkspaceCreatePayload {
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface WorkspaceUpdatePayload {
  name?: string;
  description?: string | null;
  icon?: string | null;
}

export const workspaceService = {
  /**
   * List workspaces owned by current user.
   */
  async listWorkspaces(getToken: () => Promise<string | null>): Promise<Workspace[]> {
    return authenticatedRequest<Workspace[]>(
      {
        url: "/workspaces",
        method: "GET",
      },
      getToken,
    );
  },

  /**
   * Fetch details of a single workspace.
   */
  async getWorkspace(
    workspaceId: string,
    getToken: () => Promise<string | null>,
  ): Promise<Workspace> {
    return authenticatedRequest<Workspace>(
      {
        url: `/workspaces/${workspaceId}`,
        method: "GET",
      },
      getToken,
    );
  },

  /**
   * Create a new workspace.
   */
  async createWorkspace(
    payload: WorkspaceCreatePayload,
    getToken: () => Promise<string | null>,
  ): Promise<Workspace> {
    return authenticatedRequest<Workspace>(
      {
        url: "/workspaces",
        method: "POST",
        data: payload,
      },
      getToken,
    );
  },

  /**
   * Update an existing workspace.
   */
  async updateWorkspace(
    workspaceId: string,
    payload: WorkspaceUpdatePayload,
    getToken: () => Promise<string | null>,
  ): Promise<Workspace> {
    return authenticatedRequest<Workspace>(
      {
        url: `/workspaces/${workspaceId}`,
        method: "PATCH",
        data: payload,
      },
      getToken,
    );
  },

  /**
   * Delete a workspace.
   */
  async deleteWorkspace(
    workspaceId: string,
    getToken: () => Promise<string | null>,
  ): Promise<void> {
    return authenticatedRequest<void>(
      {
        url: `/workspaces/${workspaceId}`,
        method: "DELETE",
      },
      getToken,
    );
  },
};
