---
name: backlog
description: Generate a dispatch-ready docs/BACKLOG.md from a list of features, and orchestrate building it with parallel subagents. Use when the user gives a list of features to plan/queue, asks to "build/work/run the backlog", or wants features implemented via coordinated subagents with per-feature commits. Handles both authoring the backlog and executing it as a DAG.
---

# Backlog: author + orchestrate

This skill has two modes. Detect which one the user wants:

- **AUTHOR mode** — the user hands you a list of features (or points at notes) and
  wants them turned into a structured `docs/BACKLOG.md`. Go to *Authoring*.
- **ORCHESTRATE mode** — a `docs/BACKLOG.md` already exists and the user says
  "work/build/run the backlog." Go to *Orchestrating*.

If both could apply (e.g. "here are my features, build them"), run AUTHOR first,
show the plan, then continue to ORCHESTRATE.

---

## Authoring

Goal: turn a loose feature list into a machine-parseable work queue. The file is a
**dispatch queue you will later parse**, not a human todo list — so IDs, dependencies,
and file-collision info are mandatory, not optional.

### Steps

1. **Read repo context first.** Read `CLAUDE.md` and `docs/PRD.md` (and skim the
   directory layout) so you can fill `Touches` with *real* paths and spot shared
   files that force sequencing. Never invent paths — grep/glob to confirm they exist
   or are the right place to add.
2. For each feature the user listed, write one block using the template below.
3. **Derive dependencies and collisions yourself** — don't ask the user to. A
   feature depends on another when it needs that one's code/data/endpoint to exist.
   Two features collide when their `Touches` sets intersect.
4. **Flag shared-file hotspots.** In this repo, `backend/data/alphabet_data.py` is
   the single source of truth for all letters — any two features editing it must be
   sequenced, never parallel. Watch for similar chokepoints (shared context,
   shared route files, shared migration).
5. Write `docs/BACKLOG.md`. Keep completed work in a `## Done` section at the bottom
   rather than deleting it — the git history of this file is a useful record.
6. Print the resulting **dependency plan** (see *Build the DAG*) so the user can
   sanity-check batching before anything runs.

### Feature block template

```markdown
## F-003: <short imperative title>

- **Status:** todo            # todo | in-progress | done | blocked
- **Depends on:** F-001, F-002   # feature IDs, or "none"
- **Parallel-safe:** yes      # no if it mutates global state / shared context
- **Touches:** backend/services/review.py, frontend/src/hooks/useReview.js
- **Done when:** <observable acceptance criteria; include the test/command that proves it>

### Context
2-4 sentences: the *why*, plus any decision already made so the subagent
doesn't re-litigate it (e.g. "use SM-2, not Leitner").

### Out of scope
What NOT to touch. Prevents a subagent from "improving" adjacent code and
bloating the diff. This is the highest-value field — always fill it.
```

### Field rules

- **ID** — stable, never renumber (`F-001`, `F-002`, ...). Dependencies reference
  these; renumbering breaks the graph.
- **Touches** — best-effort list of files/dirs. This is the real signal for whether
  two features can run in parallel; more reliable than a self-reported flag.
- **Depends on** — hard ordering only (needs the other's output to exist).
- **Done when** — must be *observable*. Given this repo's tests hit a live server,
  prefer "endpoint X returns Y" / "test Z passes against a running backend" over
  vague "works."
- **Out of scope** — always fill, even if just "no frontend changes."

---

## Orchestrating

You are the **coordinator**. You do not implement features yourself — you plan the
DAG, dispatch subagents, and integrate their summaries. Preserve your own context:
never read full diffs, only the summaries subagents return.

### Build the DAG

1. Parse every `todo`/`blocked` block from `docs/BACKLOG.md`.
2. Build a directed acyclic graph: edge A→B if B `depends on` A **or** their
   `Touches` sets intersect (collision ⇒ forced sequential edge, even without a
   declared dependency).
3. Compute batches by topological level: each batch = features whose deps are all
   done AND that share no file with any other feature in the same batch.
4. Detect cycles. If any exist, stop and report them — do not guess an order.
5. Print the plan: the batches, what runs in parallel, and why anything is
   sequenced (dependency vs. file collision).

### Dispatch loop

For each batch, in order:

1. Spawn one subagent **per feature in the batch, in a single message** so they run
   in parallel. Each subagent brief must contain, verbatim:
   - The feature block (all fields).
   - Pointers to read `CLAUDE.md` and `docs/PRD.md` for architecture/conventions.
   - The **Out of scope** boundary, restated as a hard constraint.
   - Instruction to verify against **Done when** (run the relevant test against a
     locally running backend where applicable).
   - **Commit** the change as a single per-feature commit:
     `feat: <title> (F-0NN)`.
   - **Return only a summary**: what changed, files touched, test/verification
     result, and anything surprising or ambiguous. **Do not** paste the diff.
2. Wait for the batch to finish. For each returned summary:
   - Success → flip `Status: done` in `docs/BACKLOG.md`, move the block to `## Done`.
   - Ambiguity/surprise flagged → spawn a **focused investigation subagent** rather
     than digging in yourself; act on its summary.
   - Failure/blocked → mark `Status: blocked` with a one-line reason, and skip
     anything that depended on it (mark those blocked too). Keep going with the rest.
3. Move to the next batch. Re-derive the DAG if statuses changed.

### Rules

- **Per-feature commits.** One commit per feature, never batched. Subagents commit
  their own work so history stays clean and each feature is independently revertable.
- **Parallel by default, sequential on collision.** Maximize parallelism, but any
  two features touching the same file run in different batches. When in doubt about
  a collision, sequence them.
- **No overlap within a batch.** Subagents can't see each other's uncommitted work;
  two agents editing one file *will* conflict. The collision edges prevent this.
- **Coordinator stays light.** Read summaries, not diffs. Update the backlog. Only
  investigate via subagents.
- **Report at the end**: which features landed, which are blocked and why, and the
  final commit list.
