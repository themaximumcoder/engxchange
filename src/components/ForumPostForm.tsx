import { useState } from 'react';
import type { ForumPost } from '../types';
import { supabase } from '../lib/supabaseClient';

export function ForumPostForm({ onSubmit, onCancel, currentUserEmail, selectedCountry }: { onSubmit: (data: Omit<ForumPost, 'id' | 'createdAt' | 'upvotes'>) => void, onCancel: () => void, currentUserEmail: string, selectedCountry: string }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [stlFile, setStlFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [tags, setTags] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        let finalImageUrl = undefined;
        let finalStlUrl = undefined;
        let finalStlName = undefined;

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { data: uploadData, error } = await supabase.storage.from('marketplace_files').upload(fileName, imageFile);
            if (!error && uploadData) {
                const { data: { publicUrl } } = supabase.storage.from('marketplace_files').getPublicUrl(uploadData.path);
                finalImageUrl = publicUrl;
            } else {
                alert('Image upload failed: ' + error?.message);
                setUploading(false); return;
            }
        }

        if (stlFile) {
            const fileExt = stlFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { data: uploadData, error } = await supabase.storage.from('marketplace_files').upload(fileName, stlFile);
            if (!error && uploadData) {
                const { data: { publicUrl } } = supabase.storage.from('marketplace_files').getPublicUrl(uploadData.path);
                finalStlUrl = publicUrl;
                finalStlName = stlFile.name;
            } else {
                alert('STL upload failed: ' + error?.message);
                setUploading(false); return;
            }
        }

        onSubmit({
            authorEmail: currentUserEmail,
            title,
            content,
            imageUrl: finalImageUrl,
            stlFileName: finalStlName,
            stlFileUrl: finalStlUrl,
            tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
            country: selectedCountry
        });
        setUploading(false);
    }

    return (
        <div className="form-container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '8px' }}>
            <div className="form-header">
                <h2>Create a Community Post</h2>
                <p>Discuss projects or share files</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Title</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Interesting Title..." style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Tags (Comma Separated)</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="#ChatRoom, #Help, #Mechanical" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Content</label>
                    <textarea required value={content} onChange={e => setContent(e.target.value)} rows={6} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}></textarea>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Image Upload (Optional)</label>
                    <input type="file" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setImageFile(file);
                    }} style={{ cursor: 'pointer' }} />
                    {imageFile && <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.2rem' }}>{imageFile.name} selected</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>STL / 3D Model Upload (Optional)</label>
                    <input type="file" accept=".stl" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setStlFile(file);
                    }} style={{ cursor: 'pointer' }} />
                    {stlFile && <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.2rem' }}>{stlFile.name} selected</p>}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                        {uploading ? 'Processing securely...' : 'Post to Community'}
                    </button>
                </div>
            </form>
        </div>
    )
}
