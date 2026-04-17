import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Automatically check if we have a valid hash token from the email URL
        const checkHash = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Invalid or expired reset token. Please request a new password reset link.');
                navigate('/login');
            }
        };
        checkHash();
    }, [navigate]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            alert('Failed to update password: ' + error.message);
        } else {
            alert('Password successfully updated! You can now access your dashboard.');
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Set New Password 🔐</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Enter a strong new password for your account below.
            </p>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '1rem', fontWeight: 'bold' }}>
                    {loading ? 'Updating Identity...' : 'Confirm New Password'}
                </button>
            </form>
        </div>
    );
}
