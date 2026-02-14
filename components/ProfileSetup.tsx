'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { X, User as UserIcon, ArrowRight, MessageSquare, Twitter, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthAndProfile({ 
  onComplete, 
  onCancel 
}: { 
  onComplete: (data: any) => void,
  onCancel: () => void
}) {
  const { data: session, status }: any = useSession();
  const [mode, setMode] = useState<'social_login' | 'setup' | 'connections' | 'credentials'>('social_login');
  const [rialoUsername, setRialoUsername] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  const handleProfileSave = async () => {
    if (!rialoUsername.trim()) return;
    setLoading('saving');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: rialoUsername })
      });
      if (res.ok) { 
        toast.success('Username updated! Welcome to RialoHub.');
        setTimeout(() => window.location.reload(), 1000);
      }
      else {
        const data = await res.json();
        setError(data.error);
        toast.error(data.error || 'Failed to save username');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('logging-in');
    const result = await signIn('credentials', { username, password, redirect: false });
    if (result?.error) {
      setError('Invalid credentials');
      toast.error('Invalid username or password');
      setLoading(null);
    }
  };

  const isTwitterConnected = !!session?.user?.twitterId;
  const isDiscordConnected = !!session?.user?.discordId;
  const isFullyConnected = isTwitterConnected && isDiscordConnected;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(253, 252, 249, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
      <div className="premium-card" style={{ maxWidth: '440px', width: '100%', padding: '3.5rem 2.5rem', backgroundColor: '#fff', border: '1px solid var(--border)', position: 'relative' }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
            {mode === 'social_login' ? 'Join RialoHub' : mode === 'setup' ? 'Identity Setup' : mode === 'connections' ? 'Verify Humanity' : 'Sign In'}
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            {mode === 'social_login' ? 'Connect a social account to start.' : mode === 'setup' ? 'Pick a unique handle for your profile.' : mode === 'connections' ? 'Connect missing socials to participate.' : 'Use your username and password.'}
          </p>
        </div>

        {mode === 'social_login' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             <button onClick={() => signIn('twitter')} className="btn-black" style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', padding: '1.15rem' }}>
                <Twitter size={20} /> Continue with X (Twitter)
             </button>
             <button onClick={() => signIn('discord')} className="btn-black" style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', padding: '1.15rem', backgroundColor: '#5865F2', border: 'none' }}>
                <MessageSquare size={20} /> Continue with Discord
             </button>
             <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span onClick={() => setMode('credentials')} style={{ fontSize: '0.85rem', color: 'var(--muted)', cursor: 'pointer', fontWeight: 700 }}>Or sign in with username/password</span>
             </div>
          </div>
        ) : mode === 'setup' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div style={{ position: 'relative' }}>
               <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
               <input type="text" placeholder="Username (e.g. builder_99)" value={rialoUsername} onChange={(e) => setRialoUsername(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '12px', border: '1px solid var(--primary)', outline: 'none', fontSize: '1rem' }} />
             </div>
             {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>{error}</div>}
             <button onClick={handleProfileSave} disabled={loading === 'saving' || !rialoUsername.trim()} className="btn-black" style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>
                {loading === 'saving' ? 'Setting up...' : 'Confirm Username'}
             </button>
          </div>
        ) : mode === 'connections' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe', color: '#075985', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem' }}>You're almost there! One more connection to verify.</div>
             <button onClick={() => signIn('twitter')} disabled={isTwitterConnected} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: isTwitterConnected ? '#f8fafc' : 'white', cursor: isTwitterConnected ? 'default' : 'pointer', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#000', color: 'white' }}><Twitter size={18} /></div><span style={{ fontWeight: 700, color: '#1e293b' }}>Connect X</span></div>
                {isTwitterConnected ? <CheckCircle2 size={20} color="#10b981" /> : <ArrowRight size={18} color="#94a3b8" />}
             </button>
             <button onClick={() => signIn('discord')} disabled={isDiscordConnected} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: isDiscordConnected ? '#f8fafc' : 'white', cursor: isDiscordConnected ? 'default' : 'pointer', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#5865F2', color: 'white' }}><MessageSquare size={18} /></div><span style={{ fontWeight: 700, color: '#1e293b' }}>Connect Discord</span></div>
                {isDiscordConnected ? <CheckCircle2 size={20} color="#10b981" /> : <ArrowRight size={18} color="#94a3b8" />}
             </button>
             <button disabled={!isFullyConnected} onClick={() => onComplete(session.user)} className={isFullyConnected ? 'btn-black' : 'btn-disabled'} style={{ marginTop: '1rem', width: '100%', padding: '1rem', justifyContent: 'center' }}>
                {isFullyConnected ? 'Enter the Hub' : 'Complete All Verification'}
             </button>
          </div>
        ) : (
          <form onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             <input type="text" required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--surface)' }} />
             <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--surface)' }} />
             {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>{error}</div>}
             <button type="submit" className="btn-black" style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>Sign In</button>
             <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span onClick={() => setMode('social_login')} style={{ fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 800 }}>Back to Social Login</span>
             </div>
          </form>
        )}
      </div>
    </div>
  );
}
