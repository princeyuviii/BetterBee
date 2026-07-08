/**
 * BetterBee — Clerk Provider Wrapper.
 *
 * Wraps the application in ClerkProvider for authentication context.
 * Configures sign-in/sign-up URLs and appearance.
 */

"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#f59e0b", // BetterBee amber/honey
          borderRadius: "0.5rem",
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
