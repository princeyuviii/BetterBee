import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { MessageSquare, Sparkles, FileText, CheckCircle2, ChevronRight, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Message } from "@/services/chat-service";

interface MessageBubbleProps {
  message: Message;
  onOpenExplain?: (message: Message) => void;
  isExplainOpen?: boolean;
}

export function MessageBubble({ message, onOpenExplain, isExplainOpen }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Render clickable citation buttons for references in text
  const renderMessageContent = (content: string) => {
    // Regex for [filename.pdf] or [filename.pdf](page X) or [filename.pdf](slide X)
    const citationRegex = /\[([^\]]+)\](?:\(([^)]+)\))?/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      // Add text before match
      if (matchIndex > lastIndex) {
        parts.push(content.substring(lastIndex, matchIndex));
      }

      const filename = match[1];
      const pageRef = match[2];

      parts.push(
        <span
          key={matchIndex}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md text-xs font-mono font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 cursor-pointer transition-colors"
          title={`Click to view source chunk`}
        >
          <FileText className="h-3 w-3" />
          <span>{filename}</span>
          {pageRef && <span className="text-neutral-400">({pageRef})</span>}
        </span>
      );

      lastIndex = citationRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div
      className={cn(
        "flex w-full gap-4 p-6 rounded-2xl border transition-all duration-300",
        isUser
          ? "bg-neutral-900/10 border-neutral-900/20"
          : "bg-neutral-900/40 border-neutral-800/40 backdrop-blur-xs"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold shadow-md",
          isUser
            ? "border-neutral-800 bg-neutral-900 text-neutral-400"
            : "border-amber-500/20 bg-amber-500/10 text-amber-500 animate-pulse"
        )}
      >
        {isUser ? <MessageSquare className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {isUser ? "You" : "BetterBee AI"}
          </span>
          <span className="text-[10px] text-neutral-600 font-mono">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Message Content */}
        <div className="prose prose-invert max-w-none text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Citations & Explainability */}
        {!isUser && (
          <div className="pt-2 space-y-3">
            {/* References list */}
            {message.citations && message.citations.length > 0 && (
              <div className="space-y-1.5 border-t border-neutral-950 pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-amber-500" /> Grounded References ({message.citations.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {message.citations.map((cite, idx) => {
                    const pageStr = cite.page_number
                      ? `p. ${cite.page_number}`
                      : cite.sheet_name
                      ? `sheet ${cite.sheet_name}`
                      : cite.slide_number
                      ? `slide ${cite.slide_number}`
                      : "";

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-neutral-950 border border-neutral-900 text-neutral-400 hover:text-neutral-200 transition-colors"
                      >
                        <FileText className="h-3 w-3 text-amber-500/70" />
                        <span className="font-medium truncate max-w-[150px]">{cite.filename}</span>
                        {pageStr && <span className="text-[10px] text-neutral-600">({pageStr})</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explainability CTA */}
            {onOpenExplain && message.explainability_data && Object.keys(message.explainability_data).length > 0 && (
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => onOpenExplain(message)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                    isExplainOpen
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-neutral-800 hover:border-amber-500/30 hover:bg-amber-500/5 text-neutral-400 hover:text-neutral-300"
                  )}
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span>Explain Generation</span>
                  <ChevronRight className={cn("h-3 w-3 transition-transform", isExplainOpen && "rotate-90")} />
                </button>
                <span className="text-[10px] font-mono text-neutral-600">
                  Latency: {message.latency_ms}ms | Confidence: {message.explainability_data?.confidence}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
