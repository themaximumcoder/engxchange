import { useState } from 'react';
import type { ForumPost, Comment } from '../types';
import { CommentSection } from './CommentSection';
import { STLViewer } from './STLViewer';

export function ForumFeed({ posts, projects = [], comments, userVotes, onCreatePost, onVote, onAddComment, onFriendRequest, currentUserEmail, onReport }: { posts: ForumPost[], projects?: any[], comments: Comment[], userVotes: Record<string, number>, onCreatePost: () => void, onVote: (id: string, delta: number) => void, onAddComment: (postId: string, content: string) => void, onFriendRequest: (email: string) => void, currentUserEmail: string, onReport?: (id: string, type: string, reason: string) => void }) {
    const [friends, setFriends] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'questions' | 'projects'>('questions');

    const toggleFriend = (email: string) => {
        if (friends.has(email)) return;
        onFriendRequest(email);
        setFriends(prev => {
            const next = new Set(prev);
            next.add(email);
            return next;
        });
    }

    const YEAR_COLORS: Record<string, string> = {
        'Year 1': '#9ca3af',
        'Year 2': '#10b981',
        'Year 3': '#3b82f6',
        'Year 4': '#8b5cf6',
        'Year 5': '#f97316',
        'Master': '#ef4444',
        'PhD': '#eab308'
    };

    return (
        <div className="forum-container" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Community Discussions 💬</h2>
                <button className="btn btn-primary" onClick={onCreatePost}>Create Post</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button className={`btn ${activeTab === 'questions' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('questions')} style={{ flex: 1, fontSize: '1.05rem', fontWeight: 'bold' }}>
                    Questions & Discussions
                </button>
                <button className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('projects')} style={{ flex: 1, fontSize: '1.05rem', fontWeight: 'bold' }}>
                    Feed
                </button>
            </div>

            {activeTab === 'questions' && (
                <div className="forum-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {posts.map(post => {
                        const badgeColor = post.yearOfStudy ? YEAR_COLORS[post.yearOfStudy] || '#6b7280' : '#6b7280';
                        return (
                            <div key={post.id} className="forum-post" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', background: '#fff' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div className="vote-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#666' }}>
                                        <span style={{ cursor: 'pointer', fontSize: '1.2rem', userSelect: 'none', color: userVotes[post.id] === 1 ? '#10b981' : '#666' }} onClick={() => onVote(post.id, 1)}>▲</span>
                                        <strong>{post.upvotes}</strong>
                                        <span style={{ cursor: 'pointer', fontSize: '1.2rem', userSelect: 'none', color: userVotes[post.id] === -1 ? '#ef4444' : '#666' }} onClick={() => onVote(post.id, -1)}>▼</span>
                                    </div>
                                    <div className="post-content" style={{ flex: 1 }}>
                                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>{post.title}</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            Posted by {post.authorEmail}
                                            {post.origin && <span style={{ color: '#2563eb', fontWeight: 600 }}>{post.origin}</span>}
                                            {post.degree && <span style={{ color: '#4b5563', fontStyle: 'italic' }}>{post.degree}</span>}
                                            {post.yearOfStudy && <span style={{ backgroundColor: badgeColor, color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{post.yearOfStudy}</span>}
                                            {post.points !== undefined && <span style={{ color: '#ca8a04', fontWeight: 'bold', fontSize: '0.8rem' }}>⭐ {post.points} pts</span>}

                                            {post.tags && post.tags.map(t => <span key={t} style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{t}</span>)}

                                            <button
                                                onClick={() => toggleFriend(post.authorEmail)}
                                                style={{ background: 'none', border: '1px solid #6366f1', color: friends.has(post.authorEmail) ? '#fff' : '#6366f1', backgroundColor: friends.has(post.authorEmail) ? '#6366f1' : 'transparent', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                {friends.has(post.authorEmail) ? 'Request Sent' : '+ Add Friend'}
                                            </button>
                                            <span style={{ marginLeft: '0.5rem' }}>• {new Date(post.createdAt).toLocaleDateString()}</span>
                                            <button onClick={() => {
                                                const reason = prompt('Why are you reporting this community post?');
                                                if (reason && onReport) onReport(post.id, 'post', reason);
                                            }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', marginLeft: '0.5rem' }}>
                                                🚩 Report Post
                                            </button>
                                        </p>
                                        <p style={{ lineHeight: 1.6, color: '#333' }}>{post.content}</p>

                                        {post.imageUrl && (
                                            <div style={{ marginTop: '1rem' }}>
                                                <img src={post.imageUrl} alt="attached by author" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px' }} />
                                            </div>
                                        )}

                                        {post.stlFileUrl && (
                                            <div style={{ marginTop: '1rem' }}>
                                                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '1.2rem' }}>🧊</span>
                                                    <strong style={{ color: '#3730a3' }}>Interactive 3D Model: {post.stlFileName}</strong>
                                                </div>
                                                <STLViewer url={post.stlFileUrl} />
                                            </div>
                                        )}

                                        <CommentSection postId={post.id} comments={comments} onAddComment={onAddComment} currentUserEmail={currentUserEmail} onReport={onReport} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'projects' && (
                <div className="projects-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {projects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '12px' }}>
                            <h3 style={{ color: '#64748b' }}>No Global Projects Yet!</h3>
                        </div>
                    ) : projects.map(proj => (
                        <div key={proj.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#1e293b' }}>{proj.title}</h3>
                                    <small style={{ color: '#64748b', fontWeight: 600 }}>By {proj.user_email} • {new Date(proj.created_at).toLocaleDateString()}</small>
                                </div>
                                <button style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '1.2rem', color: '#94a3b8', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    🤍 <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Like</span>
                                </button>
                            </div>
                            <p style={{ marginTop: '0', color: '#334155', fontSize: '1.05rem', lineHeight: 1.5 }}>{proj.description}</p>
                            {proj.image_url && (
                                <div style={{ overflow: 'hidden', borderRadius: '8px', marginTop: '1.5rem', border: '1px solid #f1f5f9' }}>
                                    <img src={proj.image_url} alt="project showcase" style={{ width: '100%', display: 'block', maxHeight: '500px', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
