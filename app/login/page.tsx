'use client';
import { useState } from 'react';
import { getSupabaseBrowser } from '../../lib/supabaseClient';

export default function Login() {
  const supabase = getSupabaseBrowser();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');

  const signup = async () => {
    const { error } = await supabase.auth.signUp({ email, password: pw });
    setMsg(error ? error.message : 'Sign-up ok. Now click Sign In.');
  };
  const signin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setMsg(error ? error.message : 'Signed in. Next: /onboarding');
  };

  return (
    <div style={{maxWidth:420}}>
      <h1>Login</h1>
      <input placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}
             style={{display:'block',width:'100%',padding:8,border:'1px solid #ccc',marginTop:8}} />
      <input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)}
             style={{display:'block',width:'100%',padding:8,border:'1px solid #ccc',marginTop:8}} />
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button onClick={signup}>Sign Up</button>
        <button onClick={signin}>Sign In</button>
      </div>
      <div style={{marginTop:8,fontSize:12,color:'#555'}}>{msg}</div>
    </div>
  );
}
