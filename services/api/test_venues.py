import sys
import os

sys.path.append('/Users/hwangdouglas/Projects/team-up-main/services/api')

from app.core.db import SessionLocal
from app.models.venue import Venue
from sqlalchemy import select

def test_venues():
    with SessionLocal() as s:
        venues = s.execute(select(Venue)).scalars().all()
        for v in venues:
            print(f"Venue: {v.name}, City: {v.city}, Address: {v.address}")

if __name__ == '__main__':
    test_venues()
