import React from "react";
import { FileText, FileSpreadsheet, FilePlus, ExternalLink, Sparkles, AlertCircle, MessageSquare } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { type SearchDocumentResult, type SearchMatch } from "@/services/search-service";
import { useRouter } from "next/navigation";

interface SearchResultsProps {
  results: SearchDocumentResult[];
  query: string;
  searchType: "semantic" | "keyword";
  workspaceId: string;
}

export function SearchResults({ results, query, searchType, workspaceId }: SearchResultsProps) {
  const router = useRouter();

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/5">
        <AlertCircle className="h-8 w-8 text-neutral-600 mb-2 animate-bounce" />
        <h3 className="text-sm font-semibold text-neutral-200">No results found</h3>
        <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 leading-normal">
          We couldn't find any passages matching "{query}" using {searchType} search. Try adjusting keywords or upload more documents.
        </p>
      </div>
    );
  }

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type === "xlsx" || type === "xls" || type === "csv") {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    }
    return <FileText className="h-5 w-5 text-amber-500" />;
  };

  const handleStartChat = (docName: string, snippet: string) => {
    const promptText = `Based on the document [${docName}], what can you tell me about the following passage:\n\n"${snippet}"`;
    router.push(`/workspaces/${workspaceId}/chat?initialMessage=${encodeURIComponent(promptText)}`);
  };

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          Showing results grouped by document
        </span>
        <span className="text-[10px] font-mono text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 flex items-center gap-1">
          {searchType === "semantic" && <Sparkles className="h-3 w-3 animate-pulse" />}
          {results.length} Document{results.length > 1 ? "s" : ""} matched
        </span>
      </div>

      <div className="space-y-4">
        {results.map((docResult) => {
          const Icon = getFileIcon(docResult.file_type);
          return (
            <div
              key={docResult.document_id}
              className="bg-neutral-900/10 border border-neutral-800/40 rounded-2xl overflow-hidden hover:border-neutral-800 transition-all duration-300 shadow-sm"
            >
              {/* Document Header */}
              <div className="flex items-center justify-between p-4 bg-neutral-900/20 border-b border-neutral-900/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 border border-neutral-900 text-neutral-400">
                    {Icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-neutral-200 truncate block">
                      {docResult.filename}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono block">
                      {docResult.file_type.toUpperCase()} | {formatBytes(docResult.file_size)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chunks/Passages Matches */}
              <div className="divide-y divide-neutral-900/40 p-4 space-y-4">
                {docResult.matches.map((match, idx) => {
                  const pRef = match.page_number
                    ? `page ${match.page_number}`
                    : match.sheet_name
                    ? `sheet ${match.sheet_name}`
                    : match.slide_number
                    ? `slide ${match.slide_number}`
                    : "";

                  return (
                    <div
                      key={match.chunk_id || idx}
                      className={cn(
                        "pt-3 first:pt-0 space-y-2 group",
                        idx > 0 && "border-t border-neutral-900/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850 text-neutral-400">
                            Match {idx + 1}
                          </span>
                          {pRef && (
                            <span className="text-[10px] font-mono text-neutral-500">
                              ({pRef})
                            </span>
                          )}
                        </div>

                        {searchType === "semantic" && (
                          <span className="text-[10px] font-mono text-amber-500/80 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">
                            Relevance: {match.score.toFixed(3)}
                          </span>
                        )}
                      </div>

                      {/* Snippet display */}
                      <div className="relative">
                        <blockquote className="text-xs text-neutral-400 font-mono italic leading-relaxed bg-neutral-950/30 p-3 rounded-xl border border-neutral-900 leading-normal pl-4 border-l-2 border-l-amber-500/60 select-text">
                          "{match.content}"
                        </blockquote>

                        {/* Action buttons on match hover */}
                        <div className="absolute right-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                          <button
                            onClick={() => handleStartChat(docResult.filename, match.content)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-neutral-950 shadow-md transition-colors cursor-pointer"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>Discuss</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
