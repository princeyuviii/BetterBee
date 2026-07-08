import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Pin, Trash2, Edit3, Check, X, Plus, FileText, FolderOpen, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { type ChatSession } from "@/services/chat-service";
import { type DocumentInfo } from "@/services/document-service";

interface SessionListProps {
  sessions: ChatSession[];
  documents?: DocumentInfo[];
  activeSessionId?: string;
  workspaceId: string;
  onRename: (sessionId: string, newTitle: string) => Promise<void>;
  onDelete: (sessionId: string) => Promise<void>;
  onTogglePin: (sessionId: string, currentPinStatus: boolean) => Promise<void>;
  onCreateNewChat: () => void;
}

export function SessionList({
  sessions,
  documents = [],
  activeSessionId,
  workspaceId,
  onRename,
  onDelete,
  onTogglePin,
  onCreateNewChat,
}: SessionListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isDocsExpanded, setIsDocsExpanded] = useState(true);

  const handleStartEdit = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await onRename(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Grouping sessions
  const pinnedSessions = sessions.filter((s) => s.is_pinned);
  const unpinnedSessions = sessions.filter((s) => !s.is_pinned);

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = session.id === editingId;

    return (
      <motion.div
        key={session.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={() => {
          if (!isEditing) {
            router.push(`/workspaces/${workspaceId}/chat/${session.id}`);
          }
        }}
        className={cn(
          "group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer select-none border",
          isActive
            ? "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-xs"
            : "bg-neutral-900/20 border-transparent hover:bg-neutral-900/60 hover:border-neutral-800/40 text-neutral-400 hover:text-neutral-200"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare className={cn("h-4 w-4 shrink-0", isActive ? "text-amber-500" : "text-neutral-500")} />
          
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs py-0.5 px-1.5 rounded-md focus:outline-hidden focus:border-amber-500 w-full"
              autoFocus
            />
          ) : (
            <span className="truncate text-xs">{session.title}</span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={(e) => handleSaveRename(session.id, e)}
                className="p-1 rounded-md hover:bg-neutral-900 text-green-500 transition-colors"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={handleCancelRename}
                className="p-1 rounded-md hover:bg-neutral-900 text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              {/* Pin indicator or pin action */}
              {(session.is_pinned || isActive) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(session.id, session.is_pinned);
                  }}
                  className={cn(
                    "p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-neutral-900 text-neutral-500 hover:text-amber-500",
                    session.is_pinned && "opacity-100 text-amber-500"
                  )}
                  title={session.is_pinned ? "Unpin session" : "Pin session"}
                >
                  <Pin className={cn("h-3 w-3", session.is_pinned && "fill-amber-500/30")} />
                </button>
              )}

              {/* Rename/Delete actions on hover */}
              <button
                onClick={(e) => handleStartEdit(session, e)}
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-neutral-900 hover:text-neutral-200 text-neutral-500 transition-all duration-200"
                title="Rename Session"
              >
                <Edit3 className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-neutral-900 hover:text-red-500 text-neutral-500 transition-all duration-200"
                title="Delete Session"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full border-r border-neutral-900 bg-neutral-950/60 backdrop-blur-md w-64 shrink-0 select-none">
      {/* New chat button */}
      <div className="p-4 border-b border-neutral-900">
        <button
          onClick={onCreateNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-neutral-950 font-semibold text-xs py-2.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Session list container */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">
        {/* Pinned conversations */}
        {pinnedSessions.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 px-3">
              Pinned Conversations
            </span>
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {pinnedSessions.map(renderSessionItem)}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Regular conversations */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 px-3">
            Recent Chat History
          </span>
          {unpinnedSessions.length === 0 && pinnedSessions.length === 0 ? (
            <div className="px-3 py-6 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/5">
              <span className="text-xs text-neutral-500">No chat history yet.</span>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {unpinnedSessions.map(renderSessionItem)}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Workspace Documents section */}
      <div className="border-t border-neutral-900 p-4 space-y-3 bg-neutral-950/40 shrink-0">
        <button
          onClick={() => setIsDocsExpanded(!isDocsExpanded)}
          className="flex items-center justify-between w-full text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition-colors focus:outline-hidden"
        >
          <span className="flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5 text-neutral-500" />
            Workspace Documents ({documents.length})
          </span>
          {isDocsExpanded ? (
            <ChevronDown className="h-3 w-3 text-neutral-500" />
          ) : (
            <ChevronRight className="h-3 w-3 text-neutral-500" />
          )}
        </button>
        
        {isDocsExpanded && (
          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
            {documents.length === 0 ? (
              <div className="py-2 text-center">
                <span className="text-[10px] text-neutral-600 italic">No files uploaded.</span>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-neutral-900/50 bg-neutral-900/10 hover:bg-neutral-900/30 transition-colors"
                  title={`${doc.filename} (${doc.status})`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="h-3.5 w-3.5 text-amber-500/70 shrink-0" />
                    <span className="text-[11px] text-neutral-300 truncate font-mono">
                      {doc.filename}
                    </span>
                  </div>
                  
                  {/* Status dot */}
                  <span className="shrink-0 flex items-center justify-center">
                    {doc.status === "ready" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Ready for queries" />
                    )}
                    {(doc.status === "uploaded" || doc.status === "processing") && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" title="Ingesting..." />
                    )}
                    {doc.status === "failed" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title="Ingestion failed" />
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
