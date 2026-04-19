import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSmartPlaceholder } from '../lib/helpers';
import type { MarketplaceItem } from '../types';
import { supabase } from '../lib/supabaseClient';
import { LocationPicker } from './LocationPicker';
import './ItemDetails.css';

export function ItemDetails({ items, isLoggedIn, currentUserEmail, currencySymbol = '£' }: { items: MarketplaceItem[], isLoggedIn: boolean, currentUserEmail: string, currencySymbol?: string }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const item = items.find(i => i.id === id);

    if (!item) return <div style={{ padding: '4rem', textAlign: 'center' }}><h2>Item not found</h2><button className="btn btn-outline" onClick={() => navigate('/')}>Back to Feed</button></div>;
    
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isTradeSelectorOpen, setIsTradeSelectorOpen] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const myItems = items.filter(i => i.sellerEmail === currentUserEmail && !i.isSold && i.id !== item.id);

    const handleProposeTrade = (offeredItemId: string) => {
        const offeredItem = myItems.find(i => i.id === offeredItemId);
        if (!offeredItem) return;

        navigate('/inbox', { state: { newContact: item.sellerEmail, draftMessage: "🔄 Trade Proposal", itemId: offeredItemId } });
    };

    const sellingPrice = item.sellingPrice || 0;
    const hasDiscount = !!(item.originalPrice && sellingPrice < item.originalPrice);

    const discountPercent = hasDiscount
        ? Math.round(((item.originalPrice! - sellingPrice) / item.originalPrice!) * 100)
        : 0;

    const handleApplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let cvUrl = '';
            if (cvFile) {
                const fileName = `${Date.now()}_${cvFile.name}`;
                const { data, error } = await supabase.storage.from('recruitment_cvs').upload(fileName, cvFile);
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage.from('recruitment_cvs').getPublicUrl(data.path);
                cvUrl = publicUrl;
            }

            const applicationData = {
                item_id: item.id,
                applicant_email: currentUserEmail,
                applicant_name: currentUserEmail.split('@')[0],
                answers: Object.entries(answers).map(([question, answer]) => ({ question, answer })),
                cv_url: cvUrl || null
            };

            const { error: insertError } = await supabase.from('applications').insert([applicationData]);
            if (insertError) throw insertError;

            alert('Application submitted successfully!');
            setIsApplying(false);
            setAnswers({});
            setCvFile(null);
        } catch (err: any) {
            alert('Submission failed: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="item-details-container">
            <button className="back-button" onClick={() => navigate(-1)}>← Back to Marketplace</button>

            <div className="item-details-grid">
                <div className="item-details-image">
                    {item.imageUrls && item.imageUrls.length > 0 ? (
                        <div className="gallery-container" style={{ position: 'relative', height: '100%', width: '100%' }}>
                            <img src={item.imageUrls[activeImageIndex]} alt={item.title} key={activeImageIndex} style={{ animation: 'fadeIn 0.3s ease' }} />
                            
                            {item.imageUrls.length > 1 && (
                                <>
                                    <button className="gallery-arrow left" onClick={() => setActiveImageIndex(prev => (prev === 0 ? item.imageUrls!.length - 1 : prev - 1))}>‹</button>
                                    <button className="gallery-arrow right" onClick={() => setActiveImageIndex(prev => (prev === item.imageUrls!.length - 1 ? 0 : prev + 1))}>›</button>
                                    
                                    <div className="gallery-dots">
                                        {item.imageUrls.map((_, i) => (
                                            <span 
                                                key={i} 
                                                className={`dot ${i === activeImageIndex ? 'active' : ''}`}
                                                onClick={() => setActiveImageIndex(i)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : item.imageUrl ? (
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
                                <span className="info-selling-price" style={{ color: '#16a34a' }}>{currencySymbol}{sellingPrice.toFixed(2)}</span>
                                {hasDiscount && (
                                    <>
                                        <span className="info-discount" style={{ color: '#ef4444', fontWeight: 'bold' }}>-{discountPercent}% OFF</span>
                                        <span className="info-original-price">{currencySymbol}{item.originalPrice?.toFixed(2)}</span>
                                    </>
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

                    {item.type !== 'Recruiting' && (
                        <div className="info-logistics">
                            <div className="logistics-card">
                                <strong>🚚 Delivery & Shipping</strong>
                                <p>{item.deliveryMethod === 'delivery' || item.deliveryMethod === 'both' ? 'National shipping and courier handover available.' : 'Direct local handover only.'}</p>
                            </div>
                            <div className="logistics-card">
                                <strong>🤝 In-Person Meet-up</strong>
                                <p>{item.deliveryMethod === 'meetup' || item.deliveryMethod === 'both' ? (item.meetupLocationName || 'Convenient spot arranged after contact') : 'Shipping only.'}</p>
                            </div>
                        </div>
                    )}

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
                                                alert("Please sign in to continue.");
                                            } else if (item.type === 'Recruiting') {
                                                setIsApplying(true);
                                            } else {
                                                navigate('/inbox', { state: { newContact: item.sellerEmail, draftMessage: `Hey! I'm interested in "${item.title}". Is it still available?`, itemId: item.id } });
                                            }
                                        }}
                                    >
                                        {item.type === 'Recruiting' ? 'Apply for Role' : 'Message Seller'}
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
                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => {
                                            const reason = window.prompt("Reason for reporting this seller:");
                                            if (reason && reason.trim()) {
                                                // We'll reuse the item ID for reports or use sellerEmail
                                                supabase.from('reports').insert([{ 
                                                    item_id: item.sellerEmail, 
                                                    item_type: 'user', 
                                                    reason: reason.trim(), 
                                                    reported_by: currentUserEmail 
                                                }]).then(({ error }) => {
                                                    if (!error) alert('Seller report submitted. Admin will review.');
                                                });
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
                                    >
                                        🚩 Report Seller Behavior
                                    </button>
                                </div>
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
                    {isApplying && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem', backdropFilter: 'blur(4px)' }}>
                            <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '20px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>Apply for {item.title}</h2>
                                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{item.society} Recruitment Phase</p>
                                </div>
                                <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {item.questions && item.questions.map((q, idx) => (
                                        <div key={idx} className="form-group">
                                            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>{q}</label>
                                            <textarea 
                                                required 
                                                value={answers[q] || ''} 
                                                onChange={e => setAnswers({ ...answers, [q]: e.target.value })}
                                                placeholder="Type your answer here..."
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '100px', fontSize: '0.95rem' }}
                                            />
                                        </div>
                                    ))}
                                    
                                    {item.allowCv && (
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Upload CV (PDF)</label>
                                            <input 
                                                type="file" 
                                                accept=".pdf" 
                                                onChange={e => setCvFile(e.target.files?.[0] || null)}
                                                style={{ width: '100%', padding: '0.8rem', border: '2px dashed #e2e8f0', borderRadius: '10px' }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsApplying(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                                            {submitting ? 'Submitting Application...' : 'Send Final Application'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
