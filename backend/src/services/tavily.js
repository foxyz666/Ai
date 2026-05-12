// Wrapper around Tavily Search API: https://docs.tavily.com/

const TAVILY_URL = "https://api.tavily.com/search";

export async function tavilySearch({ query, maxResults = 5, includeAnswer = true, signal }) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    const err = new Error("TAVILY_API_KEY is not configured on the server.");
    err.status = 500;
    err.code = "tavily_not_configured";
    throw err;
  }

  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: maxResults,
      include_answer: includeAnswer,
      search_depth: "basic",
    }),
    signal,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `Tavily request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return {
    query,
    answer: data.answer || "",
    results: (data.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
    })),
  };
}

// Build a compact context string the LLM can use when responding.
export function buildSearchContext(search) {
  if (!search || !search.results?.length) return "";
  const lines = [
    `You have access to up-to-date web search results for the user's query: "${search.query}".`,
    "Use them to answer accurately and cite sources by title. Do not fabricate URLs.",
    "",
    "Search results:",
  ];
  search.results.forEach((r, i) => {
    lines.push(`[${i + 1}] ${r.title} — ${r.url}`);
    if (r.content) lines.push(r.content.slice(0, 500));
    lines.push("");
  });
  if (search.answer) {
    lines.push("Tavily summary:");
    lines.push(search.answer);
  }
  return lines.join("\n");
}
