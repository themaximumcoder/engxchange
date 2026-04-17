import React, { useState } from 'react';
import type { Comment } from '../types';

export function CommentSection({
    postId,
    comments,
    onAddComment,
    currentUserEmail,
    onReport
}: {
    postId: string;
    comments: Comment[];
    onAddComment: (postId: string, content: string) => void;
    currentUserEmail: string;
    onReport?: (id: string, type: string, reason: string) => void;
}) {
    const [text, setText] = useState('');
    const postComments = comments.filter(c => c.postId === postId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAddComment(postId, text);
        setText('');
    };

    const handleReply = (email: string) => {
        const username = email.split('@')[0];
        setText(`@${username} ` + text);
    };

    const renderContent = (content: string) => {
        return content.split(/(@\w+)/g).map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} style={{ color: '#2563eb', fontWeight: 600 }}>{part}</span>;
            }
            return part;
        });
    };

    return (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#4b5563' }}>Discussion ({postComments.length})</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {postComments.map(c => (
                    <div key={c.id} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '0.85rem', color: '#111827' }}>
                                {c.authorEmail.split('@')[0]}
                                {c.points !== undefined && <span style={{ color: '#ca8a04', marginLeft: '0.4rem', fontSize: '0.75rem' }}>⭐ {c.points} pts</span>}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {new Date(c.createdAt).toLocaleString()}
                                <button onClick={() => {
                                    const reason = prompt('Why are you reporting this comment?');
                                    if (reason && onReport) onReport(c.id, 'comment', reason);
                                }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}>
                                    🚩
                                </button>
                            </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#374151' }}>{renderContent(c.content)}</p>
                        <button
                            onClick={() => handleReply(c.authorEmail)}
                            style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                        >
                            Reply
                        </button>
                    </div>
                ))}
            </div>

            {currentUserEmail ? (
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Add a comment or reply..."
                        style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                    <button type="submit" disabled={!text.trim()} className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>Post</button>
                </form>
            ) : (
                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Log in to join the discussion.</p>
            )}
        </div>
    );
}
