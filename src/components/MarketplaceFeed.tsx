import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketplaceItem } from '../types';
import './MarketplaceFeed.css';

interface MarketplaceFeedProps {
    items: MarketplaceItem[];
    isStudentVerified: boolean;
    isLoggedIn?: boolean;
    onReport?: (id: string, type: string, reason: string) => void;
}

const NEWS_SLIDES = [
    { id: 1, title: 'Build and Iterate', subtitle: 'Join thousands of engineers shaping the future locally.', img: '/hero-uploaded.png' },
    { id: 2, title: 'New 3D Model Gallery', subtitle: 'Our community forum now supports direct .STL file uploads.', img: '/slideshowimage2.png' },
    { id: 3, title: 'Society Recruiting', subtitle: 'Join Hyped or Formula Student - applications are open.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80' }
];

function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrent(prev => (prev + 1) % NEWS_SLIDES.length), 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            {NEWS_SLIDES.map((slide, i) => (
                <div key={slide.id} style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    opacity: i === current ? 1 : 0, transition: 'opacity 0.8s ease-in-out'
                }}>
                    <img src={slide.img} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                        position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 100%)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: '#fff'
                    }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', maxWidth: '600px', lineHeight: 1.1 }}>{slide.title}</h1>
                        <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '500px' }}>{slide.subtitle}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function MarketplaceFeed({ items, isStudentVerified, isLoggedIn = false, onReport }: MarketplaceFeedProps) {
    const [sortOption, setSortOption] = useState('newest');
    const [filterSociety, setFilterSociety] = useState('all');

    const topItems = [...items].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
    const topItemIds = new Set(topItems.map(item => item.id));
    let latestItems = items.filter(item => !topItemIds.has(item.id));

    if (filterSociety !== 'all') {
        latestItems = latestItems.filter(i => i.society === filterSociety);
    }

    if (sortOption === 'price-low') latestItems.sort((a, b) => (a.sellingPrice || 0) - (b.sellingPrice || 0));
    else if (sortOption === 'price-high') latestItems.sort((a, b) => (b.sellingPrice || 0) - (a.sellingPrice || 0));
    else if (sortOption === 'a-z') latestItems.sort((a, b) => a.title.localeCompare(b.title));

    return (
        <div className="feed-container">
            <HeroCarousel />

            {topItems.length > 0 && (
                <div className="feed-section">
                    <div className="feed-header">
                        <h2>Top Items 🔥</h2>
                    </div>
                    <div className="items-grid">
                        {topItems.map((item) => (
                            <ItemCard key={item.id} item={item} isStudentVerified={isStudentVerified} isLoggedIn={isLoggedIn} onReport={onReport} />
                        ))}
                    </div>
                </div>
            )}

            <div className="feed-section" style={{ marginTop: '2.5rem' }}>
                <div className="feed-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2>Latest Listings</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600, color: '#374151' }}>Filter by Society/Category</label>
                            <select value={filterSociety} onChange={e => setFilterSociety(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%' }}>
                                <option value="all">All Societies</option>
                                <option value="Hyped">Hyped</option>
                                <option value="HumanEd">HumanEd</option>
                                <option value="Endeavour">Endeavour</option>
                                <option value="Formula Student">Formula Student</option>
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600, color: '#374151' }}>Sort Feed By</label>
                            <select value={sortOption} onChange={e => setSortOption(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%' }}>
                                <option value="newest">Latest Timestamp</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="a-z">Alphabetical (A - Z)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {latestItems.length === 0 ? (
                    <div className="empty-state">No items found.</div>
                ) : (
                    <div className="items-grid">
                        {latestItems.map((item) => (
                            <ItemCard key={item.id} item={item} isStudentVerified={isStudentVerified} isLoggedIn={isLoggedIn} onReport={onReport} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days >= 30) {
        const months = Math.floor(days / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
    } else if (days >= 1) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
    } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours >= 1) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        const mins = Math.floor(diff / (1000 * 60));
        return mins <= 1 ? 'just now' : `${mins} mins ago`;
    }
}

function ItemCard({ item, isStudentVerified, isLoggedIn, onReport }: { item: MarketplaceItem; isStudentVerified: boolean; isLoggedIn: boolean; onReport?: (id: string, type: string, reason: string) => void }) {
    const navigate = useNavigate();
    const YEAR_COLORS: Record<string, string> = {
        'Year 1': '#9ca3af',
        'Year 2': '#10b981',
        'Year 3': '#3b82f6',
        'Year 4': '#8b5cf6',
        'Year 5': '#f97316',
        'Master': '#ef4444',
        'PhD': '#eab308'
    };
    const badgeColor = item.yearOfStudy ? YEAR_COLORS[item.yearOfStudy] || '#6b7280' : '#6b7280';

    const baseSellingPrice = item.sellingPrice;
    const hasStudentDiscount = isStudentVerified && baseSellingPrice !== undefined && baseSellingPrice > 0;
    const finalSellingPrice = hasStudentDiscount ? baseSellingPrice * 0.9 : baseSellingPrice;

    const hasDiscount = item.originalPrice && finalSellingPrice && item.originalPrice > finalSellingPrice;
    const discountPercent = hasDiscount
        ? Math.round(((item.originalPrice! - finalSellingPrice!) / item.originalPrice!) * 100)
        : 0;

    const renderDeliveryBadge = () => {
        if (!item.deliveryMethod) return null;
        const labels = { delivery: '🚚 Delivery', meetup: '🤝 Meet up', both: '🚚/🤝 Delivery or Meet up' };
        return (
            <span className="item-society" style={{ marginLeft: 'auto', background: '#e0e7ff', color: '#3730a3', border: 'none' }}>
                {labels[item.deliveryMethod]}
            </span>
        );
    };

    return (
        <div className={`item-card ${item.isSold ? 'item-sold' : ''}`}>
            {item.imageUrl && (
                <div className="item-image-container">
                    {item.isSold && <div className="sold-overlay">SOLD</div>}
                    <img src={item.imageUrl} alt={item.title} className="item-image" />
                </div>
            )}
            {!item.imageUrl && item.isSold && (
                <div className="sold-banner">SOLD</div>
            )}

            <div className="item-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="item-society">{item.society}</span>
                    {item.origin && <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>{item.origin}</span>}
                    {item.degree && <span style={{ color: '#4b5563', fontSize: '0.85rem', fontStyle: 'italic' }}>{item.degree}</span>}
                    {item.yearOfStudy && <span style={{ backgroundColor: badgeColor, color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{item.yearOfStudy}</span>}
                    {item.points !== undefined && <span style={{ color: '#ca8a04', fontWeight: 'bold', fontSize: '0.85rem' }}>⭐ {item.points} pts</span>}
                </div>
                <span className="item-type">{item.type}</span>
                {renderDeliveryBadge()}
            </div>

            <div className="item-body">
                <h3 className="item-title">{item.title}</h3>
                <small style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                    Posted {getTimeAgo(item.createdAt)}
                </small>
                <p className="item-desc">{item.description}</p>
            </div>

            <div className="item-footer">
                {item.type !== 'Recruiting' && (
                    <div className="price-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.25rem' }}>
                            £{finalSellingPrice?.toFixed(2) || '0.00'}
                        </span>
                        {hasDiscount && (
                            <>
                                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                    -{discountPercent}%
                                </span>
                                <span style={{ textDecoration: 'line-through', color: '#111', fontSize: '0.8rem', fontWeight: 'normal' }}>
                                    £{item.originalPrice?.toFixed(2)}
                                </span>
                            </>
                        )}
                        {hasStudentDiscount && (
                            <span style={{ background: '#10b981', marginLeft: 'auto', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ Student</span>
                        )}
                    </div>
                )}
                {item.type === 'Recruiting' && (
                    <div className="recruiting-badge">Open Role</div>
                )}
            </div>

            <div className="item-actions">
                {item.isSold ? (
                    <button className="btn btn-primary" disabled>
                        Item Unavailable
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <button
                            onClick={(e) => {
                                if (!isLoggedIn) {
                                    e.preventDefault();
                                    alert("You must be signed in to message sellers.");
                                } else {
                                    navigate('/inbox', { state: { newContact: item.sellerEmail } });
                                }
                            }}
                            className="btn btn-primary"
                            style={{ flex: 1, textAlign: 'center' }}
                        >
                            Message
                        </button>
                        {item.sellerPhone && (
                            <a
                                href={isLoggedIn ? `https://wa.me/${item.sellerPhone.replace(/[^0-9]/g, '')}?text=Hi,%20I%27m%20interested%20in%20your%20${encodeURIComponent(item.title)}` : '#'}
                                onClick={(e) => { if (!isLoggedIn) { e.preventDefault(); alert("You must be signed in to contact sellers."); } }}
                                className="btn btn-primary"
                                style={{ flex: 1, textAlign: 'center', background: '#25D366', color: 'white', border: 'none' }}
                                target="_blank"
                                rel="noreferrer"
                            >
                                WhatsApp
                            </a>
                        )}
                    </div>
                )}
                <div style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>
                    <button onClick={() => {
                        const reason = prompt('Why are you reporting this item? (e.g. Spam, Scam, Inappropriate)');
                        if (reason && onReport) onReport(item.id, 'item', reason);
                    }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        🚩 Report Listing to Admins
                    </button>
                </div>
            </div>
        </div>
    );
}
