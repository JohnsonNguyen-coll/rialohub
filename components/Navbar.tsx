'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { signOut, signIn } from 'next-auth/react';
import { LogOut, User as UserIcon, Bell, Menu, MessageSquare, ThumbsUp, ArrowRight, X, Twitter, MessageCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onConnect }: { 
  activeTab?: string, 
  setActiveTab?: (tab: string) => void,
  user?: any,
  onConnect: () => void 
}) {
  const displayUser = user || null;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (displayUser) {
      fetchNotifications();
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
      await fetch('/api/notifications/read', { method: 'POST' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
    <>
      <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
            <Link href="/" onClick={() => setActiveTab?.('builder')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <img src="/assets/logo.png" alt="RialoHub" style={{ height: '32px', width: 'auto' }} />
              <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--foreground)' }}>RialoHub</span>
            </Link>

            {setActiveTab && (
               <div style={{ display: 'flex', gap: '2rem' }}>
                  <button onClick={() => setActiveTab('builder')} style={{ border: 'none', background: 'none', color: activeTab === 'builder' ? 'var(--foreground)' : 'var(--muted)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', opacity: activeTab === 'builder' ? 1 : 0.6 }}>Builders</button>
                  <button onClick={() => setActiveTab('sharktank')} style={{ border: 'none', background: 'none', color: activeTab === 'sharktank' ? 'var(--foreground)' : 'var(--muted)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', opacity: activeTab === 'sharktank' ? 1 : 0.6 }}>Shark Tank</button>
                  <button onClick={() => setActiveTab('top')} style={{ border: 'none', background: 'none', color: activeTab === 'top' ? 'var(--foreground)' : 'var(--muted)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', opacity: activeTab === 'top' ? 1 : 0.6 }}>Top Leaders</button>
               </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {displayUser ? (
               <>
                 <div style={{ position: 'relative' }} ref={notifRef}>
                    <button onClick={() => { setShowNotif(!showNotif); if(!showNotif) markAsRead(); }} style={{ background: 'none', border: 'none', padding: '0.5rem', color: 'var(--secondary)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bell size={22} />
                      {notifications.some(n => !n.isRead) && <span style={{ position: 'absolute', top: '0.3rem', right: '0.3rem', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>}
                    </button>
                    {showNotif && (
                      <div className="premium-card" style={{ position: 'absolute', top: '100%', right: 0, width: '360px', marginTop: '1rem', padding: '1.5rem', maxHeight: '480px', overflowY: 'auto', border: '1px solid var(--border)' }}>
                         <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Notifications <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>View All</span></div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notifications.length === 0 ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: '0.9rem' }}>No signals yet.</div> : notifications.map(n => <div key={n.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '12px', background: n.isRead ? 'transparent' : 'var(--surface)', border: n.isRead ? 'none' : '1px solid var(--border)' }}><div style={{ width: '32px', height: '32px', borderRadius: '8px', background: n.type === 'vote' ? '#dcfce7' : '#e0f2fe', color: n.type === 'vote' ? '#166534' : '#075985', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n.type === 'vote' ? <ThumbsUp size={16} /> : <MessageSquare size={16} />}</div><div style={{ fontSize: '0.85rem' }}><span style={{ fontWeight: 800 }}>@{n.from?.username || 'Somebody'}</span> {n.type === 'vote' ? 'upvoted your project' : 'commented on your project'}<div style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.6 }}>{new Date(n.createdAt).toLocaleDateString()}</div></div></div>)}
                         </div>
                      </div>
                    )}
                 </div>
                 <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)' }} />
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button onClick={() => setShowProfileModal(true)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem', color: 'var(--foreground)' }}>
                    {(displayUser.username || displayUser.name || 'U').substring(0, 1).toUpperCase()}
                  </button>
                  <button onClick={() => signOut()} style={{ padding: '0.4rem', border: 'none', background: 'none', color: 'var(--muted)', cursor: 'pointer' }} title="Logout"><LogOut size={20} /></button>
                 </div>
               </>
            ) : (
              <button onClick={onConnect} className="btn-black" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>Sign In</button>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL IS NOW COMPLETELY DECOUPLED FOR PERFECT CENTERING */}
      {showProfileModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(12px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 100000, // Top of the world
          padding: '1.5rem' 
        }}>
          <div className="premium-card" style={{ 
            maxWidth: '420px', 
            width: '100%', 
            padding: '2.5rem', 
            backgroundColor: 'white', 
            border: '1px solid var(--border)', 
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <button onClick={() => setShowProfileModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, margin: '0 auto 1.5rem auto' }}>{(displayUser?.username || 'U').substring(0, 1).toUpperCase()}</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-1px' }}>@{displayUser?.username}</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>RialoHub Builder</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Twitter size={18} /></div>
                <div><div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', marginBottom: '2px' }}>X (Twitter)</div><div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)' }}>{displayUser?.twitterHandle ? `@${displayUser.twitterHandle}` : 'Not Connected'}</div></div>
              </div>
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#5865F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={18} /></div>
                <div><div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', marginBottom: '2px' }}>Discord</div><div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)' }}>{displayUser?.discordHandle || 'Not Connected'}</div></div>
              </div>
            </div>
            <button onClick={() => signOut()} className="btn-primary" style={{ width: '100%', marginTop: '2rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', justifyContent: 'center', padding: '1rem' }}>Sign Out</button>
          </div>
        </div>
      )}
    </>
  );
}
