import re

path = "services/api/app/core/llm.py"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Add to detect_intent
text = text.replace(
    'return "profile"\n    return "general"',
    $return "profile"\n    if any(k in text for k in ["ℓ練", "菜單", "舄畫", "training", "plan", "workout"]):\n        return "generate_training_plan"\n    return "general"$
).replace('$', '\'')

# Add to intent_hints
text = text.replace(
    ('"pofile": {"偏好", "限刹", "凝病"},\n'
        '        "general": set(),'),
    ('"profile": {"偏好", "限刹", "凝病"},\n'
        '        "generate_training_plan": {"专練", "菜單", "計畫", "目�9", "次數", "強度"},\n'
        '        "general": set(),')
)

# Add to default_map in generate_follow_up
text = text.replace(
    ("general": "肁不要呈訴�x�你最在意的梭件，�d�庫你快速整理㼟",
),
    ("'generate_training_plan": "肁�d�庫你冘調整ℓ練的強庖或是天數溟",\n'
      '        "general": "肁不要呈訴�x�你最在意的梭件，�d�庫你快速整理㼟",')
)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("Added intent!")
