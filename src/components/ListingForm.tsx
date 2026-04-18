import { useState } from 'react';
import { ENTRY_TYPES, UNIVERSITY_PRESETS } from '../types';
import type { MarketplaceItem, EntryType, UniversityPreset } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Truck, MapPin } from 'lucide-react';
import { LocationPicker } from './LocationPicker';
import './ListingForm.css';

interface ListingFormProps {
    onSubmit: (item: Omit<MarketplaceItem, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
    initialData?: Partial<MarketplaceItem>;
}

export function ListingForm({ onSubmit, onCancel, initialData }: ListingFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [type, setType] = useState<EntryType>(initialData?.type || 'Materials');
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'meetup' | 'both'>(initialData?.deliveryMethod || 'meetup');
    const [meetupLocationName, setMeetupLocationName] = useState(initialData?.meetupLocationName || '');
    const [meetupLat, setMeetupLat] = useState<number | undefined>(initialData?.meetupLat);
    const [meetupLng, setMeetupLng] = useState<number | undefined>(initialData?.meetupLng);
    const [originalPrice, setOriginalPrice] = useState<string>(initialData?.originalPrice?.toString() || '');
    const [sellingPrice, setSellingPrice] = useState<string>(initialData?.sellingPrice?.toString() || '');
    const [transactionMode, setTransactionMode] = useState<'sell' | 'trade' | 'both'>(initialData?.transactionMode || 'sell');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [sellerEmail, setSellerEmail] = useState(initialData?.sellerEmail || '');
    const [sellerPhone, setSellerPhone] = useState(initialData?.sellerPhone || '');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedUni, setSelectedUni] = useState<UniversityPreset | null>(null);
    const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const op = originalPrice ? parseFloat(originalPrice) : 0;
        const sp = sellingPrice ? parseFloat(sellingPrice) : 0;

        // Validation
        if (type !== 'Recruiting' && op > 0 && sp > op) {
            setError(`Safety Block: You cannot list an item for more than its original price (£${op.toFixed(2)}). Please reduce the price to offer a student discount.`);
            return;
        }

        if (deliveryMethod !== 'delivery' && !isLocationConfirmed) {
            setError('Please confirm your meetup address on the map before publishing.');
            return;
        }

