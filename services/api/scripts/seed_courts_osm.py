import requests
import json
import uuid
import sys
import os

# Add the 'app' directory to the path so we can import our models and database
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.db import SessionLocal
from app.models.venue import Venue, Court
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
import sqlalchemy as sa

# Overpass API URL
OVERPASS_URL = "http://overpass-api.de/api/interpreter"

# Target districts
DISTRICTS = [
    {"city": "台北市", "district": "內湖區"},
    {"city": "台北市", "district": "大安區"},
    {"city": "台北市", "district": "信義區"},
    {"city": "新北市", "district": "林口區"},
    {"city": "新北市", "district": "板橋區"},
    {"city": "新北市", "district": "中和區"},
    {"city": "新北市", "district": "新店區"},
]

def build_query(district_name):
    """
    Builds the Overpass QL query to find sports facilities in a given district.
    We look for nodes, ways, and relations tagged with leisure=sports_centre or leisure=pitch.
    """
    return f"""
    [out:json][timeout:25];
    // fetch area to search in
    area[name="{district_name}"]->.searchArea;
    (
      // query nodes, ways, and relations for pitches and sports centers
      node["leisure"="pitch"](area.searchArea);
      way["leisure"="pitch"](area.searchArea);
      relation["leisure"="pitch"](area.searchArea);
      node["leisure"="sports_centre"](area.searchArea);
      way["leisure"="sports_centre"](area.searchArea);
      relation["leisure"="sports_centre"](area.searchArea);
    );
    // output geometry for ways/relations and center coordinates
    out center;
    """

def fetch_data(district_name):
    """
    Fetches data from Overpass API for a given district.
    """
    query = build_query(district_name)
    print(f"Fetching data for {district_name}...")
    response = requests.post(OVERPASS_URL, data={'data': query})
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data for {district_name}. Status code: {response.status_code}")
        return None

def process_and_insert(city, district, data, session):
    """
    Processes the Overpass JSON data and inserts Venues and Courts into the database.
    """
    if not data or 'elements' not in data:
        return

    elements = data['elements']
    inserted_count = 0

    for element in elements:
        tags = element.get('tags', {})
        
        # Name is sometimes missing. Try to fall back to other names or descriptive tags if possible.
        name = tags.get('name') or tags.get('name:en') or tags.get('alt_name') or tags.get('sport')
        if not name:
            # If we don't have a name, maybe it's just a generic pitch. We can skip or generate one string.
            # Let's skip venues without any name.
            continue
            
        if tags.get('sport'):
            name = f"{name} ({tags.get('sport')} field)" if not tags.get('sport') in name.lower() else name
        else:
             if not tags.get('name'):
                name = "Sports Field"

        # Determine coordinates
        if element['type'] == 'node':
            lat = element['lat']
            lon = element['lon']
        elif element['type'] in ['way', 'relation'] and 'center' in element:
            lat = element['center']['lat']
            lon = element['center']['lon']
        else:
            # Skip if no coordinates
            continue
            
        # Try to resolve address
        address_parts = []
        if tags.get('addr:city'): address_parts.append(tags.get('addr:city'))
        if tags.get('addr:district'): address_parts.append(tags.get('addr:district'))
        if tags.get('addr:street'): address_parts.append(tags.get('addr:street'))
        if tags.get('addr:housenumber'): address_parts.append(tags.get('addr:housenumber'))
        address = ", ".join(address_parts)
        if not address:
            address = f"{city}{district} (Generated from OSM)"

        # Check if venue already exists near this location (e.g. within 50 meters approx - ~0.0005 deg)
        # To avoid massive duplicates, we can just check if we have something with the exact same name in this city.
        existing_venue = session.execute(
            sa.select(Venue).where(Venue.name == name).where(Venue.city == city)
        ).scalar_one_or_none()

        if existing_venue:
            # Maybe add a court to existing
            venue = existing_venue
        else:
            # Create new venue
            geo_pt = from_shape(Point(lon, lat), srid=4326)
            venue = Venue(
                name=name,
                address=address,
                city=city,
                latitude=lat,
                longitude=lon,
                geo_point=geo_pt,
                partner_code=f"osm_{element['type']}_{element['id']}"
            )
            session.add(venue)
            session.flush() # get venue.id
            inserted_count += 1
            
        # Create court based on sport type
        sport_type = tags.get('sport', 'general')
        court_name = sport_type.capitalize() + " Court" if sport_type != 'general' else "Main Court"
        # Check if court already exists in this venue
        existing_court = session.execute(
            sa.select(Court).where(Court.venue_id == venue.id).where(Court.name == court_name)
        ).scalar_one_or_none()

        if not existing_court:
            court = Court(
                venue_id=venue.id,
                name=court_name,
                sport_type=sport_type
            )
            session.add(court)

    session.commit()
    print(f"Added {inserted_count} new venues for {district} ({city}).")

def main():
    print("Starting sport courts seeding from Overpass API...")
    
    with SessionLocal() as session:
        for entry in DISTRICTS:
            city = entry["city"]
            district = entry["district"]
            data = fetch_data(district)
            process_and_insert(city, district, data, session)
            
    print("Seeding complete.")

if __name__ == "__main__":
    main()
