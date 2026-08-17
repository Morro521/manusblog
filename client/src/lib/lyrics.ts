export type LyricLine = { time: number; text: string };

const timestampPattern = /\[(\d+):(\d+(?:\.\d+)?)\]/g;

export function parseLrc(source: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const sourceLine of source.split(/\r?\n/)) {
    const text = sourceLine.replace(timestampPattern, "").trim();
    timestampPattern.lastIndex = 0;
    if (!text) continue;
    const timestamps = Array.from(sourceLine.matchAll(timestampPattern));
    for (const match of timestamps) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      if (Number.isFinite(minutes) && Number.isFinite(seconds)) lines.push({ time: minutes * 60 + seconds, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function getLyricAtTime(lines: LyricLine[], time: number): string {
  if (!lines.length) return "歌词正在加载…";
  let current = lines[0];
  for (const line of lines) {
    if (line.time > time) break;
    current = line;
  }
  return current.text;
}