        setUploading(true);
        let uploadedImageUrl = initialData?.imageUrl;
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { data, error } = await supabase.storage.from('marketplace_files').upload(fileName, imageFile);
            if (!error && data) {
                const { data: { publicUrl } } = supabase.storage.from('marketplace_files').getPublicUrl(data.path);
                uploadedImageUrl = publicUrl;
            } else {
                alert('Image upload failed: ' + error?.message);
                setUploading(false);
                return;
            }
        }

        onSubmit({
            title,
            description,
            society: 'Other',
            type,
            originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
            sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
            imageUrl: uploadedImageUrl,
            sellerEmail: sellerEmail || undefined,
            sellerPhone: sellerPhone || undefined,
            deliveryMethod: type === 'Recruiting' ? undefined : deliveryMethod,
            meetupLocationName: meetupLocationName || undefined,
            meetupLat: meetupLat,
            meetupLng: meetupLng,
            views: initialData?.views || 0,
            isSold: initialData?.isSold || false,
            transactionMode: transactionMode
        });
        setUploading(false);
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h2>{initialData?.id ? 'Update Listing' : 'List an Item or Role'}</h2>
                <p>Provide the details below. We enforce fair student pricing.</p>
            </div>

            <form className="listing-form" onSubmit={handleSubmit}>
                {error && (
                    <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fee2e2', fontSize: '0.9rem' }}>
                        <strong>⚠️ {error}</strong>
                    </div>
                )}

                <section className="form-section">
                    <h3 className="section-title">1. Essential Information</h3>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="E.g. Engineering textbook, 3D Printer filament..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Listing Type</label>
                        <select value={type} onChange={e => setType(e.target.value as EntryType)}>
                            {ENTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Exchange Preference</label>
                        <select value={transactionMode} onChange={e => setTransactionMode(e.target.value as any)}>
                            <option value="sell">Cash Only (Sell)</option>
                            <option value="trade">Exchange/Trade Only</option>
                            <option value="both">Open to Both (Sell or Trade)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe condition, size, or specific requirements..."
                            rows={3}
                        />
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="section-title">2. Pricing & Logistics</h3>

                    {type !== 'Recruiting' && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Original Price (£)</label>
                                <input type="number" min="0" step="0.01" required value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Selling Price (£)</label>
                                <input type="number" min="0" step="0.01" required={transactionMode !== 'trade'} value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder={transactionMode === 'trade' ? 'Optional' : ''} />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Truck size={16} /> Delivery Method
                            </label>
                            <select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value as 'delivery' | 'meetup' | 'both')}>
                                <option value="meetup">Meet up only</option>
                                <option value="delivery">Delivery only</option>
                                <option value="both">Both available</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <MapPin size={16} /> Location Name
                            </label>
                            <input type="text" placeholder="e.g. Main Library" value={meetupLocationName} onChange={e => setMeetupLocationName(e.target.value)} />
                        </div>
                    </div>

                    <div className="map-picker-container" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Meetup Location 📍</label>
                        
                        <div className="university-presets" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.75rem' }}>
                                Are you a University Student? Select your Uni:
                            </label>
                            <select 
                                className="uni-select"
                                value={selectedUni?.name || ''} 
                                onChange={(e) => {
                                    const uni = UNIVERSITY_PRESETS.find(u => u.name === e.target.value);
                                    setSelectedUni(uni || null);
                                    setIsLocationConfirmed(false);
                                }}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}
                            >
                                <option value="">-- Choose University --</option>
                                {UNIVERSITY_PRESETS.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                            </select>

                            {selectedUni && (
                                <div className="preset-spots">
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                        Common Meetup Spots:
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {selectedUni.locations.map(loc => (
                                            <button
                                                key={loc.name}
                                                type="button"
                                                className="preset-btn"
                                                onClick={() => {
                                                    setMeetupLat(loc.lat);
                                                    setMeetupLng(loc.lng);
                                                    setMeetupLocationName(loc.name);
                                                    setIsLocationConfirmed(true);
                                                }}
                                                style={{
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e2e8f0',
                                                    background: '#fff',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {loc.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <LocationPicker
                            initialLat={meetupLat}
                            initialLng={meetupLng}
                            onLocationChange={(lat, lng, name) => {
                                setMeetupLat(lat);
                                setMeetupLng(lng);
                                setMeetupLocationName(name);
                                setIsLocationConfirmed(false);
                            }}
                        />

                        <div className="address-confirmation" style={{ marginTop: '1rem', padding: '1rem', background: isLocationConfirmed ? '#f0fdf4' : '#fff7ed', borderRadius: '8px', border: `1px solid ${isLocationConfirmed ? '#bbf7d0' : '#ffedd5'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ fontSize: '1.25rem' }}>{isLocationConfirmed ? '✅' : '❓'}</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isLocationConfirmed ? '#166534' : '#9a3412' }}>
                                        {isLocationConfirmed ? 'Address Confirmed' : 'Please Confirm the Address'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>{meetupLocationName || 'No location pinned yet'}</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLocationConfirmed(!isLocationConfirmed)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    background: isLocationConfirmed ? '#166534' : '#ea580c',
                                    color: '#fff',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {isLocationConfirmed ? 'Change' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="section-title">3. Media & Contact</h3>
                    <div className="form-group">
                        <label>Item Image</label>
                        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>WhatsApp / Mobile</label>
                            <input type="text" value={sellerPhone} onChange={e => setSellerPhone(e.target.value)} placeholder="447123456789" />
                        </div>
                        <div className="form-group">
                            <label>Verification Email</label>
                            <input type="email" required value={sellerEmail} onChange={e => setSellerEmail(e.target.value)} />
                        </div>
                    </div>
                </section>

                <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }}>Discard</button>
                    <button type="submit" className="btn btn-primary" disabled={uploading} style={{ flex: 2 }}>
                        {uploading ? 'Processing...' : (initialData ? 'Update Verified Listing' : 'Publish to Marketplace')}
                    </button>
                </div>
            </form>
        </div>
    );
}
