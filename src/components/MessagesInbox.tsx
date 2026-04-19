import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
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
    const [showTradePicker, setShowTradePicker] = useState(false);
    const [cashOffer, setCashOffer] = useState('');
    const [selectedTargetItemId, setSelectedTargetItemId] = useState<string | null>(null);
    const [selectedProposerItemId, setSelectedProposerItemId] = useState<string | null>(null);
    const location = useLocation() as { state: { newContact?: string, draftMessage?: string, itemId?: string } | null };
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (selectedContact) {
            scrollToBottom();
        }
    }, [messages.length, selectedContact]);

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
                if (itemId) setSelectedTargetItemId(itemId);
                if (draftMessage) {
                    setDraft(draftMessage);
                }
                window.history.replaceState({}, document.title);
            }, 0);
        }
    }, [location.state]);

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
            height: isMobile ? 'calc(100vh - 180px)' : '600px', 
            background: '#fff', 
            borderRadius: isMobile ? '0' : '16px', 
            border: isMobile ? 'none' : '1px solid #e5e7eb', 
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            zIndex: 1, /* Keep below navigation bars */
            margin: '0',
            flexDirection: isMobile ? 'column' : 'row'
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
                             <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                                    {isMobile && (
                                        <button 
                                            onClick={() => setSelectedContact(null)}
                                            style={{ background: '#f1f5f9', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', color: '#2563eb' }}
                                        >
                                            ←
                                        </button>
                                    )}
                                    <div style={{ minWidth: 0 }}>
                                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedContact}</h3>
                                        <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span> Secure Message
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {selectedTargetItemId && (
                                        <div style={{ background: '#eff6ff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 700, border: '1px solid #dbeafe' }}>
                                            Target: {marketplaceItems.find(i => i.id === selectedTargetItemId)?.title.substring(0, 15)}...
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => {
                                            const reason = window.prompt(`Reason for reporting ${selectedContact}:`);
                                            if (reason && reason.trim()) {
                                                supabase.from('reports').insert([{ 
                                                    item_id: selectedContact, 
                                                    item_type: 'user', 
                                                    reason: reason.trim(), 
                                                    reported_by: currentUserEmail 
                                                }]).then(({ error }) => {
                                                    if (!error) alert('User report submitted. Admin will review.');
                                                });
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem' }}
                                        title="Report this user"
                                    >
                                        🚩
                                    </button>
                                </div>
                             </div>
                            
                            {/* MESSAGES SCROLL AREA */}
                            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                                {conversation.map(m => {
                                    const isMine = m.senderEmail?.toLowerCase() === currentUserEmail.toLowerCase();
                                    const isTrade = m.content.startsWith('[TRADE_V1]');
                                    
                                    if (isTrade) {
                                        try {
                                            const tradeData = JSON.parse(m.content.replace('[TRADE_V1]', ''));
                                            const myItem = marketplaceItems.find(i => i.id === tradeData.proposerItemId);
                                            const targetItem = marketplaceItems.find(i => i.id === tradeData.targetItemId);
                                            const isReceiver = m.receiverEmail?.toLowerCase() === currentUserEmail.toLowerCase();
                                            const status = tradeData.status || 'pending';

                                            return (
                                                <div key={m.id} style={{ alignSelf: 'center', width: isMobile ? '100%' : '85%', margin: '1rem 0' }}>
                                                    <div style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                                <img src={myItem?.imageUrl || getSmartPlaceholder(myItem?.title || 'Unknown', 'Other')} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', margin: '0 auto' }} />
                                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '5px' }}>{myItem?.title || 'Personal Item'}</div>
                                                            </div>
                                                            <div style={{ fontSize: '1.5rem' }}>🔄</div>
                                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                                <img src={targetItem?.imageUrl || getSmartPlaceholder(targetItem?.title || 'Unknown', 'Other')} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', margin: '0 auto' }} />
                                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '5px' }}>{targetItem?.title || 'Target Gear'}</div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                                            <div style={{ fontWeight: 800, color: '#1e293b' }}>Trade Proposal</div>
                                                            {tradeData.cashOffer > 0 && <div style={{ color: '#059669', fontWeight: 700 }}>+ £{tradeData.cashOffer} Cash Offer</div>}
                                                            <div style={{ 
                                                                marginTop: '10px', 
                                                                padding: '6px 16px', 
                                                                borderRadius: '20px', 
                                                                display: 'inline-block',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 900,
                                                                background: status === 'accepted' ? '#ecfdf5' : status === 'declined' ? '#fef2f2' : '#f8fafc',
                                                                color: status === 'accepted' ? '#059669' : status === 'declined' ? '#dc2626' : '#64748b'
                                                            }}>
                                                                STATUS: {status.toUpperCase()}
                                                            </div>
                                                        </div>

                                                        {isReceiver && status === 'pending' && (
                                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                                <button 
                                                                    onClick={async () => {
                                                                        const newContent = `[TRADE_V1]${JSON.stringify({ ...tradeData, status: 'accepted' })}`;
                                                                        await supabase.from('messages').update({ content: newContent }).eq('id', m.id);
                                                                    }}
                                                                    style={{ flex: 1, padding: '0.75rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                                                                >
                                                                    Accept Trade
                                                                </button>
                                                                <button 
                                                                    onClick={async () => {
                                                                        const newContent = `[TRADE_V1]${JSON.stringify({ ...tradeData, status: 'declined' })}`;
                                                                        await supabase.from('messages').update({ content: newContent }).eq('id', m.id);
                                                                    }}
                                                                    style={{ flex: 1, padding: '0.75rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                                                                >
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        } catch(e) { return null; }
                                    }

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
                                <div ref={messagesEndRef} />
                            </div>

                            {/* INPUT FORM - LOCKED TO BOTTOM */}
                            <div style={{ padding: '1.25rem', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0, position: 'relative' }}>
                                {showTradePicker && (
                                    <div style={{ position: 'absolute', bottom: '100%', left: '1.25rem', right: '1.25rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 -4px 12px rgba(0,0,0,0.1)', marginBottom: '8px', maxHeight: '300px', overflowY: 'auto', zIndex: 10 }}>
                                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 2 }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Create Trade Proposal</span>
                                            <button onClick={() => setShowTradePicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                                        </div>

                                        {/* SECTION 1: THEIR ITEM */}
                                        <div style={{ padding: '8px 1rem', fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', borderBottom: '1px solid #dbeafe' }}>
                                            1. SELECT THEIR ITEM
                                        </div>
                                        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                            {marketplaceItems.filter(i => i.sellerEmail?.toLowerCase() === selectedContact.toLowerCase()).length === 0 ? (
                                                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>User has no active listings</div>
                                            ) : (
                                                marketplaceItems
                                                    .filter(i => i.sellerEmail?.toLowerCase() === selectedContact.toLowerCase())
                                                    .map(item => (
                                                        <div 
                                                            key={item.id} 
                                                            onClick={() => setSelectedTargetItemId(item.id)}
                                                            style={{ 
                                                                padding: '8px 15px', 
                                                                display: 'flex', 
                                                                gap: '12px', 
                                                                alignItems: 'center', 
                                                                cursor: 'pointer', 
                                                                borderBottom: '1px solid #f1f5f9',
                                                                background: selectedTargetItemId === item.id ? '#f1f5f9' : 'transparent',
                                                                borderLeft: selectedTargetItemId === item.id ? '4px solid #2563eb' : '4px solid transparent'
                                                            }}
                                                        >
                                                            <img src={item.imageUrl || getSmartPlaceholder(item.title, item.society)} style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                                                            </div>
                                                            {selectedTargetItemId === item.id && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#2563eb', fontWeight: 800 }}>SELECTED</span>}
                                                        </div>
                                                    ))
                                            )}
                                        </div>

                                        {/* SECTION 2: YOUR ITEM */}
                                        <div style={{ padding: '8px 1rem', fontSize: '0.7rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', borderBottom: '1px solid #d1fae5' }}>
                                            2. SELECT YOUR ITEM TO OFFER
                                        </div>
                                        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                            {marketplaceItems.filter(i => i.sellerEmail?.toLowerCase() === currentUserEmail.toLowerCase()).length === 0 ? (
                                                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>You have no active listings</div>
                                            ) : (
                                                marketplaceItems
                                                    .filter(i => i.sellerEmail?.toLowerCase() === currentUserEmail.toLowerCase())
                                                    .map(item => (
                                                        <div 
                                                            key={item.id} 
                                                            onClick={() => setSelectedProposerItemId(item.id)}
                                                            style={{ 
                                                                padding: '8px 15px', 
                                                                display: 'flex', 
                                                                gap: '12px', 
                                                                alignItems: 'center', 
                                                                cursor: 'pointer', 
                                                                borderBottom: '1px solid #f1f5f9',
                                                                background: selectedProposerItemId === item.id ? '#f1f5f9' : 'transparent',
                                                                borderLeft: selectedProposerItemId === item.id ? '4px solid #059669' : '4px solid transparent'
                                                            }}
                                                        >
                                                            <img src={item.imageUrl || getSmartPlaceholder(item.title, item.society)} style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                                                            </div>
                                                            {selectedProposerItemId === item.id && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#059669', fontWeight: 800 }}>SELECTED</span>}
                                                        </div>
                                                    ))
                                            )}
                                        </div>

                                        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>3. ADD CASH TOP-UP (OPTIONAL)</label>
                                            <div style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800 }}>£</span>
                                                <input 
                                                    type="number" 
                                                    placeholder="0.00" 
                                                    value={cashOffer}
                                                    onChange={e => setCashOffer(e.target.value)}
                                                    style={{ width: '100%', padding: '8px 10px 8px 25px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                            <button 
                                                disabled={!selectedTargetItemId || !selectedProposerItemId}
                                                onClick={() => {
                                                    const tradeJson = JSON.stringify({
                                                        proposerItemId: selectedProposerItemId,
                                                        targetItemId: selectedTargetItemId,
                                                        cashOffer: parseFloat(cashOffer) || 0,
                                                        status: 'pending'
                                                    });
                                                    onSendMessage(selectedContact, `[TRADE_V1]${tradeJson}`);
                                                    setShowTradePicker(false);
                                                    setCashOffer('');
                                                    setSelectedProposerItemId(null);
                                                }}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '12px', 
                                                    borderRadius: '8px', 
                                                    background: (!selectedTargetItemId || !selectedProposerItemId) ? '#cbd5e1' : '#2563eb',
                                                    color: '#fff',
                                                    border: 'none',
                                                    fontWeight: 800,
                                                    cursor: (!selectedTargetItemId || !selectedProposerItemId) ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                            Send Trade Proposal
                                        </button>
                                    </div>
                                </div>
                            )}
                                <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setShowTradePicker(!showTradePicker)}
                                        style={{ background: '#f1f5f9', border: 'none', width: '46px', height: '46px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}
                                        title="Propose Trade"
                                    >
                                        🔄
                                    </button>
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
