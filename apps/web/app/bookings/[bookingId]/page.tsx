// app/bookings/[bookingId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apis } from "@/lib/api";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function BookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [ isLoading, setIsLoading ] = useState(false);
  const [ title, setTitle ] = useState("");
  const [ visibility, setVisibility ] = useState<"public" | "invite_only" | "private">("private");

  // 若你沒有 /bookings/:id API，可把必要資訊從上一頁帶 query 或暫存 state。
  useEffect(() => {}, [bookingId]);

  function createEvent() {
    if (!bookingId) return;
    // 範例：由 booking 建立活動
    setIsLoading(true);
    apis.events
      .createEvent({ eventCreateIn: { booking_id: bookingId, title, visibility } })
      .finally(() => setIsLoading(false));  
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">預約確認</h1>
      <div>Booking: {bookingId}</div>
      <label>Title</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full"
      />
      <label>Visibility</label>
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value as "public" | "invite_only" | "private")}
        className="select select-bordered w-full"
      >
        <option value="public">Public</option>
        <option value="invite_only">Invite Only</option>
        <option value="private">Private</option>
      </select>
      <button className="btn btn-primary" onClick={createEvent} disabled={isLoading}>
        {isLoading ? "建立中..." : "建立活動"}
      </button>
    </div>
  );
}
