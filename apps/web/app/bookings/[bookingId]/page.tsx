// app/bookings/[bookingId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apis } from "@/lib/api";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function BookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [info, setInfo] = useState<any>(null);

  // 若你沒有 /bookings/:id API，可把必要資訊從上一頁帶 query 或暫存 state。
  useEffect(() => { setInfo({ id: bookingId }); }, [bookingId]);

  function createEvent() {

  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">預約確認</h1>
      <div>Booking: {bookingId}</div>
    </div>
  );
}
