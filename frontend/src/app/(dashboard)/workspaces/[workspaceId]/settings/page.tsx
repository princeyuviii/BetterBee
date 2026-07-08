"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Save, Trash2, Loader2, AlertTriangle, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { workspaceService } from "@/services/workspace-service";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useWorkspaceStore();

  const workspaceId = params.workspaceId as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🐝");
  const [confirmDeleteName, setConfirmDeleteName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch current workspace details
  const { data: workspace, isLoading } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspace(workspaceId, getToken),
    enabled: !!workspaceId,
  });

  // Populate form values when data loaded
  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description || "");
      setIcon(workspace.icon || "🐝");
    }
  }, [workspace]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; description: string; icon: string }) =>
      workspaceService.updateWorkspace(workspaceId, payload, getToken),
    onSuccess: (data) => {
      toast.success("Workspace updated successfully!");
      setActiveWorkspace(data);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    },
    onError: (error) => {
      console.error("Failed to update workspace:", error);
      toast.error("Failed to update workspace. Try another name.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => workspaceService.deleteWorkspace(workspaceId, getToken),
    onSuccess: () => {
      toast.success("Workspace deleted successfully.");
      setActiveWorkspace(null);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      router.push("/workspaces");
    },
    onError: (error) => {
      console.error("Failed to delete workspace:", error);
      toast.error("Failed to delete workspace. Try again.");
    },
  });

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Workspace name is required.");
      return;
    }
    updateMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim(),
    });
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmDeleteName !== workspace?.name) {
      toast.error("Workspace name does not match confirmation.");
      return;
    }
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">Workspace not found.</p>
        <Link href="/workspaces" className="mt-4 inline-block text-amber-500 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/workspaces/${workspaceId}/chat`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-100 flex items-center gap-2">
            <Settings className="h-7 w-7 text-neutral-500" />
            Workspace Settings
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Modify workspace preferences, appearance, and lifecycle.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-8 shadow-2xl backdrop-blur-md">
        <form onSubmit={handleUpdateSubmit} className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            {/* Icon */}
            <div className="col-span-1 space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                Icon
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-lg py-2 text-center text-2xl focus:outline-hidden focus:border-amber-500/50"
              />
            </div>

            {/* Name */}
            <div className="col-span-3 space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                Workspace Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-lg py-2 px-3 text-sm focus:outline-hidden focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={255}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-lg py-2 px-3 text-sm focus:outline-hidden focus:border-amber-500/50 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-900">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-400">Danger Zone</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              Permanently delete this workspace and all associated documents, vector databases, and conversation histories. This action is irreversible.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-rose-500/10 pt-4">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Workspace</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h4 className="text-lg font-bold">Are you absolutely sure?</h4>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              This will permanently delete the workspace <strong className="text-neutral-200">"{workspace.name}"</strong>, including all of its files and indexes. 
            </p>

            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Type <span className="text-neutral-200 select-none">"{workspace.name}"</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={confirmDeleteName}
                  onChange={(e) => setConfirmDeleteName(e.target.value)}
                  placeholder={workspace.name}
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg py-2 px-3 text-sm focus:outline-hidden focus:border-rose-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setConfirmDeleteName("");
                  }}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteMutation.isPending || confirmDeleteName !== workspace.name}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Workspace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
