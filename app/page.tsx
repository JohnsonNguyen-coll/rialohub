'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import ProfileSetup from '../components/ProfileSetup';
import SubmitProjectForm from '../components/SubmitProjectForm';
import { useSearchParams } from 'next/navigation';
import { 
  Trophy, 
  Search, 
  Home as HomeIcon, 
  MessageSquare, 
  BookOpen, 
  User as UserIcon, 
  PlusCircle, 
  Layout, 
  Zap,
  Star,
  Compass,
  Link as LinkIcon,
  Flame,
  Award,
  ArrowLeft
} from 'lucide-react';

import { Suspense } from 'react';
import { toast } from 'sonner';

function HomeContent() {
  const { data: session }: any = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('builder');
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [selectedBuilder, setSelectedBuilder] = useState<any>(null);
  const [builders, setBuilders] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'submit'>('submit');
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<any>(null);


  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'builder' || tab === 'sharktank' || tab === 'top' || tab === 'builders')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'builders' && !selectedBuilder) {
       fetchBuilders();
    }
    fetchProjects();
    if (session?.user) {
      fetchProfile();
    }
    setIsLoaded(true);
  }, [session, activeTab, viewMode, selectedBuilder]);

  const fetchBuilders = async () => {
     const res = await fetch('/api/builders');
     if (res.ok) {
        const data = await res.json();
        setBuilders(data);
     }
  };

  const fetchProfile = async () => {
    const res = await fetch('/api/profile');
    if (res.ok) {
      const data = await res.json();
      setUserProfile(data);
      console.log('Profile loaded:', data);
    }
  };

  const fetchProjects = async () => {
    let url = '/api/projects';
    const params = new URLSearchParams();
    
    if (selectedBuilder) {
       params.append('userId', selectedBuilder.id);
    } else if (viewMode === 'mine') {
       if (userProfile?.id) {
          params.append('userId', userProfile.id);
       } else if (session?.user?.id) {
          params.append('userId', session.user.id);
       }
    } else if (activeTab === 'top') {
       params.append('isTop', 'true');
    } else {
       params.append('category', activeTab);
    }
    
    const finalUrl = `${url}?${params.toString()}`;
    console.log('Fetching projects from:', finalUrl);
    
    const res = await fetch(finalUrl);
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  };

  const handleProfileComplete = (updatedUser: any) => {
    setUserProfile(updatedUser);
    setShowSubmitModal(false);
    fetchProjects();
  };

  const handleVote = async (id: string) => {
    if (!userProfile && !session?.user) {
      setAuthMode('signin');
      setShowSubmitModal(true);
      return;
    }
    const user = userProfile || session?.user;
    if (!user.username || !user.twitterId || !user.discordId) {
       setAuthMode('signin');
       setShowSubmitModal(true);
       return;
    }
    const res = await fetch(`/api/projects/${id}/vote`, { method: 'POST' });
    if (res.ok) fetchProjects();
    else if (res.status === 403) {
       setAuthMode('signin');
       setShowSubmitModal(true);
    }
  };

  const handleSubmitProject = async (data: any) => {
    const isEditing = !!editingProject;
    const url = isEditing ? `/api/projects/${editingProject.id}` : '/api/projects';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        toast.success(isEditing ? 'Project updated successfully' : 'Project published successfully');
        setShowSubmitModal(false);
        setEditingProject(null);
        fetchProjects();
      } else {
        const result = await res.json();
        toast.error(result.error || 'Failed to submit project');
        throw new Error(result.error || 'Failed to submit project');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedProjects = filteredProjects.filter(p => p.isPinned);
  const normalProjects = filteredProjects.filter(p => !p.isPinned);

  if (!isLoaded) return null;

  const isAdmin = userProfile?.role === 'admin' || session?.user?.role === 'admin';
  const currentUserId = userProfile?.id || session?.user?.id;


  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Navbar 
        activeTab={activeTab === 'top' ? '' : activeTab} 
        setActiveTab={setActiveTab} 
        user={userProfile || session?.user} 
        onConnect={() => { setAuthMode('signin'); setShowSubmitModal(true); }} 
      />
      
      <div className="layout-wrapper">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div style={{ marginBottom: '2.5rem' }}>
            <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.25rem', paddingLeft: '1rem' }}>Menu</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button className={`sidebar-nav-item ${activeTab === 'builder' ? 'active' : ''}`} onClick={() => { setActiveTab('builder'); setViewMode('all'); }}>
                <Compass size={18} /> Explore Hub
              </button>
              <button className={`sidebar-nav-item ${activeTab === 'sharktank' ? 'active' : ''}`} onClick={() => { setActiveTab('sharktank'); setViewMode('all'); }}>
                <Zap size={18} /> Shark Tank
              </button>
              <button className={`sidebar-nav-item ${activeTab === 'builders' ? 'active' : ''}`} onClick={() => { setActiveTab('builders'); setViewMode('all'); setSelectedBuilder(null); }}>
                <UserIcon size={18} /> Top Builders
              </button>
              <button className={`sidebar-nav-item ${activeTab === 'top' ? 'active' : ''}`} onClick={() => { setActiveTab('top'); setViewMode('all'); setSelectedBuilder(null); }}>
                <Award size={18} /> Top Projects
              </button>
            </div>
          </div>

          <div>
             <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.25rem', paddingLeft: '1rem' }}>Community</h5>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <a href="https://discord.gg/TCbA4pRe" target="_blank" rel="noopener noreferrer" className="sidebar-nav-item"><MessageSquare size={18} /> Discord</a>
                <a href="https://learn.rialo.io/" target="_blank" rel="noopener noreferrer" className="sidebar-nav-item"><BookOpen size={18} /> Knowledge Base</a>
                <a href="https://www.rialo.io/" target="_blank" rel="noopener noreferrer" className="sidebar-nav-item"><LinkIcon size={18} /> Ecosystem</a>
             </div>
          </div>
        </aside>

        {/* Main Feed Section */}
        <section className="main-content">
          {/* Banner */}
          <div style={{ 
            borderRadius: 'var(--radius-lg)', 
            backgroundColor: '#000',
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url("/assets/1500x500.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '3.5rem',
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden',
            color: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
             <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                   <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#a5b4fc' }}>
                      <Flame size={16} />
                   </div>
                   <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#a5b4fc' }}>
                      {activeTab === 'top' ? 'Elite Curation' : 'Now Trending'}
                   </span>
                </div>
                <h1 style={{ 
                  fontSize: '2.75rem', 
                  fontWeight: 800, 
                  letterSpacing: '-2px', 
                  lineHeight: 1.1, 
                  marginBottom: '1rem',
                  textShadow: '0 2px 15px rgba(0,0,0,0.4)'
                }}>
                  {selectedBuilder ? `Projects by @${selectedBuilder.username}` : (activeTab === 'builder' ? 'The Hub of Innovation.' : activeTab === 'sharktank' ? 'Shark Tank Arena.' : activeTab === 'builders' ? 'Elite Weekly Builders.' : 'Elite Handpicked Gallery.')}
                </h1>
                <p style={{ 
                  fontSize: '1rem', 
                  color: 'rgba(255,255,255,0.85)', 
                  fontWeight: 500,
                  textShadow: '0 1px 8px rgba(0,0,0,0.4)'
                }}>
                  {selectedBuilder ? `Explore all submissions from this talented innovator.` : (activeTab === 'builder' 
                    ? 'Discover the most ambitious projects from the global builder community.' 
                    : activeTab === 'sharktank' ? 'Watch or join the most high-stakes pitches in the ecosystem.'
                    : activeTab === 'builders' ? 'Ranking the most active and successful builders in the RialoHub ecosystem this week.'
                    : 'A collection of the most exceptional projects vetted by the RialoHub team.')}
                </p>
             </div>
             <div style={{ 
               position: 'absolute', right: '-10%', top: '-10%', width: '400px', height: '400px', 
               background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
               filter: 'blur(40px)'
             }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
             <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input 
                  type="text" 
                  placeholder="Find builders, projects, and events..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '1rem 1.25rem 1rem 3.25rem',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                    outline: 'none', fontSize: '1rem', backgroundColor: 'white',
                    transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)'
                  }}
                />
             </div>
             {activeTab === 'sharktank' ? (
               isAdmin && (
                 <button onClick={() => { setAuthMode('submit'); setShowSubmitModal(true); }} className="btn-primary" style={{ padding: '0 2rem' }}>
                    <PlusCircle size={18} /> Create Event
                 </button>
               )
             ) : (
               <button onClick={() => { setAuthMode('submit'); setShowSubmitModal(true); }} className="btn-primary" style={{ padding: '0 2rem' }}>
                  <PlusCircle size={18} /> Create Post
               </button>
             )}
          </div>

          {activeTab === 'builders' && !selectedBuilder ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
               {builders.map((builder, idx) => (
                  <div key={builder.id} className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem', backgroundColor: 'white' }}>
                     <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--foreground)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>
                        {(builder.username || 'U').substring(0, 1).toUpperCase()}
                     </div>
                     <div>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>@{builder.username}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, marginTop: '0.25rem' }}>Rank #{idx + 1} this week</div>
                     </div>
                     
                     <div style={{ display: 'flex', gap: '1.5rem', width: '100%', padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: '12px' }}>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{builder.totalVotes}</div>
                           <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Votes</div>
                        </div>
                        <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{builder.totalProjects}</div>
                           <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Posts</div>
                        </div>
                     </div>

                     <button 
                        onClick={() => setSelectedBuilder(builder)}
                        className="btn-primary" 
                        style={{ width: '100%', padding: '0.85rem' }}
                     >
                        View Projects
                     </button>
                  </div>
               ))}
               {builders.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                     <p style={{ color: 'var(--muted)' }}>No builders found yet.</p>
                  </div>
               )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedBuilder && (
                 <button 
                   onClick={() => setSelectedBuilder(null)}
                   style={{ 
                     alignSelf: 'flex-start', border: 'none', background: 'var(--surface)', 
                     padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 700, 
                     color: 'var(--primary)', cursor: 'pointer', marginBottom: '1rem',
                     display: 'flex', alignItems: 'center', gap: '0.5rem'
                   }}
                 >
                   <ArrowLeft size={16} /> Back to Builders
                 </button>
              )}
              {pinnedProjects.length > 0 && !selectedBuilder && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                   {pinnedProjects.map((project, index) => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onVote={() => handleVote(project.id)}
                        rank={index}
                        isAdmin={isAdmin}
                        currentUserId={currentUserId}
                        onEdit={(p) => { setEditingProject(p); setAuthMode('submit'); setShowSubmitModal(true); }}
                        onRefresh={fetchProjects}
                        onViewFeedback={() => {}}
                        activeTab={activeTab}
                      />
                   ))}
                </div>
              )}

              {normalProjects.map((project, index) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onVote={() => handleVote(project.id)}
                  rank={index}
                  isAdmin={isAdmin}
                  currentUserId={currentUserId}
                  onEdit={(p) => { setEditingProject(p); setAuthMode('submit'); setShowSubmitModal(true); }}
                  onRefresh={fetchProjects}
                  onViewFeedback={() => {}}
                  activeTab={activeTab}
                />
              ))}
              
              {filteredProjects.length === 0 && (
                <div style={{ textAlign: 'center', padding: '8rem 2rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface)' }}>
                  <Compass size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>No projects found</h3>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Be the pioneer in this category and share your work today!</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          {userProfile || session?.user ? (
            <div className="premium-card" style={{ marginBottom: '2rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'var(--foreground)', 
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                  }}>
                     {(userProfile?.username || session?.user?.name || 'U').substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>@{userProfile?.username || session?.user?.name || 'Anonymous'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                       <Zap size={12} fill="var(--primary)" color="var(--primary)" /> Pro Builder
                    </div>
                  </div>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button 
                    className={`sidebar-nav-item ${viewMode === 'mine' ? 'active' : ''}`} 
                    onClick={() => setViewMode('mine')}
                  >
                    My Submissions
                  </button>
                  <button 
                    className={`sidebar-nav-item ${viewMode === 'all' ? 'active' : ''}`} 
                    onClick={() => setViewMode('all')}
                  >
                    Community Wall
                  </button>
               </div>
            </div>
          ) : (
            <div className="premium-card" style={{ marginBottom: '2rem', textAlign: 'center', backgroundColor: 'var(--foreground)', color: 'white', border: 'none' }}>
               <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Join the Network</h4>
               <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>Experience the full potential of RialoHub by creating your builder profile.</p>
               <button onClick={() => { setAuthMode('signin'); setShowSubmitModal(true); }} className="btn-primary" style={{ width: '100%', background: 'white', color: 'black' }}>
                  Get Started
               </button>
            </div>
          )}

        </aside>
      </div>

      {showSubmitModal && (
        ((session?.user || userProfile) && 
         authMode === 'submit' && 
         (userProfile?.username || session?.user?.username) && 
         (userProfile?.twitterId || session?.user?.twitterId) && 
         (userProfile?.discordId || session?.user?.discordId)) ? (
          <SubmitProjectForm 
            user={userProfile || session?.user}
            onCancel={() => { setShowSubmitModal(false); setEditingProject(null); }}
            onSubmit={handleSubmitProject}
            title={editingProject ? 'Edit Submission' : ((activeTab === 'sharktank' && isAdmin) ? 'Create Event' : 'New Submission')}
            initialCategory={editingProject ? editingProject.category : (activeTab === 'sharktank' ? 'sharktank' : 'builder')}
            initialIsEvent={editingProject ? editingProject.isEvent : (activeTab === 'sharktank' && isAdmin)}
            initialData={editingProject}
          />
        ) : (
          <ProfileSetup 
                  onComplete={(updatedUser: any) => {
                    setUserProfile(updatedUser);
                    setShowSubmitModal(false);
                  }}
                  onCancel={() => setShowSubmitModal(false)}
                />
        )
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
         <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
