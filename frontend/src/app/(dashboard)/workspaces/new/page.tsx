"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

import { workspaceService } from "@/services/workspace-service";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function NewWorkspacePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useWorkspaceStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🐝");

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description: string; icon: string }) =>
      workspaceService.createWorkspace(payload, getToken),
    onSuccess: (data) => {
      toast.success("Workspace created successfully!");
      // Set active workspace
      setActiveWorkspace(data);
      // Invalidate workspaces list
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      // Redirect to chat
      router.push(`/workspaces/${data.id}/chat`);
    },
    onError: (error) => {
      console.error("Failed to create workspace:", error);
      toast.error("Failed to create workspace. Try another name.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Workspace name is required.");
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim(),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div className="flex items-center gap-4">
        <Link
          href="/workspaces"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-100">
            Create Workspace
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Set up a separate environment for your team's knowledge
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 shadow-2xl backdrop-blur-md relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            {/* Icon Picker */}
            <div className="col-span-1 space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Icon
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 text-center text-2xl focus:outline-hidden focus:border-amber-500/50"
              />
            </div>

            {/* Name */}
            <div className="col-span-3 space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Workspace Name
              </label>
              <input
                type="text"
                placeholder="e.g. Finance, Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg py-2 px-3 text-sm focus:outline-hidden focus:border-amber-500/50 placeholder:text-neutral-600"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Description
            </label>
            <textarea
              placeholder="Provide a brief overview of what this workspace contains..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={255}
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg py-2 px-3 text-sm focus:outline-hidden focus:border-amber-500/50 placeholder:text-neutral-600 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-900">
            <Link
              href="/workspaces"
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
