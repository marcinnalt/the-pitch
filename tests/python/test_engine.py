"""Engine tests: JSON extraction, output normalisation and model adapters.

No model server is contacted. `_complete` is replaced with a stub.
"""

import asyncio
import json

import pytest

from server import engine


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------


def run(coroutine):
    return asyncio.run(coroutine)


def chapter(**overrides):
    data = {
        "title": "The Yellow Gate",
        "narration": "Pip finds a gate that will not open.",
        "choices": [
            {"label": "Lift it together", "outcome": "Click.", "lesson": "Notice a wobble."},
            {"label": "Fetch a grown-up", "outcome": "Help arrives.", "lesson": "Ask early."},
            {"label": "Cheer", "outcome": "It opens.", "lesson": "Encourage."},
        ],
    }
    data.update(overrides)
    return data


def quest(**overrides):
    stop = {
        "title": "The gate",
        "prompt": "A small gate is stuck.",
        "choices": [
            {"label": "Open it together", "outcome": "It opens.", "lesson": "Notice."},
            {"label": "Ask for help", "outcome": "Help comes.", "lesson": "Ask."},
            {"label": "Cheer", "outcome": "It gives way.", "lesson": "Encourage."},
        ],
    }
    data = {
        "title": "A Kindness Quest",
        "stops": [
            {**stop, "title": f"Stop {index}"} for index in range(4)
        ],
    }
    data.update(overrides)
    return data


# --------------------------------------------------------------------------
# Data URLs and JSON
# --------------------------------------------------------------------------


def test_split_data_url_returns_media_type_and_payload():
    media, payload = engine.split_data_url("data:image/png;base64,AAAA")

    assert media == "image/png"
    assert payload == "AAAA"


@pytest.mark.parametrize("value", [None, "", "https://example.com/a.png", "data:image/png;base64,"])
def test_split_data_url_rejects_non_data_urls(value):
    assert engine.split_data_url(value) == (None, None)


def test_extract_json_handles_plain_json():
    assert engine.extract_json('{"a": 1}') == {"a": 1}


def test_extract_json_handles_markdown_fences_and_chatter():
    text = 'Sure, here you go:\n```json\n{"a": 1}\n```\nHope that helps.'

    assert engine.extract_json(text) == {"a": 1}


def test_extract_json_raises_on_no_object():
    with pytest.raises(engine.EngineError):
        engine.extract_json("no json here")


def test_extract_json_raises_on_broken_json():
    with pytest.raises(engine.EngineError):
        engine.extract_json('{"a": }')


# --------------------------------------------------------------------------
# Chapter normalisation
# --------------------------------------------------------------------------


def test_normalise_chapter_returns_a_strict_shape():
    result = engine.normalise_chapter(chapter(), "Pip")

    assert result["title"] == "The Yellow Gate"
    assert result["narration"].startswith("Pip finds")
    assert len(result["choices"]) == 3
    assert result["choices"][0]["label"] == "Lift it together"
    assert result["engine"] == engine.MODEL
    assert result["safety"] in ("checked", "unverified")


def test_normalise_chapter_uses_fallback_title():
    result = engine.normalise_chapter(chapter(title=""), "Nori")

    assert result["title"] == "Nori's Adventure"


def test_normalise_chapter_clamps_long_fields():
    result = engine.normalise_chapter(
        chapter(
            title="t" * 200,
            narration="n" * 2000,
            choices=[
                {"label": "l" * 100, "outcome": "o" * 1000, "lesson": "s" * 500}
            ]
            * 4,
        ),
        "Pip",
    )

    assert len(result["title"]) <= 80
    assert len(result["narration"]) <= 900
    assert len(result["choices"]) == 3
    assert len(result["choices"][0]["label"]) == 48
    assert len(result["choices"][0]["outcome"]) == 600
    assert len(result["choices"][0]["lesson"]) == 180


def test_normalise_chapter_requires_narration():
    with pytest.raises(engine.EngineError):
        engine.normalise_chapter(chapter(narration=""), "Pip")


def test_normalise_chapter_requires_at_least_two_usable_choices():
    with pytest.raises(engine.EngineError):
        engine.normalise_chapter(
            chapter(choices=[{"label": "Only one", "outcome": "Yes."}]),
            "Pip",
        )


def test_normalise_chapter_drops_malformed_choices():
    result = engine.normalise_chapter(
        chapter(
            choices=[
                {"label": "Good", "outcome": "Fine.", "lesson": "Kind."},
                "not an object",
                {"label": "", "outcome": "No label."},
                {"label": "Also good", "outcome": "Fine."},
            ]
        ),
        "Pip",
    )

    assert [choice["label"] for choice in result["choices"]] == ["Good", "Also good"]


def test_normalise_chapter_accepts_text_instead_of_outcome():
    result = engine.normalise_chapter(
        chapter(
            choices=[
                {"label": "A", "text": "From text.", "lesson": "L"},
                {"label": "B", "text": "Also text.", "lesson": "L"},
            ]
        ),
        "Pip",
    )

    assert result["choices"][0]["outcome"] == "From text."


# --------------------------------------------------------------------------
# Quest normalisation
# --------------------------------------------------------------------------


def test_normalise_quest_returns_four_stops():
    result = engine.normalise_quest(quest(), "Pip")

    assert result["title"] == "A Kindness Quest"
    assert len(result["stops"]) == 4
    assert len(result["stops"][0]["choices"]) == 3
    assert result["safety"] in ("checked", "unverified")


