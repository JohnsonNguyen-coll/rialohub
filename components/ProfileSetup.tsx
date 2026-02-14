'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { X, User as UserIcon, ArrowRight, MessageSquare, Twitter, CheckCircle2 } from 'lucide-react';

export default function AuthAndProfile({ 
  currentProfile,
  onComplete, 
  onCancel 
}: { 
  currentProfile?: any,
  onComplete: (data: any) => void,
  onCancel: () => void
}) {
  const { data: session, status }: any = useSession();
  const [mode, setMode] = useState<'login' | 'signup' | 'setup' | 'connections'>('login');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [rialoUsername, setRialoUsername] = useState(currentProfile?.username || '');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      if (!session?.user?.username) {
        setMode('setup');
      } else if (!session?.user?.twitterId || !session?.user?.discordId) {
        setMode('connections');
      } else {
        onComplete(session.user);
      }
    }
  }, [status, session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('logging-in');
    setError(null);
    const result = await signIn('credentials', { username, password, redirect: false });
    if (result?.error) {
      setError('Invalid username or password');
      setLoading(null);
    } else {
      setLoading(null);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Letters, numbers, and underscores only.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading('signing-up');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        await signIn('credentials', { username, password, redirect: false });
      } else {
        const data = await res.json();
        setError(data.error);
        setLoading(null);
      }
    } catch (err) {
      setError('Something went wrong');
      setLoading(null);
    }
  };

  const handleProfileSave = async () => {
    if (!rialoUsername.trim()) return;
    setLoading('saving');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: rialoUsername })
      });
      if (res.ok) { /* mode will change via useEffect */ }
    } finally {
      setLoading(null);
    }
  };

  const handleSocialConnect = (provider: string) => {
    signIn(provider, { callbackUrl: window.location.href });
  };

  const isTwitterConnected = !!session?.user?.twitterId;
  const isDiscordConnected = !!session?.user?.discordId;
  const isFullyConnected = isTwitterConnected && isDiscordConnected;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(253, 252, 249, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
      <div className="premium-card" style={{ maxWidth: '440px', width: '100%', padding: '3.5rem 2.5rem', backgroundColor: '#fff', border: '1px solid var(--border)', position: 'relative' }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1px' }}>{mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : mode === 'setup' ? 'Identity Setup' : 'Verify Humanity'}</h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{mode === 'login' ? 'Login with your credentials.' : mode === 'signup' ? 'Join the RialoHub community.' : mode === 'setup' ? 'Choose your unique handle.' : 'Connect socials to interact.'}</p>
        </div>

        {mode === 'login' || mode === 'signup' ? (
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="text" required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontSize: '1rem', backgroundColor: 'var(--surface)' }} />
            <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontSize: '1rem', backgroundColor: 'var(--surface)' }} />
            {mode === 'signup' && <input type="password" required placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontSize: '1rem', backgroundColor: 'var(--surface)' }} />}
            {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>{error}</div>}
            <button type="submit" className="btn-black" style={{ marginTop: '0.5rem', width: '100%', padding: '1rem', justifyContent: 'center' }}>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}</button>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '1rem' }}>{mode === 'login' ? <>New here? <span onClick={() => setMode('signup')} style={{ color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }}>Register</span></> : <>Have account? <span onClick={() => setMode('login')} style={{ color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }}>Sign In</span></>}</div>
          </form>
        ) : mode === 'setup' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div style={{ position: 'relative' }}><UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} /><input type="text" placeholder="Handle (e.g. dev_wizard)" value={rialoUsername} onChange={(e) => setRialoUsername(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '12px', border: '1px solid var(--primary)', outline: 'none', fontSize: '1rem' }} /></div>
            <button onClick={handleProfileSave} disabled={loading === 'saving' || !rialoUsername.trim()} className="btn-black" style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>{loading === 'saving' ? 'Saving...' : 'Complete Profile'}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem' }}>Social connections are mandatory to participate.</div>
             <button onClick={() => handleSocialConnect('twitter')} disabled={isTwitterConnected} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: isTwitterConnected ? '#f8fafc' : 'white', cursor: isTwitterConnected ? 'default' : 'pointer', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#000', color: 'white' }}><Twitter size={18} /></div><span style={{ fontWeight: 700, color: '#1e293b' }}>Connect X</span></div>
                {isTwitterConnected ? <CheckCircle2 size={20} color="#10b981" /> : <ArrowRight size={18} color="#94a3b8" />}
             </button>
             <button onClick={() => handleSocialConnect('discord')} disabled={isDiscordConnected} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: isDiscordConnected ? '#f8fafc' : 'white', cursor: isDiscordConnected ? 'default' : 'pointer', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#5865F2', color: 'white' }}><MessageSquare size={18} /></div><span style={{ fontWeight: 700, color: '#1e293b' }}>Connect Discord</span></div>
                {isDiscordConnected ? <CheckCircle2 size={20} color="#10b981" /> : <ArrowRight size={18} color="#94a3b8" />}
             </button>
             <button onClick={() => onComplete(session.user)} disabled={!isFullyConnected} className={isFullyConnected ? 'btn-black' : 'btn-disabled'} style={{ marginTop: '1rem', width: '100%', padding: '1rem', opacity: isFullyConnected ? 1 : 0.5, cursor: isFullyConnected ? 'pointer' : 'not-allowed', justifyContent: 'center' }}>{isFullyConnected ? 'Enter the Hub' : 'Verify Humanity'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
