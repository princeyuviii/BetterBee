"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Upload,
  RefreshCw,
  Trash2,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";

import { documentService } from "@/services/document-service";
import { UploadDialog } from "@/components/documents/upload-dialog";

export default function WorkspaceDocumentsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load documents
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ["documents", workspaceId],
    queryFn: () => documentService.listDocuments(workspaceId, getToken),
    enabled: !!workspaceId,
  });

  // Poll for document status if any are processing
  const anyProcessing = documents.some(
    (doc) => doc.status === "uploaded" || doc.status === "processing"
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (anyProcessing) {
      intervalId = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] });
      }, 5000); // Poll every 5s
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [anyProcessing, workspaceId, queryClient]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) =>
      documentService.deleteDocument(workspaceId, documentId, getToken),
    onSuccess: () => {
      toast.success("Document deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to delete document");
    },
  });

  const handleDelete = (docId: string, filename: string) => {
    if (confirm(`Are you sure you want to delete ${filename}? This cannot be undone.`)) {
      deleteMutation.mutate(docId);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-100">
            Document Library
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your files and track ingestion pipeline status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`h-4 w-4 ${anyProcessing ? "animate-spin text-amber-500" : ""}`} />
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 transition-colors shadow-lg focus-visible:outline-hidden"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-hidden focus:border-amber-500/50 placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Library Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          <span className="text-sm text-neutral-500 mt-4">Loading document library...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 rounded-2xl border border-neutral-800 bg-neutral-900/10 backdrop-blur-xs">
          <FileText className="h-12 w-12 text-neutral-700 mb-4" />
          <h3 className="text-lg font-bold text-neutral-300">No documents found</h3>
          <p className="text-sm text-neutral-400 mt-1 max-w-xs mx-auto">
            {searchQuery ? "No documents match your search query." : "Upload documents to this workspace to get started."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="mt-6 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 transition-colors focus-visible:outline-hidden"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-xs font-semibold text-neutral-400 bg-neutral-950 uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Size</th>
                <th className="py-4 px-6">Uploaded At</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-sm text-neutral-300">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="py-4 px-6 font-medium text-neutral-200 truncate max-w-xs">
                    {doc.filename}
                  </td>
                  <td className="py-4 px-6 text-xs text-neutral-400 uppercase">
                    {doc.file_type}
                  </td>
                  <td className="py-4 px-6 text-neutral-400">
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="py-4 px-6 text-neutral-400">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    {doc.status === "ready" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                        <CheckCircle className="h-3 w-3" />
                        Ready ({doc.chunk_count} chunks)
                      </span>
                    )}
                    {(doc.status === "uploaded" || doc.status === "processing") && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        In Queue
                      </span>
                    )}
                    {doc.status === "failed" && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 cursor-help"
                        title={doc.error_message || "Ingestion failed"}
                      >
                        <XCircle className="h-3 w-3" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      className="text-neutral-500 hover:text-rose-500 p-1.5 hover:bg-neutral-900 rounded-lg transition-colors inline-flex"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        workspaceId={workspaceId}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}
