"""
Seed script for TeamUp database
Creates sample data for all models including users, venues, courts, time slots, events, bookings, and participants

Usage:
    python seed.py
"""
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
import bcrypt
import random

# Add the project root to the path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session
from werkzeug.security import generate_password_hash
from geoalchemy2 import WKTElement

from app.core.db import engine, Base
from app.models.user import User
from app.models.venue import Venue, Court, TimeSlot
from app.models.event import Event
from app.models.event_participant import EventParticipant
from app.models.event_join_request import EventJoinRequest
from app.models.booking import Booking

from app.models.notification import Notification
from app.core.types import Visibility, BookingStatus, PaymentStatus, joinRequestStatus
from app.core.constants import (
    SYSTEM_USER_ID,
    SYSTEM_USER_EMAIL,
    SYSTEM_USER_DISPLAY_NAME,
    SYSTEM_USER_PASSWORD_HASH,
)


def clear_all_data(session: Session):
    """Clear all existing data from tables"""
    print("🗑️  Clearing existing data...")
    from sqlalchemy.exc import ProgrammingError

    # Delete in reverse order of dependencies
    models_to_clear = [
        Notification, EventParticipant, EventJoinRequest, Booking,
        Event, TimeSlot, Court, Venue, User
    ]

    for model in models_to_clear:
        try:
            with session.begin_nested():
                session.query(model).delete()
        except ProgrammingError:
            pass  # Table might not exist yet

    session.commit()
    print("✅ All data cleared")


def create_users(session: Session) -> list[User]:
    """Create sample users"""
    print("\n👤 Creating users...")

    users_data = [
        {
            "email": "alice@example.com",
            "password": "password123",
            "display_name": "陳小美",
            "phone": "+886-912-345-678",
            "avatar_url": "mock-ava-1.png",
            "preferred_sports": ["basketball", "badminton"],
            "skill_levels": {"basketball": "intermediate", "badminton": "beginner"},
        },
        {
            "email": "bob@example.com",
            "password": "password123",
            "display_name": "王大明",
            "phone": "+886-923-456-789",
            "avatar_url": "mock-ava-2.png",
            "preferred_sports": ["badminton", "table_tennis"],
            "skill_levels": {"badminton": "advanced", "table_tennis": "intermediate"},
        },
        {
            "email": "charlie@example.com",
            "password": "password123",
            "display_name": "林小華",
            "phone": "+886-934-567-890",
            "avatar_url": "mock-ava-1.png",
            "preferred_sports": ["basketball", "badminton"],
            "skill_levels": {"basketball": "advanced", "badminton": "intermediate"},
        },
        {
            "email": "diana@example.com",
            "password": "password123",
            "display_name": "吳雅婷",
            "phone": "+886-945-678-901",
            "avatar_url": "mock-ava-2.png",
            "preferred_sports": ["tennis", "badminton"],
            "skill_levels": {"tennis": "beginner", "badminton": "beginner"},
        },
        {
            "email": "evan@example.com",
            "password": "password123",
            "display_name": "李志偉",
            "phone": "+886-956-789-012",
            "avatar_url": "mock-ava-1.png",
            "preferred_sports": ["basketball", "tennis"],
            "skill_levels": {"basketball": "intermediate", "tennis": "advanced"},
        },
        {
            "email": "fiona@example.com",
            "password": "password123",
            "display_name": "張心怡",
            "phone": "+886-967-890-123",
            "avatar_url": "mock-ava-2.png",
            "preferred_sports": ["badminton", "table_tennis"],
            "skill_levels": {"badminton": "intermediate", "table_tennis": "beginner"},
        },
        # Additional users
        {
            "email": "george@example.com",
            "password": "password123",
            "display_name": "黃建宏",
            "phone": "+886-978-901-234",
            "avatar_url": "mock-ava-1.png",
            "preferred_sports": ["basketball"],
            "skill_levels": {"basketball": "advanced"},
        },
        {
            "email": "helen@example.com",
            "password": "password123",
            "display_name": "許佳玲",
            "phone": "+886-989-012-345",
            "avatar_url": "mock-ava-2.png",
            "preferred_sports": ["badminton", "tennis"],
            "skill_levels": {"badminton": "advanced", "tennis": "intermediate"},
        },
        {
            "email": "ivan@example.com",
            "password": "password123",
            "display_name": "劉俊傑",
            "phone": "+886-990-123-456",
            "avatar_url": "mock-ava-1.png",
            "preferred_sports": ["basketball", "badminton", "table_tennis"],
            "skill_levels": {"basketball": "beginner", "badminton": "intermediate", "table_tennis": "advanced"},
        },
        {
            "email": "jenny@example.com",
            "password": "password123",
            "display_name": "楊雅琪",
            "phone": "+886-901-234-567",
            "avatar_url": "mock-ava-2.png",
            "preferred_sports": ["tennis"],
            "skill_levels": {"tennis": "intermediate"},
        },
        {
            "email": "kevin@example.com",
            "password": "password123",
            "display_name": "周柏翰",
            "phone": "+886-912-345-001",
            "avatar_url": "mock-ava-1.png",
            "preferred_sports": ["basketball", "table_tennis"],
            "skill_levels": {"basketball": "intermediate", "table_tennis": "intermediate"},
        },
        {
            "email": "linda@example.com",
            "password": "password123",
            "display_name": "蔡宜庭",
            "phone": "+886-923-456-002",
            "avatar_url": "mock-ava-2.png",
            "preferred_sports": ["badminton"],
            "skill_levels": {"badminton": "beginner"},
        },
        {
            "email": "mike@example.com",
            "password": "password123",
            "display_name": "鄭書豪",
            "phone": "+886-934-567-003",
            "avatar_url": "mock-ava-1.png",
            "preferred_sports": ["basketball", "badminton"],
            "skill_levels": {"basketball": "advanced", "badminton": "advanced"},
        },
        {
            "email": "nancy@example.com",
            "password": "password123",
            "display_name": "謝欣妤",
            "phone": "+886-945-678-004",
            "avatar_url": "mock-ava-2.png",
            "preferred_sports": ["tennis", "table_tennis"],
            "skill_levels": {"tennis": "beginner", "table_tennis": "beginner"},
        },
        {
            "email": "oscar@example.com",
            "password": "password123",
            "display_name": "郭冠廷",
            "phone": "+886-956-789-005",
            "avatar_url": "mock-ava-1.png",
            "preferred_sports": ["basketball"],
            "skill_levels": {"basketball": "intermediate"},
        },
        {
            "email": "peggy@example.com",
            "password": "password123",
            "display_name": "徐詩涵",
            "phone": "+886-967-890-006",
            "avatar_url": "mock-ava-2.png",
            "preferred_sports": ["badminton", "tennis"],
            "skill_levels": {"badminton": "intermediate", "tennis": "advanced"},
        },
    ]

    users = []
    for data in users_data:
        user = User(
            email=data["email"],
            password_hash=bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            display_name=data["display_name"],
            phone=data.get("phone"),
            avatar_url=data.get("avatar_url"),
            preferred_sports=data.get("preferred_sports"),
            skill_levels=data.get("skill_levels"),
        )
        session.add(user)
        users.append(user)

    # Create System User
    system_user = User(
        id=SYSTEM_USER_ID,
        email=SYSTEM_USER_EMAIL,
        display_name=SYSTEM_USER_DISPLAY_NAME,
        password_hash=SYSTEM_USER_PASSWORD_HASH,
        phone=None
    )
    session.add(system_user)
    print(f"✅ Created System User: {SYSTEM_USER_DISPLAY_NAME} ({SYSTEM_USER_ID})")

    session.commit()
    print(f"✅ Created {len(users)} sample users + 1 system user")
    return users