def test_normalise_quest_drops_bad_stops_and_keeps_two():
    data = quest(
        stops=[
            {
                "title": "Good",
                "prompt": "A prompt.",
                "choices": [
                    {"label": "A", "outcome": "A.", "lesson": "L"},
                    {"label": "B", "outcome": "B.", "lesson": "L"},
                ],
            },
            {"title": "No prompt", "prompt": "", "choices": []},
            {
                "title": "Also good",
                "prompt": "Another prompt.",
                "choices": [
                    {"label": "C", "outcome": "C.", "lesson": "L"},
                    {"label": "D", "outcome": "D.", "lesson": "L"},
                ],
            },
        ]
    )

    result = engine.normalise_quest(data, "Pip")

    assert [stop["title"] for stop in result["stops"]] == ["Good", "Also good"]


def test_normalise_quest_requires_two_stops():
    with pytest.raises(engine.EngineError):
        engine.normalise_quest({"title": "Empty", "stops": []}, "Pip")


def test_normalise_quest_clamps_and_defaults():
    data = quest(
        title="",
        stops=[
            {
                "title": "t" * 100,
                "prompt": "p" * 900,
                "choices": [
                    {"label": "l" * 100, "outcome": "o" * 900, "lesson": "s" * 400},
                    {"label": "ok", "outcome": "fine"},
                ],
            }
        ]
        * 2,
    )

    result = engine.normalise_quest(data, "Nori")

    assert result["title"] == "Nori's Kindness Quest"
    assert len(result["stops"][0]["title"]) == 48
    assert len(result["stops"][0]["prompt"]) == 500
    assert len(result["stops"][0]["choices"][0]["outcome"]) == 500


# --------------------------------------------------------------------------
# Public generation flow (with a stubbed model)
# --------------------------------------------------------------------------


def test_generate_chapter_uses_the_stubbed_model(monkeypatch):
    async def fake_complete(prompt, image_b64, image_data_url, system=engine.SYSTEM_PROMPT):
        assert "Nori" in prompt
        return json.dumps(chapter())

    monkeypatch.setattr(engine, "_complete", fake_complete)
    monkeypatch.setattr(engine, "SAFETY_PASS", False)

    result = run(
        engine.generate_chapter(
            {
                "name": "Nori",
                "lesson": "kindness",
                "age_band": "6-8",
                "language": "es",
                "transcript": "",
                "knowledge": ["We share the watering can."],
            }
        )
    )

    assert result["title"] == "The Yellow Gate"
    assert result["safety"] == "unverified"


def test_generate_chapter_rejects_wrong_image_type(monkeypatch):
    async def fake_complete(*args, **kwargs):
        raise AssertionError("model should not be called")

    monkeypatch.setattr(engine, "_complete", fake_complete)

    with pytest.raises(engine.EngineError):
        run(
            engine.generate_chapter(
                {
                    "name": "Pip",
                    "drawing": "data:image/gif;base64,AAAA",
                }
            )
        )


def test_generate_chapter_accepts_a_safe_audit(monkeypatch):
    calls = {"count": 0}

    async def fake_complete(prompt, image_b64, image_data_url, system=engine.SYSTEM_PROMPT):
        calls["count"] += 1
        if calls["count"] == 1:
            return json.dumps(chapter())
        assert "CHAPTER JSON" in prompt
        return json.dumps({"safe": True, "reasons": [], "revised": None})

    monkeypatch.setattr(engine, "_complete", fake_complete)
    monkeypatch.setattr(engine, "SAFETY_PASS", True)

    result = run(engine.generate_chapter({"name": "Pip"}))

    assert result["safety"] == "checked"
    assert calls["count"] == 2


def test_generate_chapter_uses_a_safe_rewrite(monkeypatch):
    calls = {"count": 0}

    async def fake_complete(prompt, image_b64, image_data_url, system=engine.SYSTEM_PROMPT):
        calls["count"] += 1
        if calls["count"] == 1:
            return json.dumps(chapter(title="Too Spooky"))
        return json.dumps(
            {
                "safe": False,
                "reasons": ["slightly tense"],
                "revised": chapter(title="The Gentle Gate"),
            }
        )

    monkeypatch.setattr(engine, "_complete", fake_complete)
    monkeypatch.setattr(engine, "SAFETY_PASS", True)

    result = run(engine.generate_chapter({"name": "Pip"}))

    assert result["title"] == "The Gentle Gate"
    assert result["safety"] == "rewritten"


def test_generate_chapter_rejects_an_unsafe_chapter_without_rewrite(monkeypatch):
    calls = {"count": 0}

    async def fake_complete(prompt, image_b64, image_data_url, system=engine.SYSTEM_PROMPT):
        calls["count"] += 1
        if calls["count"] == 1:
            return json.dumps(chapter())
        return json.dumps({"safe": False, "reasons": ["too scary"], "revised": None})

    monkeypatch.setattr(engine, "_complete", fake_complete)
    monkeypatch.setattr(engine, "SAFETY_PASS", True)

    with pytest.raises(engine.UnsafeChapter) as error:
        run(engine.generate_chapter({"name": "Pip"}))

    assert "too scary" in str(error.value)


def test_generate_quest_uses_the_stubbed_model(monkeypatch):
    async def fake_complete(prompt, image_b64, image_data_url, system=engine.SYSTEM_PROMPT):
        assert "Arabic" in prompt
        return json.dumps(quest())

    monkeypatch.setattr(engine, "_complete", fake_complete)
    monkeypatch.setattr(engine, "SAFETY_PASS", False)

    result = run(
        engine.generate_quest(
            {
                "name": "Nori",
                "age_band": "6-8",
                "language": "ar",
                "knowledge": ["We look after the cat."],
            }
        )
    )

    assert len(result["stops"]) == 4
    assert result["safety"] == "unverified"
