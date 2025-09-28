// app/events/[eventId]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apis } from "@/lib/api";

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [ev, setEv] = useState<any>(null);
  const [applicant_name, setApplicantName] = useState("");
  const [applicant_email, setApplicantEmail] = useState("");
  const [applicant_phone, setApplicantPhone] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const isLoggedIn = !!user;

  useEffect(() => { 
    apis.events.getEventById({ id: eventId }).then(setEv);
  // 只在有 token 時才呼叫 getMe
  const token = localStorage.getItem("access_token");
  if (token) {
    apis.auth.getMe().then(setUser).catch(() => setUser(null));
  } else {
    setUser(null);
  }  }, [eventId]);


  async function submitRequest() {
    await apis.events.joinEvent({ id: eventId, joinEventRequest:
      { 
        applicant_name: applicant_name,
        applicant_email: applicant_email,
        applicant_phone: applicant_phone,
        message: message, 
       } });
    alert("申請已送出");
  }

  if (!ev) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">{ev.title}</h1>
      <h2>LoggedIn: {isLoggedIn ? "Yes" : "No"}</h2>
      <div>狀態：{ev.visibility} / {ev.status}</div>
      <div>時間：{new Date(ev.starts_at).toLocaleString()} → {new Date(ev.ends_at).toLocaleString()}</div>
      <div>地點：{ev.address || ev.city}</div>
      <div>名額：{ev.capacity}，已報名：{ev.attending}</div>
      
      {ev.visibility !== "private" && (
        <div className="border rounded p-4 space-y-2">
          <div className="font-medium">申請加入</div>
          <input className="border px-3 py-2 rounded w-full" placeholder="你的名字" value={applicant_name} onChange={e=>setApplicantName(e.target.value)} />
          <input className="border px-3 py-2 rounded w-full" placeholder="你的 Email（選填）" value={applicant_email} onChange={e=>setApplicantEmail(e.target.value)} />
          <input className="border px-3 py-2 rounded w-full" placeholder="你的電話（選填）" value={applicant_phone} onChange={e=>setApplicantPhone(e.target.value)} />
          <textarea className="border px-3 py-2 rounded w-full" placeholder="留言（選填）" value={message} onChange={e=>setMessage(e.target.value)} />
          <button onClick={submitRequest} disabled={!isLoggedIn && !applicant_name} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">送出申請</button>
        </div>
      )}
    </div>
  );
}
