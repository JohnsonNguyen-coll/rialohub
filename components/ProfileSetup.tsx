'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { X, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

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
  const [mode, setMode] = useState<'login' | 'signup' | 'setup'>('login');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [rialoUsername, setRialoUsername] = useState(currentProfile?.username || '');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.username) {
        onComplete(session.user);
      } else {
        setMode('setup');
      }
    }
  }, [status, session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('logging-in');
    setError(null);
    
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid username or password');
      setLoading(null);
    } else {
      window.location.href = '/';
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
        window.location.href = '/';
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
    setLoading('saving');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: rialoUsername })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        onComplete(updatedUser);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(253, 252, 249, 0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(5px)'
    }}>
      <div className="premium-card" style={{
        maxWidth: '400px', width: '100%', padding: '3.5rem 2.5rem',
        backgroundColor: '#fff', border: '1px solid var(--border)',
        position: 'relative'
      }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--muted)' }}><X size={20} /></button>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1px' }}>
            {mode === 'login' ? 'Welcome' : mode === 'signup' ? 'Join Us' : 'One Last Step'}
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            {mode === 'login' ? 'Login to continue.' : mode === 'signup' ? 'Create a professional profile.' : 'Choose your display name.'}
          </p>
        </div>

        {mode === 'login' || mode === 'signup' ? (
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <input 
                type="text" required placeholder="Username" value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '6px',
                  border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem'
                }}
              />
            </div>
            <div>
              <input 
                type="password" required placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '6px',
                  border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem'
                }}
              />
            </div>
            {mode === 'signup' && (
              <div>
                <input 
                  type="password" required placeholder="Confirm Password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '0.85rem 1rem', borderRadius: '6px',
                    border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem'
                  }}
                />
              </div>
            )}
            {error && <div style={{ color: '#d93025', fontSize: '0.8rem', fontWeight: 600 }}>{error}</div>}
            
            <button type="submit" className="btn-black" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
              {loading ? '...' : mode === 'login' ? 'Login' : 'Begin'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '1rem' }}>
              {mode === 'login' ? (
                <>New here? <span onClick={() => setMode('signup')} style={{ color: 'var(--foreground)', fontWeight: 800, cursor: 'pointer' }}>Register</span></>
              ) : (
                <>Member? <span onClick={() => setMode('login')} style={{ color: 'var(--foreground)', fontWeight: 800, cursor: 'pointer' }}>Login</span></>
              )}
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input 
              type="text" placeholder="Display Name" value={rialoUsername}
              onChange={(e) => setRialoUsername(e.target.value)}
              style={{
                width: '100%', padding: '0.85rem 1rem', borderRadius: '6px',
                border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem'
              }}
            />
            <button onClick={handleProfileSave} className="btn-black" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
