import type { Notification } from '../types';

export function NotificationsPage({ notifications, onMarkRead }: { notifications: Notification[], onMarkRead: (id: string) => Promise<void> }) {
    return (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', minHeight: '600px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb', color: '#1e293b' }}>
                🔔 Activity Alerts
            </h2>
            {notifications.filter(n => !n.read).length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>You have no new notifications.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {notifications.filter(n => !n.read).map(n => (
                        <div 
                            key={n.id} 
                            onClick={() => onMarkRead(n.id)}
                            style={{ 
                                padding: '1.25rem', 
                                background: '#eff6ff', 
                                borderRadius: '12px', 
                                border: '1px solid #bfdbfe',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                                <strong style={{ color: '#1e3a8a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {n.type === 'message' ? '💬 Direct Message' : n.type === 'like' ? '❤️ Interest Alert' : '🗣️ Forum Activity'}
                                </strong>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem' }}>{n.message}</p>
                            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
                                Click to dismiss &rarr;
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