def create_venues_and_courts(session: Session) -> tuple[list[Venue], list[Court]]:
    """Create sample venues with courts"""
    print("\n🏟️  Creating venues and courts...")

    venues_data = [
        {
            "name": "臺北體育館",
            "address": "台北市松山區南京東路四段10號",
            "city": "Taipei",
            "lat": 25.0520,
            "lng": 121.5491,
            "contact_phone": "+886-2-2570-2330",
            "partner_code": "TSC001",
            "courts": [
                {"name": "1F 籃球場", "sport_type": "basketball"},
                {"name": "4F 綜合球場", "sport_type": "basketball"},
                {"name": "7F 羽球場1", "sport_type": "badminton"},
                {"name": "7F 羽球場2", "sport_type": "badminton"},
                {"name": "7F 羽球場3", "sport_type": "badminton"},
                {"name": "7F 羽球場4", "sport_type": "badminton"},
            ]
        },
        {
            "name": "信義運動中心",
            "address": "台北市信義區松壽路99號",
            "city": "Taipei",
            "lat": 25.0363,
            "lng": 121.5645,
            "contact_phone": "+886-2-2723-5200",
            "partner_code": "XSC001",
            "courts": [
                {"name": "6F 綜合球場", "sport_type": "basketball"},
                {"name": "6F 羽球場1", "sport_type": "badminton"},
                {"name": "6F 羽球場2", "sport_type": "badminton"},
                {"name": "6F 羽球場3", "sport_type": "badminton"},
                {"name": "6F 羽球場4", "sport_type": "badminton"},
                {"name": "3F 桌球桌1", "sport_type": "table_tennis"},
                {"name": "3F 桌球桌2", "sport_type": "table_tennis"},
                {"name": "3F 壁球室", "sport_type": "squash"},
            ]
        },
        {
            "name": "大安運動中心",
            "address": "台北市大安區新生南路二段55號",
            "city": "Taipei",
            "lat": 25.0261,
            "lng": 121.5332,
            "contact_phone": "+886-2-2362-5566",
            "partner_code": "DFC001",
            "courts": [
                {"name": "3F 綜合球場", "sport_type": "basketball"},
                {"name": "3F 羽球場1", "sport_type": "badminton"},
                {"name": "3F 羽球場2", "sport_type": "badminton"},
                {"name": "3F 羽球場3", "sport_type": "badminton"},
                {"name": "2F 桌球桌1", "sport_type": "table_tennis"},
                {"name": "2F 桌球桌2", "sport_type": "table_tennis"},
                {"name": "4F 壁球室", "sport_type": "squash"},
            ]
        },
        {
            "name": "板橋體育場",
            "address": "新北市板橋區文化路一段8號",
            "city": "New Taipei City",
            "lat": 25.0141,
            "lng": 121.4627,
            "contact_phone": "+886-2-2272-8666",
            "partner_code": "BQS001",
            "courts": [
                {"name": "戶外籃球場1", "sport_type": "basketball"},
                {"name": "戶外籃球場2", "sport_type": "basketball"},
                {"name": "戶外籃球場3", "sport_type": "basketball"},
                {"name": "戶外籃球場4", "sport_type": "basketball"},
                {"name": "5F 羽球場1", "sport_type": "badminton"},
                {"name": "5F 羽球場2", "sport_type": "badminton"},
                {"name": "5F 羽球場3", "sport_type": "badminton"},
                {"name": "3F 綜合球場", "sport_type": "basketball"},
                {"name": "2F 桌球桌1", "sport_type": "table_tennis"},
                {"name": "2F 桌球桌2", "sport_type": "table_tennis"},
            ]
        },
        {
            "name": "淡水河濱公園",
            "address": "新北市淡水區中正路一段",
            "city": "New Taipei City",
            "lat": 25.1740,
            "lng": 121.4458,
            "contact_phone": "+886-2-2621-2345",
            "partner_code": "TRP001",
            "courts": [
                {"name": "戶外球場1", "sport_type": "basketball"},
                {"name": "戶外球場2", "sport_type": "basketball"},
            ]
        },
        {
            "name": "內湖運動中心",
            "address": "台北市內湖區洲子街12號",
            "city": "Taipei",
            "lat": 25.0780,
            "lng": 121.5680,
            "contact_phone": "+886-2-2658-8000",
            "partner_code": "NHC001",
            "courts": [
                {"name": "8F 籃球場", "sport_type": "basketball"},
                {"name": "10F 羽球場1", "sport_type": "badminton"},
                {"name": "10F 羽球場2", "sport_type": "badminton"},
                {"name": "10F 羽球場3", "sport_type": "badminton"},
                {"name": "10F 羽球場4", "sport_type": "badminton"},
                {"name": "10F 羽球場5", "sport_type": "badminton"},
                {"name": "10F 羽球場6", "sport_type": "badminton"},
                {"name": "11F 壁球室1", "sport_type": "squash"},
                {"name": "11F 壁球室2", "sport_type": "squash"},
                {"name": "B1 桌球桌1", "sport_type": "table_tennis"},
                {"name": "B1 桌球桌2", "sport_type": "table_tennis"},
                {"name": "B1 桌球桌3", "sport_type": "table_tennis"},
            ]
        },
        {
            "name": "南港運動中心",
            "address": "台北市南港區玉成街69號",
            "city": "Taipei",
            "lat": 25.0420,
            "lng": 121.5890,
            "contact_phone": "+886-2-2783-1599",
            "partner_code": "NGC001",
            "courts": [
                {"name": "3F 多功能球場", "sport_type": "basketball"},
                {"name": "6F 羽球場1", "sport_type": "badminton"},
                {"name": "6F 羽球場2", "sport_type": "badminton"},
                {"name": "6F 羽球場3", "sport_type": "badminton"},
                {"name": "6F 羽球場4", "sport_type": "badminton"},
                {"name": "6F 壁球室", "sport_type": "squash"},
                {"name": "6F 桌球桌1", "sport_type": "table_tennis"},
                {"name": "6F 桌球桌2", "sport_type": "table_tennis"},
            ]
        },
        {
            "name": "中正運動中心",
            "address": "台北市中正區信義路一段1號",
            "city": "Taipei",
            "lat": 25.0340,
            "lng": 121.5180,
            "contact_phone": "+886-2-2395-2323",
            "partner_code": "CZC001",
            "courts": [
                {"name": "3F 綜合球場", "sport_type": "basketball"},
                {"name": "7F 羽球場1", "sport_type": "badminton"},
                {"name": "7F 羽球場2", "sport_type": "badminton"},
                {"name": "7F 羽球場3", "sport_type": "badminton"},
                {"name": "7F 羽球場4", "sport_type": "badminton"},
                {"name": "7F 羽球場5", "sport_type": "badminton"},
                {"name": "5F 桌球桌1", "sport_type": "table_tennis"},
                {"name": "5F 桌球桌2", "sport_type": "table_tennis"},
            ]
        },
        {
            "name": "新莊體育館",
            "address": "新北市新莊區中華路一段75號",
            "city": "New Taipei City",
            "lat": 25.0360,
            "lng": 121.4320,
            "contact_phone": "+886-2-2992-8800",
            "partner_code": "XZC001",
            "courts": [
                {"name": "主球場", "sport_type": "basketball"},
                {"name": "2F 羽球場1", "sport_type": "badminton"},
                {"name": "2F 羽球場2", "sport_type": "badminton"},
                {"name": "2F 羽球場3", "sport_type": "badminton"},
                {"name": "2F 羽球場4", "sport_type": "badminton"},
                {"name": "2F 桌球桌1", "sport_type": "table_tennis"},
                {"name": "2F 桌球桌2", "sport_type": "table_tennis"},
            ]
        },
        {
            "name": "三重綜合體育館",
            "address": "新北市三重區中正北路1號",
            "city": "New Taipei City",
            "lat": 25.0680,
            "lng": 121.4880,
            "contact_phone": "+886-2-2983-5566",
            "partner_code": "SZC001",
            "courts": [
                {"name": "6F 籃球場", "sport_type": "basketball"},
            ]
        },
        {
            "name": "永和國民運動中心",
            "address": "新北市永和區仁愛路222號",
            "city": "New Taipei City",
            "lat": 25.0120,
            "lng": 121.5140,
            "contact_phone": "+886-2-2929-7799",
            "partner_code": "YHC001",
            "courts": [
                {"name": "4F 羽球場1", "sport_type": "badminton"},
                {"name": "4F 羽球場2", "sport_type": "badminton"},
                {"name": "4F 羽球場3", "sport_type": "badminton"},
                {"name": "4F 羽球場4", "sport_type": "badminton"},
                {"name": "4F 羽球場5", "sport_type": "badminton"},
                {"name": "4F 羽球場6", "sport_type": "badminton"},
                {"name": "4F 桌球桌1", "sport_type": "table_tennis"},
                {"name": "4F 桌球桌2", "sport_type": "table_tennis"},
                {"name": "5F 壁球室", "sport_type": "squash"},
                {"name": "6F 綜合球場", "sport_type": "basketball"},
            ]
        },
        {
            "name": "台北網球中心",
            "address": "台北市士林區福林路77號",
            "city": "Taipei",
            "lat": 25.0980,
            "lng": 121.5280,
            "contact_phone": "+886-2-2881-8888",
            "partner_code": "TTC001",
            "courts": [
                {"name": "室內網球場1", "sport_type": "tennis"},
                {"name": "室內網球場2", "sport_type": "tennis"},
                {"name": "室外網球場1", "sport_type": "tennis"},
                {"name": "室外網球場2", "sport_type": "tennis"},
                {"name": "室外網球場3", "sport_type": "tennis"},
                {"name": "室外網球場4", "sport_type": "tennis"},
                {"name": "羽球場1", "sport_type": "badminton"},
                {"name": "羽球場2", "sport_type": "badminton"},
            ]
        },
    ]

    venues = []
    all_courts = []

    for venue_data in venues_data:
        # Create point using WKT (Well-Known Text) format for PostGIS
        point = WKTElement(f'POINT({venue_data["lng"]} {venue_data["lat"]})', srid=4326)

        venue = Venue(
            name=venue_data["name"],
            address=venue_data["address"],
            city=venue_data["city"],
            geo_point=point,
            latitude=venue_data["lat"],
            longitude=venue_data["lng"],
            contact_phone=venue_data["contact_phone"],
            partner_code=venue_data.get("partner_code")
        )
        session.add(venue)
        session.flush()  # Get the venue ID

        # Create courts for this venue
        for court_data in venue_data["courts"]:
            court = Court(
                venue_id=venue.id,
                name=court_data["name"],
                sport_type=court_data["sport_type"]
            )
            session.add(court)
            all_courts.append(court)

        venues.append(venue)

    session.commit()
    print(f"✅ Created {len(venues)} venues with {len(all_courts)} courts")
    return venues, all_courts


