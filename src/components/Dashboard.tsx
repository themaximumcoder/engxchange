import { supabase } from '../lib/supabaseClient';
import type { MarketplaceItem } from '../types';
import './Dashboard.css';

interface DashboardProps {
    items: MarketplaceItem[];
    currentUserEmail: string;
    onMarkSold: (id: string) => void;
    onDeleteListing: (id: string) => void;
}

export function Dashboard({ items, currentUserEmail, onMarkSold, onDeleteListing }: DashboardProps) {
    const sellerItems = items.filter(i => i.sellerEmail === currentUserEmail);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
        await supabase.from('items').delete().eq('id', id);
        onDeleteListing(id);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>My Listings</h2>
                <p>Manage your listed items below.</p>
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
                                <button
                                    className="btn btn-outline"
                                    onClick={() => handleDelete(item.id)}
                                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
