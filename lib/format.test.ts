import { describe, expect, it } from "vitest";
import { formatBytes, formatDuration } from "@/lib/format";

describe("formatBytes", () => {
  it("gère les valeurs absentes, les octets et les unités", () => {
    expect(formatBytes(null)).toBe("Taille inconnue");
    expect(formatBytes("taille inconnue")).toBe("taille inconnue");
    expect(formatBytes(512)).toBe("512 o");
    expect(formatBytes(1_048_576)).toBe("1 Mo");
  });
});

describe("formatDuration", () => {
  it("gère les valeurs absentes, brutes et numériques", () => {
    expect(formatDuration(null)).toBe("Durée inconnue");
    expect(formatDuration("52 min")).toBe("52 min");
    expect(formatDuration(65)).toBe("1 min 05 s");
    expect(formatDuration(3661)).toBe("1 h 01 min");
  });
});
