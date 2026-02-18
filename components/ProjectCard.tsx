'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, ChevronUp, ExternalLink, Star, MoreVertical, Trash2 } from 'lucide-react';

export default function ProjectCard({ 
  project, 
  rank, 
  onVote, 
  isAdmin, 
  onRefresh,
  activeTab
}: { 
  project: any, 
  rank: number, 
  onVote: () => void, 
  isAdmin?: boolean,
  onRefresh?: () => void,
  onViewFeedback: () => void,
  activeTab?: string
}) {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      if (onRefresh) onRefresh();
      setShowMenu(false);
    }
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/projects/${project.id}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !project.isPinned })
    });
    if (res.ok && onRefresh) onRefresh();
  };

  const handleTop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/projects/${project.id}/top`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTop: !project.isTop })
    });
    if (res.ok && onRefresh) onRefresh();
  };

  const isTopOne = rank === 0 && !project.isPinned && activeTab !== 'top' && !project.isEvent;

  return (
    <div className="premium-card" style={{ 
      padding: '1.75rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1.75rem',
      backgroundColor: 'white',
      position: 'relative',
      overflow: 'visible', // Changed from hidden to allow dropdown
      borderLeft: project.isPinned ? '4px solid var(--primary)' : '1px solid var(--border)'
    }}>
      {/* Decorative Top-Rank Indicator - Hidden for Pinned as it uses borderLeft */}
      {isTopOne && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '4px', 
          height: '100%', 
          backgroundColor: 'var(--primary)' 
        }} />
      )}

      {/* Vote Engine Integration - Hidden for Events */}
      {!project.isEvent && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '0.25rem',
          padding: '0.5rem',
          borderRadius: '12px',
          backgroundColor: '#f8fafc',
          minWidth: '50px'
        }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onVote(); }}
            style={{ 
              color: 'var(--primary)', 
              padding: '4px', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: 'none',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronUp size={24} strokeWidth={3} />
          </button>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--foreground)' }}>
             {project._count?.votes || 0}
          </span>
        </div>
      )}

      {/* Structured Content Area */}
      <div style={{ flex: 1, paddingLeft: project.isEvent ? '0.5rem' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              color: 'var(--foreground)'
            }}>
              {project.name}
            </h3>
          </Link>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {project.isPinned && (
               <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', backgroundColor: 'var(--foreground)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Pinned</span>
            )}
            {project.isTop && (
               <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', backgroundColor: '#4f46e5', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                 <Star size={10} fill="white" /> Handpicked
               </span>
            )}
            {isTopOne && (
               <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', backgroundColor: '#eef2ff', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Community Choice</span>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
           <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>
             built by <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>@{project.user?.username}</span>
           </div>
           <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--muted)' }} />
           <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>
              {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
           </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)' }}>
              <MessageSquare size={16} color="var(--muted)" /> {project._count?.feedback || 0} discussion
           </div>
           
           {project.link !== '#' && (
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
              >
                Launch <ExternalLink size={14} />
              </a>
           )}
        </div>
      </div>

      {/* Administrative Focus */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={handlePin}
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '0.4rem 0.75rem', 
                border: '1px solid var(--border)', 
                borderRadius: '8px',
                color: 'var(--secondary)',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              {project.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button 
              onClick={handleTop}
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '0.4rem 0.75rem', 
                border: project.isTop ? '1px solid var(--primary)' : '1px solid var(--border)', 
                borderRadius: '8px',
                color: project.isTop ? 'var(--primary)' : 'var(--secondary)',
                backgroundColor: project.isTop ? '#eef2ff' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Star size={12} fill={project.isTop ? 'var(--primary)' : 'none'} />
              {project.isTop ? 'Starred' : 'Star'}
            </button>

            {/* 3 Dots Menu */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                style={{ 
                  padding: '0.4rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border)', 
                  backgroundColor: 'white', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--secondary)'
                }}
              >
                <MoreVertical size={16} />
              </button>
              
              {showMenu && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  marginTop: '0.5rem', 
                  backgroundColor: 'white', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px', 
                  boxShadow: 'var(--shadow-lg)', 
                  zIndex: 100,
                  minWidth: '160px',
                  overflow: 'hidden'
                }}>
                  <button 
                    onClick={handleDelete}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem 1rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      color: '#ef4444', 
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      border: 'none', 
                      background: 'none', 
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={16} /> Delete Project
                  </button>
                </div>
              )}
            </div>
        </div>
      )}

    </div>
  );
}
