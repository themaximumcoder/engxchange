import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { MarketplaceItem } from '../types';
import { ListingForm } from './ListingForm';
import { Package, Star, Edit3, Trash2, Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface DashboardProps {
    items: MarketplaceItem[];
    currentUserEmail: string;
    onMarkSold: (id: string, isSold: boolean) => void;
    onDeleteListing: (id: string) => void;
    onUpdateListing: (id: string, updates: Partial<MarketplaceItem>) => void;
    selectedCountry: string;
}

export function Dashboard({ items, currentUserEmail, onMarkSold, onDeleteListing, onUpdateListing, selectedCountry }: DashboardProps) {
    const navigate = useNavigate();
    const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
    const [friends, setFriends] = useState<{ id: string; friend_email: string; status: string }[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [applications, setApplications] = useState<any[]>([]);
    const [viewingItemId, setViewingItemId] = useState<string | null>(null);

    const sellerItems = items.filter(i =>
        i.sellerEmail?.toLowerCase() === currentUserEmail?.toLowerCase()
    );
    const gearItems = sellerItems;

    // Derived User Points
    const userPoints = sellerItems.length > 0 ? sellerItems[0].points : 0;

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUserEmail) return;
            
            try {
                // 1. Fetch Friends
                const { data: fData, error: fError } = await supabase
                    .from('friends')
                    .select('*')
                    .or(`user_email.eq.${currentUserEmail},friend_email.eq.${currentUserEmail}`)
                    .eq('status', 'accepted');
                
                if (fError) throw fError;
                setFriends((fData || []).map(f => ({
                    id: f.id,
                    friend_email: f.user_email === currentUserEmail ? f.friend_email : f.user_email,
                    status: f.status
                })));

                // 2. Fetch Applications for user's listings
                const itemIds = sellerItems.map(i => i.id);
                if (itemIds.length > 0) {
                    const { data: aData, error: aError } = await supabase
                        .from('applications')
                        .select('*')
                        .in('item_id', itemIds);
                    if (aError) throw aError;
                    setApplications(aData || []);
                }

            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoadingFriends(false);
            }
        };

        fetchDashboardData();
    }, [currentUserEmail, items]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
        const { error } = await supabase.from('items').delete().eq('id', id);
        if (error) {
            alert('Delete failed: ' + error.message);
        } else {
            onDeleteListing(id);
        }
    };

    const handleEditSubmit = async (updatedData: Omit<MarketplaceItem, 'id' | 'createdAt'>) => {
        if (!editingItem) return;

        const dbUpdates = {
            title: updatedData.title,
            description: updatedData.description,
            price: updatedData.sellingPrice,
            original_price: updatedData.originalPrice,
            society: updatedData.society,
            type: updatedData.type,
            image_url: updatedData.imageUrl,
            delivery_method: updatedData.deliveryMethod,
            seller_phone: updatedData.sellerPhone,
            seller_email: updatedData.sellerEmail
        };

        const { error } = await supabase.from('items').update(dbUpdates).eq('id', editingItem.id);

        if (error) {
            alert('Update failed: ' + error.message);
        } else {
            onUpdateListing(editingItem.id, updatedData);
            setEditingItem(null);
        }
    };

    if (editingItem) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2>✏️ Edit Your Content</h2>
                    <p>Modify your marketplace listing or recruitment role below.</p>
                </div>
                <ListingForm
                    initialData={editingItem}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditingItem(null)}
                    selectedCountry={selectedCountry}
                />
            </div>
        );
    }

    const renderItemCard = (item: MarketplaceItem) => {
        const itemApps = applications.filter(a => a.item_id === item.id);
        
        return (
            <div key={item.id} className="dashboard-item">
                <div className="dashboard-item-info">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="dashboard-item-img" />
                    ) : (
                        <div className="dashboard-item-img" style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' }}>
                            <Package color="#94a3b8" />
                        </div>
                    )}
                    <div className="dashboard-item-text">
                        <h3>{item.title || 'Untitled Listing'}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className={`status-badge ${item.isSold ? 'sold' : 'active'}`}>
                                {item.isSold ? 'Sold' : 'Active'}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                ID: {item.id ? item.id.substring(0, 8) : 'Pending...'}
                            </span>
                        </div>
                        <p className="item-meta">
                            {item.society || 'Engineering'} &bull; {item.type || 'Gear'}
                            {item.sellingPrice != null && ` • £${item.sellingPrice.toFixed(2)}`}
                        </p>
                    </div>
                </div>

                <div className="dashboard-item-actions">
                    {item.type === 'Recruiting' ? (
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', fontSize: '0.85rem', background: '#4f46e5', marginBottom: '0.5rem' }}
                            onClick={() => setViewingItemId(item.id)}
                        >
                            📋 View {itemApps.length} Applications
                        </button>
                    ) : (
                        <button 
                            className="btn btn-outline" 
                            style={{ width: '100%', fontSize: '0.85rem', borderColor: item.isSold ? '#10b981' : undefined, color: item.isSold ? '#10b981' : undefined }} 
                            onClick={() => onMarkSold(item.id, !item.isSold)}
                        >
                            {item.isSold ? 'Mark as Unsold' : 'Mark as Sold'}
                        </button>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <button className="btn btn-primary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} onClick={() => setEditingItem(item)}>
                            <Edit3 size={16} /> Edit
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => handleDelete(item.id)}
                            style={{ color: '#ef4444', borderColor: '#ef4444', flex: 1, padding: '0.6rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const selectedItemForApps = sellerItems.find(i => i.id === viewingItemId);
    const activeApplications = applications.filter(a => a.item_id === viewingItemId);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#000' }}>Engineering Center</h1>
                    <p>Orchestrate your engineering listings, recruitment, and peer connections.</p>
                </div>
                <div className="score-badge">
                    <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Trust Score</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        < Star size={24} fill="#92400e" /> {userPoints || 0}
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
                {/* LEFT: GEAR & ITEMS */}
                <div className="dashboard-sections">
                    <section>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Package size={20} /> Your Marketplace Items
                        </h2>
                        {gearItems.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#64748b' }}>
                                You aren't currently selling any equipment.
                            </div>
                        ) : (
                            <div className="dashboard-items">
                                {gearItems.map(renderItemCard)}
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT: FRIENDS SIDEBAR */}
                <aside className="dashboard-sidebar">
                    <section style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e293b' }}>
                            <Users size={20} color="#2563eb" /> Engineering Peers
                        </h2>

                        {loadingFriends ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading connections...</p>
                        ) : friends.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>No friends added yet.</p>
                                <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => navigate('/forum')}>Find People in Forum</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {friends.map((friend) => (
                                    <div key={friend.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{friend.friend_email.split('@')[0]}</p>
                                            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Verified Student</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/inbox?with=${friend.friend_email}`)}
                                            style={{ padding: '0.5rem', borderRadius: '8px', background: '#fff', border: '1px solid #e2e8f0', color: '#2563eb', cursor: 'pointer', display: 'flex' }}
                                            title="Message Friend"
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '1rem' }}>Trust Metrics</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#64748b' }}>Response Rate</span>
                                    <span style={{ fontWeight: 700, color: '#10b981' }}>98%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#64748b' }}>Active Since</span>
                                    <span style={{ fontWeight: 700, color: '#334155' }}>2024</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>

            {/* APPLICATIONS MODAL */}
            {viewingItemId && selectedItemForApps && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(4pt)' }}>
                    <div style={{ background: 'white', borderRadius: '24px', maxWidth: '800px', width: '100%', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>Applicants for {selectedItemForApps.title}</h2>
                                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Review candidate responses and CVs for your society role.</p>
                            </div>
                            <button className="btn btn-outline" style={{ borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }} onClick={() => setViewingItemId(null)}>×</button>
                        </div>
                        
                        <div style={{ padding: '2rem', overflowY: 'auto' }}>
                            {activeApplications.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔦</span>
                                    No applications received yet. Check back soon!
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {activeApplications.map((app, idx) => (
                                        <div key={app.id} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{app.applicant_name}</h3>
                                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{app.applicant_email}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {app.cv_url && <a href={app.cv_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: '0.8rem', background: '#10b981' }}>View CV</a>}
                                                    <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => navigate(`/inbox?with=${app.applicant_email}`)}>Message</button>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {app.answers && app.answers.map((ans: any, aidx: number) => (
                                                    <div key={aidx} style={{ background: '#fff', padding: '1rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{ans.question}</p>
                                                        <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>{ans.answer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
