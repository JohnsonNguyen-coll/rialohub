'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, User } from 'lucide-react';

export default function FeedbackModal({ project, onClose }: { project: any, onClose: () => void }) {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [project.id]);

  const fetchFeedback = async () => {
    const res = await fetch(`/api/projects/${project.id}/feedback`);
    if (res.ok) {
      const data = await res.json();
      setFeedback(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/projects/${project.id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      setContent('');
      fetchFeedback();
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '80vh',
        borderRadius: '32px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#888' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Feedback for {project.name}</h2>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>Read what others have to say or leave your thoughts</p>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingRight: '0.5rem'
        }}>
          {feedback.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>No feedback yet. Be the first!</div>
          ) : (
            feedback.map((item: any) => (
              <div key={item.id} style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '1rem', 
                borderRadius: '16px',
                border: '1px solid #eee'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <User size={14} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>@{item.user.username}</span>
                  <span style={{ fontSize: '0.7rem', color: '#aaa' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#444' }}>{item.content}</div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Type your feedback..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              flex: 1,
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              border: '2px solid var(--border)',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '0 1.2rem',
              borderRadius: '12px',
              fontWeight: 700
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
