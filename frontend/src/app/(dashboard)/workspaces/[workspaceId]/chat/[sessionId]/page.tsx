"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { chatService, type Message } from "@/services/chat-service";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { ExplainabilityPanel } from "@/components/explainability/explainability-panel";
import { Loader2, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { UploadDialog } from "@/components/documents/upload-dialog";

export default function ChatSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const workspaceId = params.workspaceId as string;
  const sessionId = params.sessionId as string;
  const initialMessage = searchParams.get("initialMessage");

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Explainability Panel State
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [explainData, setExplainData] = useState<any>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Fetch session messages
  const { data: session, isLoading } = useQuery({
    queryKey: ["chat-session", sessionId],
    queryFn: () => chatService.getSession(workspaceId, sessionId, getToken),
    enabled: !!sessionId,
  });

  // Sync React Query messages to local state when loaded
  useEffect(() => {
    if (session?.messages) {
      setLocalMessages(session.messages);
    }
  }, [session]);

  // Handle scroll events to show/hide scroll-to-bottom button
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  };

  // Auto-scroll during streaming
  useEffect(() => {
    if (streamingMessage) {
      scrollToBottom();
    }
  }, [streamingMessage?.content]);

  // Auto-scroll on initial load
  useEffect(() => {
    if (localMessages.length > 0) {
      scrollToBottom();
    }
  }, [localMessages.length]);

  // Handle sending a message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    setIsSending(true);
    setInputValue("");

    // 1. Create local user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      session_id: sessionId,
      role: "user",
      content: text,
      citations: [],
      explainability_data: undefined,
      token_count: text.split(/\s+/).length,
      latency_ms: 0,
      created_at: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, userMsg]);

    // 2. Initialize local streaming assistant message
    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      session_id: sessionId,
      role: "assistant",
      content: "",
      citations: [],
      explainability_data: undefined,
      token_count: 0,
      latency_ms: 0,
      created_at: new Date().toISOString(),
    };

    setStreamingMessage(initialAssistantMsg);

    // 3. Initiate SSE chat stream
    await chatService.streamChatMessage(
      workspaceId,
      text,
      sessionId,
      getToken,
      (event) => {
        if (event.type === "token") {
          setStreamingMessage((prev) => {
            if (!prev) return null;
            return { ...prev, content: prev.content + event.content };
          });
        } else if (event.type === "citations") {
          setStreamingMessage((prev) => {
            if (!prev) return null;
            return { ...prev, citations: event.content };
          });
        } else if (event.type === "explain") {
          setStreamingMessage((prev) => {
            if (!prev) return null;
            return { ...prev, explainability_data: event.content };
          });
        } else if (event.type === "message_id") {
          setStreamingMessage((prev) => {
            if (!prev) return null;
            return { ...prev, id: event.content };
          });
        }
      },
      (err) => {
        toast.error("Error communicating with AI engine");
        setIsSending(false);
        setStreamingMessage(null);
        console.error(err);
      },
      () => {
        // Complete - reload from DB
        queryClient.invalidateQueries({ queryKey: ["chat-session", sessionId] });
        queryClient.invalidateQueries({ queryKey: ["chat-sessions", workspaceId] });
        setStreamingMessage(null);
        setIsSending(false);
      }
    );
  };

  // Catch initialMessage redirect and execute it
  useEffect(() => {
    if (initialMessage && localMessages.length === 0 && !isLoading && !isSending) {
      // Clean up search query param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("initialMessage");
      window.history.replaceState({}, "", url.pathname);
      
      handleSendMessage(decodeURIComponent(initialMessage));
    }
  }, [initialMessage, localMessages.length, isLoading]);

  const handleOpenExplain = (message: Message) => {
    if (selectedMessageId === message.id && isExplainOpen) {
      setIsExplainOpen(false);
      setSelectedMessageId(null);
      setExplainData(null);
    } else {
      setSelectedMessageId(message.id);
      setExplainData(message.explainability_data);
      setIsExplainOpen(true);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full relative">
      {/* Active Conversation thread */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-neutral-950">
        
        {/* Messages List Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar"
        >
          {isLoading && localMessages.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <span className="text-sm text-neutral-500 font-semibold">Loading conversation thread...</span>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <AnimatePresence initial={false}>
                {localMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageBubble
                      message={msg}
                      onOpenExplain={handleOpenExplain}
                      isExplainOpen={selectedMessageId === msg.id && isExplainOpen}
                    />
                  </motion.div>
                ))}
                
                {/* Streaming Assistant Message */}
                {streamingMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <MessageBubble
                      message={streamingMessage}
                      onOpenExplain={handleOpenExplain}
                      isExplainOpen={selectedMessageId === streamingMessage.id && isExplainOpen}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-amber-500 hover:text-amber-400 shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}

        {/* Input Panel */}
        <div className="px-6 pb-6 pt-4 border-t border-neutral-900 bg-neutral-950/80 backdrop-blur-xs max-w-4xl mx-auto w-full">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={() => handleSendMessage(inputValue)}
            onUploadClick={() => setIsUploadOpen(true)}
            disabled={isSending}
          />
        </div>
      </div>

      {/* AI Explainability Diagnostic Panel */}
      <AnimatePresence>
        {isExplainOpen && (
          <ExplainabilityPanel
            isOpen={isExplainOpen}
            explainData={explainData}
            onClose={() => {
              setIsExplainOpen(false);
              setSelectedMessageId(null);
              setExplainData(null);
            }}
          />
        )}
      </AnimatePresence>

      <UploadDialog
        workspaceId={workspaceId}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}
