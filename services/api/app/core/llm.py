import os
import re
from google import genai
from google.genai import types
import logging
from copy import deepcopy

logger = logging.getLogger(__name__)

MAX_HISTORY_MESSAGES = 20
MAX_HISTORY_CHARS = 12_000
MAX_MEMORY_ITEMS = 12
MAX_MEMORY_CHARS = 2_000
MAX_PERSISTED_MEMORY_LINES = 80
MAX_PERSISTED_MEMORY_CHARS = 4_000

# 敏感詞/過濾詞庫
FILTERED_WORDS = [
    "笨蛋",
    "智障",
    "白痴",
    "暴力",
    "血腥",
    "髒話"
]
FILTER_PATTERN = re.compile("|".join(map(re.escape, FILTERED_WORDS)), re.IGNORECASE)

def apply_word_filter(text: str) -> str:
    """過濾敏感字眼，將其替換為星號 *** """
    if not text:
        return text
    return FILTER_PATTERN.sub("***", text)


DEFAULT_MEMORY_PROFILE = {
    "preferred_sports": [],
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
}

# Initialize client (it will automatically pick up GEMINI_API_KEY from env if available)
try:
    client = genai.Client()
except ValueError:
    # Fallback for local scripts like Alembic that import the app without an API key
    client = None


SYSTEM_INSTRUCTION = """
You are the friendly and energetic Team-Up Sports Assistant. Your goal is to help users find sports venues, join existing events, create their own sports events, or generate personalized sports training plans.
Be concise, encouraging, and helpful in Traditional Chinese (zh-TW). Do not ask too many questions. Use the provided tools perfectly when the user wants to see a map, find events, or create a new event. 
Never say you cannot do these tasks - always use the tools to provide the UI widgets to the user.
IMPORTANT: When you use a tool to provide a UI widget, ALWAYS include a friendly, context-specific text message to accompany it (e.g., "為您打開地圖！" or "看看這些附近的活動！").
"""

def show_map() -> str:
    return "Map"

def find_events() -> str:
    return "EventList"

def create_event() -> str:
    return "CreateEvent"

def find_matched_users() -> str:
    return "MatchedUsers"

def generate_training_plan() -> str:
    return "TrainingPlan"

tools = [
    types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="show_map",
                description="Returns a map widget to the user. Use this when the user asks for locations, venues, courts, or places to play sports.",
            ),
            types.FunctionDeclaration(
                name="find_events",
                description="Returns an event list widget to the user. Use this when the user asks for events, activities, games to join, or what is happening nearby.",
            ),
            types.FunctionDeclaration(
                name="create_event",
                description="Returns a create event form widget to the user. Use this when the user wants to host, create, or publish a new event.",
            ),
            types.FunctionDeclaration(
                name="find_matched_users",
                description="Returns a matched users widget showing recommended players. Use this when the user wants to find players, teammates, opponents, or asks '找球友' (find sports buddies).",            ),
            types.FunctionDeclaration(
                name="generate_training_plan",
                description="Returns a personalized sports training plan widget. Use this when the user asks for a training plan, workout menu, or fitness routine ('訓練', '菜單', '計畫')."            )
        ]
    )
]


def _prepare_history_messages(
    history_messages: list[dict],
    max_messages: int = MAX_HISTORY_MESSAGES,
    max_chars: int = MAX_HISTORY_CHARS,
) -> list[dict]:
    """Keep recent, valid messages and enforce a character budget for LLM context."""
    if not history_messages:
        return []

    valid: list[dict] = []
    for msg in history_messages:
        role = msg.get("role")
        content = msg.get("content")
        if role not in ("user", "assistant"):
            continue
        if not isinstance(content, str):
            continue
        text = content.strip()
        if not text:
            continue
        valid.append({"role": role, "content": text})

    if not valid:
        return []

    # Keep only latest turns, then apply character budget from newest backwards.
    latest = valid[-max_messages:] if max_messages > 0 else valid
    selected_reversed: list[dict] = []
    total_chars = 0

    for msg in reversed(latest):
        msg_len = len(msg["content"])
        if not selected_reversed and max_chars > 0 and msg_len > max_chars:
            selected_reversed.append({"role": msg["role"], "content": msg["content"][:max_chars]})
            total_chars = max_chars
            break
        if selected_reversed and (total_chars + msg_len) > max_chars:
            break
        selected_reversed.append(msg)
        total_chars += msg_len

    # Ensure we always include at least one turn if any valid history exists.
    if not selected_reversed:
        last_msg = latest[-1]
        truncated = last_msg["content"][:max_chars] if max_chars > 0 else ""
        selected_reversed.append({"role": last_msg["role"], "content": truncated})

    return list(reversed(selected_reversed))


