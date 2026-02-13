'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import ProfileSetup from '../components/ProfileSetup';
import SubmitProjectForm from '../components/SubmitProjectForm';
import FeedbackModal from '../components/FeedbackModal';
import { Trophy, Users, Search, Filter, Layers } from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('builder');
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedProjectForFeedback, setSelectedProjectForFeedback] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
    if (session?.user?.email) {
      fetchProfile();
    }
    setIsLoaded(true);
  }, [session, activeTab, viewMode]);

  const fetchProfile = async () => {
    const res = await fetch('/api/profile');
    if (res.ok) {
      const data = await res.json();
      setUserProfile(data);
    }
  };

  const fetchProjects = async () => {
    let url = `/api/projects?category=${activeTab}`;
    if (viewMode === 'mine' && userProfile?.id) {
      url += `&userId=${userProfile.id}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  };

  const handleProfileComplete = (updatedUser: any) => {
    setUserProfile(updatedUser);
    fetchProjects();
  };

  const handleVote = async (id: string) => {
    if (!userProfile) {
      setShowSubmitModal(true);
      return;
    }
    const res = await fetch(`/api/projects/${id}/vote`, { method: 'POST' });
    if (res.ok) {
      fetchProjects();
    }
  };

  const handleSubmitProject = async (data: any) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      setShowSubmitModal(false);
      fetchProjects();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to submit');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) return null;

  return (
    <main>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={userProfile} 
        onConnect={() => setShowSubmitModal(true)} 
      />
      
      <div className="container">
        {/* Header Section */}
        <section style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-1px' }}>
            {activeTab === 'builder' ? 'Builder Hub' : 'Shark Tank Event'}
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            {activeTab === 'builder' 
              ? 'Join the community of builders pushing the boundaries of technology.' 
              : 'Pitch your project, gain exposure, and win community support.'}
          </p>
        </section>

        {/* View Toggle (All vs My Posts) */}
        {userProfile && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
            <button 
              onClick={() => setViewMode('all')}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                fontWeight: 700,
                backgroundColor: viewMode === 'all' ? 'var(--primary)' : 'white',
                color: viewMode === 'all' ? 'white' : 'var(--foreground)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Layers size={18} />
              All Posts
            </button>
            <button 
              onClick={() => setViewMode('mine')}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                fontWeight: 700,
                backgroundColor: viewMode === 'mine' ? 'var(--primary)' : 'white',
                color: viewMode === 'mine' ? 'white' : 'var(--foreground)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Users size={18} />
              My Posts
            </button>
          </div>
        )}

        {/* Tools Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} size={18} />
            <input 
              type="text" 
              placeholder="Search projects or builders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem 0.8rem 3rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                outline: 'none'
              }}
            />
          </div>
          <button 
            onClick={() => setShowSubmitModal(true)}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '0.8rem 2rem',
              borderRadius: '12px',
              fontWeight: 700
            }}
          >
            Submit Project
          </button>
        </div>

        {/* Project Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '2.5rem',
          marginBottom: '5rem'
        }}>
          {filteredProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onVote={handleVote}
              rank={index}
              onViewFeedback={(p) => setSelectedProjectForFeedback(p)}
            />
          ))}
          {filteredProjects.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', border: '2px dashed var(--border)', borderRadius: '24px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Users size={48} color="#ccc" />
              </div>
              <h3 style={{ color: '#888' }}>No projects found.</h3>
              <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Try changing filters or be the first to post!</p>
              {!userProfile && (
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    padding: '0.8rem 2rem',
                    borderRadius: '12px',
                    fontWeight: 700
                  }}
                >
                  Connect Profile to Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showSubmitModal && (
        userProfile ? (
          <SubmitProjectForm 
            user={userProfile}
            onCancel={() => setShowSubmitModal(false)}
            onSubmit={handleSubmitProject}
          />
        ) : (
          <ProfileSetup 
            onComplete={handleProfileComplete} 
            onCancel={() => setShowSubmitModal(false)}
          />
        )
      )}

      {selectedProjectForFeedback && (
        <FeedbackModal 
          project={selectedProjectForFeedback} 
          onClose={() => setSelectedProjectForFeedback(null)} 
        />
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '4rem 0', backgroundColor: 'rgba(0,0,0,0.02)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>RIALO<span style={{ color: 'var(--accent)' }}>HUB</span></div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>© 2026 RialoHub. Weekly Builder Tracking.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
