'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { signOut, signIn } from 'next-auth/react';
import { LogOut, User as UserIcon, Bell, Menu, MessageSquare, ThumbsUp, ArrowRight } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onConnect }: { 
  activeTab?: string, 
  setActiveTab?: (tab: string) => void,
  user?: any,
  onConnect: () => void 
}) {
  const displayUser = user || null;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (displayUser) {
      fetchNotifications();
      // Poll every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [displayUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      fetchNotifications();
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
             <img 
               src="/assets/logo.png" 
               alt="RialoHub Logo" 
               style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }} 
             />
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
               <div style={{ position: 'relative' }} ref={notifRef}>
                  <button 
                    onClick={() => {
                      setShowNotif(!showNotif);
                      if (!showNotif && unreadCount > 0) markAsRead();
                    }}
                    style={{ background: 'none', border: 'none', color: unreadCount > 0 ? 'var(--primary)' : 'var(--secondary)', cursor: 'pointer', position: 'relative' }}
                  >
                    <Bell size={20} fill={unreadCount > 0 ? 'var(--primary)' : 'none'} />
                    {unreadCount > 0 && (
                      <div style={{ 
                        position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', 
                        borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', fontSize: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
                        border: '2px solid white'
                      }}>
                        {unreadCount}
                      </div>
                    )}
                  </button>

                  {showNotif && (
                    <div style={{ 
                      position: 'absolute', top: '40px', right: '0', width: '320px', 
                      backgroundColor: 'white', borderRadius: 'var(--radius-md)', 
                      boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                      overflow: 'hidden', padding: '0.5rem 0'
                    }}>
                       <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.85rem' }}>
                          Notifications
                       </div>
                       <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                               No activity yet.
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <Link 
                                key={n.id} 
                                href={`/projects/${n.projectId}`}
                                onClick={() => setShowNotif(false)}
                                style={{ 
                                  display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', 
                                  textDecoration: 'none', borderBottom: '1px solid var(--border)',
                                  backgroundColor: n.isRead ? 'transparent' : '#f8fafc',
                                  transition: 'background 0.2s ease'
                                }}
                              >
                                 <div style={{ padding: '0.4rem', borderRadius: '8px', background: n.type === 'vote' ? '#eef2ff' : '#f0fdf4', color: n.type === 'vote' ? 'var(--primary)' : '#10b981' }}>
                                    {n.type === 'vote' ? <ThumbsUp size={14} /> : <MessageSquare size={14} />}
                                 </div>
                                 <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--foreground)', lineHeight: '1.4' }}>
                                       <strong>@{n.from.username}</strong> {n.type === 'vote' ? 'upvoted' : n.type === 'reply' ? 'replied to yours on' : 'commented on'} <strong>{n.project?.name}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                                       {new Date(n.createdAt).toLocaleDateString()}
                                    </div>
                                 </div>
                              </Link>
                            ))
                          )}
                       </div>
                       {notifications.length > 0 && (
                         <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button onClick={() => setShowNotif(false)} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                               Close
                            </button>
                         </div>
                       )}
                    </div>
                  )}
               </div>

               <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)' }} />
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '10px', 
                  backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem'
                }}>
                  {(displayUser.username || displayUser.name || 'U').substring(0, 1).toUpperCase()}
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
