from app.core.llm import (
    _prepare_history_messages,
    build_history_memory,
    build_memory_profile,
    detect_emotion,
    detect_intent,
    generate_follow_up,
    retrieve_relevant_memory,
    render_memory_profile,
    merge_memory_text,
)


def test_prepare_history_keeps_latest_messages_only():
    history = [
        {"role": "user", "content": f"msg-{i}"}
        for i in range(10)
    ]

    prepared = _prepare_history_messages(history, max_messages=4, max_chars=1000)

    assert [m["content"] for m in prepared] == ["msg-6", "msg-7", "msg-8", "msg-9"]


def test_prepare_history_respects_char_budget_from_recent_end():
    history = [
        {"role": "user", "content": "a" * 20},
        {"role": "assistant", "content": "b" * 20},
        {"role": "user", "content": "c" * 20},
    ]

    prepared = _prepare_history_messages(history, max_messages=10, max_chars=40)

    assert len(prepared) == 2
    assert prepared[0]["content"] == "b" * 20
    assert prepared[1]["content"] == "c" * 20


def test_prepare_history_filters_invalid_entries_and_keeps_one_message():
    history = [
        {"role": "system", "content": "ignore"},
        {"role": "user", "content": "   "},
        {"role": "assistant", "content": "x" * 50},
    ]

    prepared = _prepare_history_messages(history, max_messages=10, max_chars=10)

    assert len(prepared) == 1
    assert prepared[0]["role"] == "assistant"
    assert prepared[0]["content"] == "x" * 10


def test_build_history_memory_compresses_older_messages():
    history = [
        {"role": "user", "content": "我喜歡打羽球，每週三晚上有空"},
        {"role": "assistant", "content": "了解，你偏好平日晚上。"},
        {"role": "user", "content": "希望在大安區附近找場地"},
    ]

    memory = build_history_memory(history, max_items=10, max_chars=500)

    assert isinstance(memory, str)
    assert "偏好運動" in memory
    assert "大安區" in memory
    assert "目標: 尋找可參加活動" in memory


def test_build_history_memory_respects_limits_and_dedupes():
    history = [
        {"role": "user", "content": "我想打羽球"},
        {"role": "user", "content": "我想打羽球"},
        {"role": "assistant", "content": "收到"},
    ]

    memory = build_history_memory(history, max_items=2, max_chars=40)

    lines = [line for line in memory.split("\n") if line.strip()]
    assert len(lines) <= 2
    assert memory.count("偏好運動") <= 1


def test_build_history_memory_skips_non_user_noise():
    history = [
        {"role": "assistant", "content": "這是一段模型輸出，不應寫成使用者知識"},
        {"role": "user", "content": "我住在信義區，平日晚上想找籃球團"},
    ]

    memory = build_history_memory(history, max_items=10, max_chars=500)

    assert "信義區" in memory
    assert "偏好時段" in memory
    assert "偏好運動" in memory
    assert "模型輸出" not in memory


def test_merge_memory_text_dedupes_and_keeps_recent():
    existing = "- 使用者：喜歡羽球\n- 助理：已記住偏好"
    incremental = "- 助理：已記住偏好\n- 使用者：週末下午有空"

    merged = merge_memory_text(existing, incremental, max_lines=3, max_chars=200)

    assert merged.count("已記住偏好") == 1
    assert "喜歡羽球" in merged
    assert "週末下午" in merged


def test_build_memory_profile_extracts_rich_fields():
    profile = build_memory_profile([
        {"role": "user", "content": "我在信義區，平日晚上打羽球，中級程度，預算500元，想找球友"},
        {"role": "assistant", "content": "收到"},
        {"role": "user", "content": "我有膝蓋舊傷，盡量避免太激烈比賽"},
    ])

    assert "羽球" in profile["preferred_sports"]
    assert any("信義區" in loc for loc in profile["preferred_locations"])
    assert "平日" in profile["preferred_time_slots"] or "晚上" in profile["preferred_time_slots"]
    assert "中級" in profile["skill_levels"]
    assert any("500" in b for b in profile["budget_preferences"])
    assert any("尋找球友" == g for g in profile["goals"])
    assert len(profile["injury_notes"]) >= 1


def test_render_memory_profile_outputs_compact_key_knowledge():
    profile = {
        "preferred_sports": ["羽球"],
        "skill_levels": ["中級"],
        "preferred_locations": ["大安區"],
        "preferred_time_slots": ["平日", "晚上"],
        "goals": ["尋找可參加活動"],
        "constraints": [],
        "budget_preferences": ["500元"],
        "social_preferences": [],
        "injury_notes": [],
        "equipment_preferences": [],
        "event_preferences": [],
        "travel_preferences": [],
    }

    memory = render_memory_profile(profile, max_chars=300)
    assert "偏好運動" in memory
    assert "技能程度" in memory
    assert "偏好地點" in memory
    assert "預算偏好" in memory


def test_detect_intent_and_emotion():
    assert detect_intent("幫我找附近羽球活動") == "find_map"
    assert detect_intent("想找球友一起打球") == "find_buddy"
    assert detect_intent("幫我建立一個活動") == "create_event"

    assert detect_emotion("太好了我超期待") == "excited"
    assert detect_emotion("我真的很卡住") == "frustrated"


def test_retrieve_relevant_memory_by_intent_and_keywords():
    memory_text = "\n".join([
        "- 偏好運動: 羽球",
        "- 偏好地點: 信義區",
        "- 偏好時段: 平日/晚上",
        "- 預算偏好: 500元",
    ])
    selected = retrieve_relevant_memory(memory_text, "幫我找信義區平日晚上的活動", "find_events")

    assert "信義區" in selected
    assert "平日" in selected


def test_generate_follow_up_for_widget_and_intent():
    assert "鎖定" in generate_follow_up("find_map", "Map")
    assert "球友" in generate_follow_up("find_buddy", None)