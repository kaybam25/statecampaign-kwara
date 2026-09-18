import Link from "next/link";
import type { ReactNode } from "react";
import PdpStrip from "./PdpStrip";

export default function ModuleShell({
  title,
  subtitle,
  color,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  color: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <PdpStrip />
      <header className="mb-6 flex items-center justify-between rounded-xl px-6 py-5 text-white" style={{ backgroundColor: color }}>
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-xs text-white/80">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <Link href="/" className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25">
            &larr; All modules
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
