import { ExternalLink, Globe } from "lucide-react";

export default function SearchResults({ result }) {
  if (!result || !result.results?.length) return null;
  return (
    <div className="mb-3 rounded-xl border border-neon-blue/30 bg-neon-blue/[0.04] p-3">
      <div className="flex items-center gap-2 text-xs text-neon-blue/90 uppercase tracking-widest">
        <Globe size={14} />
        <span>Web sources for "{result.query}"</span>
      </div>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {result.results.slice(0, 6).map((r, i) => (
          <li key={r.url + i}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border border-white/10 bg-white/[0.03] p-2 hover:border-neon-blue/40 hover:bg-white/[0.06] transition"
            >
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-500">
                <span>{i + 1}</span>
                <span className="truncate">{safeHost(r.url)}</span>
                <ExternalLink size={10} className="ml-auto opacity-60 group-hover:opacity-100" />
              </div>
              <div className="mt-1 text-sm text-slate-200 line-clamp-2">{r.title}</div>
              {r.content && (
                <div className="mt-1 text-xs text-slate-400 line-clamp-2">{r.content}</div>
              )}
            </a>
          </li>
        ))}
      </ul>
      {result.answer && (
        <div className="mt-2 rounded-lg bg-white/[0.03] p-2 text-xs text-slate-300">
          <span className="text-neon-blue mr-1">Tavily summary:</span>
          {result.answer}
        </div>
      )}
    </div>
  );
}

function safeHost(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
