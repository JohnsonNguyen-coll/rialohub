'use client';

import React, { useState, useRef } from 'react';
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, Send, X } from 'lucide-react';

export default function SubmitProjectForm({ onSubmit, onCancel, user, title, initialCategory, initialIsEvent }: { 
  onSubmit: (data: any) => void, 
  onCancel: () => void,
  user: any,
  title?: string,
  initialCategory?: 'builder' | 'sharktank',
  initialIsEvent?: boolean
}) {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState<'builder' | 'sharktank'>(initialCategory || 'builder');
  const [isPinned, setIsPinned] = useState(false);
  const [isEvent, setIsEvent] = useState(initialIsEvent || false);
  const isAdmin = user?.role === 'admin' || (user as any)?.role === 'admin';

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        const img = `<img src="${url}" style="max-width: 100%; border-radius: 8px; margin: 1rem 0;" />`;
        execCommand('insertHTML', img);
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || isSubmitting) return;
    if (!initialIsEvent && !link) return;

    setIsSubmitting(true);
    const content = editorRef.current?.innerHTML || '';
    
    try {
      await onSubmit({
        name,
        link: initialIsEvent ? (link || '#') : link,
        category,
        description: content,
        isPinned: isAdmin ? isPinned : false,
        isEvent: isAdmin ? isEvent : (initialIsEvent || false),
      });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1.5rem'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        borderRadius: '12px',
        padding: '3rem',
        overflowY: 'auto',
        position: 'relative',
        border: '1px solid var(--border)'
      }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: '2rem', right: '2rem', color: 'var(--muted)' }}><X size={20} /></button>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-1px' }}>{title || 'Create Post'}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>
              {initialIsEvent ? 'Event Title' : 'Project Title'}
            </label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="..."
              style={{
                width: '100%', padding: '1rem',
                borderRadius: '8px', border: '1px solid var(--border)',
                outline: 'none', fontSize: '1rem'
              }}
            />
          </div>

          {!initialIsEvent && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>Link</label>
              <input 
                required
                type="url" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%', padding: '1rem',
                  borderRadius: '8px', border: '1px solid var(--border)',
                  outline: 'none', fontSize: '1rem'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>Content</label>
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: 'var(--beige-light)', 
                borderBottom: '1px solid var(--border)',
                display: 'flex', gap: '0.25rem'
              }}>
                <button type="button" onClick={() => execCommand('bold')} style={{ padding: '0.4rem', borderRadius: '4px' }}><Bold size={16} /></button>
                <button type="button" onClick={() => execCommand('italic')} style={{ padding: '0.4rem', borderRadius: '4px' }}><Italic size={16} /></button>
                <button type="button" onClick={() => handleLink()} style={{ padding: '0.4rem', borderRadius: '4px' }}><LinkIcon size={16} /></button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '0.4rem', borderRadius: '4px' }}><ImageIcon size={16} /></button>
              </div>
              <div 
                ref={editorRef}
                contentEditable
                data-placeholder="Tell us more about it..."
                style={{
                  minHeight: '240px',
                  padding: '1.25rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  fontSize: '1rem',
                  lineHeight: '1.6'
                }}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="btn-black"
            style={{ padding: '1.25rem', justifyContent: 'center', fontSize: '1rem' }}
          >
            {isSubmitting ? 'Publishing...' : (initialIsEvent ? 'Publish Event' : 'Publish Post')}
          </button>
        </form>
      </div>
    </div>
  );
}
