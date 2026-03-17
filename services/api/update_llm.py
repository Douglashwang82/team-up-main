import re

file_path = "services/api/app/core/llm.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Filter words at the top if not exists
filter_config = """
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
    \"\"\"過濾敏感字眼，將其替換為星號 *** \"\"\"
    if not text:
        return text
    return FILTER_PATTERN.sub("***", text)
"""

if "FILTERED_WORDS =" not in content:
    content = content.replace(
        "MAX_PERSISTED_MEMORY_CHARS = 4_000",
        filter_config
    )

# 2. Update _reason_with_llm SYSTEM INSTRUCTION building
old_sys_prompt = """\
        config=types.GenerateContentConfig(
            system_instruction=(
                f"{SYSTEMimport re

file_path = "serv  
file_pae u
with open(file_path, "r", encoding="utf-       content = f.read()

# 1. Add Filter words at  
# 1. Add Filter word {efilter_config = """
MAX_PERSISTED_MEMORY_LINE= MAX_PERSISTED_MEMOreMAX_PERSISTED_MEMORY_CHARS = 4ED
# 敏感詞/過濾詞庫
FILTEREtruFILTERED_WORDS = [
    "{    "笨蛋",
   N}    "智障"      "白痴"??    "暴力"\\    "血腥"      "髒話" {]
FILTER_PA\n"

def apply_word_filter(text: str) -> str:
    \"\"\"過濾敏感字眼，將其替?n\    \"\"\"過濾敏感字眼，將????   if not text:
        return text
    return FILTER_PATTERN??        return ?   return FILTER_??""

if 看看」、「稍等我一下喔?i???   content = content.replace(
     ??        "MAX_PERSISTED_MEMORYf"        filter_config
    )

# 2. Update _re?   )

# 2. Update _??
# 2???ld_sys_prompt = """\
        config=types.GenerateCont ?       config=types?           system_instruction=(
         us                f"{SYSTEMimport??file_path = "serv  
file_pae u
w  ffile_pae u
with op??ith opente
# 1. Add Filter words at  
# 1. Add Filter word {efilter_config?? 1. Add Filter word {efi_sMAX_PERSISTED_MEMORY_LINE= MAX_PERSISTED_?? 敏感詞/過濾詞庫
FILTEREtruFILTERED_WORDS = [
    "{    "笨蛋",
   N??FILTEREtruFILTERED_WORD      "{    "笨蛋",
   N}  yp   N}    "智障" CoFILTER_PA\n"

def apply_word_filter(text: str) -> str:
    \"\"\"過濾敏? 
def apply_epl    \"\"\"過濾敏感字眼，將其?.        return text
    return FILTER_PATTERN??        return ?   return FILTER_??""

if 看看?i    return FILTER_??
inot in final_text and "?" not in final_text:
            final_text     ??        "MAX_PERSfollow_up}"

        logger.info(
"""

new_final_c    )

# 2. Update _re?   )

# 2. Update _??
# 2???lal_te
# 2nd 
# 2. Update _??
text:
 # 2???ld_syinal        config=tytext}\\n\\n         us                f"{SYSTEMimport??file_path = "serv  
file_pae u
w  ffile_paeplfile_pae u
w  ffile_pae u
with op??ith opente
# 1. Add Filter 9:w  ffile_ilwith op??itin # 1. Add Filter wort # 1. Add Filter word {efiomFILTEREtruFILTERED_WORDS = [
    "{    "笨蛋",
   N??FILTEREtruFILTERED_WORD  f.write(content)

print("Update completed.")