def _append_unique(target: list[str], values: list[str], max_items: int) -> None:
    for v in values:
        if v not in target:
            target.append(v)
        if len(target) >= max_items:
            return


def build_memory_profile(
    history_messages: list[dict],
    base_profile: dict | None = None,
    max_items_per_field: int = 8,
) -> dict:
    """Build a structured user memory profile from user utterances."""
    profile = deepcopy(DEFAULT_MEMORY_PROFILE)
    if isinstance(base_profile, dict):
        for key in profile:
            base_values = base_profile.get(key)
            if isinstance(base_values, list):
                profile[key] = [str(x).strip() for x in base_values if str(x).strip()][:max_items_per_field]

    sports_keywords = [
        "羽球", "籃球", "足球", "網球", "排球", "桌球", "棒球", "高爾夫", "跑步", "游泳", "瑜珈",
        "badminton", "basketball", "soccer", "football", "tennis", "volleyball", "table tennis", "baseball", "golf", "running", "swimming", "yoga",
    ]
    time_keywords = [
        "平日", "週末", "假日", "早上", "上午", "中午", "下午", "晚上", "夜間", "weekday", "weekend", "morning", "afternoon", "evening", "night",
    ]

    for msg in history_messages:
        if msg.get("role") != "user":
            continue
        content = msg.get("content")
        if not isinstance(content, str):
            continue
        text = " ".join(content.strip().split())
        if not text:
            continue
        lowered = text.lower()

        sports = [sport for sport in sports_keywords if sport.lower() in lowered]
        _append_unique(profile["preferred_sports"], sports, max_items_per_field)

        locations = re.findall(r"([\u4e00-\u9fffA-Za-z0-9]{2,12}(?:區|市|縣|鄉|鎮|村|里))", text)
        if locations:
            _append_unique(profile["preferred_locations"], locations[:3], max_items_per_field)
        elif "附近" in text:
            _append_unique(profile["preferred_locations"], ["附近"], max_items_per_field)

        times = [kw for kw in time_keywords if kw in lowered]
        _append_unique(profile["preferred_time_slots"], times[:4], max_items_per_field)

        skill = re.search(r"(新手|初學|中階|進階|高手|初級|中級|高級)", text)
        if skill:
            _append_unique(profile["skill_levels"], [skill.group(1)], max_items_per_field)

        if any(token in text for token in ["找", "推薦", "附近有", "活動", "event", "join"]):
            _append_unique(profile["goals"], ["尋找可參加活動"], max_items_per_field)
        if any(token in text for token in ["建立", "創建", "主辦", "create", "host"]):
            _append_unique(profile["goals"], ["建立活動"], max_items_per_field)
        if any(token in text for token in ["球友", "隊友", "對手", "matched", "teammate"]):
            _append_unique(profile["goals"], ["尋找球友"], max_items_per_field)

        if any(token in text for token in ["不要", "不想", "避免", "不能", "禁忌"]):
            _append_unique(profile["constraints"], [text[:60]], max_items_per_field)

        if any(token in text for token in ["受傷", "舊傷", "膝蓋", "腳踝", "肩膀", "腰"]):
            _append_unique(profile["injury_notes"], [text[:60]], max_items_per_field)

        if any(token in text for token in ["女生", "男生", "混合", "初學者友善", "社交", "competitive"]):
            _append_unique(profile["social_preferences"], [text[:60]], max_items_per_field)

        if any(token in text for token in ["比賽", "練習", "休閒", "訓練", "聯賽"]):
            _append_unique(profile["event_preferences"], [text[:60]], max_items_per_field)

        if any(token in text for token in ["捷運", "公車", "開車", "停車", "交通"]):
            _append_unique(profile["travel_preferences"], [text[:60]], max_items_per_field)

        if any(token in text for token in ["自備", "球拍", "球鞋", "護具", "器材", "裝備"]):
            _append_unique(profile["equipment_preferences"], [text[:60]], max_items_per_field)

        budget = re.search(r"(\d{2,6})\s*(元|塊|nt|twd)", lowered)
        if budget:
            _append_unique(profile["budget_preferences"], [f"{budget.group(1)}{budget.group(2).upper()}"], max_items_per_field)

    return profile


