import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { MarketplaceItem, Report } from '../types';

interface AdminStats {
    items: number;
    posts: number;
    usersTotal: number;
    usersToday: number;
}

export function AdminDashboard({ items = [] }: { items?: MarketplaceItem[] }) {
    console.log(`Admin context: handling ${items.length} marketplace items.`);
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<AdminStats>({ items: 0, posts: 0, usersTotal: 0, usersToday: 0 });
    const [loading, setLoading] = useState(true);

    const loadReports = useCallback(async () => {
        const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
        if (data) setReports(data as Report[]);

        // Fetch highly efficient DB aggregate counts dynamically
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [rItems, rPosts, rUsersTotal, rUsersToday] = await Promise.all([
            supabase.from('items').select('*', { count: 'exact', head: true }),
            supabase.from('posts').select('*', { count: 'exact', head: true }),
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString())
        ]);

        setStats({
            items: rItems.count || 0,
            posts: rPosts.count || 0,
            usersTotal: rUsersTotal.count || 0,
            usersToday: rUsersToday.count || 0
        });

        setLoading(false);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            loadReports();
        }, 0);
    }, [loadReports]);

    const handleDeleteContent = async (reportId: string, itemId: string, itemType: string) => {
        if (!window.confirm('Are you absolutely sure you want to permanently delete this content from the database?')) return;

        const table = itemType === 'item' ? 'items' : itemType === 'post' ? 'posts' : 'comments';

        // Destructive Wipe
        await supabase.from(table).delete().eq('id', itemId);

        // Clear Report
        await supabase.from('reports').delete().eq('id', reportId);

        window.alert('Content successfully eradicated.');
        loadReports();
    };

    const handleDismiss = async (reportId: string) => {
        await supabase.from('reports').delete().eq('id', reportId);
        loadReports();
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading moderation queue...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '12px', minHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #f87171', paddingBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: '#991b1b', fontSize: '1.8rem' }}>Admin Dashboard 🛡️</h2>
                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
                    {reports.length} Active Reports
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.items}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Active Listings</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.posts}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Forum Posts</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.usersTotal}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Total Students</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>+{stats.usersToday}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>New Registers Today</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#10b981', background: '#ecfdf5', borderRadius: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Zero Active Reports!</h3>
                        <p style={{ marginTop: '0.5rem' }}>The community is perfectly clean.</p>
                    </div>
                ) : reports.map(r => (
                    <div key={r.id} style={{ padding: '1.5rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <strong style={{ fontSize: '1.1rem', textTransform: 'capitalize', color: '#991b1b' }}>Reported {r.item_type}</strong>
                            <small style={{ color: '#7f1d1d' }}>{new Date(r.created_at).toLocaleString()}</small>
                        </div>
                        <div style={{ background: '#fff', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Reporting User:</strong> {r.reported_by}</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Target ID:</strong> <code style={{ color: '#2563eb' }}>{r.item_id}</code></p>
                            <p style={{ margin: '0' }}><strong>Complaint Reason:</strong> <span style={{ color: '#dc2626' }}>{r.reason}</span></p>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444', flex: 1 }} onClick={() => handleDeleteContent(r.id, r.item_id, r.item_type)}>
                                Execute Content Deletion
                            </button>
                            <button className="btn btn-outline" style={{ background: '#fff', flex: 1 }} onClick={() => handleDismiss(r.id)}>
                                Dismiss (False Alarm)
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
