'use client';
import { useEffect, useState } from 'react';
type Match = {
  user_id: string; display_name: string; neighborhoods: string[];
  budget_min: number; budget_max: number; timeline_earliest: string; timeline_latest: string;
  cleanliness: number; smoking: string; sleep_schedule: string; guests: string; pets: string; work: string;
  score: number;
};
export default function Matches() {
  const [data, setData] = useState<Match[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { const r = await fetch('/api/match'); const j = await r.json(); setData(j.matches||[]); setLoading(false); })(); }, []);
  if (loading) return <div>Loading…</div>;
  return (
    <div>
      <h1>Your Top Matches</h1>
      {data.length === 0 && <div>No matches yet. Widen budget/dates.</div>}
      {data.map(m => (
        <div key={m.user_id} style={{border:'1px solid #ddd',borderRadius:12,padding:12,marginTop:12}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><strong>{m.display_name}</strong><span>{m.score}/100</span></div>
          <div>${m.budget_min}–{m.budget_max} • {m.neighborhoods.join(', ')}</div>
          <div style={{color:'#666',fontSize:12}}>Move window: {m.timeline_earliest} → {m.timeline_latest}</div>
          <div style={{color:'#666',fontSize:12}}>
            Cleanliness {m.cleanliness}/5 • Smoking {m.smoking} • Sleep {m.sleep_schedule} • Guests {m.guests} • Pets {m.pets} • Work {m.work}
          </div>
        </div>
      ))}
    </div>
  );
}
