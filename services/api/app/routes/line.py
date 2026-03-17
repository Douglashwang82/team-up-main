from flask import Blueprint, request, abort, jsonify, g
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import MessageEvent, TextMessage, TextSendMessage
from pydantic_core import ValidationError
from google import genai
from ..core.db import SessionLocal
from ..core.auth import require_auth
from ..models.line_bot import LineBotConfig
from ..schemas.line_bot import LineBotConfigCreate, LineBotConfigUpdate, LineBotConfigResponse
import uuid
from ..core.llm import generate_response

bp = Blueprint("line", __name__, url_prefix="/line")

@bp.get("/config")
@require_auth
def get_bot_config():
    """取得當前使用者的 LINE Bot 設定"""
    with SessionLocal() as db:
        config = db.query(LineBotConfig).filter(LineBotConfig.owner_id == g.user_id).first()
        if not config:
            return jsonify({"error": "No bot config found"}), 404
        return jsonify(LineBotConfigResponse.model_validate(config).model_dump(mode="json"))

@bp.post("/config")
@require_auth
def create_or_update_bot_config():
    """新增或更新 LINE Bot 設定"""
    try:
        data = LineBotConfigCreate(**request.json)
    except ValidationError as e:
        return jsonify(e.errors()), 400

    with SessionLocal() as db:
        config = db.query(LineBotConfig).filter(LineBotConfig.owner_id == g.user_id).first()
        if not config:
            # Create new
            config = LineBotConfig(
                owner_id=g.user_id,
                channel_secret=data.channel_secret,
                channel_access_token=data.channel_access_token,
                llm_api_key=data.llm_api_key,
                llm_model=data.llm_model
            )
            db.add(config)
        else:
            # Update existing
            config.channel_secret = data.channel_secret
            config.channel_access_token = data.channel_access_token
            config.llm_api_key = data.llm_api_key
            if data.llm_model:
                config.llm_model = data.llm_model
            config.is_active = True
        
        db.commit()
        db.refresh(config)
        return jsonify(LineBotConfigResponse.model_validate(config).model_dump(mode="json"))

@bp.route("/webhook/<bot_id>", methods=["POST"])
def callback(bot_id):
    # 1. 取得請求資源
    signature = request.headers.get("X-Line-Signature")
    if not signature:
        abort(400, "Missing signature")
        
    body = request.get_data(as_text=True)

    # 2. 去資料庫尋找這個 bot_id 的設定
    with SessionLocal() as db:
        bot_config = db.query(LineBotConfig).filter(LineBotConfig.bot_id == bot_id, LineBotConfig.is_active == True).first()
        if not bot_config:
            abort(404, "Bot not found or inactive")

        channel_secret = bot_config.channel_secret
        access_token = bot_config.channel_access_token
    
    # 3. 動態實例化 Handler 與 API
    handler = WebhookHandler(channel_secret)
    line_bot_api = LineBotApi(access_token)

    # 4. 註冊訊息處理邏輯 (在請求內動態註冊)
    @handler.add(MessageEvent, message=TextMessage)
    def handle_message(event):
        user_line_id = event.source.user_id
        text = event.message.text
        
        # 這裡將使用者的對話餵給你的 LLM Agent
        # 你可以透過 db 或 bot_config 取得跟 owner 的關聯
        # llm_response = chat_with_llm(bot_id=bot_id, line_user_id=user_line_id, message=text)
        
        reply_text = f"[{bot_id[:6]}] 你說了: {text}"
        
        line_bot_api.reply_message(
            event.reply_token,
            TextSendMessage(text=reply_text)
        )

    # 5. 驗證簽章並執行 handler 的分發
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400, "Invalid signature")

    return "OK"

