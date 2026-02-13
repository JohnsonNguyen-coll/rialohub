'use client';

import React from 'react';
import Link from 'next/link';
import { Layout, Users, Trophy, PlusCircle, Twitter, MessageSquare, LogIn } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onConnect 
}: { 
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  user: { username: string, twitter: string, discord: string } | null,
  onConnect: () => void
}) {
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
        <Link href="/" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
          RIALO<span style={{ color: 'var(--accent)' }}>HUB</span>
        </Link>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <button 
            onClick={() => setActiveTab('builder')}
            style={{ 
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user ? (
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
                {user.username}
              </div>
              <div style={{ width: '1px', height: '15px', backgroundColor: '#eee' }} />
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Twitter size={14} color="#1DA1F2" style={{ opacity: user.twitter ? 1 : 0.3 }} />
                <MessageSquare size={14} color="#5865F2" style={{ opacity: user.discord ? 1 : 0.3 }} />
              </div>
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
                border: '1.5px solid var(--primary)'
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

