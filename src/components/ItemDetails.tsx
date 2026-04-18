import { useParams, useNavigate } from 'react-router-dom';
import type { MarketplaceItem } from '../types';
import { LocationPicker } from './LocationPicker';
import './ItemDetails.css';

export function ItemDetails({ items, isLoggedIn, isStudentVerified }: { items: MarketplaceItem[], isLoggedIn: boolean, isStudentVerified: boolean }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = items.find(i => i.id === id);

    if (!item) return <div style={{ padding: '4rem', textAlign: 'center' }}><h2>Item not found</h2><button className="btn btn-outline" onClick={() => navigate('/')}>Back to Feed</button></div>;

    const basePrice = item.sellingPrice || 0;
    const finalPrice = isStudentVerified && basePrice > 0 ? basePrice * 0.9 : basePrice;
    const hasDiscount = !!(item.originalPrice && finalPrice < item.originalPrice);

    const discountPercent = hasDiscount
        ? Math.round(((item.originalPrice! - finalPrice) / item.originalPrice!) * 100)
        : 0;

    return (
        <div className="item-details-container">
            <button className="back-button" onClick={() => navigate(-1)}>← Back to Marketplace</button>

            <div className="item-details-grid">
                <div className="item-details-image">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} />
                    ) : (
                        <div className="no-image">No Image Available</div>
                    )}
                </div>

                <div className="item-details-info">
                    <div className="info-header">
                        <span className="info-society">{item.society}</span>
                        {item.isSold && <span className="sold-badge">SOLD</span>}
                        <h1 className="info-title">{item.title}</h1>
                        <p className="info-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                            {item.sellerAvatar ? (
                                <img src={item.sellerAvatar} alt="Seller Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👤</div>
                            )}
                            <span>Posted by {item.sellerEmail ? item.sellerEmail.split('@')[0] : 'Engineer'} • {new Date(item.createdAt).toLocaleDateString()}</span>
                        </p>
                    </div>

                    <div className="info-price-section">
                        {item.type !== 'Recruiting' && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', flexWrap: 'wrap' }}>
                                <span className="info-selling-price">£{finalPrice.toFixed(2)}</span>
                                {hasDiscount && (
                                    <>
                                        <span className="info-discount" style={{ color: '#ef4444', fontWeight: 'bold' }}>-{discountPercent}% OFF</span>
                                        <span className="info-original-price">£{item.originalPrice?.toFixed(2)}</span>
                                    </>
                                )}
                                {isStudentVerified && (
                                    <span style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                                        Student Price Applied
                                    </span>
                                )}
                            </div>
                        )}
                        {item.type === 'Recruiting' && <div className="recruiting-tag">OPEN ROLE</div>}
                    </div>

                    <div className="info-description">
                        <h3>Description</h3>
                        <p>{item.description}</p>
                    </div>

                    <div className="info-logistics">
                        <div className="logistics-card">
                            <strong>🚚 Delivery</strong>
                            <p>{item.deliveryMethod === 'delivery' || item.deliveryMethod === 'both' ? 'Available for shipping/handover.' : 'Local meet-up only.'}</p>
                        </div>
                        <div className="logistics-card">
                            <strong>🤝 Meet-up</strong>
                            <p>{item.deliveryMethod === 'meetup' || item.deliveryMethod === 'both' ? (item.meetupLocationName || 'Arranged after contact') : 'Shipping only.'}</p>
                        </div>
                    </div>

                    {item.meetupLat && item.meetupLng && (
                        <div className="info-map-section" style={{ marginTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>📍 Exact Meet-up Location</h3>
                            <LocationPicker
                                initialLat={item.meetupLat}
                                initialLng={item.meetupLng}
                                onLocationChange={() => { }}
                                readOnly={true}
                            />
                            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${item.meetupLat},${item.meetupLng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                >
                                    Open in Google Maps
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="info-actions">
                        {!item.isSold && (
                            <>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }}
                                    onClick={() => {
                                        if (!isLoggedIn) {
                                            alert("Please sign in to message sellers.");
                                        } else {
                                            navigate('/inbox', { state: { newContact: item.sellerEmail, draftMessage: `Hey! I'm interested in "${item.title}". Is it still available?` } });
                                        }
                                    }}
                                >
                                    Message Seller
                                </button>
                                {item.sellerPhone && (
                                    <a
                                        href={`https://wa.me/${item.sellerPhone.replace(/[^0-9]/g, '')}`}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', background: '#25D366', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                                        target="_blank" rel="noreferrer"
                                    >
                                        WhatsApp Seller
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
