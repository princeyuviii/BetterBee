"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Plus,
  Activity,
} from "lucide-react";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { workspaceService } from "@/services/workspace-service";
import { useAuth } from "@clerk/nextjs";
import { BeeIcon } from "@/components/icons";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { getToken } = useAuth();
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();

  // Load workspaces list
  const { data: workspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => workspaceService.listWorkspaces(getToken),
  });

  const navigation = [
    {
      name: "Dashboard",
      href: "/workspaces",
      icon: LayoutDashboard,
      current: pathname === "/workspaces",
    },
    {
      name: "Chat",
      href: activeWorkspace ? `/workspaces/${activeWorkspace.id}/chat` : "#",
      icon: MessageSquare,
      current: pathname.includes("/chat"),
      disabled: !activeWorkspace,
    },
    {
      name: "Documents",
      href: activeWorkspace ? `/workspaces/${activeWorkspace.id}/documents` : "#",
      icon: FolderOpen,
      current: pathname.includes("/documents"),
      disabled: !activeWorkspace,
    },
    {
      name: "Search",
      href: activeWorkspace ? `/workspaces/${activeWorkspace.id}/search` : "#",
      icon: Search,
      current: pathname.includes("/search"),
      disabled: !activeWorkspace,
    },
    {
      name: "Settings",
      href: activeWorkspace ? `/workspaces/${activeWorkspace.id}/settings` : "#",
      icon: Settings,
      current: pathname.includes("/settings"),
      disabled: !activeWorkspace,
    },
    {
      name: "System Status",
      href: "/status",
      icon: Activity,
      current: pathname === "/status",
    },
  ];

  return (
    <div
      className={`relative flex flex-col h-screen border-r border-neutral-800 bg-neutral-950 text-neutral-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Logo */}
      <div className="flex h-16 items-center px-4 gap-3 border-b border-neutral-900">
        <Link href="/workspaces" className="flex items-center gap-2">
          <BeeIcon className="h-7 w-7 text-amber-500 flex-shrink-0 animate-pulse" />
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              BetterBee
            </span>
          )}
        </Link>
      </div>

      {/* Workspace Switcher */}
      <div className="p-3 border-b border-neutral-900">
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-amber-500 hover:bg-neutral-800"
          >
            {activeWorkspace?.icon ? activeWorkspace.icon : <Plus className="h-5 w-5" />}
          </button>
        ) : (
          <div className="space-y-2">
            <label className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase px-1">
              Active Workspace
            </label>
            <div className="flex gap-2">
              <select
                value={activeWorkspace?.id || ""}
                onChange={(e) => {
                  const ws = workspaces.find((w) => w.id === e.target.value);
                  if (ws) {
                    setActiveWorkspace(ws);
                    router.push(`/workspaces/${ws.id}/chat`);
                  } else {
                    setActiveWorkspace(null);
                    router.push("/workspaces");
                  }
                }}
                className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg py-1.5 px-3 text-sm focus:outline-hidden focus:border-amber-500/50"
              >
                <option value="">Select workspace</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.icon ? `${w.icon} ` : ""}
                    {w.name}
                  </option>
                ))}
              </select>
              <Link
                href="/workspaces/new"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-amber-500 transition-colors"
                title="Create Workspace"
              >
                <Plus className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              disabled={item.disabled}
              onClick={() => router.push(item.href)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                item.disabled
                  ? "opacity-40 cursor-not-allowed"
                  : item.current
                  ? "bg-amber-500/10 text-amber-500"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 shadow-md transition-colors z-50 cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </div>
  );
}
