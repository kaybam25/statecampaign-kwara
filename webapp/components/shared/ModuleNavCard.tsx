"use client";

import Link from "next/link";

export default function ModuleNavCard({
  href,
  title,
  description,
  color,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  color: string; // hex
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-white" style={{ backgroundColor: color }}>
        {title}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-zinc-500">{description}</p>
        <div className="mt-auto flex items-center justify-between">
          {badge && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">{badge}</span>}
          <span className="ml-auto text-xs font-semibold opacity-0 transition group-hover:opacity-100" style={{ color }}>
            Open &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
