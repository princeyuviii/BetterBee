"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { searchService } from "@/services/search-service";
import { SearchResults } from "@/components/search/search-results";
import { Search, Sparkles, HelpCircle, FileText, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SearchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  
  const workspaceId = params.workspaceId as string;
  const initialQuery = searchParams.get("q") || "";

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<"semantic" | "keyword">("semantic");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQueryInput(q);
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Query search service
  const { data, isLoading, error } = useQuery({
    queryKey: ["search", workspaceId, searchQuery, searchType],
    queryFn: () => {
      if (!searchQuery.trim()) return null;
      return searchService.searchWorkspace(workspaceId, searchQuery, searchType, getToken);
    },
    enabled: !!searchQuery.trim() && !!workspaceId,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    setSearchQuery(queryInput.trim());
  };

  const handleSuggestionClick = (promptText: string) => {
    setQueryInput(promptText);
    setSearchQuery(promptText);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-950 text-neutral-100 p-6 custom-scrollbar h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto space-y-8 select-none">
        
        {/* Page Hero */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-100 flex items-center gap-2">
            <Search className="h-6 w-6 text-amber-500" />
            Document Explorer
          </h1>
          <p className="text-xs text-neutral-500 leading-normal">
            Locate exact matches, sections, and tables across your workspace document corpus.
          </p>
        </div>

        {/* Search Control Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-neutral-900/30 border border-neutral-900 p-6 rounded-2xl space-y-4 shadow-sm"
        >
          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-xl bg-neutral-950 border border-neutral-900 w-fit">
            <button
              type="button"
              onClick={() => setSearchType("semantic")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchType === "semantic"
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/10 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-300 border border-transparent"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Semantic Search</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchType("keyword")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchType === "keyword"
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/10 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-300 border border-transparent"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Keyword Matching</span>
            </button>
          </div>

          {/* Search Inputs */}
          <div className="flex gap-3">
            <div className="relative flex-1 flex items-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 focus-within:border-amber-500/50 transition-all">
              <Search className="h-4 w-4 text-neutral-500 shrink-0 mr-3" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder={
                  searchType === "semantic"
                    ? "Ask a question or enter a topic concept..."
                    : "Search for specific literal keywords, names, or values..."
                }
                className="flex-1 bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-sm shadow-md shadow-amber-500/10 active:scale-98 transition-all cursor-pointer disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Dynamic content rendering */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center space-y-3"
            >
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                Searching documents database...
              </span>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 border border-red-500/20 bg-red-500/5 text-red-400 text-xs rounded-xl flex items-center gap-2"
            >
              <span>Search query failed. Please verify API connection or try again.</span>
            </motion.div>
          ) : data ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <SearchResults
                results={data.results}
                query={data.query}
                searchType={data.search_type}
                workspaceId={workspaceId}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pt-4"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                Suggested exploration queries
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => handleSuggestionClick("guidelines and requirements")}
                  className="flex items-center justify-between text-left p-4 rounded-xl border border-neutral-900 bg-neutral-900/10 hover:bg-neutral-900/30 hover:border-neutral-800 transition-all cursor-pointer text-xs"
                >
                  <span className="text-neutral-300 font-medium truncate max-w-[250px]">
                    "guidelines and requirements"
                  </span>
                  <HelpCircle className="h-4 w-4 text-neutral-600 shrink-0 ml-2" />
                </button>
                <button
                  onClick={() => handleSuggestionClick("financial performance table")}
                  className="flex items-center justify-between text-left p-4 rounded-xl border border-neutral-900 bg-neutral-900/10 hover:bg-neutral-900/30 hover:border-neutral-800 transition-all cursor-pointer text-xs"
                >
                  <span className="text-neutral-300 font-medium truncate max-w-[250px]">
                    "financial performance table"
                  </span>
                  <HelpCircle className="h-4 w-4 text-neutral-600 shrink-0 ml-2" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
