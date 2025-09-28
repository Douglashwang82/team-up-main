// app/venues/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apis } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import VenueCard from "@/components/VenueCard";

export default function VenuesPage({ searchParams }: { searchParams: any }) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const city = searchParams.city ?? "";
  const date = searchParams.date ?? "";
  const sport_type = searchParams.sport ?? "";

  useEffect(() => {
    if (!city && !date) {
      setData(null);
      return;
    }

    setLoading(true);
    apis.venues
      .searchVenues({ city, date: new Date(date), sportType: sport_type || undefined })
      .then(setData)
      .finally(() => setLoading(false));
  }, [city, date, sport_type]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <SearchBar defaultCity={city} defaultDate={date} defaultSport={sport_type} />
      {loading && <div>Loading…</div>}
      {!loading && data?.length === 0 && <div>找不到符合的場地</div>}
      <div className="grid gap-4">
        {data?.map((item) => (
          item ? <VenueCard key={item.venue.id} venue={item.venue} timeslots={item.timeslots} /> : null
        ))}
      </div>
    </div>
  );
}
