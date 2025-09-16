'use client';
import { useState } from 'react';
import { apis} from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage(){
  const [email,setEmail]=useState('you@example.com');
  const [password,setPassword]=useState('p@ssw0rd');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const router=useRouter();
  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setLoading(true); setError(null);
    try{
      const {access_token,refresh_token}=await apis.auth.login({loginIn: { email, password }});
      localStorage.setItem('access_token',access_token);
      localStorage.setItem('refresh_token',refresh_token);
      router.push('/events');
    }catch(err:any){ setError(err?.message||'Login failed'); }
    finally{ setLoading(false); }
  }
  return(<div><h1>Login</h1><form onSubmit={onSubmit}>
    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder='email' />
    <input value={password} type='password' onChange={e=>setPassword(e.target.value)} placeholder='password' />
    {error && <p style={{color:'crimson'}}>{error}</p>}
    <button disabled={loading}>{loading?'Signing in...':'Sign in'}</button>
  </form></div>);
}
