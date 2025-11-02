// components/SearchBar.tsx
"use client";
import { useRouter } from "next/navigation";

export default function SearchBar({ defaultCity="", defaultDate="", defaultSport="" }) {
  const r = useRouter();
  function submit(formData: FormData) {
    const city = formData.get("city") as string;
    const date = formData.get("date") as string;
    const sport = formData.get("sport") as string;
    const q = new URLSearchParams({ city, date, sport }).toString();
    r.push(`/venues?${q}`);
  }
  return (
    <form action={submit} className="flex flex-wrap gap-3">
      <input name="city" placeholder="城市" defaultValue={defaultCity} className="border px-3 py-2 rounded"/>
      <input type="date" name="date" defaultValue={defaultDate} className="border px-3 py-2 rounded"/>
      <select name="sport" defaultValue={defaultSport} className="border px-3 py-2 rounded">
        <option value="">全部運動</option>
        <option value="basketball">Basketball</option>
        <option value="badminton">Badminton</option>
      </select>
      <button className="px-4 py-2 rounded bg-black text-white">搜尋</button>
    </form>
  );
}
