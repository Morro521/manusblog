export type HitokotoQuote = {
  text: string;
  source: string;
  fallback: boolean;
};

export type QuoteFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const HITOKOTO_URL = "https://v1.hitokoto.cn?max_length=24";
const fallbackQuote: HitokotoQuote = {
  text: "一言服务暂时不可用，先把眼前的问题看清。",
  source: "MorroBlog · 本地回退",
  fallback: true,
};

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function getHitokotoQuote(fetchImpl: QuoteFetch = fetch): Promise<HitokotoQuote> {
  try {
    const response = await fetchImpl(HITOKOTO_URL, { signal: AbortSignal.timeout(3500) });
    if (!response.ok) return fallbackQuote;

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object") return fallbackQuote;
    const record = payload as Record<string, unknown>;
    const text = readText(record.hitokoto);
    const source = readText(record.from);
    if (!text || text.length > 80) return fallbackQuote;

    return {
      text,
      source: source || "未署名",
      fallback: false,
    };
  } catch {
    return fallbackQuote;
  }
}
