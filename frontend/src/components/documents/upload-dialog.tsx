"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { X, UploadCloud, File, Loader2, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";

import { documentService } from "@/services/document-service";

interface UploadDialogProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "idle" | "uploading" | "confirming" | "success" | "error";
  error?: string;
}

interface StagedFile {
  id: string;
  file: File;
}

export function UploadDialog({ workspaceId, isOpen, onClose }: UploadDialogProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);

  const isUploading = files.some(
    (f) => f.status === "uploading" || f.status === "confirming"
  );
  const hasStaging = stagedFiles.length > 0;

  // Function to handle a single file upload
  const uploadFile = async (file: File, fileId: string, index: number, totalFiles: number) => {
    try {
      // 1. Initiate upload with backend
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" } : f))
      );
      const fileType = file.name.split(".").pop() || "txt";
      
      const initiateRes = await documentService.initiateUpload(
        workspaceId,
        {
          filename: file.name,
          file_size: file.size,
          file_type: fileType,
        },
        getToken
      );

      // 2. Direct upload (PUT) to pre-signed S3 / Local mock URL
      await axios.put(initiateRes.upload_url, file, {
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          setFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: percentCompleted } : f))
          );
        },
      });

      // 3. Confirm upload with backend
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "confirming" } : f))
      );
      
      await documentService.confirmUpload(workspaceId, initiateRes.document_id, getToken);

      // Success
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "success", progress: 100 } : f))
      );
    } catch (err: any) {
      console.error(`Upload failed for ${file.name}:`, err);
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "error", error: err.message || "Upload failed" } : f))
      );
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const handleConfirmUpload = async () => {
    if (stagedFiles.length === 0) return;

    const filesToUpload = [...stagedFiles];
    // Remove the staged files from staging list as they are about to be uploaded
    setStagedFiles([]);

    // Process all uploads in parallel
    const uploadPromises = filesToUpload.map((staged, index) =>
      uploadFile(staged.file, staged.id, index, filesToUpload.length)
    );

    await Promise.all(uploadPromises);
    
    // Invalidate queries to refresh document list
    queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] });
    toast.success("Batch upload process completed.");
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => {
        const fileId = `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        return {
          id: fileId,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "idle" as const,
          file,
        };
      });

      setFiles((prev) => [...prev, ...newFiles.map(({ file, ...rest }) => rest)]);
      setStagedFiles((prev) => [...prev, ...newFiles.map(({ id, file }) => ({ id, file }))]);
    },
    []
  );

  const handleClose = () => {
    if (isUploading) return;
    setFiles([]);
    setStagedFiles([]);
    onClose();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/markdown": [".md"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-200">Upload Documents</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Files are split, parsed and vectorized securely
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-neutral-500 hover:text-neutral-300 p-1 hover:bg-neutral-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 transition-all ${
            isUploading
              ? "border-neutral-900 bg-neutral-950 cursor-not-allowed opacity-50"
              : isDragActive
              ? "border-amber-500 bg-amber-500/5 cursor-pointer"
              : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/20 cursor-pointer"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-10 w-10 text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-300">
            {isDragActive ? "Drop documents here..." : "Drag & drop files or click to browse"}
          </span>
          <span className="text-[10px] text-neutral-500">
            Supports PDF, DOCX, Markdown, Text, Excel, PowerPoint (max 50MB)
          </span>
        </div>

        {/* Upload List */}
        {files.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Selected Files
            </h4>
            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col p-3 rounded-lg border border-neutral-900 bg-neutral-900/30 gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <File className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-neutral-200 truncate w-64">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {file.status === "idle" && (
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        disabled={isUploading}
                        className="text-neutral-500 hover:text-rose-500 p-1 hover:bg-neutral-850 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {file.status === "uploading" && (
                      <span className="text-[10px] text-amber-500 font-semibold">
                        {file.progress}%
                      </span>
                    )}
                    {file.status === "confirming" && (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                        <span className="text-[10px] text-neutral-400">Processing...</span>
                      </div>
                    )}
                    {file.status === "success" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {file.status === "error" && (
                      <span title={file.error}>
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {file.status === "uploading" && (
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Footer */}
        {hasStaging && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-900">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-600 transition-colors shadow-lg cursor-pointer disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-950" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Confirm & Upload {stagedFiles.length} {stagedFiles.length === 1 ? "file" : "files"}</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
