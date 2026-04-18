import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { Project } from '../types';

export function Profile({ session, onProfileUpdate }: { session: Session | null, onProfileUpdate?: () => void }) {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [university, setUniversity] = useState('');
    const [degree, setDegree] = useState('');
    const [yearOfStudy, setYearOfStudy] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');

    const [universities, setUniversities] = useState<string[]>([]);
    const [fetchingUnis, setFetchingUnis] = useState(true);

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectTitle, setProjectTitle] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [projectImage, setProjectImage] = useState<File | null>(null);
    const [uploadingProject, setUploadingProject] = useState(false);

    const DEGREES = [
        'Computer Science', 'Software Engineering', 'Mechanical Engineering',
        'Electrical & Electronic Engineering', 'Chemical Engineering',
        'Civil Engineering', 'Aerospace Engineering', 'Biomedical Engineering', 'Other'
    ];

    const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Master', 'PhD'];

    useEffect(() => {
        let active = true;
        const loadProfile = async () => {
            if (!session?.user?.id) return;
            const { data } = await supabase.from('users').select('username, university, degree, year_of_study, profile_picture_url').eq('id', session.user.id).single();
            if (active && data) {
                // If username is empty, use email prefix as a cute default
                const defaultName = session.user.email?.split('@')[0] || '';
                setUsername(data.username || defaultName);
                // Default to Edinburgh if not set, following the user's base
                setUniversity(data.university || 'University of Edinburgh');
                setDegree(data.degree || 'Engineering');
                setYearOfStudy(data.year_of_study || 'Year 1');
                setProfilePictureUrl(data.profile_picture_url || '/avatars/robot.png');
            } else if (active && session.user.email) {
                // Fallback for brand new profiles
                setUsername(session.user.email.split('@')[0]);
                setUniversity('University of Edinburgh');
                setDegree('Engineering');
                setYearOfStudy('Year 1');
                setProfilePictureUrl('/avatars/robot.png');
            }
            if (active) setLoading(false);
        };

        const loadProjects = async () => {
            if (!session?.user?.id) return;
            const { data } = await supabase.from('projects').select('*').eq('user_email', session.user.email).order('created_at', { ascending: false });
            if (active && data) setProjects(data as Project[]);
        };

        const fetchUnis = async () => {
            try {
                const res = await fetch('https://universities.hipolabs.com/search?country=United+Kingdom');
                const data = await res.json();
                if (active) {
                    const uniqueNames = Array.from(new Set<string>(data.map((u: { name: string }) => u.name as string)));
                    uniqueNames.sort((a, b) => a.localeCompare(b));
                    setUniversities(['University of Edinburgh', 'Heriot-Watt University', 'Edinburgh Napier University', ...uniqueNames.filter(n => !['University of Edinburgh', 'Heriot-Watt University', 'Edinburgh Napier University'].includes(n))]);
                    setFetchingUnis(false);
                }
            } catch {
                if (active) {
                    setUniversities(['University of Edinburgh', 'Heriot-Watt University', 'Edinburgh Napier University']);
                    setFetchingUnis(false);
                }
            }
        };

        loadProfile();
        loadProjects();
        fetchUnis();
        return () => { active = false; };
    }, [session]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!session?.user?.id) throw new Error('No active session.');
            const updates = { 
                id: session.user.id,
                email: session.user.email,
                username, 
                university, 
                degree, 
                year_of_study: yearOfStudy, 
                profile_picture_url: profilePictureUrl 
            };
            const { error: dbError } = await supabase.from('users').upsert(updates);
            if (dbError) throw dbError;
            if (onProfileUpdate) await onProfileUpdate();
            alert('Profile configuration locked and updated successfully!');
        } catch (err: any) {
            console.error('Full Profile Error Context:', err);
            const msg = err.message || (typeof err === 'string' ? err : 'Unknown database constraint error');
            alert('Error updating profile: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.email) return;
        setUploadingProject(true);
        try {
            let imageUrl = '';
            if (projectImage) {
                const ext = projectImage.name.split('.').pop();
                const fileName = `portfolio_${Date.now()}_${Math.random()}.${ext}`;
                const { error: uploadError } = await supabase.storage.from('marketplace_files').upload(`projects/${fileName}`, projectImage);
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('marketplace_files').getPublicUrl(`projects/${fileName}`);
                imageUrl = publicUrl;
            }

            const { error } = await supabase.from('projects').insert([{
                user_email: session.user.email,
                title: projectTitle,
                description: projectDesc,
                image_url: imageUrl
            }]);

            if (error) throw error;

            alert('Awesome! Your project has been added safely to your social portfolio.');
            setProjectTitle(''); setProjectDesc(''); setProjectImage(null);

            const { data } = await supabase.from('projects').select('*').eq('user_email', session.user.email).order('created_at', { ascending: false });
            if (data) setProjects(data as Project[]);

        } catch (err: unknown) {
            alert('Engine error processing upload: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
        setUploadingProject(false);
    };

    const handleDeleteProject = async (id: string) => {
        if (!window.confirm('Delete this project from your portfolio explicitly?')) return;
        await supabase.from('projects').delete().eq('id', id);
        setProjects(prev => prev.filter(p => p.id !== id));
    };

    if (loading && !username) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Synchronizing local systems tracking data...</div>;

    return (
        <div className="container" style={{ margin: '2rem auto', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

            <div style={{ flex: '1', minWidth: '300px', background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Edit Identity</h2>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600 }}>Profile Picture</label>
                        {profilePictureUrl && (
                            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                <img src={profilePictureUrl} alt="Preview" style={{ width: '180px', height: '180px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !session) return;
                            setLoading(true);
                            try {
                                const ext = file.name.split('.').pop();
                                const fileName = `avatar_${session.user.id}_${Date.now()}.${ext}`;
                                const { error: uploadError } = await supabase.storage.from('marketplace_files').upload(`avatars/${fileName}`, file);
                                if (uploadError) throw uploadError;

                                const { data: { publicUrl } } = supabase.storage.from('marketplace_files').getPublicUrl(`avatars/${fileName}`);
                                setProfilePictureUrl(publicUrl);
                                await supabase.from('users').update({ profile_picture_url: publicUrl }).eq('id', session.user.id);
                                alert('Profile picture dynamically uploaded and synced securely to your Identity!');
                            } catch (err: unknown) {
                                alert('Failed to completely upload avatar payload constraints: ' + (err instanceof Error ? err.message : 'Unknown error'));
                            } finally {
                                setLoading(false);
                            }
                        }} style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }} />
                        
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#64748b', display: 'block', marginBottom: '0.75rem' }}>
                                Or choose a funny engineering mascot:
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {[
                                    { id: 'robot', path: '/avatars/robot.png' },
                                    { id: 'sparky', path: '/avatars/sparky.png' },
                                    { id: 'coggy', path: '/avatars/coggy.png' },
                                    { id: 'strong', path: '/avatars/strong.png' }
                                ].map(avatar => (
                                    <button
                                        key={avatar.id}
                                        type="button"
                                        onClick={() => {
                                            setProfilePictureUrl(avatar.path);
                                        }}
                                        style={{
                                            border: profilePictureUrl === avatar.path ? '3px solid #6366f1' : '3px solid transparent',
                                            padding: '4px',
                                            borderRadius: '50%',
                                            background: 'none',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <img src={avatar.path} alt={avatar.id} style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600 }}>Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="CoolEngineer99" style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600 }}>University Base</label>
                        {fetchingUnis ? <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Querying Global Hipo Database...</span> : (
                            <select value={university} onChange={e => setUniversity(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                                <option value="">Select your specific UK university...</option>
                                {universities.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <label style={{ fontWeight: 600 }}>Academic Base</label>
                        <select value={degree} onChange={e => setDegree(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                            <option value="">Select a degree discipline...</option>
                            {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', marginTop: '0.5rem' }}>
                            <option value="">Select current year segment...</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
                        {loading ? 'Locking State...' : 'Save Global Profile'}
                    </button>

                    <button className="btn btn-outline" type="button" onClick={() => { supabase.auth.signOut(); window.location.href = '/'; }} style={{ color: '#ef4444', borderColor: '#ef4444', marginTop: '1rem' }}>
                        Logout Sessions Safely
                    </button>
                </form>
            </div>

            <div style={{ flex: '2', minWidth: '350px', background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '1rem', color: '#1e293b' }}>
                    My Project Portfolio 🚀
                </h2>

                <form onSubmit={handleAddProject} style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Showcase New Build</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" placeholder="Project Title (e.g. Robot Arm v2)" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                        <textarea placeholder="Tell the community how you built it and what materials you used!" value={projectDesc} onChange={e => setProjectDesc(e.target.value)} required rows={3} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                        <input type="file" accept="image/*" onChange={e => setProjectImage(e.target.files?.[0] || null)} style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }} />
                        <button type="submit" disabled={uploadingProject} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                            {uploadingProject ? 'Pushing arrays...' : 'Publish to Portfolio'}
                        </button>
                    </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {projects.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b' }}>Your portfolio is currently empty. Upload your first mechanism!</p>
                    ) : projects.map(p => (
                        <div key={p.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>{p.title}</h3>
                                <button onClick={() => handleDeleteProject(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.8rem' }}>Added {new Date(p.created_at).toLocaleDateString()}</span>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.5 }}>{p.description}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
