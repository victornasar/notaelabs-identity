---
name: brand-interview
description: Interview a client for a brand identity in grilling rounds and record the brief in brands/<slug>/work/brief.md. Use for gate 1 of /brand, or when a brief has open questions.
---

# Brand interview

Builds `brands/<slug>/work/brief.md` through rounds of questions, until every item of the core is answered well enough to write a strategy from.

## The core

Each item is answered, specifically, before the brief can be approved:

1. **Category**: what the company is, in the words a buyer would use, and what it is not.
2. **Three competitors**: named companies the buyer also considers. For each, what their identity looks like, in the user's words.
3. **Audience**: the person who buys and the people who use the brand afterward.
4. **Equity**: what the current identity owns (name, colors, shapes, type, phrases) and how attached people are to each. For a new company, the name and its story.
5. **Never**: words the brand must never be, each with an example of a brand that is.
6. **Budget tier**: what the client would otherwise pay a studio, as a range.
7. **Deadline**: the date, and what must exist by then.

Ask beyond the core wherever an answer would change the strategy: the one thing the company does that others don't, a founder story, the name's meaning, where the brand will be seen most (product UI, sales decks, signage).

## A round

A round is 4–7 numbered questions, so the user can answer in one message. Each question:

- is about one thing, and names which core item it serves;
- comes with a **proposed answer** when the repo or earlier rounds suggest one (an existing `brand.ts`, the research, earlier answers), so the user can reply "yes" or correct it;
- pushes on vague answers from earlier rounds: "calm" becomes "calm like what? name a brand that is calm and one that only claims it."

Write the round into `brief.md` under `## Round N`, questions first, each followed by `**Answer:**` left blank. Commit it. Then show the questions in chat.

## Taking answers

Answers arrive in chat or as text the user wrote under `**Answer:**` in the file. Copy chat answers into the file verbatim under their question, then update `## Brief so far`: the core items as short, plain statements, each marked answered or open.

Then ask the next round, aimed at the open and the vague. Stop asking when every core item is answered specifically; usually two or three rounds. Then present `## Brief so far` and ask for approval.

## brief.md

```markdown
---
slug: <slug>
status: interviewing   # becomes `approved` only after the user approves in chat
---
# <Name>: brief

## Brief so far
1. Category: ... (answered | open)
...

## Round 1
1. **[Category]** Question? *Proposed:* ...
   **Answer:**

## Approval
```
