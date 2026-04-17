import { useState } from 'react';
import { ENTRY_TYPES, SOCIETIES } from '../types';
import type { MarketplaceItem, SocietyName, EntryType } from '../types';
import { supabase } from '../lib/supabaseClient';
import './ListingForm.css';

interface ListingFormProps {
    onSubmit: (item: Omit<MarketplaceItem, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
    initialData?: MarketplaceItem;
}

export function ListingForm({ onSubmit, onCancel, initialData }: ListingFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [society, setSociety] = useState<SocietyName>(initialData?.society || 'Hyped');
    const [type, setType] = useState<EntryType>(initialData?.type || 'Materials');
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'meetup' | 'both'>(initialData?.deliveryMethod || 'meetup');
    const [originalPrice, setOriginalPrice] = useState<string>(initialData?.originalPrice?.toString() || '');
    const [sellingPrice, setSellingPrice] = useState<string>(initialData?.sellingPrice?.toString() || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [sellerEmail, setSellerEmail] = useState(initialData?.sellerEmail || '');
    const [sellerPhone, setSellerPhone] = useState(initialData?.sellerPhone || '');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const op = originalPrice ? parseFloat(originalPrice) : 0;
        const sp = sellingPrice ? parseFloat(sellingPrice) : 0;

        // Validation: Selling Price cannot be higher than Original Price
        if (type !== 'Recruiting' && op > 0 && sp > op) {
            setError(`Safety Block: You cannot list an item for more than its original price (£${op.toFixed(2)}). Please reduce the selling price to offer a fair student discount.`);
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
            society,
            type,
            originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
            sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
            imageUrl: uploadedImageUrl,
            sellerEmail: sellerEmail || undefined,
            sellerPhone: sellerPhone || undefined,
            deliveryMethod: type === 'Recruiting' ? undefined : deliveryMethod,
            views: initialData?.views || 0,
            isSold: initialData?.isSold || false
        });
        setUploading(false);
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h2>{initialData ? 'Update Listing' : 'List an Item or Role'}</h2>
                <p>Provide the details below. We enforce fair student pricing.</p>
            </div>

            <form className="listing-form" onSubmit={handleSubmit}>
                {error && (
                    <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fee2e2', fontSize: '0.9rem' }}>
                        <strong>⚠️ {error}</strong>
                    </div>
                )}

                <section className="form-section">
                    <h3 className="section-title">1. Item Information</h3>
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
                        <label>Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe condition, size, or specific requirements..."
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Society Association</label>
                            <select value={society} onChange={e => setSociety(e.target.value as SocietyName)}>
                                {SOCIETIES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Content Type</label>
                            <select value={type} onChange={e => setType(e.target.value as EntryType)}>
                                {ENTRY_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="section-title">2. Pricing & Logistics</h3>

                    {type !== 'Recruiting' ? (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Original Price (£)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={originalPrice}
                                    onChange={e => setOriginalPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                                <span className="field-hint">The full retail price you paid.</span>
                            </div>
                            <div className="form-group">
                                <label>Selling Price (£)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={sellingPrice}
                                    onChange={e => setSellingPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                                <span className="field-hint">Must be less than or equal to original.</span>
                            </div>
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>Pricing does not apply to recruiting posts.</p>
                    )}

                    <div className="form-row">
                        {type !== 'Recruiting' && (
                            <div className="form-group">
                                <label>Delivery Method</label>
                                <select value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value as any)}>
                                    <option value="meetup">Meet up in person</option>
                                    <option value="delivery">Post / Delivery</option>
                                    <option value="both">Both Options</option>
                                </select>
                            </div>
                        )}
                        <div className="form-group">
                            <label>Item Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) setImageFile(file);
                                }}
                            />
                            {(imageFile || initialData?.imageUrl) && (
                                <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                                    ✅ {imageFile ? imageFile.name : 'Current image kept'}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="section-title">3. Contact Verification</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>University Email</label>
                            <input
                                type="email"
                                required
                                value={sellerEmail}
                                onChange={e => setSellerEmail(e.target.value)}
                                placeholder="student@ed.ac.uk"
                            />
                        </div>
                        <div className="form-group">
                            <label>WhatsApp (Optional)</label>
                            <input
                                type="text"
                                value={sellerPhone}
                                onChange={e => setSellerPhone(e.target.value)}
                                placeholder="447123456789"
                            />
                        </div>
                    </div>
                </section>

                <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={uploading} style={{ flex: 2 }}>
                        {uploading ? 'Processing listing...' : (initialData ? 'Save Changes' : 'Publish Listing')}
                    </button>
                </div>
            </form>
        </div>
    );
}
