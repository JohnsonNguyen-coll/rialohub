'use client';

import React, { useState, useRef } from 'react';
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, Send, X } from 'lucide-react';

export default function SubmitProjectForm({ onSubmit, onCancel, user, title, initialCategory, initialIsEvent, initialData }: { 
  onSubmit: (data: any) => void, 
  onCancel: () => void,
  user: any,
  title?: string,
  initialCategory?: 'builder' | 'sharktank',
  initialIsEvent?: boolean,
  initialData?: any
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [category, setCategory] = useState<'builder' | 'sharktank'>(initialData?.category || initialCategory || 'builder');
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
  const [isEvent, setIsEvent] = useState(initialData?.isEvent || initialIsEvent || false);
  const isAdmin = user?.role === 'admin' || (user as any)?.role === 'admin';

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialData?.description && editorRef.current) {
      editorRef.current.innerHTML = initialData.description;
    }
  }, [initialData]);

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
    setShowLinkPrompt(true);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [promptLink, setPromptLink] = useState('');

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptLink) {
      execCommand('createLink', promptLink);
      setPromptLink('');
      setShowLinkPrompt(false);
    }
  };

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
        isPinned: isAdmin ? isPinned : (initialData?.isPinned ?? false),
        isEvent: isAdmin ? isEvent : (initialData?.isEvent ?? initialIsEvent ?? false),
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
        <button 
          onClick={onCancel} 
          style={{ 
            position: 'absolute', 
            top: '1.5rem', 
            right: '1.5rem', 
            color: 'var(--muted)', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            backgroundColor: 'var(--surface)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', letterSpacing: '-0.5px' }}>{title || 'Create Post'}</h2>

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
                padding: '0.6rem', 
                backgroundColor: 'var(--surface)', 
                borderBottom: '1px solid var(--border)',
                display: 'flex', gap: '0.4rem',
                alignItems: 'center'
              }}>
                {[
                  { icon: <Bold size={18} />, cmd: 'bold' },
                  { icon: <Italic size={18} />, cmd: 'italic' },
                  { icon: <LinkIcon size={18} />, action: handleLink },
                  { icon: <ImageIcon size={18} />, action: () => fileInputRef.current?.click() },
                ].map((btn, idx) => (
                  <button 
                    key={idx}
                    type="button" 
                    onClick={() => btn.action ? btn.action() : execCommand(btn.cmd!)} 
                    style={{ 
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: 'var(--secondary)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = 'var(--primary)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--secondary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {btn.icon}
                  </button>
                ))}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
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

      {showLinkPrompt && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1.5rem'
        }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '360px', padding: '2rem', backgroundColor: 'white' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Insert Link</h4>
            <form onSubmit={handleLinkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                autoFocus
                type="url" 
                required
                placeholder="https://example.com"
                value={promptLink}
                onChange={(e) => setPromptLink(e.target.value)}
                style={{
                  width: '100%', padding: '0.85rem 1rem',
                  borderRadius: '10px', border: '1px solid var(--border)',
                  outline: 'none', fontSize: '0.95rem'
                }}
              />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowLinkPrompt(false)} className="sidebar-nav-item" style={{ justifyContent: 'center', padding: '0.75rem' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>Insert</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
