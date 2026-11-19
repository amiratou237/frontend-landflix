import { describe, expect, it } from "vitest";
import { normalizeApiResponse } from "@/lib/api/client";
import {
  mediaSchema,
  providersSchema,
  releaseSchema,
  taskStatusSchema,
  uqVideoSchema,
} from "@/lib/api/schemas";

const video = {
  duration: 3600,
  image_url: null,
  resolution: "1080p",
  size_in_bytes: 1_048_576,
  title: "Épisode pilote",
  type: "mp4",
  url: "https://uqload.example/file",
  html_url: "https://uqload.example/embed",
};

describe("schémas API tolérants", () => {
  it("accepte les champs média nullables et des champs tiers supplémentaires", () => {
    expect(
      mediaSchema.parse({
        title: "Futurama",
        url: null,
        image_url: null,
        extra: true,
      }),
    ).toMatchObject({ title: "Futurama", url: null });
  });

  it("accepte les scalaires vidéo en chaîne ou nombre et préserve les champs inconnus", () => {
    expect(
      uqVideoSchema.parse({ ...video, duration: "52 min", source: "tiers" }),
    ).toMatchObject({ duration: "52 min", source: "tiers" });
  });

  it("valide les fournisseurs et la version", () => {
    expect(
      providersSchema.safeParse({
        providers: ["french-stream"],
        default: "french-stream",
        status: {
          "french-stream": {
            status: "ok",
            base_url: "https://example.com",
            reason: "Disponible",
          },
        },
      }).success,
    ).toBe(true);
    expect(
      releaseSchema.parse({ latest_release_version: "unknown" })
        .latest_release_version,
    ).toBe("unknown");
  });

  it("valide les états pending, done et failed d’une tâche", () => {
    const base = {
      task_id: "550e8400-e29b-41d4-a716-446655440000",
      video_url: "https://uqload.example/embed",
    };
    expect(
      taskStatusSchema.parse({
        ...base,
        status: "pending",
        error: null,
        info: null,
      }).status,
    ).toBe("pending");
    expect(
      taskStatusSchema.parse({
        ...base,
        status: "done",
        error: null,
        info: video,
      }).info?.title,
    ).toBe("Épisode pilote");
    expect(
      taskStatusSchema.parse({
        ...base,
        status: "failed",
        error: "Échec",
        info: null,
      }).error,
    ).toBe("Échec");
  });
});

describe("normalisation ApiResult", () => {
  it("traite une erreur métier HTTP 200 comme business", () => {
    const result = normalizeApiResponse(
      200,
      {
        error: "Invalid video_url: only UQload links are supported.",
        status: "rejected",
      },
      uqVideoSchema,
    );
    expect(result).toMatchObject({
      ok: false,
      kind: "business",
      code: "rejected",
    });
  });

  it("distingue une tâche introuvable HTTP 200", () => {
    const result = normalizeApiResponse(
      200,
      { error: "Unknown task_id: abc", status: "not_found" },
      taskStatusSchema,
    );
    expect(result).toMatchObject({
      ok: false,
      kind: "business",
      code: "not_found",
    });
  });

  it("conserve le fournisseur invalide comme erreur métier HTTP 200", () => {
    const result = normalizeApiResponse(
      200,
      {
        error:
          "Invalid provider. Available providers: papadustream, french-stream, flemmix",
      },
      providersSchema,
    );
    expect(result).toMatchObject({
      ok: false,
      kind: "business",
      message:
        "Invalid provider. Available providers: papadustream, french-stream, flemmix",
    });
  });

  it("classe la validation 422, le réseau 502 et le timeout 504", () => {
    expect(
      normalizeApiResponse(
        422,
        {
          detail: [
            { loc: ["query", "query"], msg: "Field required", type: "missing" },
          ],
        },
        providersSchema,
      ),
    ).toMatchObject({ ok: false, kind: "validation" });
    expect(
      normalizeApiResponse(
        502,
        { error: "backend_unreachable" },
        providersSchema,
      ),
    ).toMatchObject({ ok: false, kind: "network" });
    expect(
      normalizeApiResponse(504, { error: "backend_timeout" }, providersSchema),
    ).toMatchObject({ ok: false, kind: "timeout" });
  });

  it("rejette les réponses 200 incompatibles avec le schéma attendu", () => {
    expect(
      normalizeApiResponse(200, { results: [null] }, providersSchema),
    ).toMatchObject({ ok: false, kind: "invalid_response" });
  });
});
