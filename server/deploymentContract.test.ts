import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const readProjectFile = (file: string) => fs.readFileSync(path.join(projectRoot, file), "utf8");

describe("fnos deployment contract", () => {
  it("builds the complete Node application in the image and starts the compiled server", () => {
    const dockerfile = readProjectFile("Dockerfile");

    expect(dockerfile).toContain("FROM node:22-slim");
    expect(dockerfile).toContain("COPY . .");
    expect(dockerfile).toContain("corepack pnpm install --frozen-lockfile");
    expect(dockerfile).toContain("corepack pnpm run build");
    expect(dockerfile).toContain('CMD ["node", "dist/index.js"]');
    expect(dockerfile).not.toContain("/app/client/dist");
  });

  it("connects the app to the compose-managed MySQL service only after its health check", () => {
    const compose = readProjectFile("docker-compose.yml");

    expect(compose).toContain("@mysql:3306/");
    expect(compose).toContain("condition: service_healthy");
    expect(compose).toContain('"3000:3000"');
  });
});
