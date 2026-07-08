/**
 * BetterBee — Authentication & Profile Services.
 *
 * Handles synchronizing authenticated Clerk users with the backend database.
 */

import { authenticatedRequest } from "@/lib/api";

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSyncPayload {
  clerk_id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

export const authService = {
  /**
   * Sync Clerk user profile data to the database.
   */
  async syncUser(
    payload: UserSyncPayload,
    getToken: () => Promise<string | null>,
  ): Promise<UserProfile> {
    return authenticatedRequest<UserProfile>(
      {
        url: "/auth/sync",
        method: "POST",
        data: payload,
      },
      getToken,
    );
  },

  /**
   * Fetch current user's profile details from the database.
   */
  async getMe(getToken: () => Promise<string | null>): Promise<UserProfile> {
    return authenticatedRequest<UserProfile>(
      {
        url: "/auth/me",
        method: "GET",
      },
      getToken,
    );
  },
};
