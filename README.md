# StorySpark Local

A static, neo-brutalist marketing site and playable studio preview for **StorySpark Local** — a
kid-first story platform where children aged 4–10 draw a character, say an idea, and choose their
way through short adventures that quietly teach a lesson.

> Draw a friend. Learn a lesson. Play the story.

**Status:** concept pitch / front-end prototype. Story content is scripted; the full product would
run the Gemini 4 story engine with a child-safety pass.

---

## Run it

No build step, no dependencies. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly with `file://` also works for the pages, but a local server is
recommended (it keeps the fonts, canvas export and navigation behaving like production).

---

## Pages

| File | What it's for |
| --- | --- |
| `index.html` | Landing page: hero, lesson preview, how it works, interactive chapter demo, grown-up band, CTA |
| `what-it-does.html` | The 12-world lesson library with theme + age filters, the learning loop, and lesson mapping |
| `how-it-works.html` | The four-stage story pipeline, engine features, interruption-friendly design, short spec |
| `grown-ups.html` | Safety pledge, the "never list", screen-time defaults, educator notes, FAQ |
| `play.html` | Playable studio: crayon canvas, hero name, lesson picker, branching story preview, PNG colouring-page download |

Shared UI lives in `assets/css/style.css` and `assets/js/main.js`; the studio logic is in
`assets/js/play.js`.

---

## The kid-first idea

The site sells a **learning platform**, not a voice gadget. Voice and vision are how kids use it;
the lesson is why it exists.

- **No reading required** — every choice is spoken and pictured.
- **One decision at a time** — three clear options, no timers, no wrong answers.
- **A lesson in disguise** — kindness, courage, sharing, honesty, patience, curiosity,
  empathy, teamwork, persistence, gratitude, fairness, problem-solving.
- **A real ending** — 7–20 minute adventures with a talk-about-it question and a printable page.

## Design system

Neo-brutalist, built for small hands and big feelings:

- **Palette:** milk `#FFFDF3` + yellow `#FFD22E` + ink `#14110F`, with tomato / sky / mint used
  only inside illustrations.
- **Shape:** sharp corners, 3–4px black borders, hard offset shadows, rotated stickers, no pills.
- **Type:** Archivo Black for display, Space Grotesk for body copy.
- **Deliberately absent:** online/status indicators, pill cards, rounded corners, dark patterns,
  fake testimonials, autoplay.
- **Motion:** a marquee ticker and small scroll reveals, both disabled under
  `prefers-reduced-motion`.
- **Accessibility:** skip link, semantic landmarks, visible focus rings, ARIA states on filters
  and chips, live regions for the story demo, keyboard-operable controls.

## Studio preview

`play.html` is a genuinely interactive front-end demo:

1. Draw with a mouse or finger on the canvas (five crayon colours + eraser + clear).
2. Pick one of six hero names and six lessons.
3. "Tell my story" composes a scripted chapter that inserts the hero's name and shows three
   branching choices with a lesson underneath.
4. Save the drawing as a printable PNG colouring page.

Each of the six lessons has its own intro and three outcomes. The preview does **not** call a
model — it is intentionally self-contained so the pitch works offline.

## Project structure

```
storyspark/
├── index.html
├── what-it-does.html
├── how-it-works.html
├── grown-ups.html
├── play.html
├── README.md
└── assets/
    ├── css/style.css
    ├── favicon.svg
    └── js/
        ├── main.js   # nav, reveals, home demo, lesson filters
        └── play.js   # canvas + studio story engine
```

## Roadmap (aligning the front end with the PID)

1. **Wire the studio to the real engine** — POST the drawing + transcript to a local Gemini 4
   endpoint, stream back a chapter object (`title`, `narration`, `choices[]`, `coloringSvg`).
2. **Voice in / voice out** — Whisper STT and Piper TTS on device; keep the draw-and-tap fallback.
3. **Safety pass** — run the thinking-mode child-safety review server-side and reject/rewrite
   before the chapter reaches the client.
4. **Grown-up session controls** — age band, 5–30 minute timer, wind-down ending, no autoplay.
5. **Lesson telemetry for grown-ups** — "what they practised" recap, never a child-facing score.
6. **Printable pack** — SVG colouring page of the child's own character plus a retelling strip.

---

*Concept pitch. Copy and lesson content are demo material; no real child data is collected by
this static site.*
