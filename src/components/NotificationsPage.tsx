import type { Notification } from '../types';

export function NotificationsPage({ notifications, onMarkRead }: { notifications: Notification[], onMarkRead: (id: string) => Promise<void> }) {
    return (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', minHeight: '600px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb', color: '#1e293b' }}>
                🔔 Activity Alerts
            </h2>
            {notifications.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>You have no new notifications.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {notifications.map(n => (
                        <div key={n.id} style={{ padding: '1rem', background: n.read ? '#f8fafc' : '#eff6ff', borderRadius: '8px', border: `1px solid ${n.read ? '#e2e8f0' : '#bfdbfe'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                                <strong style={{ color: '#1e3a8a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {n.type === 'message' ? '💬 Direct Message' : '🗣️ Forum Comment'}
                                </strong>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem' }}>{n.message}</p>
                            {!n.read && (
                                <button
                                    onClick={() => onMarkRead(n.id)}
                                    style={{ marginTop: '0.75rem', fontSize: '0.75rem', background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Mark as Seen
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
