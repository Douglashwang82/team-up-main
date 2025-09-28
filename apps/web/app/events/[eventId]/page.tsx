// app/events/[eventId]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apis } from "@/lib/api";

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [ev, setEv] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => { apis.events.getEventById({ id: eventId }).then(setEv); }, [eventId]);

  async function submitRequest() {
    // await apis.events.joinEvent({ id: (eventId, applicant_name: name, applicant_email: email });
    alert("申請已送出");
  }

  if (!ev) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">{ev.title}</h1>
      <div>狀態：{ev.visibility} / {ev.status}</div>
      <div>時間：{ev.starts_at} → {ev.ends_at}</div>
      <div>地點：{ev.address || ev.city}</div>
      <div>名額：{ev.capacity}，已報名：{ev.attending}</div>

      {ev.visibility !== "private" && (
        <div className="border rounded p-4 space-y-2">
          <div className="font-medium">申請加入</div>
          <input className="border px-3 py-2 rounded w-full" placeholder="你的名字" value={name} onChange={e=>setName(e.target.value)} />
          <input className="border px-3 py-2 rounded w-full" placeholder="你的 Email（選填）" value={email} onChange={e=>setEmail(e.target.value)} />
          <button onClick={submitRequest} disabled={!name} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">送出申請</button>
        </div>
      )}
    </div>
  );
}
