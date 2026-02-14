'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LogOut, User as UserIcon, Bell, Menu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onConnect }: { 
  activeTab?: string, 
  setActiveTab?: (tab: string) => void,
  user?: any,
  onConnect: () => void 
}) {
  const displayUser = user || null;

  return (
    <nav className="glass" style={{ 
      height: '72px',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {/* Branding Area */}
        <div style={{ width: 'var(--sidebar-width)', display: 'flex', alignItems: 'center' }}>
           <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ 
               width: '32px', height: '32px', borderRadius: '8px', 
               background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               color: 'white', fontWeight: 900, fontSize: '1rem'
             }}>R</div>
             <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-1.5px' }}>
                RIALO<span style={{ fontWeight: 400, color: 'var(--secondary)' }}>HUB</span>
             </span>
           </Link>
        </div>
        
        {/* Centered Navigation */}
        {setActiveTab && (
          <div style={{ flex: 1, display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
            {['builder', 'sharktank'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === tab ? 800 : 600,
                  color: activeTab === tab ? 'var(--primary)' : 'var(--secondary)',
                  padding: '0.5rem 0',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'builder' ? 'The Hub' : 'Shark Tank'}
                {activeTab === tab && (
                  <div style={{ 
                    position: 'absolute', bottom: '-24px', left: '0', right: '0', 
                    height: '3px', backgroundColor: 'var(--primary)',
                    borderRadius: '3px 3px 0 0'
                  }} />
                )}
              </button>
            ))}
          </div>
        )}

        {/* User Actions Area */}
        <div style={{ width: 'var(--right-sidebar-width)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.25rem' }}>
          {displayUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
               <button style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}>
                  <Bell size={20} />
               </button>
               <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)' }} />
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '10px', 
                  backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem'
                }}>
                  {displayUser.username.substring(0, 1).toUpperCase()}
                </div>
                <button 
                  onClick={() => signOut()}
                  style={{
                    padding: '0.4rem', border: 'none', background: 'none', color: 'var(--muted)', cursor: 'pointer'
                  }}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onConnect}
              className="btn-black"
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
