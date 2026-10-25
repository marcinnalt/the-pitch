"""StorySpark Local — optional model backend.

Run from the repository root:

    uvicorn server.app:app --reload --port 8080

This serves both the static site and the chapter API, so the front-end can call
POST /api/chapter on the same origin.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .engine import EngineError, UnsafeChapter, generate_chapter, generate_quest

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

MAX_DRAWING_CHARS = 12_000_000  # roughly 9 MB of base64 image data

app = FastAPI(
    title="StorySpark Local",
    version="0.1.0",
    description="A child-safe, chapter-at-a-time story API for open-weight models.",
)

origins = [
    origin.strip()
    for origin in os.getenv(
        "STORYSPARK_ORIGINS",
        "http://localhost:8000,http://127.0.0.1:8000,http://localhost:8080",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ChapterRequest(BaseModel):
    name: str = Field(default="Pip", max_length=24)
    lesson: str = Field(default="kindness", max_length=32)
    age_band: str = Field(default="4-6", max_length=8)
    language: str = Field(default="en", max_length=8)
    transcript: str = Field(default="", max_length=280)
    drawing: str | None = None
    knowledge: list[str] = Field(default_factory=list, max_length=3)


class QuestRequest(BaseModel):
    name: str = Field(default="Pip", max_length=24)
    lesson: str = Field(default="kindness", max_length=32)
    age_band: str = Field(default="4-6", max_length=8)
    language: str = Field(default="en", max_length=8)
    knowledge: list[str] = Field(default_factory=list, max_length=2)


@app.get("/api/health")
async def health() -> dict:
    from . import engine

    return {
        "ok": True,
        "engine": engine.ENGINE,
        "model": engine.MODEL,
        "safety_pass": engine.SAFETY_PASS,
    }


@app.post("/api/chapter")
async def chapter(request: ChapterRequest) -> dict:
    if request.drawing and len(request.drawing) > MAX_DRAWING_CHARS:
        raise HTTPException(status_code=413, detail="Drawing is too large")

    payload = request.model_dump()
    payload["knowledge"] = [note.strip()[:900] for note in request.knowledge[:3] if note.strip()]

    try:
        return await generate_chapter(payload)
    except UnsafeChapter as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except EngineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/api/quest")
async def quest(request: QuestRequest) -> dict:
    payload = request.model_dump()
    payload["knowledge"] = [note.strip()[:700] for note in request.knowledge[:2] if note.strip()]

    try:
        return await generate_quest(payload)
    except UnsafeChapter as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except EngineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# Mount last so /api routes win. Serves index.html at / and the static pages.
app.mount("/", StaticFiles(directory=ROOT, html=True), name="site")
