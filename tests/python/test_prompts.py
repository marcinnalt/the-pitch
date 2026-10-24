"""Prompt-contract tests: language, knowledge and quest instructions."""

from server import prompts


def test_twelve_lessons_are_available():
    assert len(prompts.LESSONS) == 12
    assert prompts.LESSONS["kindness"].startswith("kindness:")
    assert "problem_solving" in prompts.LESSONS


def test_all_four_ui_languages_are_known():
    assert set(prompts.LANGUAGES) == {"en", "es", "fr", "ar"}
    assert prompts.LANGUAGES["ar"].startswith("Arabic")


def test_chapter_prompt_carries_name_lesson_language_and_notes():
    prompt = prompts.build_user_prompt(
        name="Nori",
        lesson="sharing",
        age_band="6-8",
        transcript="a fox with a red hat",
        has_image=True,
        language="es",
        knowledge=["Grandma's garden: we share the watering can."],
    )

    assert "Nori" in prompt
    assert "sharing: making room" in prompt
    assert "Spanish (Español)" in prompt
    assert "Write the title, narration and every choice in Spanish" in prompt
    assert "Grandma's garden" in prompt
    assert "hand-drawn character" in prompt


def test_chapter_prompt_handles_no_drawing_and_no_notes():
    prompt = prompts.build_user_prompt(
        name="Pip",
        lesson="courage",
        age_band="4-6",
        transcript="",
        has_image=False,
        language="en",
    )

    assert "did not draw" in prompt
    assert "invent a gentle first beat" in prompt
    assert "Family notes" not in prompt
    assert "English" in prompt


def test_unknown_lesson_and_language_fall_back_to_defaults():
    prompt = prompts.build_user_prompt(
        name="Pip",
        lesson="astrophysics",
        age_band="4-6",
        transcript="",
        has_image=False,
        language="xx",
    )

    assert prompts.LESSONS["kindness"] in prompt
    assert "English" in prompt


def test_knowledge_is_limited_in_the_chapter_prompt():
    notes = [f"note {index} " + "x" * 900 for index in range(5)]
    prompt = prompts.build_user_prompt(
        name="Pip",
        lesson="kindness",
        age_band="4-6",
        transcript="",
        has_image=False,
        language="en",
        knowledge=notes,
    )

    assert "note 0" in prompt
    assert "note 2" in prompt
    assert "note 3" not in prompt
    assert "note 4" not in prompt


def test_quest_prompt_requires_four_stops_and_three_choices():
    prompt = prompts.build_quest_prompt(
        name="Nori",
        age_band="7-10",
        language="fr",
        lesson="kindness",
        knowledge=["We look after the neighbour's cat."],
    )

    assert "Nori" in prompt
    assert "French (Français)" in prompt
    assert "Four stops, three choices per stop" in prompt
    assert "neighbour's cat" in prompt
    assert "No cliffhanger" in prompt


def test_safety_prompt_embeds_the_chapter_json():
    prompt = prompts.build_safety_prompt(
        {
            "title": "The Gate",
            "narration": "A small gate.",
            "choices": [{"label": "Help", "outcome": "Kind.", "lesson": "Notice."}],
        }
    )

    assert "strict child-safety reviewer" in prompt
    assert '"title": "The Gate"' in prompt
    assert "CHAPTER JSON" in prompt
