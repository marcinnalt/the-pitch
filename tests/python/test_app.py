"""API tests for the optional FastAPI adapter.

Skipped automatically when the backend extras are not installed.
"""

import pytest

pytest.importorskip("fastapi", reason="install server/requirements.txt to run API tests")
pytest.importorskip("httpx", reason="install server/requirements.txt to run API tests")

from fastapi.testclient import TestClient  # noqa: E402

from server import app as app_module  # noqa: E402


@pytest.fixture()
def client():
    return TestClient(app_module.app)


def test_health_reports_engine_and_safety(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert "engine" in body
    assert "model" in body
    assert "safety_pass" in body


def test_chapter_endpoint_returns_the_generated_chapter(client, monkeypatch):
    seen = {}

    async def fake_generate(payload):
        seen.update(payload)
        return {
            "title": "The Yellow Gate",
            "narration": "Pip helps.",
            "choices": [{"label": "Help", "outcome": "It opens.", "lesson": "Notice."}],
            "engine": "stub",
            "safety": "checked",
        }

    monkeypatch.setattr(app_module, "generate_chapter", fake_generate)

    response = client.post(
        "/api/chapter",
        json={
            "name": "Nori",
            "lesson": "kindness",
            "age_band": "6-8",
            "language": "es",
            "transcript": "a fox",
            "drawing": "data:image/png;base64,AAAA",
            "knowledge": ["  We share the watering can.  ", "  "],
        },
    )

    assert response.status_code == 200
    assert response.json()["title"] == "The Yellow Gate"
    assert seen["language"] == "es"
    assert seen["knowledge"] == ["We share the watering can."]


def test_chapter_endpoint_rejects_an_oversized_drawing(client):
    response = client.post(
        "/api/chapter",
        json={"name": "Pip", "drawing": "data:image/png;base64," + "A" * 12_000_001},
    )

    assert response.status_code == 413


def test_chapter_endpoint_rejects_too_many_knowledge_notes(client):
    response = client.post(
        "/api/chapter",
        json={"name": "Pip", "knowledge": ["a", "b", "c", "d"]},
    )

    assert response.status_code == 422


def test_chapter_endpoint_maps_safety_rejection_to_422(client, monkeypatch):
    async def unsafe(payload):
        raise app_module.UnsafeChapter("too tense")

    monkeypatch.setattr(app_module, "generate_chapter", unsafe)

    response = client.post("/api/chapter", json={"name": "Pip"})

    assert response.status_code == 422
    assert "too tense" in response.json()["detail"]


def test_chapter_endpoint_maps_engine_failure_to_502(client, monkeypatch):
    async def broken(payload):
        raise app_module.EngineError("model unavailable")

    monkeypatch.setattr(app_module, "generate_chapter", broken)

    response = client.post("/api/chapter", json={"name": "Pip"})

    assert response.status_code == 502
    assert "model unavailable" in response.json()["detail"]


def test_quest_endpoint_returns_stops(client, monkeypatch):
    async def fake_quest(payload):
        return {
            "title": "A Kindness Quest",
            "stops": [
                {
                    "title": "The gate",
                    "prompt": "A gate.",
                    "choices": [
                        {"label": "Help", "outcome": "Open.", "lesson": "Notice."},
                        {"label": "Ask", "outcome": "Help.", "lesson": "Ask."},
                    ],
                }
            ],
        }

    monkeypatch.setattr(app_module, "generate_quest", fake_quest)

    response = client.post(
        "/api/quest",
        json={"name": "Nori", "language": "fr", "knowledge": ["The cat."]},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "A Kindness Quest"
    assert response.json()["stops"][0]["title"] == "The gate"


def test_quest_endpoint_limits_knowledge(client, monkeypatch):
    seen = {}

    async def fake_quest(payload):
        seen.update(payload)
        return {"title": "Q", "stops": []}

    monkeypatch.setattr(app_module, "generate_quest", fake_quest)

    response = client.post(
        "/api/quest",
        json={"name": "Nori", "knowledge": ["one", "two"]},
    )

    assert response.status_code == 200
    assert seen["knowledge"] == ["one", "two"]
