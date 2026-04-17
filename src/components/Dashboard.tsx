import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { MarketplaceItem } from '../types';
import { ListingForm } from './ListingForm';
import { Package, Star, Edit3, Trash2 } from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
    items: MarketplaceItem[];
    currentUserEmail: string;
    onMarkSold: (id: string, isSold: boolean) => void;
    onDeleteListing: (id: string) => void;
    onUpdateListing: (id: string, updates: Partial<MarketplaceItem>) => void;
}

export function Dashboard({ items, currentUserEmail, onMarkSold, onDeleteListing, onUpdateListing }: DashboardProps) {
    const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);

    const sellerItems = items.filter(i =>
        i.sellerEmail?.toLowerCase() === currentUserEmail?.toLowerCase()
    );
    const gearItems = sellerItems;

    // 2. Derive User Points
    const userPoints = sellerItems.length > 0 ? sellerItems[0].points : 0;

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
                />
            </div>
        );
    }

    const renderItemCard = (item: MarketplaceItem) => (
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
                {item.type !== 'Recruiting' && (
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

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Personal Terminal</h1>
                    <p>Orchestrate your engineering listings and project recruitment.</p>
                </div>
                <div className="score-badge">
                    <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Trust Score</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={24} fill="#92400e" /> {userPoints || 0}
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                {/* SECTION: GEAR & ITEMS */}
                <section>
                    <h2 className="dashboard-section-title">
                        <Package size={28} /> Engineering Gear & Equipment
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
        </div>
    );
}
