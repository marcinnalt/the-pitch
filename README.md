# StorySpark Local

**AI for kids — stories, lessons and quests that run on your own device.**

StorySpark Local is a story and learning world for kids aged 4–10. A child draws a hero with a
finger or a mouse, picks a lesson such as kindness, courage or sharing, and gets a short illustrated
adventure in which their own drawing is the main character. The story pauses at real choices, the
child decides what happens next, and the ending names the small behaviour they practised — without
a score, a leaderboard or a wrong answer.

It is built for the way families actually live: one tablet, several kids, more than one language.
Each child can have their own profile, cartoon avatar, age band and story language, while the
grown-ups keep one shared bookshelf of family stories, values and class topics that the adventures
can draw on. Kindness quests turn the same idea into a four-stop choose-your-path game. Everything
runs on the family's own device; there are no ads, no accounts for kids and no cloud profile.

The project is a working concept pitch: the static site, studio, profiles, knowledge base and
quest run entirely in the browser, and an optional local backend connects the same interface to an
open-weight model such as Gemma, Qwen or Llama. This repository contains both.

---

## Run it in one line

You need Python 3 (already installed on macOS and most Linux systems) and a browser. There is no
build step and no `npm install`.

```bash
git clone https://github.com/marcinnalt/the-pitch.git && cd the-pitch && python3 -m http.server 8000
```

Then open **http://localhost:8000**. That is the whole front end. The studio, profiles, avatar picker, knowledge base and quest work
offline in this mode, using scripted story content. Opening `index.html` directly from disk mostly
works too, but a local server is recommended so navigation, fonts and canvas export behave like
the deployed site.

### Optional: connect a real local model

The backend is a small FastAPI app. It is optional — without it the site uses its built-in
scripted chapters and quests.

```bash
# 1. Install the backend (a virtual environment is recommended)
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r server/requirements.txt

# 2. Install Ollama and pull an open-weight model
#    https://ollama.com/download
ollama pull gemma3:12b             # or any vision-capable model you have

# 3. Run the app + API together
uvicorn server.app:app --reload --port 8080
# open http://localhost:8080
```

Then point the front end at the API. In `play.html`, set:

```html
<script>window.STORYSPARK_API = "/api/chapter";</script>
```

and in `game.html`, set:

```html
<script>window.STORYSPARK_QUEST_API = "/api/quest";</script>
```

Both pages already serve from the same origin when you use `uvicorn`, so no CORS setup is needed.

### Use a different model or server

Copy `.env.example` to `.env` and edit it:

```bash
cp .env.example .env
```

| Setting | Default | What it does |
| --- | --- | --- |
| `STORYSPARK_ENGINE` | `ollama` | `ollama`, `openai` (vLLM, llama.cpp, LM Studio, TGI) or `transformers` |
| `STORYSPARK_MODEL` | `gemma4:12b` | Any model name the chosen server knows |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama address |
| `STORYSPARK_BASE_URL` | `http://localhost:8080/v1` | OpenAI-compatible base URL |
| `STORYSPARK_API_KEY` | `local` | Key for the OpenAI-compatible server |
| `STORYSPARK_SAFETY_PASS` | `1` | Set to `0` to skip the second safety review |

For the in-process Hugging Face path:

```bash
pip install -r server/requirements-transformers.txt
STORYSPARK_ENGINE=transformers STORYSPARK_MODEL=google/gemma-3-12b-it \
  uvicorn server.app:app --port 8080
```

---

## What is in the box

| Page | What it does |
| --- | --- |
| `index.html` | Landing page, lesson preview and an interactive chapter demo |
| `what-it-does.html` | The twelve-world lesson library, filters and learning loop |
| `how-it-works.html` | The story pipeline and how a chapter is built |
| `family.html` | Kid profiles, cartoon avatars, per-kid language and the family knowledge base |
| `play.html` | The studio: draw a hero, choose a lesson, get a branching chapter, save a colouring page |
| `game.html` | A four-stop kindness quest with hearts, stars and a reflection screen |
| `grown-ups.html` | Safety promise, screen-time defaults, educator notes, FAQ and install steps |

Profiles, the active kid, language choice and knowledge notes are stored in `localStorage` on the
device. No child data leaves the browser unless a grown-up explicitly connects a local model, in
which case only the hero name, age band, language, drawing and up to three short knowledge excerpts
are sent to that model.

## Deployment

The front end is static, so GitHub Pages and Vercel both work with no build command.

- **GitHub Pages:** already served at <https://marcinnalt.github.io/the-pitch/>.
- **Vercel:** import the repository, choose the **Other** preset, leave the build command empty,
  set the output directory to `.`, and deploy. `vercel.json` adds clean URLs and security headers.
- **Backend:** host `server/` separately on a machine that can run Python and reach the model
  (Render, Fly.io, a home server or a GPU box). Vercel cannot run this long-lived FastAPI process.

## Project layout

```
the-pitch/
├── index.html · what-it-does.html · how-it-works.html
├── family.html · play.html · game.html · grown-ups.html
├── assets/
│   ├── css/style.css
│   ├── avatars/*.svg
│   └── js/  main.js · store.js · i18n.js · play.js · family.js · game.js
├── server/  app.py · engine.py · prompts.py · requirements.txt
├── DESIGN.md        # design system and components
├── ARCHITECTURE.md  # front end, backend, model integration, safety
└── vercel.json
```

## Status

Concept pitch and front-end prototype. Story and quest content is scripted by default; the local
model path is wired but needs a model server to be useful. Copy and lesson content are demo
material. No real child data is collected by this static site.

*Draw boldly. Choose kindly. The end.*
