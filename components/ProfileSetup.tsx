'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Twitter, MessageSquare, CheckCircle2, AlertCircle, X, Lock, User as UserIcon, ArrowRight, Github } from 'lucide-react';

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
  
  // Auth states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile states
  const [rialoUsername, setRialoUsername] = useState(currentProfile?.username || '');
  const [twitterHandle, setTwitterHandle] = useState(currentProfile?.twitterHandle || '');
  const [twitterId, setTwitterId] = useState(currentProfile?.twitterId || '');
  const [discordHandle, setDiscordHandle] = useState(currentProfile?.discordHandle || '');
  const [discordId, setDiscordId] = useState(currentProfile?.discordId || '');

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set mode based on session status and profile completeness
  useEffect(() => {
    if (status === 'authenticated') {
      setMode('setup');
      if (session?.user?.username) {
        setRialoUsername(session.user.username);
      }
    }
  }, [status, session]);

  // Sync state when currentProfile prop changes
  useEffect(() => {
    if (currentProfile) {
      if (currentProfile.username) setRialoUsername(currentProfile.username);
      if (currentProfile.twitterHandle) setTwitterHandle(currentProfile.twitterHandle);
      if (currentProfile.twitterId) setTwitterId(currentProfile.twitterId);
      if (currentProfile.discordHandle) setDiscordHandle(currentProfile.discordHandle);
      if (currentProfile.discordId) setDiscordId(currentProfile.discordId);
    }
  }, [currentProfile]);

  // Sync OAuth data from session
  useEffect(() => {
    if (session?.user && mode === 'setup') {
      if ((session.user as any).provider === 'twitter') {
        setTwitterHandle((session.user as any).username || session.user.name || '');
        setTwitterId((session.user as any).providerAccountId || '');
      } else if ((session.user as any).provider === 'discord') {
        setDiscordHandle((session.user as any).username || session.user.name || '');
        setDiscordId((session.user as any).providerAccountId || '');
      }
    }
  }, [session, mode]);
  
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
      setLoading(null);
      // Mode will be updated by useEffect on session change
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading('signing-up');
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(null);
      } else {
        // Success! Now login automatically
        const result = await signIn('credentials', {
          username,
          password,
          redirect: false,
        });
        
        if (result?.error) {
          setMode('login');
          setError('Account created, please login');
          setLoading(null);
        }
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
        body: JSON.stringify({
          username: rialoUsername,
          twitterHandle,
          twitterId,
          discordHandle,
          discordId
        })
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Something went wrong');
        setLoading(null);
        return;
      }

      const updatedUser = await res.json();
      onComplete(updatedUser);
    } catch (err) {
      alert('Failed to save profile');
      setLoading(null);
    }
  };

  const isSetupValid = rialoUsername.length >= 3;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem', backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        maxWidth: '450px', width: '100%', padding: '2.5rem',
        backgroundColor: '#fff', borderRadius: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative', color: '#000'
      }}>
        <button 
          onClick={onCancel}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#888', border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        {mode === 'login' || mode === 'signup' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '60px', height: '60px', backgroundColor: 'var(--primary)', 
                borderRadius: '18px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' 
              }}>
                <Lock size={28} />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p style={{ color: '#666' }}>{mode === 'login' ? 'Login to your RialoHub profile' : 'Join the RialoHub community'}</p>
            </div>

            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#333' }}>USERNAME</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '14px',
                      border: '2px solid #eee', outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#333' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '14px',
                      border: '2px solid #eee', outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#333' }}>CONFIRM PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '14px',
                        border: '2px solid #eee', outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div style={{ color: '#ff4d4f', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={!!loading}
                style={{
                  width: '100%', padding: '1.2rem', borderRadius: '16px',
                  backgroundColor: '#000', color: 'white', fontWeight: 800,
                  fontSize: '1rem', cursor: 'pointer', border: 'none', marginTop: '0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
              {mode === 'login' ? (
                <>Don't have an account? <span onClick={() => { setMode('signup'); setError(null); }} style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Sign Up</span></>
              ) : (
                <>Already have an account? <span onClick={() => { setMode('login'); setError(null); }} style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Login</span></>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-1px' }}>Connect Socials</h2>
              <p style={{ color: '#666' }}>Almost there! Connect your accounts to participate</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#333' }}>CHOOSE USERNAME</label>
                <input 
                  type="text" 
                  placeholder="Username..." 
                  value={rialoUsername}
                  onChange={(e) => setRialoUsername(e.target.value)}
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '14px',
                    border: `2px solid ${rialoUsername && !/^[a-zA-Z0-9_]+$/.test(rialoUsername) ? '#ff4d4f' : '#eee'}`,
                    outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Commented out for initial testing of credentials auth
              <button 
                onClick={() => signIn('twitter')}
                style={{
                  width: '100%', padding: '1.2rem', borderRadius: '16px',
                  border: `2px solid ${twitterHandle ? '#1DA1F2' : '#eee'}`,
                  backgroundColor: twitterHandle ? 'rgba(29, 161, 242, 0.05)' : '#fff',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Twitter color="#1DA1F2" fill={twitterHandle ? "#1DA1F2" : "none"} />
                  <div style={{ fontWeight: 800 }}>{twitterHandle ? `@${twitterHandle}` : 'Connect Twitter / X'}</div>
                </div>
                {twitterHandle && <CheckCircle2 color="#1DA1F2" />}
              </button>

              <button 
                onClick={() => signIn('discord')}
                style={{
                  width: '100%', padding: '1.2rem', borderRadius: '16px',
                  border: `2px solid ${discordHandle ? '#5865F2' : '#eee'}`,
                  backgroundColor: discordHandle ? 'rgba(88, 101, 242, 0.05)' : '#fff',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <MessageSquare color="#5865F2" fill={discordHandle ? "#5865F2" : "none"} />
                  <div style={{ fontWeight: 800 }}>{discordHandle ? discordHandle : 'Connect Discord'}</div>
                </div>
                {discordHandle && <CheckCircle2 color="#5865F2" />}
              </button>
              */}
            </div>

            <button
              disabled={!isSetupValid || loading === 'saving'}
              onClick={handleProfileSave}
              style={{
                width: '100%', marginTop: '2rem',
                backgroundColor: isSetupValid ? '#000' : '#ccc',
                color: 'white', padding: '1.2rem', borderRadius: '16px',
                fontWeight: 800, fontSize: '1rem',
                cursor: isSetupValid ? 'pointer' : 'not-allowed', border: 'none'
              }}
            >
              {loading === 'saving' ? 'Saving...' : 'Finish Setup & Start Exploring'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
