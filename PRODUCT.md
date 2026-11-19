# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS; delegated in the supplied implementation brief.

## Users

A single personal user at a time, searching film and series catalogs without an account.

## Product Purpose

Streams DL lets the user search one of three streaming catalog providers, inspect extracted UQload links, and optionally refresh a link's video information.

## Positioning

The user selects the catalog source and the interface carries the chosen result through link extraction and optional UQload metadata resolution.

## Operating Context

The user runs a local FastAPI backend and a local frontend. Scraping may take a minute or more and backend requests are serialized through one shared browser.

## Capabilities and Constraints

Providers are `french-stream`, `papadustream`, and `flemmix`. The browser accesses the backend only through same-origin Next.js route handlers because the backend has no CORS configuration. The backend's `/download` endpoint resolves video information and does not download a file. Resolve tasks are held in memory and can disappear after a backend restart. Provider status is declarative, not a live health check. API video fields are nullable and third-party shaped. Responses may carry business errors with HTTP 200.

## Brand Commitments

No existing brand assets or visual identity must be preserved. The user delegated a restrained identity to the implementation.

## Evidence on Hand

The supplied API contract and sample responses are the source of truth. No backend implementation, logo, or catalog data was supplied; do not invent them.

## Product Principles

- Keep the search-to-video path direct.
- Make long scraping waits and recoverable errors clear.
- Preserve the selected provider and search in the URL.
- Show uncertain or declarative data as such.
- Never imply that resolving metadata downloads a file.

## Accessibility & Inclusion

French interface, keyboard focus visibility, associated form labels, polite live status updates, accessible contrast, and touch targets of at least 40 px are required.
