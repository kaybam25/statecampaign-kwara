"use client";

export type Crumb = {
  label: string;
  onClick: () => void;
};

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          <button
            onClick={c.onClick}
            className={
              i === crumbs.length - 1
                ? "font-semibold text-co-navy"
                : "text-zinc-500 hover:text-co-orange hover:underline"
            }
          >
            {c.label}
          </button>
          {i < crumbs.length - 1 && <span className="text-zinc-300">/</span>}
        </span>
      ))}
    </nav>
  );
}