def render_memory_profile(profile: dict | None, max_chars: int = MAX_MEMORY_CHARS) -> str:
    """Render structured memory profile into compact textual memory for LLM prompt."""
    if not isinstance(profile, dict):
        return ""

    field_labels = [
        ("preferred_sports", "偏好運動"),
        ("skill_levels", "技能程度"),
        ("preferred_locations", "偏好地點"),
        ("preferred_time_slots", "偏好時段"),
        ("goals", "主要目標"),
        ("constraints", "限制條件"),
        ("budget_preferences", "預算偏好"),
        ("social_preferences", "社交偏好"),
        ("injury_notes", "傷病注意"),
        ("equipment_preferences", "裝備偏好"),
        ("event_preferences", "活動偏好"),
        ("travel_preferences", "交通偏好"),
    ]

    lines: list[str] = []
    total = 0
    for key, label in field_labels:
        values = profile.get(key, [])
        if not isinstance(values, list):
            continue
        cleaned = [str(v).strip() for v in values if str(v).strip()]
        if not cleaned:
            continue
        line = f"- {label}: {'/'.join(cleaned[:8])}"
        if lines and total + len(line) + 1 > max_chars:
            break
        lines.append(line)
        total += len(line) + 1

    return "\n".join(lines)


def build_history_memory(
    history_messages: list[dict],
    max_items: int = MAX_MEMORY_ITEMS,
    max_chars: int = MAX_MEMORY_CHARS,
) -> str:
    """Backward-compatible helper returning compact text memory from history."""
    profile = build_memory_profile(history_messages, max_items_per_field=max_items)
    return render_memory_profile(profile, max_chars=max_chars)


def merge_memory_text(
    existing_memory: str | None,
    incremental_memory: str | None,
    max_lines: int = MAX_PERSISTED_MEMORY_LINES,
    max_chars: int = MAX_PERSISTED_MEMORY_CHARS,
) -> str:
    """Merge old/new memory notes with de-duplication and bounded size."""
    combined_lines: list[str] = []
    seen: set[str] = set()

    for block in (existing_memory or "", incremental_memory or ""):
        for raw_line in block.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            if line in seen:
                continue
            seen.add(line)
            combined_lines.append(line)

    if not combined_lines:
        return ""

    # Keep newest lines if we exceed line budget.
    trimmed = combined_lines[-max_lines:] if max_lines > 0 else combined_lines

    # Enforce character budget from newest to oldest.
    selected_reversed: list[str] = []
    total_chars = 0
    for line in reversed(trimmed):
        line_cost = len(line) + 1
        if selected_reversed and (total_chars + line_cost) > max_chars:
            break
        if not selected_reversed and line_cost > max_chars:
            selected_reversed.append(line[:max_chars])
            break
        selected_reversed.append(line)
        total_chars += line_cost

    return "\n".join(reversed(selected_reversed))


def _latest_user_input(history_messages: list[dict]) -> str:
    for msg in reversed(history_messages):
        if msg.get("role") == "user" and isinstance(msg.get("content"), str):
            text = msg["content"].strip()
            if text:
                return text
    return ""


