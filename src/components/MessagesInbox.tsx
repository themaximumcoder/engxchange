import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSmartPlaceholder } from '../lib/helpers';
import type { Message, MarketplaceItem } from '../types';

export function MessagesInbox({
    messages,
    currentUserEmail,
    onSendMessage,
    onMarkAsRead,
    marketplaceItems = []
}: {
    messages: Message[],
    currentUserEmail: string,
    onSendMessage: (receiver: string, content: string, itemId?: string) => void,
    onMarkAsRead?: (senderEmail: string) => void,
    marketplaceItems?: MarketplaceItem[]
}) {
    const [selectedContact, setSelectedContact] = useState<string | null>(null);
    const [draft, setDraft] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const location = useLocation() as { state: { newContact?: string, draftMessage?: string, itemId?: string } | null };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (location.state?.newContact) {
            const { newContact, draftMessage, itemId } = location.state;
            setTimeout(() => {
                setSelectedContact(newContact);
                if (draftMessage) {
                    setDraft(draftMessage);
                }
                // Handle immediate trade proposal card
                if (itemId) {
                    onSendMessage(newContact, "🔄 Trade Proposal", itemId);
                }
                window.history.replaceState({}, document.title);
            }, 0);
        }
    }, [location.state, onSendMessage]);

    useEffect(() => {
        if (selectedContact && onMarkAsRead) {
            onMarkAsRead(selectedContact);
        }
    }, [selectedContact, messages.length, onMarkAsRead]);

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

    const showSidebar = !isMobile || !selectedContact;
    const showChat = !isMobile || !!selectedContact;

    return (
        <div style={{ 
            display: 'flex', 
            minHeight: isMobile ? 'calc(100vh - 200px)' : '650px', 
            maxHeight: isMobile ? '80vh' : 'none',
            background: '#fff', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb', 
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
            {/* CONTACTS SIDEBAR */}
            {showSidebar && (
                <div style={{ 
                    width: isMobile ? '100%' : '30%', 
                    borderRight: !isMobile ? '1px solid #e5e7eb' : 'none', 
                    background: '#f9fafb', 
                    display: 'flex', 
                    flexDirection: 'column' 
                }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: 800 }}>Inbox</h2>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {contacts.length === 0 ? (
                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
                                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Your inbox is empty.</p>
                            </div>
                        ) : (
                            contacts.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setSelectedContact(c)}
                                    style={{ 
                                        padding: '1.25rem 1.5rem', 
                                        cursor: 'pointer', 
                                        background: selectedContact === c ? '#eff6ff' : 'transparent', 
                                        borderBottom: '1px solid #f1f5f9', 
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', opacity: selectedContact === c ? 1 : 0 }}></div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ color: selectedContact === c ? '#2563eb' : '#374151', fontSize: '0.95rem', fontWeight: selectedContact === c ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Click to view chat</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* CHAT WINDOW */}
            {showChat && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
                    {!selectedContact ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', padding: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                            <h3>Private Messaging</h3>
                            <p>Contact a seller to discuss gear or propose a trade.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {isMobile && (
                                    <button 
                                        onClick={() => setSelectedContact(null)}
                                        style={{ background: '#f3f4f6', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                                    >
                                        ← Back
                                    </button>
                                )}
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827', fontWeight: 700 }}>{selectedContact}</h3>
                                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>● Online</div>
                                </div>
                            </div>
                            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                                {conversation.map(m => {
                                    const isMine = m.senderEmail === currentUserEmail;
                                    const linkedItem = m.itemId ? marketplaceItems.find(i => i.id === m.itemId) : null;

                                    return (
                                        <div key={m.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: isMobile ? '85%' : '70%' }}>
                                            <div style={{ 
                                                background: isMine ? '#2563eb' : '#fff', 
                                                color: isMine ? '#fff' : '#1f2937', 
                                                padding: '0.8rem 1.1rem', 
                                                borderRadius: '16px', 
                                                borderBottomRightRadius: isMine ? '4px' : '16px', 
                                                borderBottomLeftRadius: !isMine ? '4px' : '16px', 
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
                                                border: isMine ? 'none' : '1px solid #e2e8f0' 
                                            }}>
                                                {linkedItem && (
                                                    <div 
                                                        onClick={() => window.open(`/item/${linkedItem.id}`, '_blank')}
                                                        style={{ background: isMine ? 'rgba(255,255,255,0.1)' : '#f8fafc', padding: '10px', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', border: `1px solid ${isMine ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}` }}
                                                    >
                                                        <img src={linkedItem.imageUrl || getSmartPlaceholder(linkedItem.title, linkedItem.society)} style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{linkedItem.title}</div>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Listing Reference</div>
                                                        </div>
                                                    </div>
                                                )}
                                                <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>{m.content}</p>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.35rem', textAlign: isMine ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: '4px', padding: '0 4px' }}>
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isMine && (
                                                    <span style={{ color: m.read ? '#3b82f6' : '#9ca3af', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                        {m.read ? '✓✓' : '✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ padding: '1.25rem', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
                                <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
                                    <input
                                        type="text"
                                        value={draft}
                                        onChange={e => setDraft(e.target.value)}
                                        placeholder="Write a message..."
                                        style={{ flex: 1, padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#f9fafb', fontSize: '0.95rem' }}
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={!draft.trim()} style={{ borderRadius: '12px', padding: '0 1.5rem' }}>Send</button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
