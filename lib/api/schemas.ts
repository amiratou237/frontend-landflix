import { z } from "zod";

const nullableText = z
  .string()
  .nullable()
  .optional()
  .transform((value) => value ?? null);
const nullableScalar = z
  .union([z.string(), z.number()])
  .nullable()
  .optional()
  .transform((value) => value ?? null);

export const mediaSchema = z
  .object({
    title: z.string(),
    url: nullableText,
    image_url: nullableText,
  })
  .passthrough();

export const uqVideoSchema = z
  .object({
    duration: nullableScalar,
    image_url: nullableText,
    resolution: nullableText,
    size_in_bytes: nullableScalar,
    title: nullableText,
    type: nullableText,
    url: nullableText,
    html_url: z.string(),
  })
  .passthrough();

export const providersSchema = z
  .object({
    providers: z.array(z.string()),
    default: z.string(),
    status: z.record(
      z.string(),
      z
        .object({
          status: z.string(),
          base_url: z.string(),
          reason: z.string(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const searchResponseSchema = z
  .object({ results: z.array(mediaSchema) })
  .passthrough();
export const videosResponseSchema = z
  .object({ results: z.array(uqVideoSchema) })
  .passthrough();

export const taskStatusSchema = z
  .object({
    task_id: z.string(),
    status: z.enum(["pending", "done", "failed"]),
    video_url: z.string(),
    error: z.string().nullable(),
    info: uqVideoSchema.nullable(),
  })
  .passthrough();

export const resolveAcceptedSchema = z
  .object({
    status: z.literal("accepted"),
    task_id: z.string(),
    video_url: z.string(),
  })
  .passthrough();

export const releaseSchema = z
  .object({ latest_release_version: z.string() })
  .passthrough();

export const backendErrorSchema = z
  .object({
    error: z.string(),
    status: z.string().optional(),
  })
  .passthrough();

export type Media = z.infer<typeof mediaSchema>;
export type UqVideo = z.infer<typeof uqVideoSchema>;
export type ProvidersResponse = z.infer<typeof providersSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type ResolveAccepted = z.infer<typeof resolveAcceptedSchema>;
export type ApiError = z.infer<typeof backendErrorSchema>;
