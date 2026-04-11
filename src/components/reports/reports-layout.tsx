"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReportsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function ReportsLayout({
  title,
  description,
  children,
  className,
}: ReportsLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-slate-50/50 pb-20", className)}>
      {/* Premium Masthead with Glassmorphism */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        {/* Abstract background elements for premium feel */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-6 py-12 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <nav className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                <Link
                  href="/dashboard/reports"
                  className="hover:text-blue-600 transition-colors font-medium"
                >
                  Reports
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-700 font-semibold">{title}</span>
              </nav>
              <div className="flex items-center space-x-2 text-blue-600 font-bold tracking-tight text-xs uppercase mb-1">
                <div className="w-8 h-0.5 bg-blue-600 rounded-full" />
                <span>Reports & Analytics</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none group">
                {title}
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
              {description && (
                <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Contextual indicators could go here */}
            <div className="hidden lg:flex items-center space-x-4 text-slate-400 text-sm">
              <div className="flex flex-col items-end">
                <span className="font-bold text-slate-600">Dynamic Sync</span>
                <span>Updates in real-time</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col items-end">
                <span className="font-bold text-slate-600 uppercase tracking-widest text-[10px]">
                  Version
                </span>
                <span>v2.0 Beta</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-[1600px] mx-auto px-6 -mt-8 relative z-10">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
