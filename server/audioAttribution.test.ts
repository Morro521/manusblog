import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("ambient audio attribution", () => {
  it("uses a project-hosted licensed asset instead of a third-party example track", () => {
    const layout = read("client/src/components/BlogLayout.tsx");

    expect(layout).toContain('src="/manus-storage/smile-drone-ambient_a15c3c11.mp3"');
    expect(layout).not.toContain("soundhelix.com");
    expect(layout).toContain("audioRef.current.play()");
    expect(layout).not.toContain("autoPlay");
  });

  it("records the artist, original source, and CC BY-SA 4.0 license", () => {
    const attributions = read("ATTRIBUTIONS.md");

    expect(attributions).toContain("Adrian Diaz");
    expect(attributions).toContain("Smile Drone");
    expect(attributions).toContain("CC BY-SA 4.0");
    expect(attributions).toContain("archive.org/details/100_free_royalty_background_music_tracks");
  });
});