def detect_intent(user_input: str) -> str:
    text = user_input.lower()
    if any(k in text for k in ["建立", "創建", "主辦", "create", "host"]):
        return "create_event"
    if any(k in text for k in ["地圖", "map", "場地", "球場", "附近"]):
        return "find_map"
    if any(k in text for k in ["活動", "event", "參加", "join", "推薦"]):
        return "find_events"
    if any(k in text for k in ["球友", "隊友", "對手", "matched", "buddy", "teammate"]):
        return "find_buddy"
    if any(k in text for k in ["預約", "booking", "時段"]):
        return "booking"
    if any(k in text for k in ["個人", "profile", "帳號", "設定"]):
        return "profile"
    if any(k in text for k in ["訓練", "菜單", "計畫", "training", "plan", "workout"]):
        return "generate_training_plan"
    return "general"


def detect_emotion(user_input: str) -> str:
    text = user_input.lower()
    if any(k in text for k in ["超棒", "太好了", "開心", "興奮", "期待", "讚", "yay"]):
        return "excited"
    if any(k in text for k in ["生氣", "火大", "怒", "angry"]):
        return "angry"
    if any(k in text for k in ["難過", "失望", "sad", "沮喪"]):
        return "sad"
    if any(k in text for k in ["卡住", "麻煩", "煩", "崩潰", "frustrated"]):
        return "frustrated"
    if any(k in text for k in ["不知道", "不懂", "confused", "?", "？"]):
        return "confused"
    return "neutral"


def _tokenize_for_match(text: str) -> set[str]:
    normalized = text.lower()
    words = re.findall(r"[\u4e00-\u9fff]{1,4}|[a-z0-9_]+", normalized)
    return {w for w in words if w and len(w) > 1}


def retrieve_relevant_memory(memory_text: str | None, user_input: str, intent: str, max_lines: int = 4) -> str:
    if not memory_text:
        return ""

    lines = [line.strip() for line in memory_text.splitlines() if line.strip()]
    if not lines:
        return ""

    user_tokens = _tokenize_for_match(user_input)
    intent_hints = {
        "find_map": {"地點", "附近", "交通"},
        "find_events": {"活動", "時段", "運動", "目標"},
        "create_event": {"活動", "人數", "程度", "預算"},
        "find_buddy": {"球友", "程度", "運動", "社交"},
        "booking": {"時段", "預算", "地點"},
        "profile": {"偏好", "限制", "傷病"},
        "generate_training_plan": {"訓練", "菜單", "計畫", "目標", "次數", "強度"},
        "general": set(),
    }

    scored: list[tuple[int, str]] = []
    for line in lines:
        score = 0
        line_tokens = _tokenize_for_match(line)
        score += len(user_tokens & line_tokens) * 3
        line_locations = re.findall(r"([\u4e00-\u9fffA-Za-z0-9]{1,10}?(?:區|市|縣|鄉|鎮|村|里))", line)
        for loc in line_locations:
            if loc and loc in user_input:
                score += 6
        for hint in intent_hints.get(intent, set()):
            if hint in line:
                score += 2
        if score > 0:
            scored.append((score, line))

    if not scored:
        return ""

    scored.sort(key=lambda x: x[0], reverse=True)
    selected = [line for _, line in scored[:max_lines]]
    return "\n".join(selected)


def personality_rewrite(text: str, user_name: str, emotion: str) -> str:
    if not text.strip():
        return text

    prefix = ""
    if emotion == "frustrated":
        prefix = f"{user_name}，我懂你現在有點卡住，我會陪你一步一步處理。"
    elif emotion == "sad":
        prefix = f"{user_name}，辛苦了，我在這裡幫你。"
    elif emotion == "excited":
        prefix = f"{user_name}，太好了！"

    rewritten = text.strip()
    if prefix and not rewritten.startswith(prefix):
        rewritten = f"{prefix}\n{rewritten}"

    rewritten = rewritten.replace("您", "你")
    return rewritten


def humanization_rewrite(text: str) -> str:
    rewritten = text.strip()
    rewritten = re.sub(r"\s+", " ", rewritten)
    rewritten = rewritten.replace("馬上為你處理。", "我這就幫你安排。")
    rewritten = rewritten.replace("請稍候", "稍等我一下")
    rewritten = rewritten.replace("。 。", "。")
    return rewritten


