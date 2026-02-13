'use client';

import React from 'react';
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
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '24px',
      padding: '1.5rem',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative',
      transition: 'all 0.3s ease',
      height: '100%'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.06)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
    }}
    >
      <div style={{
        position: 'absolute',
        top: '-10px',
        left: '-10px',
        width: '32px',
        height: '32px',
        backgroundColor: rank === 0 ? '#FFD700' : rank === 1 ? '#C0C0C0' : rank === 2 ? '#CD7F32' : 'var(--primary)',
        color: rank < 3 ? 'black' : 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '0.9rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1
      }}>
        {rank + 1}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{project.name}</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
            by @{project.user?.username || 'anonymous'}
          </div>
        </div>
        <span style={{ 
          fontSize: '0.7rem', 
          backgroundColor: project.category === 'builder' ? '#E3F2FD' : '#FFF3E0',
          color: project.category === 'builder' ? '#1E88E5' : '#FB8C00',
          padding: '0.2rem 0.6rem',
          borderRadius: '20px',
          fontWeight: 800,
          textTransform: 'uppercase'
        }}>
          {project.category}
        </span>
      </div>

      <div 
        style={{ color: '#555', fontSize: '0.9rem', flex: 1, overflow: 'hidden', minHeight: '60px' }} 
        dangerouslySetInnerHTML={{ __html: project.description }}
      />

      <div style={{ display: 'flex', gap: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
        <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          fontWeight: 700,
          color: 'var(--primary)',
          fontSize: '0.85rem',
          backgroundColor: '#eee',
          padding: '0.4rem 0.8rem',
          borderRadius: '10px'
        }}>
          View <ExternalLink size={14} />
        </a>

        <button 
          onClick={() => onViewFeedback(project)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#666',
            padding: '0.4rem 0.8rem',
            borderRadius: '10px',
            border: '1px solid #eee'
          }}
        >
          <MessageSquare size={14} />
          {project._count?.feedback || 0}
        </button>
        
        <button 
          onClick={() => onVote(project.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--accent)',
            color: 'white',
            padding: '0.4rem 1rem',
            borderRadius: '10px',
            fontWeight: 800,
            marginLeft: 'auto',
            fontSize: '0.9rem'
          }}
        >
          <ThumbsUp size={16} />
          {project._count?.votes || 0}
        </button>
      </div>
    </div>
  );
}
