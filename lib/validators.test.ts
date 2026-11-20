import { describe, expect, it } from "vitest";
import {
  validateHttpUrl,
  validateProvider,
  validateQuery,
  validateTaskId,
} from "@/lib/validators";

describe("validation des entrées proxy", () => {
  it("trimme et borne les recherches", () => {
    expect(validateQuery(" Futurama ")).toEqual({
      ok: true,
      value: "Futurama",
    });
    expect(validateQuery("  ").ok).toBe(false);
    expect(validateQuery("x".repeat(201)).ok).toBe(false);
  });

  it("accepte seulement un nom fournisseur slugifié", () => {
    expect(validateProvider("french-stream").ok).toBe(true);
    expect(validateProvider("French Stream").ok).toBe(false);
  });

  it("limite les URL à http(s)", () => {
    expect(
      validateHttpUrl("https://catalogue.example/media/1", "media_url").ok,
    ).toBe(true);
    expect(validateHttpUrl("javascript:alert(1)", "media_url").ok).toBe(false);
    expect(validateHttpUrl("https://example.com/video", "video_url").ok).toBe(
      true,
    );
    expect(
      validateHttpUrl("https://uqload.example/embed", "video_url").ok,
    ).toBe(true);
  });

  it("borne et valide les identifiants de tâche", () => {
    expect(validateTaskId("550e8400-e29b-41d4-a716-446655440000").ok).toBe(
      true,
    );
    expect(validateTaskId("../../etc/passwd").ok).toBe(false);
  });
});
