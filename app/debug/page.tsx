'use client';
import { useState } from 'react';
import { getSupabaseBrowser } from '../../lib/supabaseClient';

export default function Debug() {
  const supabase = getSupabaseBrowser();
  const [log, setLog] = useState<string[]>([]);

  const add = (line: string) => setLog((L) => [...L, line]);

  const checkEnv = async () => {
    add(`NEXT_PUBLIC_SUPABASE_URL present: ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    add(`NEXT_PUBLIC_SUPABASE_ANON_KEY present: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
    add(`URL value (first 30 chars): ${(process.env.NEXT_PUBLIC_SUPABASE_URL || '').slice(0, 30)}...`);
  };

  const whoAmI = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) add(`getUser error: ${error.message}`);
    add(`user: ${user ? user.id : 'NOT SIGNED IN'}`);
  };

  const tryInsert = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { add('Not signed in → go to /login first'); return; }

    // Minimal, valid payload (all required fields set)
    const payload = {
      user_id: user.id,
      display_name: 'Debug User',
      bio: 'debug',
      age: 25,
      budget_min: 1200,
      budget_max: 2000,
      neighborhoods: ['Astoria'],
      timeline_earliest: '2025-10-01',
      timeline_latest:   '2025-12-01',
      cleanliness: 3,
      smoking: 'no',
      sleep_schedule: 'flexible',
      guests: 'sometimes',
      pets: 'none',
      work: 'hybrid',
      preferred_gender_mix: 'any',
      dealbreakers: {}
    };

    const { error } = await supabase.from('profiles').upsert(payload);
    add(error ? `UPSERT error: ${error.code} - ${error.message}` : 'UPSERT ok');
  };

  const readMine = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { add('Not signed in'); return; }
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
    if (error) add(`READ error: ${error.code} - ${error.message}`);
    else add(`READ ok: ${data ? 'found row' : 'no row'}`);
  };

  return (
    <div style={{maxWidth:720}}>
      <h1>Debug</h1>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button onClick={checkEnv}>Check env</button>
        <button onClick={whoAmI}>Who am I?</button>
        <button onClick={tryInsert}>Try insert test profile</button>
        <button onClick={readMine}>Read my profile</button>
      </div>
      <pre style={{marginTop:12, padding:12, background:'#f7f7f7', whiteSpace:'pre-wrap'}}>
        {log.join('\n')}
      </pre>
      <p style={{marginTop:12}}>Tip: go to <a href="/login">/login</a> first, sign in, then return here.</p>
    </div>
  );
}