def create_time_slots(session: Session, courts: list[Court]) -> list[TimeSlot]:
    """Create sample time slots for the next 14 days"""
    print("\n⏰ Creating time slots...")

    time_slots = []
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # Create time slots for next 14 days
    for day_offset in range(14):
        date = today + timedelta(days=day_offset)

        # Create time slots: 9-11, 11-13, 14-16, 16-18, 18-20, 20-22
        slot_definitions = [
            (9, 11, 800),   # Morning - 800 TWD
            (11, 13, 800),
            (14, 16, 1000), # Afternoon - 1000 TWD
            (16, 18, 1000),
            (18, 20, 1200), # Evening - 1200 TWD (peak)
            (20, 22, 1200),
        ]

        # Create slots for each court
        for court in courts:
            for start_hour, end_hour, price in slot_definitions:
                starts_at = date.replace(hour=start_hour, minute=0, second=0)
                ends_at = date.replace(hour=end_hour, minute=0, second=0)

                # Make some slots not bookable (already reserved by venue)
                is_bookable = day_offset > 0  # Today's slots are not bookable

                time_slot = TimeSlot(
                    court_id=court.id,
                    starts_at=starts_at,
                    ends_at=ends_at,
                    price_cents=price * 100,  # Convert to cents
                    currency="TWD",
                    is_bookable=is_bookable
                )
                session.add(time_slot)
                time_slots.append(time_slot)

    session.commit()
    print(f"✅ Created {len(time_slots)} time slots")
    return time_slots


