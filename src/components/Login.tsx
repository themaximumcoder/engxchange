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
        } catch (err: any) {
            alert('Login failed: ' + err.message);
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
        <div className="form-container" style={{ padding: '2.5rem', maxWidth: '400px', margin: '4rem auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', color: '#111827', textAlign: 'center' }}>Welcome Back</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Email Address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="student@university.ac.uk" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Password</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="••••••••" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', flex: 1 }}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                    <button type="button" onClick={handleForgotPassword} disabled={loading} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: '0 1rem' }}>
                        Forgot Password?
                    </button>
                </div>
            </form>
        </div>
    );
}
