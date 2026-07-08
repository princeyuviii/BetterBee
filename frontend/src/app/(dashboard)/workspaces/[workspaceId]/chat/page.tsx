"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { chatService } from "@/services/chat-service";
import { ChatInput } from "@/components/chat/chat-input";
import { BeeIcon } from "@/components/icons";
import { FileText, HelpCircle, Terminal, Compass, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { UploadDialog } from "@/components/documents/upload-dialog";

export default function ChatLandingPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  
  const workspaceId = params.workspaceId as string;
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const createSessionMutation = useMutation({
    mutationFn: (message: string) => chatService.createSession(workspaceId, getToken, message.slice(0, 40)),
    onError: (err) => {
      toast.error("Failed to start conversation");
      setIsSubmitting(false);
      console.error(err);
    }
  });

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    createSessionMutation.mutate(messageText, {
      onSuccess: (newSession) => {
        queryClient.invalidateQueries({ queryKey: ["chat-sessions", workspaceId] });
        // Redirect to new session page and pass the initial message in query params
        router.push(
          `/workspaces/${workspaceId}/chat/${newSession.id}?initialMessage=${encodeURIComponent(messageText)}`
        );
      },
    });
  };

  const suggestions = [
    {
      title: "Analyze workspace details",
      desc: "Summarize the key information across all uploaded files.",
      icon: FileText,
      prompt: "Summarize the key information and main themes from all the documents uploaded in this workspace.",
    },
    {
      title: "Query document metrics",
      desc: "Find figures, tables, or spreadsheets.",
      icon: Terminal,
      prompt: "What are the key numerical metrics, figures, or financial tables available in our workspace documents?",
    },
    {
      title: "Understand requirements",
      desc: "Identify deliverables or action items.",
      icon: Compass,
      prompt: "What are the primary deliverables, requirements, or action items outlined in the files?",
    },
    {
      title: "Ask a general question",
      desc: "Formulate a custom search search request.",
      icon: HelpCircle,
      prompt: "Show me a detailed overview of the project guidelines mentioned in the documentation.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full items-center justify-between p-6 max-w-4xl mx-auto w-full select-none">
      {/* Spacer or flex filler */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 w-full">
        {/* Logo/Hero area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-lg shadow-amber-500/5 animate-pulse">
            <BeeIcon className="h-10 w-10 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-100 sm:text-4xl bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 bg-clip-text">
              What knowledge can I retrieve?
            </h1>
            <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
              BetterBee searches, reranks, and synthesizes answers strictly grounded in your workspace document corpus.
            </p>
          </div>
        </motion.div>

        {/* Suggestions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4"
        >
          {suggestions.map((s, idx) => {
            const Icon = s.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(s.prompt)}
                disabled={isSubmitting}
                className="flex items-start text-left gap-4 p-4 rounded-2xl border border-neutral-800/40 bg-neutral-900/10 hover:bg-neutral-900/40 hover:border-neutral-800 transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 border border-neutral-900 text-neutral-400 group-hover:text-amber-500 group-hover:border-amber-500/20 transition-all shadow-xs">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors">
                    {s.title}
                  </span>
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    {s.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full pt-6 sticky bottom-0 bg-neutral-950/20 backdrop-blur-xs pb-4"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-amber-500/80 bg-neutral-900/20 border border-neutral-800/40 rounded-2xl">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            <span>Initializing session and searching document context...</span>
          </div>
        ) : (
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={() => handleSendMessage(inputValue)}
            onUploadClick={() => setIsUploadOpen(true)}
          />
        )}
      </motion.div>

      <UploadDialog
        workspaceId={workspaceId}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}
