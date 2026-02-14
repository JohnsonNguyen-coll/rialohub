'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Layout, Users, Trophy, PlusCircle, Twitter, MessageSquare, LogIn, LogOut } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user: initialUser, 
  onConnect 
}: { 
  activeTab?: string, 
  setActiveTab?: (tab: string) => void,
  user: any | null,
  onConnect: () => void
}) {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(initialUser);

  useEffect(() => {
    if (session && !user) {
      fetch('/api/profile').then(res => res.json()).then(data => setUser(data));
    }
  }, [session, user]);

  const displayUser = user || initialUser;
  return (
    <nav style={{ 
      padding: '1rem 0', 
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      backgroundColor: 'rgba(247, 243, 233, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 100,
      marginBottom: '2rem'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px', textDecoration: 'none' }}>
          RIALO<span style={{ color: 'var(--accent)' }}>HUB</span>
        </Link>
        
        {setActiveTab && (
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <button 
              onClick={() => setActiveTab('builder')}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontWeight: 600,
                color: activeTab === 'builder' ? 'var(--accent)' : 'var(--foreground)',
                borderBottom: activeTab === 'builder' ? '2px solid var(--accent)' : 'none',
                padding: '0.4rem 0'
              }}
            >
              <Users size={18} />
              Builder Hub
            </button>
            <button 
              onClick={() => setActiveTab('sharktank')}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontWeight: 600,
                color: activeTab === 'sharktank' ? 'var(--accent)' : 'var(--foreground)',
                borderBottom: activeTab === 'sharktank' ? '2px solid var(--accent)' : 'none',
                padding: '0.4rem 0'
              }}
            >
              <Trophy size={18} />
              Shark Tank
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {displayUser ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.2rem'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1.2rem', 
                backgroundColor: 'white', 
                padding: '0.5rem 1.2rem', 
                borderRadius: '16px',
                border: '1px solid var(--border)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                  {displayUser.username}
                </div>
                <div style={{ width: '1px', height: '15px', backgroundColor: '#eee' }} />
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <Twitter size={14} color="#1DA1F2" style={{ opacity: displayUser.twitterHandle ? 1 : 0.3 }} />
                  <MessageSquare size={14} color="#5865F2" style={{ opacity: displayUser.discordHandle ? 1 : 0.3 }} />
                </div>
              </div>

              <button 
                onClick={() => signOut()}
                title="Log out"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.6rem',
                  borderRadius: '12px',
                  border: '1px solid #fee2e2',
                  backgroundColor: '#fff1f1',
                  color: '#ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#fecaca';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff1f1';
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onConnect}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                color: 'var(--primary)',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid var(--primary)',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              <LogIn size={18} />
              Connect Profiles
            </button>
          )}

          <button 
            onClick={onConnect}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <PlusCircle size={18} />
            Submit
          </button>
        </div>
      </div>
    </nav>
  );
}

