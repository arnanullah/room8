'use client';
import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '../../lib/supabaseClient';

const NEIGHBORHOODS = [
  'Astoria','Long Island City','Williamsburg','Greenpoint','Bushwick','Bed-Stuy',
  'Crown Heights','Park Slope','Brooklyn Heights','DUMBO','Fort Greene',
  'Upper East Side','Upper West Side','Harlem','Washington Heights',
  'Midtown','Murray Hill','Kips Bay','Chelsea','West Village','East Village',
  'Lower East Side','SoHo','Tribeca','FiDi','Jersey City','Hoboken'
];

export default function Onboarding() {
  const supabase = getSupabaseBrowser();
  const [form, setForm] = useState({
    display_name: '', bio: '', age: 23,
    budget_min: 1200, budget_max: 2000,
    neighborhoods: [] as string[],
    timeline_earliest: '', timeline_latest: '',
    cleanliness: 3, smoking: 'no', sleep_schedule: 'flexible',
    guests: 'sometimes', pets: 'none', work: 'hybrid',
    preferred_gender_mix: 'any', dealbreakers: {}
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (data) setForm(prev => ({...prev, ...data}));
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleNeighborhood = (n: string) =>
    setForm(f => f.neighborhoods.includes(n)
      ? { ...f, neighborhoods: f.neighborhoods.filter(x => x !== n) }
      : { ...f, neighborhoods: [...f.neighborhoods, n] });

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Please sign in at /login first'); return; }
    const payload = { ...form, user_id: user.id };
    const { error } = await supabase.from('profiles').upsert(payload);
    if (error) alert(error.message); else alert('Saved!');
  };

  return (
    <div style={{maxWidth:720}}>
      <h1>Onboarding</h1>
      <input placeholder="Display name" value={form.display_name}
        onChange={e=>setForm({...form, display_name:e.target.value})}
        style={{display:'block',width:'100%',padding:8,border:'1px solid #ccc'}} />
      <label style={{display:'block',marginTop:8}}>Budget</label>
      <div style={{display:'flex',gap:8}}>
        <input type="number" value={form.budget_min} onChange={e=>setForm({...form, budget_min:+e.target.value})}/>
        <input type="number" value={form.budget_max} onChange={e=>setForm({...form, budget_max:+e.target.value})}/>
      </div>
      <label style={{display:'block',marginTop:8}}>Move-in window</label>
      <div style={{display:'flex',gap:8}}>
        <input type="date" value={form.timeline_earliest} onChange={e=>setForm({...form, timeline_earliest:e.target.value})}/>
        <input type="date" value={form.timeline_latest} onChange={e=>setForm({...form, timeline_latest:e.target.value})}/>
      </div>
      <label style={{display:'block',marginTop:8}}>Neighborhoods</label>
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
        {NEIGHBORHOODS.map(n => (
          <button key={n} onClick={()=>toggleNeighborhood(n)}
            style={{padding:'4px 8px',border:'1px solid #ccc', background: form.neighborhoods.includes(n) ? '#eee' : 'white'}}>
            {n}
          </button>
        ))}
      </div>
      <label style={{display:'block',marginTop:8}}>Cleanliness (1–5)</label>
      <input type="number" min={1} max={5} value={form.cleanliness} onChange={e=>setForm({...form, cleanliness:+e.target.value})}/>
      <label style={{display:'block',marginTop:8}}>Smoking</label>
      <select value={form.smoking} onChange={e=>setForm({...form, smoking:e.target.value})}>
        <option value="no">no</option><option value="outside">outside</option><option value="yes">yes</option>
      </select>
      <label style={{display:'block',marginTop:8}}>Sleep</label>
      <select value={form.sleep_schedule} onChange={e=>setForm({...form, sleep_schedule:e.target.value})}>
        <option value="early_bird">early_bird</option><option value="flexible">flexible</option><option value="night_owl">night_owl</option>
      </select>
      <label style={{display:'block',marginTop:8}}>Guests</label>
      <select value={form.guests} onChange={e=>setForm({...form, guests:e.target.value})}>
        <option value="never">never</option><option value="sometimes">sometimes</option><option value="often">often</option>
      </select>
      <label style={{display:'block',marginTop:8}}>Pets</label>
      <select value={form.pets} onChange={e=>setForm({...form, pets:e.target.value})}>
        <option value="none">none</option><option value="cat">cat</option><option value="dog">dog</option><option value="ok_with_pets">ok_with_pets</option>
      </select>
      <label style={{display:'block',marginTop:8}}>Work</label>
      <select value={form.work} onChange={e=>setForm({...form, work:e.target.value})}>
        <option value="wfh">wfh</option><option value="hybrid">hybrid</option><option value="onsite">onsite</option>
      </select>
      <div style={{marginTop:12}}>
        <button onClick={save}>Save profile</button>
      </div>
    </div>
  );
}
