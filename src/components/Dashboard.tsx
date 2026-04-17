import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { MarketplaceItem } from '../types';
import { ListingForm } from './ListingForm';
import './Dashboard.css';

interface DashboardProps {
    items: MarketplaceItem[];
    currentUserEmail: string;
    onMarkSold: (id: string) => void;
    onDeleteListing: (id: string) => void;
    onUpdateListing: (id: string, updates: Partial<MarketplaceItem>) => void;
}

export function Dashboard({ items, currentUserEmail, onMarkSold, onDeleteListing, onUpdateListing }: DashboardProps) {
    const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
    const sellerItems = items.filter(i =>
        i.sellerEmail?.toLowerCase() === currentUserEmail?.toLowerCase()
    );

    // Find current user points from the items (assuming they are injected by App.tsx)
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

        // Map back to DB column names
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
                    <h2>Edit Listing</h2>
                    <p>Modify your item details below.</p>
                </div>
                <ListingForm
                    initialData={editingItem}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditingItem(null)}
                />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2>My Listings</h2>
                    <p>Manage your listed items below.</p>
                </div>
                <div style={{ background: '#fef3c7', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid #fcd34d', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Score</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                        ⭐ {userPoints || 0} pts
                    </div>
                </div>
            </div>

            {sellerItems.length === 0 ? (
                <div className="empty-state">You haven't listed any items yet.</div>
            ) : (
                <div className="dashboard-items">
                    {sellerItems.map(item => (
                        <div key={item.id} className="dashboard-item">
                            {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginRight: '1rem', flexShrink: 0 }} />
                            )}
                            <div className="dashboard-item-info" style={{ flex: 1 }}>
                                <h3>{item.title}</h3>
                                <span className={`status-badge ${item.isSold ? 'sold' : 'active'}`}>
                                    {item.isSold ? 'Sold' : 'Active'}
                                </span>
                                <p className="item-meta">
                                    {item.type} &bull; {item.society}
                                    {item.sellingPrice !== undefined && ` • £${item.sellingPrice.toFixed(2)}`}
                                </p>
                            </div>
                            <div className="dashboard-item-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {!item.isSold && (
                                    <button className="btn btn-outline" onClick={() => onMarkSold(item.id)}>
                                        Mark as Sold
                                    </button>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem 1rem' }} onClick={() => setEditingItem(item)}>
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => handleDelete(item.id)}
                                        style={{ color: '#ef4444', borderColor: '#ef4444', flex: 1 }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
