"""Model adapters for StorySpark.

Supported backends, selected with STORYSPARK_ENGINE:

  ollama        - local Ollama server (recommended; Gemma 4 / Gemma 3 / Qwen-VL)
  openai        - any OpenAI-compatible server (vLLM, llama.cpp, LM Studio, TGI)
  transformers  - in-process Hugging Face model (needs the optional extra)

The rest of the app only calls `generate_chapter(payload)`.
"""

from __future__ import annotations

import base64
import io
import json
import os
import re
from typing import Any

import httpx

from .prompts import (
    SYSTEM_PROMPT,
    build_quest_prompt,
    build_safety_prompt,
    build_user_prompt,
)

ENGINE = os.getenv("STORYSPARK_ENGINE", "ollama").strip().lower()
MODEL = os.getenv("STORYSPARK_MODEL", "gemma4:12b").strip()
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
BASE_URL = os.getenv("STORYSPARK_BASE_URL", "http://localhost:8080/v1").rstrip("/")
API_KEY = os.getenv("STORYSPARK_API_KEY", "local")
SAFETY_PASS = os.getenv("STORYSPARK_SAFETY_PASS", "1") not in ("0", "false", "False")
TIMEOUT = float(os.getenv("STORYSPARK_TIMEOUT", "120"))


class EngineError(RuntimeError):
    """The model could not produce a usable chapter."""


class UnsafeChapter(EngineError):
    """The safety pass rejected the chapter and had no safe rewrite."""


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------


def split_data_url(data_url: str | None) -> tuple[str | None, str | None]:
    """Return (media_type, base64_payload) for a data URL, or (None, None)."""
    if not data_url or not data_url.startswith("data:"):
        return None, None

    header, _, payload = data_url.partition(",")
    if not payload:
        return None, None

    media_type = header[5:].split(";")[0] or "image/png"
    return media_type, payload


def extract_json(text: str) -> dict:
    """Models like to wrap JSON in fences or prose. Dig the object out."""
    cleaned = text.strip()

    fence = re.search(r"```(?:json)?\s*(.*?)```", cleaned, re.S)
    if fence:
        cleaned = fence.group(1).strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end <= start:
        raise EngineError("Model returned no JSON object")

    try:
        return json.loads(cleaned[start : end + 1])
    except json.JSONDecodeError as exc:
        raise EngineError(f"Model returned invalid JSON: {exc}") from exc


def normalise_quest(raw: dict, name: str) -> dict:
    """Validate a four-stop quest without trusting the model's shape."""
    if not isinstance(raw, dict):
        raise EngineError("Quest is not an object")

    title = re.sub(r"\s+", " ", str(raw.get("title") or "A Kindness Quest")).strip()
    stops = raw.get("stops")

    if not isinstance(stops, list):
        raise EngineError("Quest has no stops")

    clean_stops: list[dict] = []
    for stop in stops[:4]:
        if not isinstance(stop, dict):
            continue

        prompt = re.sub(
            r"\s+", " ", str(stop.get("prompt") or stop.get("narration") or "")
        ).strip()
        if not prompt:
            continue

        choices = stop.get("choices")
        if not isinstance(choices, list):
            continue

        clean_choices: list[dict] = []
        for choice in choices[:3]:
            if not isinstance(choice, dict):
                continue

            label = re.sub(r"\s+", " ", str(choice.get("label") or "")).strip()
            outcome = re.sub(
                r"\s+", " ", str(choice.get("outcome") or choice.get("text") or "")
            ).strip()
            lesson = re.sub(r"\s+", " ", str(choice.get("lesson") or "")).strip()

            if label and outcome:
                clean_choices.append(
                    {
                        "label": label[:48],
                        "outcome": outcome[:500],
                        "lesson": lesson[:180],
                    }
                )

        if len(clean_choices) >= 2:
            clean_stops.append(
                {
                    "title": re.sub(
                        r"\s+", " ", str(stop.get("title") or "A small stop")
                    ).strip()[:48],
                    "prompt": prompt[:500],
                    "choices": clean_choices,
                }
            )

    if len(clean_stops) < 2:
        raise EngineError("Quest needs at least two usable stops")

    return {
        "title": title[:80] or f"{name}'s Kindness Quest",
        "stops": clean_stops,
        "engine": MODEL,
        "safety": "checked" if SAFETY_PASS else "unverified",
    }


