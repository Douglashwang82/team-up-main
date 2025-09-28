// components/VenueCard.tsx
"use client";
import { useState } from "react";
import { apis } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function VenueCard({ venue, timeslots }: { venue: any; timeslots: any[] }) {
  const [creating, setCreating] = useState<string | null>(null);
  const r = useRouter();

  async function book(tsId: string) {
    setCreating(tsId);
    try {
      const res = await apis.venues.bookVenueTimeslot({ bookVenueTimeslotRequest: { timeslot_id: tsId } });
      r.push(`/bookings/${res.id}`);
    } finally {
      setCreating(null);
    }
  }

  return (
    <div className="border rounded p-4">
      <div className="font-semibold">{venue.name}</div>
      <div className="text-sm text-gray-600">{venue.address}</div>
      <div className="mt-3 space-y-2">
        {timeslots.map((ts) => (
          <div key={ts.id} className="flex items-center justify-between border rounded p-2">
            <div className="text-sm">
              <div>{new Date(ts.starts_at).toLocaleString()} → {new Date(ts.ends_at).toLocaleString()}</div>
              <div>{ts.sport_type || "N/A"} · {ts.price_cents ? `$${(ts.price_cents/100).toFixed(2)}` : "-"}</div>
            </div>
            <button
              onClick={() => book(ts.id)}
              disabled={creating === ts.id}
              className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {creating === ts.id ? "建立中…" : "立即預約"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