def create_events(session: Session, users: list[User], time_slots: list[TimeSlot]) -> list[Event]:
    """Create sample Events"""
    print("\n⚽ Creating Events...")

    events_data = [
        {
            "title": "週末籃球賽",
            "description": "誠徵週末籃球球友，友誼賽性質，歡迎各程度球友參加！",
            "owner": users[0],  # Alice
            "max_participants": 10,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "temporary",
        },
        {
            "title": "羽球雙打練習",
            "description": "固定羽球雙打練習，適合中級程度，一起進步！",
            "owner": users[1],  # Bob
            "max_participants": 8,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "週五籃球夜",
            "description": "每週五晚上的籃球局，略有強度但氣氛愉快！",
            "owner": users[2],  # Charlie
            "max_participants": 12,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "網球新手村",
            "description": "適合新手的網球團，現場有教練指導。",
            "owner": users[3],  # Diana
            "max_participants": 6,
            "visibility": Visibility.private.value,
            "status": "open",
            "duration_type": "permanent",
            "invite_token": "TENNIS2024ABC",
        },
        {
            "title": "排球比賽備戰",
            "description": "備戰近期比賽，限有經驗者。",
            "owner": users[4],  # Evan
            "max_participants": 8,
            "visibility": Visibility.private.value,
            "status": "closed",
            "duration_type": "temporary",
        },
        {
            "title": "週日早晨羽球",
            "description": "週日早晨輕鬆打，打完一起喝咖啡！",
            "owner": users[5],  # Fiona
            "max_participants": 8,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "temporary",
        },
        # Additional events
        {
            "title": "內湖籃球社團",
            "description": "內湖地區的籃球愛好者聚集地，每週固定練習，歡迎有基礎的球友加入！",
            "owner": users[6],  # George
            "max_participants": 15,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "女生羽球團",
            "description": "專屬女性的羽球團，不分程度，主打輕鬆愉快的運動氛圍。",
            "owner": users[7],  # Helen
            "max_participants": 12,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "公司籃球隊練習",
            "description": "XX科技籃球隊週末練習，準備參加企業聯賽。",
            "owner": users[8],  # Ivan
            "max_participants": 12,
            "visibility": Visibility.private.value,
            "status": "open",
            "duration_type": "temporary",
            "invite_token": "XXTECH2024",
        },
        {
            "title": "網球初學者團",
            "description": "一起從零開始學網球！會請教練來指導，費用均攤。",
            "owner": users[9],  # Jenny
            "max_participants": 8,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "排球混合團",
            "description": "男女混合排球，著重基本功練習與團隊配合。",
            "owner": users[10],  # Kevin
            "max_participants": 14,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "三對三籃球賽",
            "description": "週末三對三街頭籃球，快節奏比賽！",
            "owner": users[11],  # Linda
            "max_participants": 9,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "temporary",
        },
        {
            "title": "高手羽球局",
            "description": "限定中高階球友，追求高品質對打體驗。",
            "owner": users[12],  # Mike
            "max_participants": 8,
            "visibility": Visibility.private.value,
            "status": "open",
            "duration_type": "permanent",
            "invite_token": "PROPLAYER88",
        },
        {
            "title": "親子籃球活動",
            "description": "親子同樂的籃球活動，大人小孩一起打球！",
            "owner": users[13],  # Nancy
            "max_participants": 20,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "temporary",
        },
        {
            "title": "大學校友籃球",
            "description": "台大校友籃球隊，每週固定打球聚會。",
            "owner": users[14],  # Oscar
            "max_participants": 10,
            "visibility": Visibility.private.value,
            "status": "open",
            "duration_type": "permanent",
            "invite_token": "NTUALUMNI",
        },
        {
            "title": "夜間羽球團",
            "description": "下班後的羽球時光，紓壓放鬆的好選擇！",
            "owner": users[15],  # Peggy
            "max_participants": 10,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "新手籃球教學",
            "description": "適合完全沒有經驗的朋友，有專人指導基本動作。",
            "owner": users[0],  # Alice
            "max_participants": 8,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "temporary",
        },
        {
            "title": "週末排球樂",
            "description": "輕鬆的週末排球活動，打完一起聚餐！",
            "owner": users[1],  # Bob
            "max_participants": 12,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "temporary",
        },
        {
            "title": "網球雙打配對",
            "description": "尋找雙打搭檔的網球活動，每次隨機配對。",
            "owner": users[2],  # Charlie
            "max_participants": 8,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "晨間籃球運動",
            "description": "早起打球的健康生活，每週三、五早上6點半。",
            "owner": users[3],  # Diana
            "max_participants": 10,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
        {
            "title": "羽球積分賽",
            "description": "內部積分制比賽，累積積分有獎勵！",
            "owner": users[4],  # Evan
            "max_participants": 16,
            "visibility": Visibility.public.value,
            "status": "open",
            "duration_type": "permanent",
        },
    ]

    events = []
    for data in events_data:
        event = Event(
            title=data["title"],
            description=data["description"],
            owner_user_id=data["owner"].id,
            max_participants=data["max_participants"],
            visibility=data["visibility"],
            status=data["status"],
            duration_type=data["duration_type"],

            invite_token=data.get("invite_token"),
            image=f"mock-{random.randint(1, 4)}.png",
        )
        session.add(event)
        events.append(event)

    session.commit()
    print(f"✅ Created {len(events)} Events")
    return events


def create_participants(session: Session, events: list[Event], users: list[User]):
    """Create Event participants"""
    print("\n👥 Creating participants...")

    participants_count = 0

    # Event 0: Weekend Basketball (Alice's team)
    # Owner + 3 members
    for i, user in enumerate([users[0], users[1], users[2], users[3]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[0].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 1: Badminton Doubles (Bob's team)
    # Owner + 2 members
    for i, user in enumerate([users[1], users[4], users[5]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[1].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 2: Friday Night Hoops (Charlie's team) - CONFIRMED with full roster
    # Owner + 5 members
    for i, user in enumerate([users[2], users[0], users[1], users[3], users[4], users[5]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[2].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 3: Tennis Club (Diana's team)
    # Owner + 1 member
    for i, user in enumerate([users[3], users[2]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[3].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 4: Volleyball Tournament (Evan's team) - CONFIRMED
    # Owner + 5 members
    for i, user in enumerate([users[4], users[0], users[1], users[2], users[3], users[5]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[4].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 5: Sunday Badminton (Fiona's team)
    # Owner + 2 members
    for i, user in enumerate([users[5], users[1], users[3]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[5].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 6: 內湖籃球社團 (George's team)
    for i, user in enumerate([users[6], users[0], users[2], users[8], users[10], users[12]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[6].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 7: 女生羽球團 (Helen's team)
    for i, user in enumerate([users[7], users[3], users[5], users[9], users[11], users[13], users[15]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[7].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 8: 公司籃球隊練習 (Ivan's team - private)
    for i, user in enumerate([users[8], users[6], users[10], users[12], users[14]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[8].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 9: 網球初學者團 (Jenny's team)
    for i, user in enumerate([users[9], users[7], users[13]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[9].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 10: 排球混合團 (Kevin's team)
    for i, user in enumerate([users[10], users[1], users[4], users[7], users[11], users[14]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[10].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 11: 三對三籃球賽 (Linda's team)
    for i, user in enumerate([users[11], users[0], users[2], users[6], users[8]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[11].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 12: 高手羽球局 (Mike's team - private)
    for i, user in enumerate([users[12], users[4], users[6]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[12].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 13: 親子籃球活動 (Nancy's team)
    for i, user in enumerate([users[13], users[3], users[9], users[15]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[13].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 14: 大學校友籃球 (Oscar's team - private)
    for i, user in enumerate([users[14], users[2], users[8], users[10]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[14].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 15: 夜間羽球團 (Peggy's team)
    for i, user in enumerate([users[15], users[1], users[5], users[7], users[11]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[15].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 16: 新手籃球教學 (Alice's 2nd team)
    for i, user in enumerate([users[0], users[9], users[13]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[16].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 17: 週末排球樂 (Bob's 2nd team)
    for i, user in enumerate([users[1], users[4], users[7], users[10], users[14]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[17].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 18: 網球雙打配對 (Charlie's 2nd team)
    for i, user in enumerate([users[2], users[3], users[9], users[15]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[18].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 19: 晨間籃球運動 (Diana's 2nd team)
    for i, user in enumerate([users[3], users[6], users[8], users[12]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[19].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    # Event 20: 羽球積分賽 (Evan's 2nd team)
    for i, user in enumerate([users[4], users[1], users[5], users[7], users[11], users[12], users[15]]):
        role = "owner" if i == 0 else "member"
        participant = EventParticipant(
            event_id=events[20].id,
            user_id=user.id,
            role=role,
            display_name=user.display_name,
            email=user.email,
            phone=user.phone,
        )
        session.add(participant)
        participants_count += 1

    session.commit()
    print(f"✅ Created {participants_count} participants")


def create_join_requests(session: Session, events: list[Event], users: list[User]):
    """Create sample join requests"""
    print("\n📝 Creating join requests...")

    requests_data = [
        {
            "event": events[0],  # Weekend Basketball
            "applicant": users[4],  # Evan
            "message": "我想參加！我打中鋒。",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[0],  # Weekend Basketball
            "applicant": users[5],  # Fiona
            "message": "我可以參加嗎？我是新手但我很想學！",
            "status": joinRequestStatus.approved.value,
        },
        {
            "event": events[1],  # Badminton Doubles
            "applicant": users[3],  # Diana
            "message": "正在尋找固定的練習夥伴！",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[3],  # Tennis Club (invite-only)
            "applicant": users[0],  # Alice
            "message": "朋友給我邀請碼，很期待能學習！",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[5],  # Sunday Badminton
            "applicant": users[2],  # Charlie
            "message": "時間剛好！算我一份。",
            "status": joinRequestStatus.rejected.value,
        },
        # Additional join requests
        {
            "event": events[6],  # 內湖籃球社團
            "applicant": users[14],  # Oscar
            "message": "住內湖附近，很方便！",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[6],  # 內湖籃球社團
            "applicant": users[1],  # Bob
            "message": "想找固定打球的地方。",
            "status": joinRequestStatus.approved.value,
        },
        {
            "event": events[7],  # 女生羽球團
            "applicant": users[0],  # Alice
            "message": "剛開始學羽球，可以加入嗎？",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[9],  # 網球初學者團
            "applicant": users[11],  # Linda
            "message": "一直想學網球，剛好有這個團！",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[9],  # 網球初學者團
            "applicant": users[15],  # Peggy
            "message": "請問初學者也可以參加嗎？",
            "status": joinRequestStatus.approved.value,
        },
        {
            "event": events[10],  # 排球混合團
            "applicant": users[3],  # Diana
            "message": "大學有打過排球，想繼續打。",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[10],  # 排球混合團
            "applicant": users[13],  # Nancy
            "message": "朋友推薦來的！",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[11],  # 三對三籃球賽
            "applicant": users[4],  # Evan
            "message": "喜歡三對三的節奏感！",
            "status": joinRequestStatus.approved.value,
        },
        {
            "event": events[11],  # 三對三籃球賽
            "applicant": users[14],  # Oscar
            "message": "以前常打三對三。",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[13],  # 親子籃球活動
            "applicant": users[1],  # Bob
            "message": "想帶小孩一起運動！",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[13],  # 親子籃球活動
            "applicant": users[6],  # George
            "message": "看起來很適合全家活動。",
            "status": joinRequestStatus.approved.value,
        },
        {
            "event": events[15],  # 夜間羽球團
            "applicant": users[0],  # Alice
            "message": "下班後想運動一下！",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[15],  # 夜間羽球團
            "applicant": users[4],  # Evan
            "message": "時間很適合上班族。",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[15],  # 夜間羽球團
            "applicant": users[9],  # Jenny
            "message": "辦公室在附近，很方便。",
            "status": joinRequestStatus.approved.value,
        },
        {
            "event": events[16],  # 新手籃球教學
            "applicant": users[7],  # Helen
            "message": "完全沒打過籃球，可以嗎？",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[17],  # 週末排球樂
            "applicant": users[6],  # George
            "message": "週末想找地方運動！",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[18],  # 網球雙打配對
            "applicant": users[12],  # Mike
            "message": "正在找雙打夥伴！",
            "status": joinRequestStatus.approved.value,
        },
        {
            "event": events[19],  # 晨間籃球運動
            "applicant": users[0],  # Alice
            "message": "早起打球感覺很棒！",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[20],  # 羽球積分賽
            "applicant": users[3],  # Diana
            "message": "有積分制感覺很刺激！",
            "status": joinRequestStatus.submitted.value,
        },
        {
            "event": events[20],  # 羽球積分賽
            "applicant": users[9],  # Jenny
            "message": "喜歡這種競賽模式。",
            "status": joinRequestStatus.approved.value,
        },
    ]

    for data in requests_data:
        request = EventJoinRequest(
            event_id=data["event"].id,
            applicant_user_id=data["applicant"].id,
            applicant_name=data["applicant"].display_name,
            applicant_email=data["applicant"].email,
            applicant_phone=data["applicant"].phone,
            message=data["message"],
            status=data["status"],
            reviewed_at=datetime.now(timezone.utc) if data["status"] != joinRequestStatus.submitted.value else None,
        )
        session.add(request)

    session.commit()
    print(f"✅ Created {len(requests_data)} join requests")


def create_bookings(session: Session, events: list[Event], users: list[User], time_slots: list[TimeSlot]):
    """Create sample bookings"""
    print("\n📅 Creating bookings...")

    # Filter bookable time slots
    bookable_time_slots = [ts for ts in time_slots if ts.is_bookable]

    bookings_data = [
        # Event bookings
        {
            "owner": users[0],  # Alice
            "event": events[0],  # Weekend Basketball
            "time_slot": bookable_time_slots[5],  # Saturday morning
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[1],  # Bob
            "event": events[1],  # Badminton Doubles
            "time_slot": bookable_time_slots[15],  # Next week
            "status": BookingStatus.pending.value,
            "payment_status": PaymentStatus.pending.value,
        },
        {
            "owner": users[2],  # Charlie
            "event": events[2],  # Friday Night Hoops (confirmed event)
            "time_slot": bookable_time_slots[25],  # Friday evening
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[3],  # Diana
            "event": events[3],  # Tennis Club
            "time_slot": bookable_time_slots[35],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[4],  # Evan
            "event": events[4],  # Volleyball Tournament
            "time_slot": bookable_time_slots[45],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[5],  # Fiona
            "event": events[5],  # Sunday Badminton
            "time_slot": bookable_time_slots[55],  # Sunday morning
            "status": BookingStatus.pending.value,
            "payment_status": PaymentStatus.pending.value,
        },
        # Individual bookings (no event)
        {
            "owner": users[0],  # Alice - individual booking
            "event": None,
            "time_slot": bookable_time_slots[10],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[1],  # Bob - individual booking
            "event": None,
            "time_slot": bookable_time_slots[20],
            "status": BookingStatus.pending.value,
            "payment_status": PaymentStatus.none.value,
        },
        {
            "owner": users[3],  # Diana - cancelled booking
            "event": None,
            "time_slot": bookable_time_slots[30],
            "status": BookingStatus.cancelled.value,
            "payment_status": PaymentStatus.failed.value,
        },
        # Additional bookings for new events
        {
            "owner": users[6],  # George
            "event": events[6],  # 內湖籃球社團
            "time_slot": bookable_time_slots[65],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[7],  # Helen
            "event": events[7],  # 女生羽球團
            "time_slot": bookable_time_slots[75],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[8],  # Ivan
            "event": events[8],  # 公司籃球隊練習
            "time_slot": bookable_time_slots[85],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[9],  # Jenny
            "event": events[9],  # 網球初學者團
            "time_slot": bookable_time_slots[95],
            "status": BookingStatus.pending.value,
            "payment_status": PaymentStatus.pending.value,
        },
        {
            "owner": users[10],  # Kevin
            "event": events[10],  # 排球混合團
            "time_slot": bookable_time_slots[105],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[11],  # Linda
            "event": events[11],  # 三對三籃球賽
            "time_slot": bookable_time_slots[115],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[12],  # Mike
            "event": events[12],  # 高手羽球局
            "time_slot": bookable_time_slots[125],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[13],  # Nancy
            "event": events[13],  # 親子籃球活動
            "time_slot": bookable_time_slots[135],
            "status": BookingStatus.pending.value,
            "payment_status": PaymentStatus.pending.value,
        },
        {
            "owner": users[14],  # Oscar
            "event": events[14],  # 大學校友籃球
            "time_slot": bookable_time_slots[145],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[15],  # Peggy
            "event": events[15],  # 夜間羽球團
            "time_slot": bookable_time_slots[155],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[0],  # Alice
            "event": events[16],  # 新手籃球教學
            "time_slot": bookable_time_slots[165],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[1],  # Bob
            "event": events[17],  # 週末排球樂
            "time_slot": bookable_time_slots[175],
            "status": BookingStatus.pending.value,
            "payment_status": PaymentStatus.pending.value,
        },
        {
            "owner": users[2],  # Charlie
            "event": events[18],  # 網球雙打配對
            "time_slot": bookable_time_slots[185],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[3],  # Diana
            "event": events[19],  # 晨間籃球運動
            "time_slot": bookable_time_slots[195],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[4],  # Evan
            "event": events[20],  # 羽球積分賽
            "time_slot": bookable_time_slots[205],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        # Additional individual bookings
        {
            "owner": users[6],  # George - individual booking
            "event": None,
            "time_slot": bookable_time_slots[215],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[8],  # Ivan - individual booking
            "event": None,
            "time_slot": bookable_time_slots[225],
            "status": BookingStatus.pending.value,
            "payment_status": PaymentStatus.pending.value,
        },
        {
            "owner": users[10],  # Kevin - individual booking
            "event": None,
            "time_slot": bookable_time_slots[235],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
        {
            "owner": users[12],  # Mike - cancelled booking
            "event": None,
            "time_slot": bookable_time_slots[245],
            "status": BookingStatus.cancelled.value,
            "payment_status": PaymentStatus.failed.value,
        },
        {
            "owner": users[14],  # Oscar - individual booking
            "event": None,
            "time_slot": bookable_time_slots[255],
            "status": BookingStatus.confirmed.value,
            "payment_status": PaymentStatus.succeeded.value,
        },
    ]

    event_booking_count = 0
    for data in bookings_data:
        booking = Booking(
            owner_user_id=data["owner"].id,
            time_slot_id=data["time_slot"].id,
            event_id=data["event"].id if data.get("event") else None,
            status=data["status"],
            payment_status=data["payment_status"],
        )
        session.add(booking)
        if data.get("event"):
            event_booking_count += 1

    session.commit()
    print(f"✅ Created {len(bookings_data)} bookings ({event_booking_count} assigned to Events)")


def print_summary(session: Session):
    """Print summary of seeded data"""
    print("\n" + "="*60)
    print("📊 SEEDING SUMMARY")
    print("="*60)

    user_count = session.query(User).count()
    venue_count = session.query(Venue).count()
    court_count = session.query(Court).count()
    time_slot_count = session.query(TimeSlot).count()
    event_count = session.query(Event).count()
    participant_count = session.query(EventParticipant).count()
    join_request_count = session.query(EventJoinRequest).count()
    booking_count = session.query(Booking).count()

    print(f"👤 Users:              {user_count}")
    print(f"🏟️  Venues:             {venue_count}")
    print(f"🎾 Courts:             {court_count}")
    print(f"⏰ Time Slots:          {time_slot_count}")
    print(f"⚽ Events:              {event_count}")
    print(f"👥 Participants:       {participant_count}")
    print(f"📝 Join Requests:      {join_request_count}")
    print(f"📅 Bookings:           {booking_count}")
    print("="*60)

    print("\n📧 Test User Credentials (all use password: password123):")
    print("-" * 60)
    test_emails = [
        "alice@example.com", "bob@example.com", "charlie@example.com",
        "diana@example.com", "evan@example.com", "fiona@example.com",
        "george@example.com", "helen@example.com", "ivan@example.com",
        "jenny@example.com", "kevin@example.com", "linda@example.com",
        "mike@example.com", "nancy@example.com", "oscar@example.com",
        "peggy@example.com"
    ]
    for email in test_emails:
        print(f"  {email}")
    print("-" * 60)


def main():
    """Main seeding function"""
    print("="*60)
    print("🌱 TEAMUP DATABASE SEEDING")
    print("="*60)

    # Create database session
    with Session(engine) as session:
        # Clear existing data
        clear_all_data(session)

        # Create data
        users = create_users(session)
        venues, courts = create_venues_and_courts(session)
        time_slots = create_time_slots(session, courts)
        events = create_events(session, users, time_slots)
        create_participants(session, events, users)
        create_join_requests(session, events, users)
        create_bookings(session, events, users, time_slots)

        # Print summary
        print_summary(session)

    print("\n✅ Seeding completed successfully!")
    print("🚀 You can now start your API server and test with the seeded data.\n")


if __name__ == "__main__":
    main()
