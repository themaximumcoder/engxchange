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

    // Compute unique contacts based on sender/receiver history (Normalized to lowercase)
    const contacts = Array.from(new Set([
        ...messages.map(m => (m.senderEmail?.toLowerCase() === currentUserEmail.toLowerCase() ? m.receiverEmail : m.senderEmail)?.toLowerCase()),
        ...(selectedContact ? [selectedContact.toLowerCase()] : [])
    ])).filter(Boolean) as string[];

    const conversation = messages
        .filter(m => {
            const sender = m.senderEmail?.toLowerCase();
            const receiver = m.receiverEmail?.toLowerCase();
            const current = currentUserEmail.toLowerCase();
            const selected = selectedContact?.toLowerCase();
            
            return (sender === current && receiver === selected) ||
                   (receiver === current && sender === selected);
        })
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
            height: isMobile ? 'calc(100vh - 220px)' : '750px', 
            background: '#fff', 
            borderRadius: isMobile ? '0' : '16px', 
            border: isMobile ? 'none' : '1px solid #e5e7eb', 
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            zIndex: 1, /* Keep below navigation bars */
            margin: '0'
        }}>
            {/* CONTACTS SIDEBAR */}
            {showSidebar && (
                <div style={{ 
                    width: isMobile ? '100%' : '28%', 
                    borderRight: !isMobile ? '1px solid #e5e7eb' : 'none', 
                    background: '#f8fafc', 
                    display: 'flex', 
                    flexDirection: 'column' 
                }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b', fontWeight: 900 }}>Inbox</h2>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {contacts.length === 0 ? (
                            <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
                                <p style={{ color: '#64748b', fontSize: '1rem' }}>No messages found.</p>
                            </div>
                        ) : (
                            contacts.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setSelectedContact(c)}
                                    style={{ 
                                        padding: '1.25rem 1.5rem', 
                                        cursor: 'pointer', 
                                        background: selectedContact?.toLowerCase() === c.toLowerCase() ? '#fff' : 'transparent', 
                                        borderBottom: '1px solid #f1f5f9', 
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        borderLeft: selectedContact?.toLowerCase() === c.toLowerCase() ? '4px solid #2563eb' : '4px solid transparent'
                                    }}
                                >
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ color: '#1e293b', fontSize: '1rem', fontWeight: selectedContact?.toLowerCase() === c.toLowerCase() ? 800 : 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Active connection</div>
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
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🤝</div>
                            <h3 style={{ color: '#1e293b' }}>Select a conversation</h3>
                            <p style={{ maxWidth: '300px' }}>Your engineering trade discussions and gear inquiries will appear here.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                {isMobile && (
                                    <button 
                                        onClick={() => setSelectedContact(null)}
                                        style={{ background: '#f1f5f9', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', color: '#2563eb' }}
                                    >
                                        ← Contacts
                                    </button>
                                )}
                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedContact}</h3>
                                    <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span> Secure Message
                                    </div>
                                </div>
                            </div>
                            
                            {/* MESSAGES SCROLL AREA */}
                            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                                {conversation.map(m => {
                                    const isMine = m.senderEmail?.toLowerCase() === currentUserEmail.toLowerCase();
                                    const linkedItem = m.itemId ? marketplaceItems.find(i => i.id === m.itemId) : null;

                                    return (
                                        <div key={m.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: isMobile ? '90%' : '75%' }}>
                                            <div style={{ 
                                                background: isMine ? '#2563eb' : '#fff', 
                                                color: isMine ? '#fff' : '#1e2937', 
                                                padding: '0.85rem 1.25rem', 
                                                borderRadius: '18px', 
                                                borderBottomRightRadius: isMine ? '4px' : '18px', 
                                                borderBottomLeftRadius: !isMine ? '4px' : '18px', 
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
                                                border: isMine ? 'none' : '1px solid #e2e8f0',
                                                fontSize: '0.95rem',
                                                lineHeight: 1.5
                                            }}>
                                                {linkedItem && (
                                                    <div 
                                                        onClick={() => window.open(`/item/${linkedItem.id}`, '_blank')}
                                                        style={{ background: isMine ? 'rgba(255,255,255,0.15)' : '#f1f5f9', padding: '10px', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', border: `1px solid ${isMine ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}` }}
                                                    >
                                                        <img src={linkedItem.imageUrl || getSmartPlaceholder(linkedItem.title, linkedItem.society)} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isMine ? '#fff' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{linkedItem.title}</div>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Listing Info</div>
                                                        </div>
                                                    </div>
                                                )}
                                                <p style={{ margin: 0 }}>{m.content}</p>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', textAlign: isMine ? 'right' : 'left', display: 'flex', alignItems: 'center', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: '6px', padding: '0 8px' }}>
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isMine && (
                                                    <span style={{ color: m.read ? '#3b82f6' : '#cbd5e1', fontWeight: 900 }}>
                                                        {m.read ? '✓✓' : '✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* INPUT FORM - LOCKED TO BOTTOM */}
                            <div style={{ padding: '1.25rem', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
                                <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={draft}
                                        onChange={e => setDraft(e.target.value)}
                                        placeholder="Type your message..."
                                        style={{ 
                                            flex: 1, 
                                            padding: '0.9rem 1.25rem', 
                                            borderRadius: '14px', 
                                            border: '2px solid #f1f5f9', 
                                            outline: 'none', 
                                            background: '#f8fafc', 
                                            fontSize: '0.95rem',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                                        onBlur={e => e.target.style.borderColor = '#f1f5f9'}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary" 
                                        disabled={!draft.trim()} 
                                        style={{ 
                                            borderRadius: '14px', 
                                            padding: '0 1.5rem', 
                                            height: '46px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 800
                                        }}
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