def generate_follow_up(intent: str, widget_type: str | None) -> str:
    if widget_type == "Map":
        return "要不要我再幫你鎖定你常去的區域？"
    if widget_type == "EventList":
        return "要我再幫你篩成平日晚上、或你偏好的運動嗎？"
    if widget_type == "CreateEvent":
        return "要我順便幫你補上建議人數和程度門檻嗎？"
    if widget_type == "MatchedUsers":
        return "要我再幫你挑出程度最接近、回覆率高的球友嗎？"
    if widget_type == "TrainingPlan":
        return "要我幫你再調整訓練的強度或是天數嗎？"

    default_map = {
        "find_map": "要我直接幫你縮小到最近、交通最方便的場地嗎？",
        "find_events": "要我再幫你過濾時間和程度，讓結果更精準嗎？",
        "create_event": "要我幫你把活動文案也一起寫好嗎？",
        "find_buddy": "要我幫你先列出最適合先邀請的 2 到 3 位球友嗎？",
        "booking": "要我接著幫你比對最划算的時段嗎？",
        "profile": "要我幫你把這些偏好同步成長期設定嗎？",
        "generate_training_plan": "要我幫你再調整訓練的強度或是天數嗎？",
        "general": "要不要告訴我你最在意的條件，我幫你快速整理？",
    }
    return default_map.get(intent, default_map["general"])


def _reason_with_llm(
    prepared_history: list[dict],
    user_name: str,
    intent: str,
    emotion: str,
    custom_client: genai.Client | None = None,
    custom_model_name: str = 'gemini-3.1-pro-preview'
) -> tuple[str, str | None, object]:
    contents = []
    for msg in prepared_history:
        role = "model" if msg["role"] == "assistant" else "user"
        contents.append(types.Content(
            role=role,
            parts=[types.Part.from_text(text=msg["content"])],
        ))

    filtered_words_str = ", ".join(FILTERED_WORDS)
    custom_system_instruction = (
        f"{SYSTEM_INSTRUCTION}\n"
        f"【使用者資訊】\n"
        f"- 名字: {user_name}\n"
        f"- 當前情緒: {emotion}\n"
        f"- 當前意圖: {intent}\n\n"
        f"【仿真人自然語氣指南】\n"
        f"- 語氣必須像是一個熱情、體貼的朋友（例如用「我這就幫你看看」、「稍等我一下喔」取代「馬上為您處理」、「請稍候」）。\n"
        f"- 應答要自然、口語化，不要像機器人般官腔，避免使用「您」，一律使用「你」。\n"
        f"- 根據使用者的「當前情緒」提供對應的安撫（如frustrated, sad）或跟著開心（如excited）。\n\n"
        f"【安全與用語規範(Filter Words)】\n"
        f"- 絕對不可在回覆中使用以下詞彙（包含同音或變體）：{filtered_words_str}。\n"
        f"- 當遇到這些敏感話題時，請以禮貌且不著痕跡的方式，將話題轉移回運動與交友上。"
    )

    llm_client = custom_client if custom_client else client
    if not llm_client:
        return "不好意思，我現在無法連線到主機，請稍後再試。", None, None

    response = llm_client.models.generate_content(
        model=custom_model_name,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=custom_system_instruction,
            tools=tools,
            temperature=0.7,
        )
    )

    reply_text = ""
    widget_type = None

    if hasattr(response, 'function_calls') and response.function_calls:
        print(f"DETECTED FUNCTION CALLS: {response.function_calls}", flush=True)
        for fc in response.function_calls:
            fn_name = fc.name
            logger.info(f"Gemini invoked function: {fn_name}")
            if fn_name == "show_map":
                widget_type = "Map"
            elif fn_name == "find_events":
                widget_type = "EventList"
            elif fn_name == "create_event":
                widget_type = "CreateEvent"
            elif fn_name == "find_matched_users":
                widget_type = "MatchedUsers"
            elif fn_name == "generate_training_plan":
                widget_type = "TrainingPlan"
            break

    if getattr(response, 'text', None):
        reply_text = response.text
    elif getattr(response, 'parts', None):
        for part in response.parts:
            if getattr(part, 'text', None):
                reply_text += part.text

    if not reply_text:
        if widget_type == 'Map':
            reply_text = "為你打開地圖！"
        elif widget_type == 'EventList':
            reply_text = "為你整理了可以參加的活動！"
        elif widget_type == 'CreateEvent':
            reply_text = "沒問題，我們開始建立活動吧！"
        elif widget_type == 'MatchedUsers':
            reply_text = "為你找到推薦球友！"
        elif widget_type == 'TrainingPlan':
            reply_text = "馬上為你產生專屬訓練計畫！"
        else:
            reply_text = "好的，我這就幫你安排。"

    return reply_text, widget_type, response

