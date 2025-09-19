import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

type Profile = {
  user_id: string; display_name: string;
  budget_min: number; budget_max: number;
  neighborhoods: string[];
  timeline_earliest: string; timeline_latest: string;
  cleanliness: number; smoking: string; sleep_schedule: string; guests: string; pets: string; work: string;
  dealbreakers: Record<string, any>;
};

function daysOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  const start = new Date(Math.max(+aStart, +bStart));
  const end   = new Date(Math.min(+aEnd, +bEnd));
  const ms = +end - +start;
  return ms >= 0 ? Math.floor(ms / 86400000) + 1 : 0;
}
function intersect<T>(a: T[], b: T[]) { const set = new Set(a); return b.filter(x => set.has(x)); }

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (k: string) => cookieStore.get(k)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (!me) return NextResponse.json({ error: 'Fill onboarding first' }, { status: 400 });

  const { data: candidates, error } = await supabase
    .from('profiles').select('*')
    .neq('user_id', user.id)
    .or(`budget_min.lte.${me.budget_max},budget_max.gte.${me.budget_min}`)
    .lte('timeline_earliest', me.timeline_latest)
    .gte('timeline_latest', me.timeline_earliest)
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  function score(other: Profile): number | null {
    const budgetOverlap = me.budget_min <= other.budget_max && other.budget_min <= me.budget_max;
    if (!budgetOverlap) return null;
    const overlapDays = daysOverlap(new Date(me.timeline_earliest), new Date(me.timeline_latest),
                                    new Date(other.timeline_earliest), new Date(other.timeline_latest));
    if (overlapDays < 15) return null;
    if (me.dealbreakers?.smoking === 'no' && other.smoking !== 'no') return null;
    if (me.dealbreakers?.pets === 'no_dogs' && other.pets === 'dog') return null;

    let s = 0;
    const cleanDist = Math.abs(me.cleanliness - other.cleanliness);
    s += Math.max(0, 20 * (1 - cleanDist / 4));
    s += (me.smoking === other.smoking ? 15 : 0);

    const adj = new Set([['early_bird','flexible'].toString(), ['flexible','night_owl'].toString()]);
    if (me.sleep_schedule === other.sleep_schedule) s += 10;
    else if (adj.has([me.sleep_schedule, other.sleep_schedule].sort().toString())) s += 5;

    const petsOk = (me.pets === 'ok_with_pets' || other.pets === 'ok_with_pets' || me.pets === other.pets);
    s += petsOk ? 10 : 0;

    const map: any = { never:0, sometimes:1, often:2 };
    const gDist = Math.abs(map[me.guests] - map[other.guests]);
    s += Math.max(0, 10 * (1 - gDist / 2));

    s += me.work === other.work ? 5 : 3;

    const n = intersect(me.neighborhoods || [], other.neighborhoods || []).length;
    s += n >= 2 ? 15 : n >= 1 ? 10 : 0;

    return Math.min(100, Math.round(s));
  }

  const results = (candidates || [])
    .map((p) => ({ p, score: score(p as any) }))
    .filter((x) => x.score !== null)
    .sort((a, b) => (b.score! - a.score!))
    .slice(0, 20)
    .map(({ p, score }) => ({
      user_id: (p as any).user_id,
      display_name: (p as any).display_name,
      neighborhoods: (p as any).neighborhoods,
      budget_min: (p as any).budget_min,
      budget_max: (p as any).budget_max,
      timeline_earliest: (p as any).timeline_earliest,
      timeline_latest: (p as any).timeline_latest,
      cleanliness: (p as any).cleanliness,
      smoking: (p as any).smoking,
      sleep_schedule: (p as any).sleep_schedule,
      guests: (p as any).guests,
      pets: (p as any).pets,
      work: (p as any).work,
      score
    }));

  return NextResponse.json({ matches: results });
}
