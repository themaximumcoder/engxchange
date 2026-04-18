import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSmartPlaceholder } from '../lib/helpers';
import type { MarketplaceItem } from '../types';
import { LocationPicker } from './LocationPicker';
import './ItemDetails.css';

export function ItemDetails({ items, isLoggedIn, isStudentVerified, currentUserEmail }: { items: MarketplaceItem[], isLoggedIn: boolean, isStudentVerified: boolean, currentUserEmail: string }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = items.find(i => i.id === id);

    if (!item) return <div style={{ padding: '4rem', textAlign: 'center' }}><h2>Item not found</h2><button className="btn btn-outline" onClick={() => navigate('/')}>Back to Feed</button></div>;
    
    const [isTradeSelectorOpen, setIsTradeSelectorOpen] = useState(false);
    const myItems = items.filter(i => i.sellerEmail === currentUserEmail && !i.isSold && i.id !== item.id);

    const handleProposeTrade = (offeredItemId: string) => {
        const offeredItem = myItems.find(i => i.id === offeredItemId);
        if (!offeredItem) return;

        const tradeMsg = `Hey! I'm interested in trading your "${item.title}" for my "${offeredItem.title}". Check out my gear here: https://engxchange.com/item/${offeredItem.id}`;
        navigate('/inbox', { state: { newContact: item.sellerEmail, draftMessage: tradeMsg } });
    };

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
                        <div className="item-placeholder-smart" style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden' }}>
                            <img src={getSmartPlaceholder(item.title, item.society)} alt="Smart Placeholder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
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
                            <span>Posted by {item.sellerName || (item.sellerEmail ? item.sellerEmail.split('@')[0] : 'Engineer')} • {new Date(item.createdAt).toLocaleDateString()}</span>
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
                        {(item.transactionMode === 'trade' || item.transactionMode === 'both') && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.8rem', background: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 700, marginTop: '1rem' }}>
                                🔄 Exchange Available
                            </div>
                        )}
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
                                {(item.transactionMode === 'trade' || item.transactionMode === 'both') && (
                                    <button 
                                        className="btn btn-outline" 
                                        style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', marginTop: '0.5rem', border: '2px solid #6366f1', color: '#6366f1' }}
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                                alert("Please sign in to propose a trade.");
                                            } else {
                                                setIsTradeSelectorOpen(true);
                                            }
                                        }}
                                    >
                                        🤝 Propose Trade Exchange
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {isTradeSelectorOpen && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                            <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', maxWidth: '450px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Propose an Exchange</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Select which of your active listings you'd like to offer in exchange for <strong>{item.title}</strong>:</p>
                                
                                {myItems.length === 0 ? (
                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', marginBottom: '1.5rem' }}>
                                        <p style={{ color: '#64748b', marginBottom: '1rem' }}>You don't have any gear listed yet!</p>
                                        <button className="btn btn-primary" onClick={() => navigate('/list')}>List an Item Now</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                        {myItems.map(mi => (
                                            <div 
                                                key={mi.id} 
                                                onClick={() => handleProposeTrade(mi.id)}
                                                style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}
                                                onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {mi.imageUrl ? <img src={mi.imageUrl} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} alt="" /> : <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '4px' }} />}
                                                <span style={{ fontWeight: 600 }}>{mi.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setIsTradeSelectorOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
