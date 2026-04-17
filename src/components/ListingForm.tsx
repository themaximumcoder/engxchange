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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                <h2>List an Item or Role</h2>
                <p>Fill out the details below to add to the marketplace.</p>
            </div>

            <form className="listing-form" onSubmit={handleSubmit}>
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
                        placeholder="Describe the condition, specific requirements, etc."
                        rows={4}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Society</label>
                        <select value={society} onChange={e => setSociety(e.target.value as SocietyName)}>
                            {SOCIETIES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Type</label>
                        <select value={type} onChange={e => setType(e.target.value as EntryType)}>
                            {ENTRY_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {type !== 'Recruiting' && (
                    <div className="form-group">
                        <label>Delivery Method</label>
                        <select value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value as any)}>
                            <option value="meetup">Meet up</option>
                            <option value="delivery">Delivery</option>
                            <option value="both">Both (Delivery or Meet up)</option>
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label>Upload Image (from laptop or phone)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) setImageFile(file);
                        }}
                    />
                    {imageFile && <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem' }}>{imageFile.name} selected</p>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Contact Email</label>
                        <input
                            type="email"
                            required
                            value={sellerEmail}
                            onChange={e => setSellerEmail(e.target.value)}
                            placeholder="student@ed.ac.uk"
                        />
                    </div>
                    <div className="form-group">
                        <label>WhatsApp Number (Optional, ex: 447...)</label>
                        <input
                            type="text"
                            value={sellerPhone}
                            onChange={e => setSellerPhone(e.target.value)}
                            placeholder="447123456789"
                        />
                    </div>
                </div>

                {type !== 'Recruiting' && (
                    <div className="form-row">
                        <div className="form-group">
                            <label>Original Price (£)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={originalPrice}
                                onChange={e => setOriginalPrice(e.target.value)}
                                placeholder="0.00"
                            />
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
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                        {uploading ? 'Uploading securely...' : 'Submit Listing'}
                    </button>
                </div>
            </form>
        </div>
    );
}
