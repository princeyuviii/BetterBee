"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useUserSync } from "@/hooks/use-user-sync";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Sync the logged-in Clerk user with local PG on layout mount
  const { isSyncing, isSynced } = useUserSync();

  if (isSyncing) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-neutral-950 text-neutral-200">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        <p className="mt-4 text-sm text-neutral-400 font-medium animate-pulse">
          Synchronizing workspace account...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-neutral-900/40 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
