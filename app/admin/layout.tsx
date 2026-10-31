import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-[#111827] text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-800">
        <div className="flex items-center gap-8">
          <span className="text-emerald-400 font-bold tracking-widest text-xs flex items-center gap-2 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Trendifacts Publishing Desk
          </span>

          <div className="hidden sm:flex gap-6 items-center">
            <Link href="/admin" className="text-sm font-bold text-white hover:text-emerald-400 transition">
              Unified Workspace
            </Link>
            <Link href="/" target="_blank" className="text-sm font-medium text-gray-300 hover:text-white transition">
              View Live Site ↗
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}