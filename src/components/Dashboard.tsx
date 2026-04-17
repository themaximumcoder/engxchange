import type { MarketplaceItem } from '../types';
import './Dashboard.css';

interface DashboardProps {
    items: MarketplaceItem[];
    currentUserEmail: string;
    onMarkSold: (id: string) => void;
}

export function Dashboard({ items, currentUserEmail, onMarkSold }: DashboardProps) {
    const sellerItems = items.filter(i => i.sellerEmail === currentUserEmail);

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
                            <div className="dashboard-item-info">
                                <h3>{item.title}</h3>
                                <span className={`status-badge ${item.isSold ? 'sold' : 'active'}`}>
                                    {item.isSold ? 'Sold' : 'Active'}
                                </span>
                                <p className="item-meta">
                                    {item.type} &bull; {item.society}
                                    {item.sellingPrice !== undefined && ` • £${item.sellingPrice.toFixed(2)}`}
                                </p>
                            </div>
                            <div className="dashboard-item-actions">
                                {!item.isSold && (
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => onMarkSold(item.id)}
                                    >
                                        Mark as Sold
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
