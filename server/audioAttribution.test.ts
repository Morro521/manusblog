import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("音乐播放列表与实时歌词契约", () => {
  it("使用用户确认可用的 morro.asia 顺序歌单，并保持访客主动播放", () => {
    const layout = read("client/src/components/BlogLayout.tsx");
    const compactPlayer = read("client/src/components/CompactMusicPlayer.tsx");
    const fullPlayer = read("client/src/components/FullMusicPlayer.tsx");
    const playlist = read("client/src/lib/musicPlaylist.ts");

    expect(playlist).toContain("https://morro.asia/music/");
    expect(playlist).toContain('coverUrl: "/manus-storage/love-song_580291b0.jpg"');
    expect(playlist).toContain('coverUrl: "/manus-storage/faruxue_31157853.jpg"');
    expect(playlist.match(/id: "/g)).toHaveLength(7);
    expect(layout).toContain("onEnded={() => moveTrack(1, true)}");
    expect(fullPlayer).toContain("正在读取歌词…");
    expect(fullPlayer).toContain("原始内嵌封面");
    expect(layout).toContain("CompactMusicPlayer");
    expect(layout).toContain("consumeDragClick");
    expect(layout).toContain("playerLevel === 3");
    expect(layout).toContain("setPlayerLevel(2)");
    expect(layout).toContain("FullMusicPlayer");
    expect(layout).toContain("getFullPanelPosition");
    expect(layout).toContain("openFullPanel");
    expect(fullPlayer).toContain("选择歌曲");
    expect(fullPlayer).toContain("返回二级播放控制");
    expect(compactPlayer).toContain("可拖拽的紧凑音乐播放器");
    expect(compactPlayer).toContain("onPointerDown={(event) => { activate(); onDragStart(event); }}");
    expect(compactPlayer).toContain("compact-music-player--idle");
    expect(compactPlayer).toContain("compact-music-player--active");
    expect(compactPlayer).toContain("closeOnExternalPointer");
    expect(compactPlayer).toContain("w-fit max-w");
    expect(compactPlayer).toContain('type="range"');
    expect(compactPlayer).toContain("在收起态拖动播放进度");
    expect(compactPlayer).toContain('aria-label="上一首"');
    expect(compactPlayer).toContain('aria-label="下一首"');
    expect(layout).not.toContain("autoPlay");
  });

  it("记录用户确认的来源以及实时歌词播放方式", () => {
    const attributions = read("ATTRIBUTIONS.md");
    expect(attributions).toContain("morro.asia/music/");
    expect(attributions).toContain("站点所有者已于 2026-08-15 确认");
    expect(attributions).toContain("LRC 时间轴");
  });
});
