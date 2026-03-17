import re

path = "apps/mobile/app/index.tsx"
with open(path, "r") as f:
    text = f.read()

# Replace onContentSizeChange ... onLayout ... ListEmptyComponent
pattern = r"onContentSizeChange=\{\(w,\s*h)\s*=>\s*\{.*?ListEmptyComponent="

replacement = r""onLayout={() => {
                            // Automatically scroll down when keyboard pushes container up
                            if (messages.length > 0 && !isLoadingMore) {
                                setTimeout(() => {
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                }, 50);
                            }
                        }}
                        ListEmptyComponent="""

new_text = re.sub(pattern, replacement, text, flags=re.DOTALL)
with open(path, "w") as f:
    f.write(new_text)

print("Replaced!")