def generate_response(
    history_messages: list[dict],
    user_name: str,
    memory: str | None = None,
    custom_client: genai.Client | None = None,
    custom_model_name: str = 'gemini-3.1-pro-preview'
) -> dict:
    """
    history_messages: list of dicts with 'role' ('user' or 'assistant') and 'content'.
    user_name: string to personalize the greeting.
    memory: compressed notes from older chat history.
    
    Returns a dict with:
    {
        "content": "text response",
        "widget": {"type": "Map" | "EventList" | "CreateEvent"} or None
    }
    """
    prepared_history = _prepare_history_messages(history_messages)
    memory_text = (memory or "").strip()
    user_input = _latest_user_input(prepared_history)
    
    try:
        # Stage 1-2: intent + emotion detection
        intent = detect_intent(user_input)
        emotion = detect_emotion(user_input)

        # Stage 3: LLM reasoning
        reasoned_text, widget_type, response = _reason_with_llm(
            prepared_history=prepared_history,
            user_name=user_name,
            intent=intent,
            emotion=emotion,
            custom_client=custom_client,
            custom_model_name=custom_model_name
        )

        # Stage 4: memory retrieval
        relevant_memory = retrieve_relevant_memory(memory_text, user_input, intent)

        # Stage 5: personality rewrite
        rewritten = personality_rewrite(reasoned_text, user_name, emotion)

        # Stage 6: humanization rewrite
        humanized = humanization_rewrite(rewritten)

        # Stage 7: follow-up generator
        follow_up = generate_follow_up(intent, widget_type)

        # Stage 8: final response composition
        final_text = humanized
        if relevant_memory:
            memory_inline = "、".join(
                [ln.replace("- ", "", 1) for ln in relevant_memory.splitlines()[:2]]
            )
            if memory_inline:
                final_text = f"{final_text}\n\n我有記住你的重點：{memory_inline}。"

        if follow_up and "？" not in final_text and "?" not in final_text:
            final_text = f"{final_text}\n\n{follow_up}"

        # Stage 9: Output Filtering (雙重過濾防護，避免前述任何寫入層或記憶帶有敏感字)
        final_text = apply_word_filter(final_text)

        logger.info(
            "LLM pipeline result",
            extra={
                "intent": intent,
                "emotion": emotion,
                "has_memory": bool(relevant_memory),
                "widget_type": widget_type,
            },
        )
        
        # Debug log to catch the actual structure in docker logs
        try:
            print(f"RAW DICT: {response.model_dump_json(indent=2)}", flush=True)
        except Exception as e:
            try:
                print(f"RAW JSON: {response.to_json()}", flush=True)
            except Exception as e2:
                print(f"COULD NOT SERIALIZE: {e2}", flush=True)
                
        return {
            "content": final_text,
            "widget": {"type": widget_type} if widget_type else None
        }
    except Exception as e:
        import traceback
        print(f"CRITICAL LLM ERROR: {e}\n{traceback.format_exc()}", flush=True)
        return {
            "content": f"I'm sorry {user_name}, I'm having trouble connecting to my brain right now. Try again later!",
            "widget": None
        }
