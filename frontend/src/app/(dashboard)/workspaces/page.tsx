"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import {
  Plus,
  FolderOpen,
  MessageSquare,
  ArrowRight,
  Layers,
  Database,
  Brain,
  Clock,
  Sparkles,
  TrendingUp,
  FileText,
} from "lucide-react";

import { useWorkspaceStore, type Workspace } from "@/stores/workspace-store";
import { workspaceService } from "@/services/workspace-service";
import { analyticsService } from "@/services/analytics-service";

export default function WorkspacesPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();

  // Load workspaces list
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => workspaceService.listWorkspaces(getToken),
  });

  // Load database analytics
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => analyticsService.getAnalytics(getToken),
  });

  const handleSelectWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
    router.push(`/workspaces/${ws.id}/chat`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const isLoading = isWorkspacesLoading || isAnalyticsLoading;

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-100 bg-gradient-to-r from-neutral-100 via-neutral-200 to-amber-500 bg-clip-text text-transparent">
            System Console
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Global RAG analytics, ingestion status, and workspace overview.
          </p>
        </div>
        <Link
          href="/workspaces/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 transition-all shadow-lg shadow-amber-500/10 focus-visible:outline-hidden transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Workspace</span>
        </Link>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Workspaces */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Active Workspaces
            </span>
            <span className="text-2xl font-black text-neutral-100">
              {isLoading ? "..." : analytics?.total_workspaces}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        {/* Total Documents / Storage */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Knowledge Base
            </span>
            <span className="text-2xl font-black text-neutral-100">
              {isLoading ? "..." : analytics?.total_documents}
            </span>
            <span className="text-[10px] text-neutral-500 block">
              {isLoading ? "..." : `${analytics?.total_chunks} chunks (${formatBytes(analytics?.total_storage_bytes || 0)})`}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400">
            <Database className="h-5 w-5" />
          </div>
        </div>

        {/* Queries executed */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Queries Executed
            </span>
            <span className="text-2xl font-black text-neutral-100">
              {isLoading ? "..." : analytics?.total_queries}
            </span>
            <span className="text-[10px] text-neutral-500 block">
              {isLoading ? "..." : `${analytics?.total_tokens.toLocaleString()} total tokens`}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400">
            <Brain className="h-5 w-5" />
          </div>
        </div>

        {/* Latency */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Avg Latency
            </span>
            <span className="text-2xl font-black text-neutral-100">
              {isLoading ? "..." : `${analytics?.avg_latency_ms.toFixed(0)} ms`}
            </span>
            <span className="text-[10px] text-amber-500/80 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Real-time tracking
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Section split: Workspaces vs Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Workspaces List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-neutral-200 uppercase tracking-wider px-1 text-[11px]">
            Your Workspaces
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl border border-neutral-800 bg-neutral-900/30 animate-pulse"
                />
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-neutral-850 bg-neutral-900/10 max-w-md mx-auto">
              <Layers className="h-12 w-12 text-neutral-600 mb-4" />
              <h3 className="text-lg font-bold text-neutral-200">No workspaces found</h3>
              <p className="text-sm text-neutral-400 mt-1 mb-6">
                Get started by creating your team's first private knowledge space.
              </p>
              <Link
                href="/workspaces/new"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create Workspace</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {workspaces.map((workspace) => {
                const isActive = activeWorkspace?.id === workspace.id;
                return (
                  <div
                    key={workspace.id}
                    onClick={() => handleSelectWorkspace(workspace)}
                    className={`group cursor-pointer relative flex flex-col justify-between h-44 rounded-2xl p-6 border transition-all duration-300 ${
                      isActive
                        ? "bg-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/5"
                        : "bg-neutral-900/20 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-4 right-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-neutral-950 border border-neutral-850 text-lg">
                          {workspace.icon || "🐝"}
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-200 group-hover:text-amber-500 transition-colors text-base line-clamp-1">
                            {workspace.name}
                          </h3>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            /{workspace.slug}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-400 mt-4 line-clamp-2 leading-relaxed">
                        {workspace.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-900/80 pt-4 mt-4">
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3.5 w-3.5" />
                          {workspace.document_count} files
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-amber-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Launch <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Activity Logs / Ingestion Pipelines */}
        <div className="space-y-6">
          
          {/* Pipeline Ingestion Health */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-200 uppercase tracking-wider px-1 text-[11px]">
              Ingestion Pipelines
            </h2>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
              {isLoading ? (
                <div className="h-20 animate-pulse bg-neutral-900 rounded-lg" />
              ) : !analytics?.document_statuses.length ? (
                <p className="text-xs text-neutral-500 text-center py-4">No documents indexed yet.</p>
              ) : (
                <div className="space-y-3">
                  {analytics.document_statuses.map((status) => {
                    const isReady = status.status === "ready";
                    const isFailed = status.status === "failed";
                    const isProcessing = status.status === "processing" || status.status === "uploaded";

                    const badgeClass = isReady
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : isFailed
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20";

                    return (
                      <div
                        key={status.status}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-neutral-950/50 border border-neutral-900"
                      >
                        <span className="font-semibold text-neutral-300 capitalize">{status.status}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                          {status.count} files
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Queries */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-200 uppercase tracking-wider px-1 text-[11px]">
              Recent Activity Feed
            </h2>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 animate-pulse bg-neutral-900 rounded-lg" />
                  ))}
                </div>
              ) : !analytics?.recent_queries.length && !analytics?.recent_uploads.length ? (
                <p className="text-xs text-neutral-500 text-center py-6">No recent actions recorded.</p>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                  {/* Render Recent Queries */}
                  {analytics?.recent_queries.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => {
                        const ws = workspaces.find((w) => w.id === q.workspace_id);
                        if (ws) {
                          setActiveWorkspace(ws);
                          router.push(`/workspaces/${q.workspace_id}/chat`);
                        }
                      }}
                      className="group cursor-pointer p-3 rounded-xl bg-neutral-950/50 hover:bg-neutral-950 border border-neutral-900 hover:border-neutral-800 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-sm">
                          {q.workspace_name}
                        </span>
                        <span className="text-neutral-500 font-semibold">{q.latency_ms} ms</span>
                      </div>
                      <p className="text-xs text-neutral-300 font-medium line-clamp-2 leading-relaxed group-hover:text-amber-400 transition-colors">
                        "{q.query}"
                      </p>
                      <span className="text-[9px] text-neutral-600 block">
                        {new Date(q.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}

                  {/* Render Recent Uploads */}
                  {analytics?.recent_uploads.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        const ws = workspaces.find((w) => w.id === doc.workspace_id);
                        if (ws) {
                          setActiveWorkspace(ws);
                          router.push(`/workspaces/${doc.workspace_id}/documents`);
                        }
                      }}
                      className="group cursor-pointer p-3 rounded-xl bg-neutral-950/50 hover:bg-neutral-950 border border-neutral-900 hover:border-neutral-800 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-neutral-400 font-bold bg-neutral-900 px-1.5 py-0.5 rounded-sm">
                          {doc.workspace_name}
                        </span>
                        <span className="text-neutral-500 capitalize">{doc.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                        <p className="text-neutral-300 font-medium truncate max-w-[150px] group-hover:text-amber-400 transition-colors">
                          {doc.filename}
                        </p>
                      </div>
                      <span className="text-[9px] text-neutral-600 block">
                        {new Date(doc.created_at).toLocaleDateString()} at {new Date(doc.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
