import pytest
from app.models.event import Event
from app.models.event_participant import EventParticipant

class TestSplitBill:
    """Tests for split bill endpoints"""
    
    def test_split_bill_success(self, client, db, user, user2, event, auth_headers):
        # The 'event' fixture already adds 'user' as the owner participant.
        # Add a couple more participants
        from app.models.user import User
        from passlib.hash import bcrypt
        
        user3 = User(
            email="u3@example.com", 
            password_hash=bcrypt.hash("pw"), 
            display_name="U3",
            phone="456"
        )
        db.add(user3)
        db.commit()
        db.refresh(user3)
        
        p2 = EventParticipant(event_id=event.id, user_id=user2.id, role="member", display_name=user2.display_name, email=user2.email, phone=user2.phone)
        p3 = EventParticipant(event_id=event.id, user_id=user3.id, role="member", display_name=user3.display_name, email=user3.email, phone=user3.phone)
        db.add_all([p2, p3])
        db.commit()
        
        response = client.post(
            f"/events/{event.id}/split-bill",
            headers=auth_headers,
            json={"total_amount": 1000}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["ok"] is True
        assert data["split_among"] == 3
        # 1000 // 3 = 333, remainder 1
        # Expect two people to get 334, one to get 333
        amounts = [p["amount_due"] for p in data["participants"]]
        assert sorted(amounts) == [333, 333, 334]
        assert all(p["payment_status"] == "unpaid" for p in data["participants"])

    def test_update_participant_payment_success(self, client, db, user, event, auth_headers):
        # The 'event' fixture already adds 'user' as the owner participant.
        participant = db.query(EventParticipant).filter(
            EventParticipant.event_id == event.id,
            EventParticipant.user_id == user.id
        ).first()

        response = client.patch(
            f"/events/{event.id}/participants/{participant.id}/payment",
            headers=auth_headers,
            json={"payment_status": "paid"}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["ok"] is True
        assert data["payment_status"] == "paid"

