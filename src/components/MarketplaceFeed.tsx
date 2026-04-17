import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketplaceItem } from '../types';
import './MarketplaceFeed.css';

interface MarketplaceFeedProps {
    items: MarketplaceItem[];
    isStudentVerified: boolean;
    isLoggedIn?: boolean;
    onReport?: (id: string, type: string, reason: string) => void;
    onLikeItem: (id: string) => void;
    locationFilter?: string;
    savedItems: string[];
}

const NEWS_SLIDES = [
    { id: 1, title: 'Build and Iterate', subtitle: 'Join thousands of engineers shaping the future locally.', img: '/hero-uploaded.png' },
    { id: 2, title: 'New 3D Model Gallery', subtitle: 'Our community forum now supports direct .STL file uploads.', img: '/3dcad_image.jpg' },
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

export function MarketplaceFeed({ items, isStudentVerified, isLoggedIn = false, onReport, onLikeItem, locationFilter = 'all', savedItems }: MarketplaceFeedProps) {
    const [sortOption, setSortOption] = useState('newest');
    const [recruitSortOption, setRecruitSortOption] = useState('newest');

    // 1. Partition Data
    const hotItems = [...items].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
    const recruitingItems = items.filter(i => i.type === 'Recruiting');
    let standardItems = items.filter(i => i.type !== 'Recruiting');

    // 2. Apply Filters & Sorting to standard items
    if (locationFilter !== 'all') {
        standardItems = standardItems.filter(i => i.origin === locationFilter);
    }

    const sortItems = (arr: MarketplaceItem[]) => {
        const sorted = [...arr];
        if (sortOption === 'price-low') sorted.sort((a, b) => (a.sellingPrice || 0) - (b.sellingPrice || 0));
        else if (sortOption === 'price-high') sorted.sort((a, b) => (b.sellingPrice || 0) - (a.sellingPrice || 0));
        else if (sortOption === 'a-z') sorted.sort((a, b) => a.title.localeCompare(b.title));
        else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return sorted;
    };

    const sortRecruitItems = (arr: MarketplaceItem[]) => {
        const sorted = [...arr];
        if (recruitSortOption === 'a-z') sorted.sort((a, b) => a.title.localeCompare(b.title));
        else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return sorted;
    };

    const displayItems = sortItems(standardItems);

    return (
        <div className="feed-container">
            <HeroCarousel />


            {/* SECTION 1: HOT LISTINGS (SLIDER) */}
            {hotItems.length > 0 && (
                <div className="feed-section">
                    <div className="feed-header">
                        <h2>Top Engineering Picks 🔥</h2>
                    </div>
                    <div className="slider-container">
                        {hotItems.map((item) => (
                            <div key={item.id} className="slider-item">
                                <ItemCard item={item} isStudentVerified={isStudentVerified} isLoggedIn={isLoggedIn} onReport={onReport} onLikeItem={onLikeItem} savedItems={savedItems} />
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* SECTION 2: LATEST LISTINGS */}
            <div className="feed-section">
                <div className="feed-header" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <h2>Latest Marketplace</h2>
                        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Showing {displayItems.length} items</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Shop Order</label>
                            <select value={sortOption} onChange={e => setSortOption(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', outline: 'none', cursor: 'pointer' }}>
                                <option value="newest">Recently Posted</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="a-z">Name (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {displayItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
                        <p style={{ color: '#6b7280', margin: 0 }}>No matching engineering gear found in this category.</p>
                    </div>
                ) : (
                    <div className="items-grid">
                        {displayItems.map((item) => (
                            <ItemCard key={item.id} item={item} isStudentVerified={isStudentVerified} isLoggedIn={isLoggedIn} onReport={onReport} onLikeItem={onLikeItem} savedItems={savedItems} />
                        ))}
                    </div>
                )}
            </div>

            {/* SECTION: SOCIETY RECRUITMENT & ROLES (BOTTOM) */}
            {recruitingItems.length > 0 && (
                <div className="feed-section" style={{ marginTop: '4rem' }}>
                    <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ marginBottom: '0.25rem' }}>Society Recruitment & Roles 👥</h2>
                            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Find your next engineering venture or leadership position.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Sort Roles:</span>
                            <select
                                value={recruitSortOption}
                                onChange={e => setRecruitSortOption(e.target.value)}
                                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', cursor: 'pointer', background: '#fff' }}
                            >
                                <option value="newest">Latest Postings</option>
                                <option value="a-z">Role Name (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    <div className="items-grid">
                        {sortRecruitItems(recruitingItems).map((item) => (
                            <ItemCard key={item.id} item={item} isStudentVerified={isStudentVerified} isLoggedIn={isLoggedIn} onReport={onReport} onLikeItem={onLikeItem} savedItems={savedItems} />
                        ))}
                    </div>
                </div>
            )}
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

function ItemCard({ item, isStudentVerified, isLoggedIn, onReport, onLikeItem, savedItems }: { item: MarketplaceItem; isStudentVerified: boolean; isLoggedIn: boolean; onReport?: (id: string, type: string, reason: string) => void; onLikeItem: (id: string) => void; savedItems: string[] }) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const isRecruit = item.type === 'Recruiting';
    
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
    const isSaved = savedItems.includes(item.id);
    const sellerUsername = item.sellerEmail ? item.sellerEmail.split('@')[0] : 'Engineering Student';

    const baseSellingPrice = item.sellingPrice;
    const hasStudentDiscount = isStudentVerified && baseSellingPrice !== undefined && baseSellingPrice > 0;
    const finalSellingPrice = hasStudentDiscount ? baseSellingPrice * 0.9 : baseSellingPrice;

    const hasDiscount = !!(item.originalPrice && finalSellingPrice && item.originalPrice > finalSellingPrice);
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
        <div
            className={`item-card ${item.isSold ? 'item-sold' : ''}`}
            onClick={() => navigate(`/item/${item.id}`)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                cursor: 'pointer',
                background: (isRecruit && isHovered) ? '#fee2e2' : undefined,
                transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isHovered ? '0 12px 20px -10px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
            }}
        >
            {item.imageUrl && (
                <div className="item-image-container">
                    {item.isSold && <div className="sold-overlay">SOLD</div>}
                    <img src={item.imageUrl} alt={item.title} className="item-image" />
                    <button
                        className="like-heart-button"
                        onClick={(e) => { e.stopPropagation(); onLikeItem(item.id); }}
                        title="I'm interested!"
                        style={{ color: isSaved ? '#ef4444' : '#d1d5db', transform: isSaved ? 'scale(1.1)' : 'scale(1)' }}
                    >
                        {isSaved ? '❤️' : '🤍'}
                    </button>
                </div>
            )}
            {!item.imageUrl && item.isSold && (
                <div className="sold-banner">SOLD</div>
            )}

            <div className="item-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.origin && <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>{item.origin}</span>}
                    {item.degree && <span style={{ color: '#4b5563', fontSize: '0.85rem', fontStyle: 'italic' }}>{item.degree}</span>}
                    {item.yearOfStudy && <span style={{ backgroundColor: badgeColor, color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{item.yearOfStudy}</span>}
                    {!!item.points && <span style={{ color: '#ca8a04', fontWeight: 'bold', fontSize: '0.85rem' }}>⭐ {item.points} pts</span>}
                </div>
                <span className="item-type">{item.type}</span>
                {renderDeliveryBadge()}
            </div>

            <div className="item-body">
                <h3 className="item-title">{item.title}</h3>
                <small style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                    By {sellerUsername} &bull; {getTimeAgo(item.createdAt)}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                    -{discountPercent}%
                                </span>
                                <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.8rem', fontWeight: 'normal' }}>
                                    £{item.originalPrice?.toFixed(2)}
                                </span>
                            </div>
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

            <div className="item-actions" onClick={e => e.stopPropagation()}>
                {item.isSold ? (
                    <button className="btn btn-primary" disabled>
                        Item Unavailable
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isLoggedIn) {
                                    console.error("Auth Guard: Sign-in required for messaging.");
                                } else {
                                    navigate('/inbox', {
                                        state: {
                                            newContact: item.sellerEmail,
                                            draftMessage: `Hey! I'm interested in your listing: "${item.title}" 👀 Is it still available?`
                                        }
                                    });
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isLoggedIn) { e.preventDefault(); alert("You must be signed in to contact sellers."); }
                                }}
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
