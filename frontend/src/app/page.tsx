"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Shield,
  Cpu,
  Database,
  CloudLightning,
  ChevronRight,
  ArrowUpRight,
  Upload,
  Lock,
  Terminal,
  Activity,
  Layers,
  HardDrive,
} from "lucide-react";
import { BeeIcon } from "@/components/icons";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const [pipelineStep, setPipelineStep] = useState(0);

  // Cycle through pipeline steps in mock UI
  useEffect(() => {
    const timer = setInterval(() => {
      setPipelineStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const pipeline = [
    {
      title: "Document Uploaded",
      desc: "User uploads Q3_Financials.pdf to workspace.",
      status: "Ingesting to AWS S3 Private Bucket...",
      icon: <Upload className="h-5 w-5 text-cyan-400" />,
    },
    {
      title: "Local Document Parsing",
      desc: "FastAPI extracts and chunks text using background tasks.",
      status: "Parsed into 48 semantic chunks...",
      icon: <Layers className="h-5 w-5 text-purple-400" />,
    },
    {
      title: "Vector Store Ingestion",
      desc: "ChromaDB vector database stores the generated embeddings.",
      status: "Local ChromaDB database updated successfully.",
      icon: <Database className="h-5 w-5 text-emerald-400" />,
    },
    {
      title: "Secure Query Response",
      desc: "Groq LLM generates final answer using retrieved context.",
      status: "Answer returned in 410ms with zero data leakage.",
      icon: <CloudLightning className="h-5 w-5 text-amber-400" />,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#07090e] text-neutral-100 overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-950/20 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-neutral-900 bg-[#07090e]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <BeeIcon className="h-8 w-8 text-amber-500 flex-shrink-0 animate-pulse" />
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                BetterBee
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#metrics" className="hover:text-cyan-400 transition-colors">Performance</a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">Security Architecture</a>
          </nav>

          <div className="flex items-center gap-4">
            {isLoaded && (
              <>
                {!isSignedIn ? (
                  <>
                    <Link href="/sign-in">
                      <button className="px-4 py-2 text-sm font-semibold border border-neutral-800 rounded-lg hover:bg-neutral-950 transition-all cursor-pointer">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/workspaces">
                      <button className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 hover:from-cyan-400 hover:to-blue-500 rounded-lg shadow-lg shadow-cyan-500/10 cursor-pointer">
                        Get Started
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/workspaces">
                      <button className="px-4 py-2 text-sm font-semibold border border-cyan-800/50 hover:border-cyan-500 text-cyan-400 rounded-lg hover:bg-cyan-950/20 transition-all flex items-center gap-1.5 cursor-pointer">
                        Go to Dashboard <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-xs font-semibold text-cyan-400 mb-2">
            <Lock className="h-3 w-3 animate-pulse" /> 100% Secure, Self-Hosted RAG Stack
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent leading-[1.1]">
            Your Private AI Workspace
          </h1>
          <p className="text-lg text-neutral-400 leading-relaxed">
            Take complete control of your data. BetterBee lets you ingest private documents, build localized vector databases, and run queries using ultra-fast cloud LLMs with absolutely zero data leakage. Fully optimized to run on low-resource environments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/workspaces">
              <button className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-[#00dbe9] hover:bg-[#2feeff] text-neutral-950 rounded-xl shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                Launch Workspace <ChevronRight className="h-5 w-5" />
              </button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 text-base font-semibold border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 rounded-xl transition-all cursor-pointer">
                Explore Features
              </button>
            </a>
          </div>
        </motion.div>

        {/* Mock UI Pipeline Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 max-w-4xl mx-auto rounded-2xl border border-neutral-900 bg-[#0f1118]/80 backdrop-blur-sm p-6 shadow-2xl shadow-black/60 text-left"
        >
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-full bg-red-500/80" />
              <div className="h-3.5 w-3.5 rounded-full bg-yellow-500/80" />
              <div className="h-3.5 w-3.5 rounded-full bg-green-500/80" />
              <span className="text-xs text-neutral-500 font-mono ml-4">RAG Pipeline Monitor</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/30 text-[10px] font-mono text-cyan-400">
              <Terminal className="h-3 w-3" /> system_active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {pipeline.map((step, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  pipelineStep === idx
                    ? "border-cyan-500/40 bg-cyan-950/20 shadow-lg shadow-cyan-500/5"
                    : "border-neutral-800/60 bg-neutral-900/40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    pipelineStep === idx ? "bg-cyan-950/60" : "bg-neutral-800/40"
                  }`}>
                    {step.icon}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">0{idx + 1}</span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-200">{step.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">{step.desc}</p>
                {pipelineStep === idx && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-[10px] font-mono text-cyan-400 border-t border-cyan-500/10 pt-2.5"
                  >
                    {step.status}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="metrics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-900">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { metric: "0%", title: "AI Model Training Leakage", desc: "No data is sent to external training datasets." },
            { metric: "< 0.6s", title: "Free Tier Server Boot Speed", desc: "Optimized lazy loading prevents boot OOMs." },
            { metric: "~270 MB", title: "Runtime In-Memory Footprint", desc: "Comfortably runs under the 512MB Render limit." },
            { metric: "100%", title: "File & Vector DB Ownership", desc: "All indexes are saved directly in your control." },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2 text-center md:text-left">
              <div className="text-4xl md:text-5xl font-extrabold text-cyan-400 font-mono tracking-tight">{item.metric}</div>
              <h4 className="text-sm font-bold text-neutral-300">{item.title}</h4>
              <p className="text-xs text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-neutral-900 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-200">
            Engineered for Privacy, Speed, and Efficiency
          </h2>
          <p className="text-neutral-400">
            We stripped out the heavy dependencies and rebuilt the pipeline to fit low-resource servers without removing core functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Cpu className="h-6 w-6 text-cyan-400" />,
              title: "Local HuggingFace Embeddings",
              desc: "Generate vectors offline using `all-MiniLM-L6-v2` directly inside the Python process. Completely free and secure.",
            },
            {
              icon: <Activity className="h-6 w-6 text-purple-400" />,
              title: "Bypass Reranker Settings",
              desc: "Save 180MB+ of RAM by choosing the lightweight Bypass Reranker option (`RERANKER_PROVIDER=none`), avoiding model bloat.",
            },
            {
              icon: <Database className="h-6 w-6 text-emerald-400" />,
              title: "FastAPI Background Ingest",
              desc: "No paid Celery worker services needed. All files are split and ingested in background thread tasks safely.",
            },
            {
              icon: <HardDrive className="h-6 w-6 text-blue-400" />,
              title: "AWS S3 Private Storage",
              desc: "Uploaded files are securely stored in your private AWS S3 bucket, retrieved temporarily using pre-signed links.",
            },
            {
              icon: <Shield className="h-6 w-6 text-amber-400" />,
              title: "PgBouncer Compatibility",
              desc: "Prepared statement cache disabled for `asyncpg` to guarantee database stability under transaction pooling.",
            },
            {
              icon: <CloudLightning className="h-6 w-6 text-cyan-400" />,
              title: "Ultra-Fast Groq Integration",
              desc: "Leverages the Groq API to query state-of-the-art models like Llama-3 in milliseconds for zero local LLM RAM overhead.",
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-neutral-900/60 bg-[#0f1118]/40 hover:border-neutral-800 transition-all duration-300 space-y-4 hover:shadow-lg hover:shadow-cyan-950/5 group"
            >
              <div className="p-3 bg-neutral-900 rounded-xl w-fit group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-lg font-semibold text-neutral-200">{feat.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Architecture Flow */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-neutral-900 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-200">
            How Your Data Remains 100% Private
          </h2>
          <p className="text-neutral-400">
            BetterBee isolates documents and database indexes within your private workspace.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto p-8 rounded-2xl border border-neutral-900 bg-[#0c0e14] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/10 to-blue-950/10 opacity-30" />
          
          <div className="relative space-y-8 z-10">
            {[
              {
                title: "1. Isolated Upload",
                desc: "Documents are uploaded directly from your browser to your private S3 bucket. No third-party servers ever read the file keys.",
              },
              {
                title: "2. Encrypted Parsing & Embedding",
                desc: "Your self-hosted FastAPI server downloads and splits the file. Embedding vectors are generated locally or via secure API endpoints.",
              },
              {
                title: "3. Local Vector Storage",
                desc: "Embeddings are indexed locally in ChromaDB and mapped directly to your workspace. They never leave your private server database.",
              },
              {
                title: "4. Anonymized LLM Prompts",
                desc: "Queries fetch matching context from ChromaDB. Only the raw context and question are sent to the Groq API, with strict privacy switches to prevent data logging.",
              },
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full border border-cyan-500/30 bg-cyan-950/50 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
                    {idx + 1}
                  </div>
                  {idx < 3 && <div className="w-0.5 bg-neutral-800 flex-grow my-2" />}
                </div>
                <div className="space-y-1 pt-0.5">
                  <h4 className="text-md font-bold text-neutral-200">{step.title}</h4>
                  <p className="text-sm text-neutral-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="bg-gradient-to-b from-[#07090e] to-[#0c101a] py-20 border-t border-neutral-900 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-cyan-950/10 blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-200">
            Secure Your Knowledge Base Today
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto">
            Self-host BetterBee on Render, Railway, or fly.io and experience private document intelligence with zero overhead.
          </p>
          <div className="flex justify-center">
            <Link href="/workspaces">
              <button className="px-8 py-4 text-base font-semibold bg-[#00dbe9] hover:bg-[#2feeff] text-neutral-950 rounded-xl shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer">
                Enter App Workspace <ArrowUpRight className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-950 bg-[#05060a] py-8 text-center text-xs text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BeeIcon className="h-4 w-4 text-neutral-600" />
            <span className="font-semibold text-neutral-500">BetterBee</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} BetterBee Private AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
