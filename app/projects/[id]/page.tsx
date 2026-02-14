'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { ThumbsUp, MessageSquare, ExternalLink, ArrowLeft, User, Calendar, Tag, Send, PlusCircle, Trophy, Zap, Clock, Share2, Sparkles } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import SubmitProjectForm from '@/components/SubmitProjectForm';

const FeedbackItem = ({ 
  item, 
  session, 
  replyTo, 
  setReplyTo, 
  replyContent, 
  setReplyContent, 
  handleReply, 
  submitting,
  level = 0
}: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginLeft: level > 0 ? '1.5rem' : '0' }}>
      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: level === 0 ? 'white' : 'var(--surface)', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--border)',
        boxShadow: level === 0 ? 'var(--shadow-sm)' : 'none',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
               {item.user.username.substring(0, 1).toUpperCase()}
            </div>
            @{item.user.username}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{ color: 'var(--secondary)', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '1rem' }}>
          {item.content}
        </div>
        
        <button 
          onClick={() => {
            if (!session) return;
            setReplyTo(replyTo === item.id ? null : item.id);
          }}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--primary)', 
            fontWeight: 800, 
            fontSize: '0.75rem', 
            cursor: 'pointer', 
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <MessageSquare size={12} /> {replyTo === item.id ? 'Cancel' : 'Reply'}
        </button>

        {replyTo === item.id && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea 
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Write your response to @${item.user.username}...`}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary)',
                outline: 'none',
                fontSize: '0.95rem',
                minHeight: '100px',
                resize: 'none',
                backgroundColor: 'white',
                boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.05)'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => handleReply(item.id)}
                disabled={submitting || !replyContent.trim()}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Post Reply
              </button>
            </div>
          </div>
        )}
      </div>

      {item.replies && item.replies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '2px solid #eef2ff', paddingLeft: '1rem' }}>
          {item.replies.map((reply: any) => (
            <FeedbackItem 
              key={reply.id} 
              item={reply} 
              session={session}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleReply={handleReply}
              submitting={submitting}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProjectDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session }: any = useSession();
  
  const [project, setProject] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchFeedback();
    }
  }, [id]);

  useEffect(() => {
    if (project?.isEvent) {
      fetchEntries();
    }
  }, [project]);

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    }
    setLoading(false);
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/projects/${id}/feedback`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error('Feedback fetch error:', err);
    }
  };

  const fetchEntries = async () => {
    const res = await fetch(`/api/projects?eventId=${id}`);
    if (res.ok) {
      const data = await res.json();
      setEntries(data);
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
      fetchProject();
    }
  };

  const handleEntrySubmit = async (data: any) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        category: 'sharktank',
        eventId: id
      })
    });

    if (res.ok) {
      fetchEntries();
      setShowEntryModal(false);
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to submit project');
    }
  };

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || !session || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId })
      });

      if (res.ok) {
        setReplyContent('');
        setReplyTo(null);
        await fetchFeedback();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !session || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment })
      });

      if (res.ok) {
        setComment('');
        await fetchFeedback();
        await fetchProject();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
       <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!project) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem', fontWeight: 700 }}>Project not found</div>;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Navbar onConnect={() => {}} user={session?.user} activeTab="" setActiveTab={() => {}} />
      
      {/* Dynamic Hero Header */}
      <div style={{ 
        position: 'relative', 
        padding: '6rem 0 10rem 0', 
        background: project.isEvent ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'var(--surface)',
        color: project.isEvent ? 'white' : 'var(--foreground)',
        overflow: 'hidden'
      }}>
         <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <button 
              onClick={() => router.push('/')}
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                color: project.isEvent ? 'rgba(255,255,255,0.6)' : 'var(--secondary)', 
                fontWeight: 700, marginBottom: '2.5rem',
                fontSize: '0.85rem', border: 'none', background: 'none', cursor: 'pointer',
                padding: '0.6rem 1rem', borderRadius: '12px', backgroundColor: project.isEvent ? 'rgba(255,255,255,0.05)' : 'white',
                boxShadow: project.isEvent ? 'none' : 'var(--shadow-sm)'
              }}
            >
              <ArrowLeft size={16} /> Back to Discover
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '3rem', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                     {project.isEvent ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '100px', background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                           <Trophy size={14} /> Global Shark Tank
                        </div>
                     ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '100px', background: 'white', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, border: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                           <PlusCircle size={14} /> Builder Project
                        </div>
                     )}
                  </div>
                  <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-3px', lineHeight: 1, maxWidth: '800px' }}>
                    {project.name}
                  </h1>
                  <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: project.isEvent ? 'white' : 'var(--foreground)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'white' }}>
                         {project.user?.username.substring(0, 1).toUpperCase()}
                      </div>
                      @{project.user?.username}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', opacity: 0.7 }}>
                      <Calendar size={16} /> Created on {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '1rem' }}>
                  {project.link !== '#' && (
                     <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem', background: project.isEvent ? 'white' : 'var(--primary)', color: project.isEvent ? 'black' : 'white' }}>
                        Live Demo <ExternalLink size={18} />
                     </a>
                  )}
                  <button className="btn-black" style={{ background: project.isEvent ? 'rgba(255,255,255,0.1)' : 'var(--foreground)', color: 'white', border: 'none', padding: '1rem' }}>
                     <Share2 size={18} />
                  </button>
               </div>
            </div>
         </div>
         {/* Abstract BG Decor */}
         <div style={{ position: 'absolute', bottom: '-50%', left: '-10%', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div className="container" style={{ marginTop: '-6rem', paddingBottom: '8rem', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: project.isEvent ? '1fr' : 'minmax(0, 1fr) 360px', gap: '3rem', alignItems: 'start' }}>
          
          {/* Main Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div className="premium-card" style={{ padding: '4rem', backgroundColor: 'white', border: '1px solid var(--border)' }}>
              <div 
                className="project-detail-content"
                dangerouslySetInnerHTML={{ __html: project.description }}
                style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#334155' }}
              />
              
              <style jsx global>{`
                .project-detail-content img {
                  max-width: 100%;
                  height: auto;
                  border-radius: var(--radius-lg);
                  margin: 3rem 0;
                  display: block;
                  box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                }
                .project-detail-content p {
                  margin-bottom: 2rem;
                }
                .project-detail-content h2, .project-detail-content h3 {
                  margin: 3rem 0 1.5rem 0;
                  font-weight: 800;
                  color: var(--foreground);
                }
              `}</style>
            </div>

            {/* Event Specifics Section */}
            {project.isEvent && (
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <div style={{ padding: '0.8rem', borderRadius: '16px', background: 'var(--surface)', color: 'var(--primary)' }}>
                        <Zap size={28} />
                     </div>
                     <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Arena Submissions</h2>
                  </div>
                  <button 
                    onClick={() => { if (!session) return; setShowEntryModal(true); }}
                    className="btn-primary"
                    style={{ padding: '1rem 2.5rem' }}
                  >
                    <Sparkles size={18} /> Apply for Pitch
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '2rem' }}>
                  {entries.map((entry, idx) => (
                    <ProjectCard 
                      key={entry.id} 
                      project={entry} 
                      rank={entry.isPinned ? -1 : idx} 
                      onVote={() => fetchEntries()} 
                      isAdmin={session?.user?.role === 'admin'}
                      onRefresh={() => fetchEntries()}
                      onViewFeedback={() => router.push(`/projects/${entry.id}`)}
                    />
                  ))}
                  {entries.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.2 }}><Trophy size={60} /></div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>No contenders yet.</h3>
                      <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Be the first brave builder to enter the arena.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Discussion Hub Section */}
            <div style={{ marginTop: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                 <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'var(--surface)', color: 'var(--primary)' }}>
                    <MessageSquare size={24} />
                 </div>
                 <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Community Feedback</h3>
              </div>

              <div className="premium-card" style={{ padding: '2.5rem', marginBottom: '4rem', background: 'var(--surface)', border: 'none' }}>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What are your thoughts on this execution?"
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    outline: 'none',
                    minHeight: '160px',
                    fontSize: '1.1rem',
                    backgroundColor: 'white',
                    resize: 'none',
                    marginBottom: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Supportive feedback helps builders grow.</span>
                  <button 
                    disabled={submitting || !comment.trim()}
                    onClick={handleComment}
                    className="btn-primary"
                    style={{ padding: '1rem 3rem' }}
                  >
                    {submitting ? '...' : 'Send Feedback'} <Send size={18} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {feedbacks.map((item) => (
                  <FeedbackItem 
                    key={item.id} 
                    item={item} 
                    session={session}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    handleReply={handleReply}
                    submitting={submitting}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Visual Richness */}
          {!project.isEvent && (
            <aside style={{ position: 'sticky', top: '8rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="premium-card" style={{ padding: '3rem', textAlign: 'center', background: 'linear-gradient(to bottom, #ffffff, #f8fafc)' }}>
                <div style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '0.5rem', letterSpacing: '-4px' }}>
                  {project._count?.votes || 0}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '2.5rem', letterSpacing: '2px' }}>
                   UPVOTES
                </div>
                <button 
                  onClick={handleVote}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    background: voted ? 'white' : 'var(--primary)',
                    color: voted ? 'var(--primary)' : 'white',
                    border: voted ? '2px solid var(--primary)' : 'none',
                    fontSize: '1.1rem'
                  }}
                >
                  <ThumbsUp size={22} fill={voted ? 'var(--primary)' : 'none'} />
                  {voted ? 'Upvoted' : 'Upvote Project'}
                </button>
              </div>

              <div className="premium-card" style={{ padding: '2.5rem', backgroundColor: 'var(--foreground)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h5 style={{ fontWeight: 800, fontSize: '0.75rem', marginBottom: '2rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '2px' }}>The Innovator</h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '18px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>@{project.user?.username}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Top Builder Node</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '100%', fontSize: '0.85rem' }}>
                       View Work History
                    </button>
                    {project.user?.twitterHandle && (
                      <a href={`https://twitter.com/${project.user.twitterHandle}`} target="_blank" rel="noopener noreferrer" style={{ textAlign: 'center', color: '#60a5fa', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}>
                         Twitter @{project.user.twitterHandle}
                      </a>
                    )}
                  </div>
                </div>
                {/* Visual Accent */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.3 }} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {showEntryModal && (
        <SubmitProjectForm 
          user={session?.user}
          title={`Arena Entry: ${project?.name}`}
          onCancel={() => setShowEntryModal(false)}
          onSubmit={handleEntrySubmit}
        />
      )}
    </main>
  );
}
