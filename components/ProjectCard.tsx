'use client';

import React from 'react';
import Link from 'next/link';
import { Twitter, MessageSquare, ExternalLink, ThumbsUp } from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
  category: string;
  user: {
    username: string;
  };
  _count: {
    votes: number;
    feedback: number;
  };
}

export default function ProjectCard({ 
  project, 
  onVote, 
  rank,
  onViewFeedback
}: { 
  project: any, 
  onVote: (id: string) => void, 
  rank: number,
  onViewFeedback: (project: any) => void
}) {
  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '20px',
        padding: '1.2rem 2rem',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        position: 'relative',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateX(5px)';
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.backgroundColor = 'rgba(212, 163, 115, 0.02)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.backgroundColor = 'var(--card-bg)';
      }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: rank === 0 ? '#FFD700' : rank === 1 ? '#C0C0C0' : rank === 2 ? '#CD7F32' : '#f0f0f0',
          color: rank < 3 ? 'black' : '#666',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '1rem',
          flexShrink: 0
        }}>
          {rank + 1}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ minWidth: '0' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {project.name}
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 600 }}>
              by <span style={{ color: 'var(--accent)' }}>@{project.user?.username || 'anonymous'}</span>
            </div>
          </div>
          
          <span style={{ 
            fontSize: '0.65rem', 
            backgroundColor: project.category === 'builder' ? '#E3F2FD' : '#FFF3E0',
            color: project.category === 'builder' ? '#1E88E5' : '#FB8C00',
            padding: '0.2rem 0.6rem',
            borderRadius: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginLeft: 'auto'
          }}>
            {project.category}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
            <MessageSquare size={18} />
            <span style={{ fontWeight: 700 }}>{project._count?.feedback || 0}</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            backgroundColor: 'rgba(212, 163, 115, 0.1)', 
            color: 'var(--accent)',
            padding: '0.6rem 1.2rem',
            borderRadius: '14px',
            fontWeight: 900,
            minWidth: '80px',
            justifyContent: 'center'
          }}>
            <ThumbsUp size={18} fill="currentColor" />
            {project._count?.votes || 0}
          </div>
        </div>
      </div>
    </Link>
  );
}
