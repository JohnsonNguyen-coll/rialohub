'use client';

import React, { useState, useRef } from 'react';
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, Send, X } from 'lucide-react';

export default function SubmitProjectForm({ onSubmit, onCancel, user }: { 
  onSubmit: (data: any) => void, 
  onCancel: () => void,
  user: any
}) {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState<'builder' | 'sharktank'>('builder');
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleImageUpload = () => {
    const url = prompt('Enter image URL:');
    if (url) execCommand('insertImage', url);
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !link) return;

    const content = editorRef.current?.innerHTML || '';
    
    onSubmit({
      name,
      link,
      category,
      description: content,
    });
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
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        borderRadius: '32px',
        padding: '2.5rem',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <button 
          onClick={onCancel}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#888' }}
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', letterSpacing: '-1px' }}>Submit New Project</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>PROJECT NAME</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What are you building?"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>SOCIAL / WEBSITE LINK</label>
            <input 
              required
              type="url" 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>CATEGORY</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button"
                onClick={() => setCategory('builder')}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: `2px solid ${category === 'builder' ? 'var(--accent)' : 'var(--border)'}`,
                  fontWeight: 800,
                  backgroundColor: category === 'builder' ? 'rgba(212, 163, 115, 0.1)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                Builder Hub
              </button>
              <button 
                type="button"
                onClick={() => setCategory('sharktank')}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: `2px solid ${category === 'sharktank' ? 'var(--accent)' : 'var(--border)'}`,
                  fontWeight: 800,
                  backgroundColor: category === 'sharktank' ? 'rgba(212, 163, 115, 0.1)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                Shark Tank
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>DESCRIPTION & DETAILS</label>
            <div style={{
              border: '2px solid var(--border)',
              borderRadius: '14px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: '#f9f9f9', 
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button type="button" onClick={() => execCommand('bold')} style={{ padding: '0.5rem', borderRadius: '4px' }}><Bold size={18} /></button>
                <button type="button" onClick={() => execCommand('italic')} style={{ padding: '0.5rem', borderRadius: '4px' }}><Italic size={18} /></button>
                <button type="button" onClick={() => handleLink()} style={{ padding: '0.5rem', borderRadius: '4px' }}><LinkIcon size={18} /></button>
                <button type="button" onClick={() => handleImageUpload()} style={{ padding: '0.5rem', borderRadius: '4px' }}><ImageIcon size={18} /></button>
              </div>
              <div 
                ref={editorRef}
                contentEditable
                style={{
                  minHeight: '180px',
                  padding: '1.2rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}
              />
            </div>
          </div>

          <button 
            type="submit"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '1.1rem',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Send size={18} />
            Publish Project
          </button>
        </form>
      </div>
    </div>
  );
}