def normalise_chapter(raw: dict, name: str) -> dict:
    """Validate and shape the model output. Never trust the model's keys."""
    if not isinstance(raw, dict):
        raise EngineError("Chapter is not an object")

    title = re.sub(r"\s+", " ", str(raw.get("title") or "A StorySpark Adventure")).strip()
    narration = re.sub(
        r"\s+", " ", str(raw.get("narration") or raw.get("intro") or "")
    ).strip()

    if not narration:
        raise EngineError("Chapter has no narration")

    choices = raw.get("choices")
    if not isinstance(choices, list):
        raise EngineError("Chapter has no choices")

    clean_choices: list[dict] = []
    for choice in choices[:3]:
        if not isinstance(choice, dict):
            continue
        label = re.sub(r"\s+", " ", str(choice.get("label") or "")).strip()
        outcome = re.sub(
            r"\s+", " ", str(choice.get("outcome") or choice.get("text") or "")
        ).strip()
        lesson = re.sub(r"\s+", " ", str(choice.get("lesson") or "")).strip()

        if label and outcome:
            clean_choices.append(
                {"label": label[:48], "outcome": outcome[:600], "lesson": lesson[:180]}
            )

    if len(clean_choices) < 2:
        raise EngineError("Chapter needs at least two usable choices")

    return {
        "title": title[:80] or f"{name}'s Adventure",
        "narration": narration[:900],
        "choices": clean_choices,
        "engine": MODEL,
        "safety": "checked" if SAFETY_PASS else "unverified",
    }


# --------------------------------------------------------------------------
# Text completion adapters
# --------------------------------------------------------------------------


async def _ollama_complete(prompt: str, image_b64: str | None, system: str) -> str:
    message: dict[str, Any] = {"role": "user", "content": prompt}
    if image_b64:
        message["images"] = [image_b64]

    payload = {
        "model": MODEL,
        "stream": False,
        "format": "json",
        "messages": [
            {"role": "system", "content": system},
            message,
        ],
        "options": {"temperature": 0.7, "num_predict": 700},
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)

    if response.status_code >= 400:
        raise EngineError(f"Ollama returned {response.status_code}: {response.text[:200]}")

    return response.json().get("message", {}).get("content", "")


async def _openai_complete(prompt: str, image_data_url: str | None, system: str) -> str:
    content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
    if image_data_url:
        content.append({"type": "image_url", "image_url": {"url": image_data_url}})

    payload = {
        "model": MODEL,
        "temperature": 0.7,
        "max_tokens": 800,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": content},
        ],
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(
            f"{BASE_URL}/chat/completions",
            json=payload,
            headers={"Authorization": f"Bearer {API_KEY}"},
        )

    if response.status_code >= 400:
        raise EngineError(
            f"OpenAI-compatible server returned {response.status_code}: {response.text[:200]}"
        )

    return response.json()["choices"][0]["message"]["content"]


# Lazy-loaded transformers objects (only used with STORYSPARK_ENGINE=transformers)
_local: dict[str, Any] = {}


def _local_complete(prompt: str, image_data_url: str | None, system: str) -> str:
    try:
        import torch
        from PIL import Image
        from transformers import AutoModelForImageTextToText, AutoProcessor
    except ImportError as exc:  # pragma: no cover - optional path
        raise EngineError(
            "The transformers backend needs torch, transformers and pillow. "
            "Install them with: pip install -r server/requirements-transformers.txt"
        ) from exc

    if not _local:
        model_id = os.getenv("STORYSPARK_MODEL", "google/gemma-3-12b-it")
        _local["processor"] = AutoProcessor.from_pretrained(model_id)
        _local["model"] = AutoModelForImageTextToText.from_pretrained(
            model_id,
            torch_dtype=torch.bfloat16,
            device_map="auto",
        )

    processor = _local["processor"]
    model = _local["model"]

    messages: list[dict[str, Any]] = [
        {"role": "system", "content": system},
        {
            "role": "user",
            "content": [
                *(
                    [{"type": "image", "image": _to_pil(image_data_url)}]
                    if image_data_url
                    else []
                ),
                {"type": "text", "text": prompt},
            ],
        }
    ]

    inputs = processor.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt",
    ).to(model.device)

    with torch.inference_mode():
        output = model.generate(**inputs, max_new_tokens=800, do_sample=True, temperature=0.7)

    generated = output[:, inputs["input_ids"].shape[-1] :]
    return processor.batch_decode(generated, skip_special_tokens=True)[0]


