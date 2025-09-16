import secrets
import string

_BASE62 = string.ascii_letters + string.digits
def gen_invite_token(length: int = 28) -> str:
    # 高熵 base62 token：用於 invite_only event
    return "".join(secrets.choice(_BASE62) for _ in range(length))
