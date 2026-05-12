import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-white/10 bg-black/60">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] uppercase tracking-widest text-slate-400">
        <span>{match?.[1] || "code"}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <SyntaxHighlighter
        language={match?.[1] || "text"}
        style={oneDark}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "12px 14px",
          fontSize: "13px",
          background: "transparent",
        }}
        codeTagProps={{ style: { fontFamily: '"JetBrains Mono", ui-monospace, monospace' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
