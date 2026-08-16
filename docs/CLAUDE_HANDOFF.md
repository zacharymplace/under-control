# Claude Repo Handoff

## Purpose

This repo is ready for Claude-assisted implementation work after reaching a zero-lint baseline.

Claude should be used for local repo execution, multi-file edits, implementation passes, and validation loops.

GitHub remains the source of truth.

## Current Guardrail

Zero lint is now part of release readiness.

Required validation:

    npm run release:ready

This runs:

    npm run check
    npm run lint:debt
    npm run lint:debt:baseline

## Operating Model

Use Claude for:
- narrow code edits
- typed refactors
- component cleanup
- implementation passes
- test and validation loops

Use strategic review before:
- gameplay scoring changes
- architecture changes
- release gate changes
- scenario model changes
- major UI flow changes

## Recommended Next Branch

    gameplay/playable-v01-feel-pass

Goal:
- make the playable loop feel clearer and more intentional
- improve player understanding of early turns
- sharpen action feedback
- avoid changing the core scoring model unless explicitly scoped

## Completion Standard

A Claude-assisted branch is not complete until:

    npm run release:ready
    npm run pr:cleanup-check

both pass.