def _to_pil(data_url: str | None):
    from PIL import Image

    _, payload = split_data_url(data_url)
    if not payload:
        return None
    return Image.open(io.BytesIO(base64.b64decode(payload))).convert("RGB")


# --------------------------------------------------------------------------
# Public API
# --------------------------------------------------------------------------


async def _complete(
    prompt: str,
    image_b64: str | None,
    image_data_url: str | None,
    system: str = SYSTEM_PROMPT,
) -> str:
    if ENGINE == "ollama":
        return await _ollama_complete(prompt, image_b64, system)
    if ENGINE in ("openai", "vllm", "llamacpp", "lmstudio"):
        return await _openai_complete(prompt, image_data_url, system)
    if ENGINE == "transformers":
        return _local_complete(prompt, image_data_url, system)

    raise EngineError(f"Unknown STORYSPARK_ENGINE: {ENGINE}")


async def generate_chapter(payload: dict) -> dict:
    """Generate one safe chapter from a child's drawing + spoken idea."""
    name = str(payload.get("name") or "Pip")[:24]
    lesson = str(payload.get("lesson") or "kindness")
    age_band = str(payload.get("age_band") or "4-6")
    transcript = str(payload.get("transcript") or "")[:280]
    drawing = payload.get("drawing")
    drawing = drawing if isinstance(drawing, str) else None

    media_type, image_b64 = split_data_url(drawing)
    if image_b64 and media_type not in ("image/png", "image/jpeg", "image/webp"):
        raise EngineError("Drawing must be a PNG, JPEG or WebP data URL")

    language = str(payload.get("language") or "en")[:8]
    knowledge = payload.get("knowledge") or []
    knowledge = [str(note)[:900] for note in knowledge[:3] if str(note).strip()]

    prompt = build_user_prompt(
        name=name,
        lesson=lesson,
        age_band=age_band,
        transcript=transcript,
        has_image=bool(image_b64),
        language=language,
        knowledge=knowledge,
    )

    raw = await _complete(prompt, image_b64, drawing)
    chapter = normalise_chapter(extract_json(raw), name)

    if not SAFETY_PASS:
        return chapter

    audit_prompt = build_safety_prompt(chapter)
    audit = extract_json(
        await _complete(
            audit_prompt,
            None,
            None,
            system=(
                "You are a strict child-safety reviewer for stories aimed at ages 4 to 10. "
                "You return only valid JSON."
            ),
        )
    )

    if audit.get("safe") is True:
        chapter["safety"] = "checked"
        return chapter

    revised = audit.get("revised")
    if isinstance(revised, dict):
        chapter = normalise_chapter(revised, name)
        chapter["safety"] = "rewritten"
        return chapter

    reasons = audit.get("reasons") or []
    raise UnsafeChapter("Safety pass rejected the chapter: " + "; ".join(map(str, reasons))[:300])


async def generate_quest(payload: dict) -> dict:
    """Generate a four-stop kindness quest for the active child."""
    name = str(payload.get("name") or "Pip")[:24]
    age_band = str(payload.get("age_band") or "4-6")[:8]
    language = str(payload.get("language") or "en")[:8]
    lesson = str(payload.get("lesson") or "kindness")[:32]
    knowledge = payload.get("knowledge") or []
    knowledge = [str(note)[:900] for note in knowledge[:2] if str(note).strip()]

    prompt = build_quest_prompt(
        name=name,
        age_band=age_band,
        language=language,
        lesson=lesson,
        knowledge=knowledge,
    )

    raw = await _complete(prompt, None, None)
    quest = normalise_quest(extract_json(raw), name)

    if not SAFETY_PASS:
        return quest

    audit_prompt = build_safety_prompt(
        {
            "title": quest["title"],
            "narration": quest["stops"][0]["prompt"],
            "choices": [
                choice
                for stop in quest["stops"]
                for choice in stop["choices"]
            ],
        }
    )
    audit = extract_json(
        await _complete(
            audit_prompt,
            None,
            None,
            system=(
                "You are a strict child-safety reviewer for games aimed at ages 4 to 10. "
                "You return only valid JSON."
            ),
        )
    )

    if audit.get("safe") is True:
        quest["safety"] = "checked"
        return quest

    reasons = audit.get("reasons") or []
    raise UnsafeChapter(
        "Safety pass rejected the quest: " + "; ".join(map(str, reasons))[:300]
    )
