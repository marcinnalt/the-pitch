# Architecture — StorySpark Local

## Overview

```
Browser (static site)
├── pages: index, what-it-does, how-it-works, family, play, game, grown-ups
├── assets/js/store.js     profiles, avatars, language, knowledge, progress (localStorage)
├── assets/js/i18n.js      UI translations + RTL
├── assets/js/main.js      nav, filters, landing demo
├── assets/js/play.js      canvas studio, chapter request/fallback, PNG export
├── assets/js/family.js    profile CRUD, avatar picker, knowledge base
└── assets/js/game.js      four-stop quest, request/fallback, hearts/stars

Optional backend (FastAPI)
├── server/app.py          /api/health, /api/chapter, /api/quest, static mount
├── server/engine.py       Ollama / OpenAI-compatible / transformers adapters
└── server/prompts.py      system prompts, lesson map, safety prompt
```

The front end is the product. The backend is an optional adapter: without it, the studio and quest
use scripted content and the rest of the site is unchanged.

## Front end

No framework and no build step. Each page is plain HTML with a shared stylesheet and small
defer-loaded scripts.

### State

`store.js` owns all device state:

| Key | Shape | Purpose |
| --- | --- | --- |
| `storyspark.profiles.v1` | `Profile[]` | Up to 8 kids: name, age band, avatar, language, favourite lesson, counters |
| `storyspark.active.v1` | `string` | Active profile id |
| `storyspark.knowledge.v1` | `KnowledgeNote[]` | Shared family bookshelf: title, text, word count, enabled flag |

Reads and writes are wrapped in `try/catch` so private mode still renders. The active profile
supplies the hero name, age band, language and default lesson to the studio and quest.

### Languages

`i18n.js` holds four UI dictionaries: English, Spanish, French and Arabic. It sets
`<html lang>` and `<html dir>`, translates `[data-i18n]` and `[data-i18n-ph]` nodes, and broadcasts a
`storyspark:language` event. The selected language is stored per profile and sent to the model, so a
story can be written in the child's language while the interface matches.

### Studio (`play.html` + `play.js`)

Canvas drawing with pointer events, five crayon colours, eraser and clear. The child can type or
pick a hero name, pick one of six lessons, and choose a language. On submit the studio:

1. Builds a payload: name, lesson, age band, language, drawing data URL, up to three knowledge
   excerpts.
2. POSTs to `window.STORYSPARK_API` when set; otherwise uses the scripted story for the lesson.
3. Renders title, narration and three choices; selecting a choice shows its outcome and lesson.
4. Can export the drawing as a PNG colouring page.
5. Records the story against the active profile.

A failed or malformed API response falls back to the scripted chapter and tells the child so in
plain words.

### Family library (`family.html` + `family.js`)

Profile CRUD with eight predetermined cartoon avatars, age band, language and favourite lesson.
Add, switch and remove are immediate; removal asks for confirmation. The knowledge base accepts
pasted notes and `.txt`/`.md`/`.json`/`.csv` files up to 300 KB, stores them locally, and lets a
grown-up enable, disable or delete each note.

### Quest (`game.html` + `game.js`)

A four-stop scripted kindness quest in all four languages: a yellow gate, a snack table, a quiet
corner, paper stars. Each stop offers three kind choices; every choice earns a heart and a star and
adds a reflection line. The end screen lists what was practised, offers a replay and links to the
studio. If `window.STORYSPARK_QUEST_API` is set, the quest requests a generated deck and validates
its shape, falling back to the scripted deck on any error.

## Backend

FastAPI app, run with `uvicorn server.app:app --port 8080`. It serves the API and mounts the
repository as static files, so the front end and API share an origin.

### Endpoints

`GET /api/health` returns the engine, model and safety-pass status.

`POST /api/chapter`

```json
{
  "name": "Nori",
  "lesson": "kindness",
  "age_band": "4-6",
  "language": "es",
  "transcript": "",
  "drawing": "data:image/png;base64,...",
  "knowledge": ["Grandma's garden: we share the watering can."]
}
```

Returns:

```json
{
  "title": "The Watering Can",
  "narration": "...",
  "choices": [
    { "label": "Offer the can", "outcome": "...", "lesson": "..." }
  ],
  "engine": "gemma4:12b",
  "safety": "checked"
}
```

`POST /api/quest` accepts `name`, `lesson`, `age_band`, `language` and up to two knowledge notes,
and returns `{ "title", "stops": [{ "title", "prompt", "choices": [...] }] }`.

Errors: `413` drawing too large, `422` safety rejection, `502` model/engine failure. The front end
treats all of them as "use the scripted content".

### Engine adapters

Selected with `STORYSPARK_ENGINE`:

- **ollama** (default) — `POST /api/chat` with an optional base64 image. Supports vision models.
- **openai** — any OpenAI-compatible `/chat/completions` server (vLLM, llama.cpp, LM Studio, TGI).
- **transformers** — in-process `AutoModelForImageTextToText` with `accelerate`; optional extras.

The model name is configuration, not code. Gemma 4, Gemma 3, Qwen-VL, Llama or any compatible
open-weight model can be used by changing `STORYSPARK_MODEL`.

### Prompt contract

`prompts.py` defines the lesson map, the chapter system prompt, the quest prompt and the safety
prompt. The contract is narrow: one chapter at a time, exactly three choices, short sentences, no
cliffhangers, no personal-data requests, no brands or real people. The model must return JSON only.

`engine.py` never trusts the model's shape. `extract_json` digs the object out of fences or prose,
and `normalise_chapter` / `normalise_quest` rebuild a strict object, clamp lengths and reject
anything with too few usable choices or stops.

### Safety

A second model call audits every chapter or quest against a checklist: no violence, death, cruelty,
humiliation, scary imagery, romance, brands, ads or data requests; peril must be small, reversible
and resolved. The audit can return a rewritten chapter. If it rejects without a safe rewrite, the
API returns `422` and the client falls back to scripted content. `STORYSPARK_SAFETY_PASS=0` exists
for local debugging only.

The static site itself sends nothing anywhere. When a local model is connected, only the hero name,
age band, language, drawing, transcript and up to three short knowledge excerpts are sent to that
model server.

## Deployment

- **Static:** GitHub Pages at `https://marcinnalt.github.io/the-pitch/`; Vercel via `vercel.json`
  with no build step, output `.`, clean URLs and security headers. `.vercelignore` excludes
  `server/` and docs from the static deploy.
- **Backend:** a Python host that can reach the model (home server, GPU box, Render, Fly.io). Set
  `STORYSPARK_ORIGINS` to the deployed front-end origin. Vercel cannot host this long-lived process.
- The front end uses same-origin `/api/...` when served by FastAPI; for split hosting, point the
  two `window.STORYSPARK_*` constants at the backend URL.

## Limits and next steps

- Scripted content is the offline default; the model path needs a running model server.
- localStorage is per browser and device; there is no sync or account system by design.
- The backend has no authentication or rate limiting; add both before exposing it publicly.
- Next: streaming chapters, voice input/output on device, grown-up session timer, and a printable
  pack generated from the child's own drawing.
