'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { ThumbsUp, MessageSquare, ExternalLink, ArrowLeft, User, Calendar, Tag } from 'lucide-react';

export default function ProjectDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();
  
  const [project, setProject] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchFeedback();
    }
  }, [id]);

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    }
    setLoading(false);
  };

  const fetchFeedback = async () => {
    const res = await fetch(`/api/projects/${id}/feedback`);
    if (res.ok) {
      const data = await res.json();
      setFeedbacks(data);
    }
  };

  const handleVote = async () => {
    if (!session) {
      alert('Please login to vote');
      return;
    }
    const res = await fetch(`/api/projects/${id}/vote`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setVoted(data.voted);
      fetchProject(); // Refresh counts
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !session || submitting) return;

    setSubmitting(true);
    const res = await fetch(`/api/projects/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment })
    });

    if (res.ok) {
      setComment('');
      fetchFeedback();
      fetchProject(); // Refresh counts
    }
    setSubmitting(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>Loading project...</div>;
  if (!project) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>Project not found</div>;

  return (
    <main>
      <Navbar onConnect={() => {}} user={null} activeTab="" setActiveTab={() => {}} />
      
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        <button 
          onClick={() => router.back()}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#666', fontWeight: 600, marginBottom: '2rem',
            padding: '0.5rem 0'
          }}
        >
          <ArrowLeft size={18} /> Back to Hub
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start' }}>
          {/* Main Content */}
          <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '3rem', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>{project.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700 }}>
                    <User size={16} /> @{project.user?.username}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.9rem' }}>
                    <Calendar size={16} /> {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                    <Tag size={16} /> {project.category} Hub
                  </div>
                </div>
              </div>
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '16px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none'
                }}
              >
                Visit Site <ExternalLink size={18} />
              </a>
            </div>

            <div 
              className="project-detail-content"
              dangerouslySetInnerHTML={{ __html: project.description }}
              style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#333' }}
            />
            
            <style jsx global>{`
              .project-detail-content img {
                max-width: 100%;
                height: auto;
                border-radius: 24px;
                margin: 2rem 0;
                display: block;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              }
              .project-detail-content p {
                margin-bottom: 1.5rem;
              }
            `}</style>

            <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <MessageSquare size={24} /> Community Feedback ({project._count.feedback})
              </h3>

              <form onSubmit={handleComment} style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="WAGMI! Leave your thoughts on this project..."
                    style={{
                      flex: 1,
                      padding: '1.2rem',
                      borderRadius: '16px',
                      border: '2px solid var(--border)',
                      outline: 'none',
                      minHeight: '120px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button 
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      padding: '1rem 2.5rem',
                      borderRadius: '14px',
                      fontWeight: 800,
                      cursor: (submitting || !comment.trim()) ? 'not-allowed' : 'pointer',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {submitting ? 'Posting...' : 'Post Comment'} <Send size={18} />
                  </button>
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {feedbacks.map((item) => (
                  <div key={item.id} style={{ padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '20px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)' }}>@{item.user.username}</div>
                      <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ color: '#444', lineHeight: '1.6' }}>{item.content}</div>
                  </div>
                ))}
                {feedbacks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', border: '2px dashed #eee', borderRadius: '24px' }}>
                    No comments yet. Be the first to share your thoughts!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '2rem', border: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent)' }}>{project._count.votes}</div>
                <div style={{ fontWeight: 700, color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Votes</div>
              </div>
              <button 
                onClick={handleVote}
                style={{
                  width: '100%',
                  padding: '1.2rem',
                  borderRadius: '16px',
                  backgroundColor: voted ? 'rgba(212, 163, 115, 0.1)' : 'var(--accent)',
                  color: voted ? 'var(--accent)' : 'white',
                  border: voted ? '2px solid var(--accent)' : 'none',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.7rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <ThumbsUp size={22} fill={voted ? 'var(--accent)' : 'none'} />
                {voted ? 'Voted' : 'Upvote Project'}
              </button>
            </div>

            <div style={{ backgroundColor: '#000', borderRadius: '28px', padding: '2rem', color: 'white' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 800 }}>About Builder</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>@{project.user?.username}</div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa' }}>RialoHub Member</div>
                </div>
              </div>
              {project.user?.twitterHandle && (
                <a href={`https://twitter.com/${project.user.twitterHandle}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1DA1F2', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                  Twitter @{project.user.twitterHandle}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Add these to make it work with lucide icons not yet imported
function Send({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
  );
}
