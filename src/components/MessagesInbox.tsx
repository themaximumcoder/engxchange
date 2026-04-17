import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { Message } from '../types';

export function MessagesInbox({
    messages,
    currentUserEmail,
    onSendMessage
}: {
    messages: Message[],
    currentUserEmail: string,
    onSendMessage: (receiver: string, content: string) => void
}) {
    const [selectedContact, setSelectedContact] = useState<string | null>(null);
    const [draft, setDraft] = useState('');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.newContact) {
            setSelectedContact(location.state.newContact);
            // Replace the URL state locally to avoid locking user upon refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Compute unique contacts based on sender/receiver history
    const contacts = Array.from(new Set([
        ...messages.map(m => m.senderEmail === currentUserEmail ? m.receiverEmail : m.senderEmail),
        ...(selectedContact ? [selectedContact] : [])
    ]));

    const conversation = messages
        .filter(m => (m.senderEmail === currentUserEmail && m.receiverEmail === selectedContact) ||
            (m.receiverEmail === currentUserEmail && m.senderEmail === selectedContact))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContact || !draft.trim()) return;
        onSendMessage(selectedContact, draft);
        setDraft('');
    };

    return (
        <div style={{ display: 'flex', minHeight: '600px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ width: '30%', borderRight: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Inbox</h2>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {contacts.length === 0 ? (
                        <p style={{ padding: '1.5rem', color: '#6b7280', fontSize: '0.9rem', textAlign: 'center' }}>No messages yet.</p>
                    ) : (
                        contacts.map(c => (
                            <div
                                key={c}
                                onClick={() => setSelectedContact(c)}
                                style={{ padding: '1rem 1.5rem', cursor: 'pointer', background: selectedContact === c ? '#eff6ff' : 'transparent', borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }}
                            >
                                <strong style={{ color: selectedContact === c ? '#2563eb' : '#374151', fontSize: '0.9rem' }}>{c}</strong>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {!selectedContact ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        Select a conversation to start messaging
                    </div>
                ) : (
                    <>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Chat with {selectedContact}</h3>
                        </div>
                        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f9fafb' }}>
                            {conversation.map(m => {
                                const isMine = m.senderEmail === currentUserEmail;
                                return (
                                    <div key={m.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                        <div style={{ background: isMine ? '#2563eb' : '#e5e7eb', color: isMine ? '#fff' : '#1f2937', padding: '0.75rem 1rem', borderRadius: '12px', borderBottomRightRadius: isMine ? '4px' : '12px', borderBottomLeftRadius: !isMine ? '4px' : '12px' }}>
                                            <p style={{ margin: 0, lineHeight: 1.4, fontSize: '0.95rem' }}>{m.content}</p>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem', textAlign: isMine ? 'right' : 'left' }}>
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
                            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={draft}
                                    onChange={e => setDraft(e.target.value)}
                                    placeholder="Type a message..."
                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                                />
                                <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>Send</button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
