import type { ReactNode } from "react";
import Link from "next/link";
import { BeeIcon } from "@/components/icons";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-radial from-neutral-900 via-neutral-950 to-black text-neutral-100 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity focus-visible:outline-hidden"
          >
            <BeeIcon className="h-10 w-10 text-amber-500 animate-pulse" />
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              BetterBee
            </span>
          </Link>
          <p className="mt-2 text-sm text-neutral-400 font-medium">
            Your team's private AI workspace
          </p>
        </div>

        <div className="relative">
          {/* Decorative background glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-2xl backdrop-blur-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
