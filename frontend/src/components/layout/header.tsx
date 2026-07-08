"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { CommandPalette } from "./command-palette";

export function Header() {
  const { activeWorkspace } = useWorkspaceStore();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Setup Command+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-neutral-900 bg-neutral-950/80 px-6 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-300">
            {activeWorkspace ? activeWorkspace.name : "Dashboard"}
          </span>
          {activeWorkspace && (
            <>
              <span className="text-neutral-600">/</span>
              <span className="text-xs text-neutral-500 font-medium">
                {activeWorkspace.slug}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Global Search CMD+K Trigger */}
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-800 transition-colors w-48 text-left cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Quick search...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-sm bg-neutral-800 px-1.5 font-mono text-[10px] font-medium text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* Clerk User Button for Profile & Logout */}
          <div className="flex items-center pl-2 border-l border-neutral-800">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8 hover:opacity-80 transition-opacity",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </>
  );
}
