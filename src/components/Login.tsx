import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.toLowerCase().endsWith('.ac.uk')) {
            alert('Only UK university student accounts (.ac.uk) are permitted to log in.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            onLoginSuccess();
        } catch (err: unknown) {
            alert('Login failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            alert('Please manually type your email address into the box first so we know where to send the reset link.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/update-password',
        });
        setLoading(false);
        if (error) {
            alert('Failed to send reset email: ' + error.message);
        } else {
            alert('Password reset link successfully securely dispatched! Please check your .ac.uk university email securely.');
        }
    };

    return (
        <div className="form-container" style={{ padding: '2.5rem', maxWidth: '400px', margin: '4rem auto', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#111827' }}>engXchange Login</h2>
                <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.9rem' }}>Secure access to your student account</p>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>University Email (.ac.uk)</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                        placeholder="student@ed.ac.uk"
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1rem', fontWeight: 'bold', marginTop: '1rem', borderRadius: '8px' }}>
                    {loading ? 'Authenticating...' : 'Sign In To System'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button type="button" onClick={handleForgotPassword} disabled={loading} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
                        Trouble logging in? Reset Password
                    </button>
                </div>
            </form>
        </div>
    );
}
