'use client';

import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Twitter, MessageSquare, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ProfileSetup({ 
  onComplete, 
  onCancel 
}: { 
  onComplete: (data: { username: string, twitterHandle: string, discordHandle: string }) => void,
  onCancel: () => void
}) {
  const { data: session }: any = useSession();
  const [rialoUsername, setRialoUsername] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  
  const isTwitterConnected = session?.user?.provider === 'twitter';
  const isDiscordConnected = session?.user?.provider === 'discord';

  const handleTwitterConnect = () => {
    signIn('twitter');
  };

  const handleDiscordConnect = () => {
    signIn('discord');
  };

  const handleEnter = async () => {
    // Validate username: alphanumeric and underscore only, no spaces
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(rialoUsername)) {
      alert('Username can only contain letters, numbers, and underscores (no spaces or special characters)');
      return;
    }

    setLoading('submitting');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: rialoUsername,
          twitterHandle: isTwitterConnected ? (session?.user?.username || session?.user?.name) : '',
          discordHandle: isDiscordConnected ? (session?.user?.username || session?.user?.name) : ''
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

  const isComplete = rialoUsername.length >= 3 && (isTwitterConnected || isDiscordConnected);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        padding: '2.5rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '32px',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button 
          onClick={onCancel}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#888' }}
        >
          <X size={24} />
        </button>

      <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Connect Profile</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Login with your social accounts to RialoHub</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.9rem' }}>CHOOSE USERNAME</label>
          <input 
            type="text" 
            placeholder="Username..." 
            value={rialoUsername}
            onChange={(e) => setRialoUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '14px',
              border: `2px solid ${rialoUsername && !/^[a-zA-Z0-9_]+$/.test(rialoUsername) ? '#ff4d4f' : 'var(--border)'}`,
              outline: 'none',
              fontSize: '1rem'
            }}
          />
          {rialoUsername && !/^[a-zA-Z0-9_]+$/.test(rialoUsername) && (
            <div style={{ color: '#ff4d4f', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>
              No spaces or special characters allowed (only A-Z, 0-9, _)
            </div>
          )}
        </div>

        <button 
          onClick={handleTwitterConnect}
          style={{
            padding: '1.2rem',
            borderRadius: '16px',
            border: `2px solid ${isTwitterConnected ? '#1DA1F2' : '#eee'}`,
            backgroundColor: isTwitterConnected ? 'rgba(29, 161, 242, 0.05)' : '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Twitter color="#1DA1F2" fill={isTwitterConnected ? "#1DA1F2" : "none"} />
            <div style={{ fontWeight: 700 }}>{isTwitterConnected ? `Connected as @${session?.user?.username || session?.user?.name}` : 'Connect Twitter / X'}</div>
          </div>
          {isTwitterConnected && <CheckCircle2 color="#1DA1F2" />}
        </button>

        <button 
          onClick={handleDiscordConnect}
          style={{
            padding: '1.2rem',
            borderRadius: '16px',
            border: `2px solid ${isDiscordConnected ? '#5865F2' : '#eee'}`,
            backgroundColor: isDiscordConnected ? 'rgba(88, 101, 242, 0.05)' : '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MessageSquare color="#5865F2" fill={isDiscordConnected ? "#5865F2" : "none"} />
            <div style={{ fontWeight: 700 }}>{isDiscordConnected ? `Connected as ${session?.user?.username || session?.user?.name}` : 'Connect Discord'}</div>
          </div>
          {isDiscordConnected && <CheckCircle2 color="#5865F2" />}
        </button>
      </div>

      <button
        disabled={!isComplete || loading === 'submitting'}
        onClick={handleEnter}
        style={{
          width: '100%',
          marginTop: '2rem',
          backgroundColor: isComplete ? 'var(--primary)' : '#ccc',
          color: 'white',
          padding: '1.1rem',
          borderRadius: '14px',
          fontWeight: 800,
          fontSize: '1rem',
          cursor: isComplete ? 'pointer' : 'not-allowed'
        }}
      >
        {loading === 'submitting' ? 'Saving...' : isComplete ? 'Continue to RialoHub' : 'Connect Accounts & Pick Username'}
      </button>

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888' }}>
        <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
        Real OAuth connection via NextAuth
      </div>
      </div>
    </div>
  );
}
