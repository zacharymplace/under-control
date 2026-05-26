# Playable v0.1 Feel Pass Brief

## Purpose

This branch is the first Claude-executable gameplay feel pass after the repo reached zero lint debt and received Claude handoff instructions.

## Goal

Make the playable loop clearer and more intentional without changing core scoring semantics.

## Scope

Allowed:
- improve first 3–5 turn player guidance
- clarify action consequence language
- improve immediate feedback wording
- improve player understanding of load, drift, signal, and integrity
- make existing UI states easier to read

Avoid unless explicitly approved:
- changing scoring constants
- changing action outcome math
- changing scenario model shape
- changing release readiness
- introducing new routes
- broad UI redesign

## Working Rules

- GitHub remains source of truth.
- Keep edits narrow.
- Preserve zero lint debt.
- Run validation before completion.

## Required Validation

    npm run release:ready
    npm run pr:cleanup-check

## Suggested Claude Prompt

You are working in the Under Control repo. Read CLAUDE.md and docs/CLAUDE_HANDOFF.md first.

Create a narrow gameplay feel pass for playable v0.1. Focus on making the first 3–5 turns more understandable and making action consequences clearer. Do not change scoring constants, action math, release readiness, routes, or scenario model shape unless explicitly necessary. Preserve zero lint debt.

Before completion, run:

    npm run release:ready
    npm run pr:cleanup-check

Then summarize exactly what changed, what did not change, and what the next safest branch should be.
