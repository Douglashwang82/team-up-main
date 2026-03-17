from datetime import datetime, timedelta, timezone

from app.models import ChatMessage, ChatMemory


def test_chat_route_uses_latest_30_messages_in_order(
    client,
    db,
    user,
    auth_headers,
    monkeypatch,
):
    captured = {}

    def fake_generate_response(history, user_name, memory=None):
        captured["history"] = history
        captured["user_name"] = user_name
        captured["memory"] = memory
        return {"content": "ok", "widget": None}

    monkeypatch.setattr("app.routes.chat.generate_response", fake_generate_response)

    base = datetime.now(timezone.utc) - timedelta(minutes=200)
    older_seed = [
        "我住在大安區",
        "我喜歡羽球",
        "平日晚上有空",
        "想找附近活動",
        "我是中級程度",
        "預算大約500元",
    ]
    for i in range(35):
        content = older_seed[i] if i < len(older_seed) else f"m{i}"
        role = "user" if i < len(older_seed) else ("assistant" if i % 2 else "user")
        db.add(
            ChatMessage(
                user_id=user.id,
                role=role,
                content=content,
                created_at=base + timedelta(minutes=i),
            )
        )
    db.commit()

    response = client.post(
        "/chat/messages",
        headers=auth_headers,
        json={"role": "user", "content": "trigger"},
    )

    assert response.status_code == 201
    assert "history" in captured

    sent_contents = [m["content"] for m in captured["history"]]

    # Route keeps newest 30 messages after inserting the trigger message.
    expected_contents = [f"m{i}" for i in range(6, 35)] + ["trigger"]
    assert sent_contents == expected_contents
    assert captured["user_name"] == "Test"
    assert isinstance(captured["memory"], str)
    assert "偏好運動" in captured["memory"]

    memory_row = db.query(ChatMemory).filter(ChatMemory.user_id == user.id).first()
    assert memory_row is not None
    assert isinstance(memory_row.memory_text, str)
    assert memory_row.memory_text.strip() != ""
    assert isinstance(memory_row.memory_profile, dict)
    assert "preferred_sports" in memory_row.memory_profile


def test_chat_route_reuses_persisted_memory(
    client,
    db,
    user,
    auth_headers,
    monkeypatch,
):
    db.add(
        ChatMemory(
            user_id=user.id,
            memory_text="- 偏好運動: 羽球",
            memory_profile={
                "preferred_sports": ["羽球"],
                "skill_levels": [],
                "preferred_locations": [],
                "preferred_time_slots": [],
                "goals": [],
                "constraints": [],
                "budget_preferences": [],
                "social_preferences": [],
                "injury_notes": [],
                "equipment_preferences": [],
                "event_preferences": [],
                "travel_preferences": [],
            },
        )
    )
    db.commit()

    captured = {}

    def fake_generate_response(history, user_name, memory=None):
        captured["memory"] = memory
        return {"content": "ok", "widget": None}

    monkeypatch.setattr("app.routes.chat.generate_response", fake_generate_response)

    response = client.post(
        "/chat/messages",
        headers=auth_headers,
        json={"role": "user", "content": "今天想找人打球"},
    )

    assert response.status_code == 201
    assert "羽球" in (captured.get("memory") or "")


def test_clear_messages_also_clears_memory(
    client,
    db,
    user,
    auth_headers,
):
    db.add(ChatMessage(user_id=user.id, role="user", content="hello"))
    db.add(ChatMemory(user_id=user.id, memory_text="- 使用者：hello"))
    db.commit()

    response = client.delete("/chat/messages", headers=auth_headers)

    assert response.status_code == 200
    assert db.query(ChatMessage).filter(ChatMessage.user_id == user.id).count() == 0
    assert db.query(ChatMemory).filter(ChatMemory.user_id == user.id).count() == 0