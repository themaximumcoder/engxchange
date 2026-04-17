import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function RegistrationForm({ onComplete }: { onComplete: () => void }) {
    const [universities, setUniversities] = useState<{ name: string }[]>([]);
    const [selectedUni, setSelectedUni] = useState('');
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const fetchUnis = async () => {
            try {
                // External API can be flaky, we fetch UK list
                const res = await fetch('https://universities.hipolabs.com/search?country=United+Kingdom');
                if (!res.ok) throw new Error('API unreachable');
                const data = await res.json();
                if (active) {
                    const uniqueNames = Array.from(new Set<string>(data.map((u: any) => u.name as string)));
                    uniqueNames.sort((a, b) => a.localeCompare(b));
                    const mapped = uniqueNames.map(name => ({ name }));
                    setUniversities(mapped);
                    if (mapped.length > 0) setSelectedUni(mapped[0].name);
                    setLoading(false);
                }
            } catch (err) {
                if (active) {
                    console.error("Failed to fetch universities API, using internal list", err);
                    // Robust static fallback for major UK engineering schools
                    const fallbackUnis = [
                        'University of Edinburgh',
                        'Imperial College London',
                        'University of Oxford',
                        'University of Cambridge',
                        'University of Manchester',
                        'University of Glasgow',
                        'University of Strathclyde',
                        'Heriot-Watt University',
                        'Loughborough University',
                        'University of Bristol',
                        'University of Sheffield',
                        'University of Leeds',
                        'University of Nottingham',
                        'Other UK University'
                    ].sort().map(name => ({ name }));
                    setUniversities(fallbackUnis);
                    setSelectedUni('University of Edinburgh');
                    setLoading(false);
                }
            }
        };
        fetchUnis();
        return () => { active = false; };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.toLowerCase().endsWith('.ac.uk')) {
            alert('Only UK university student accounts (.ac.uk) are permitted to sign up.');
            return;
        }

        setLoading(true);
        try {
            // 1. Proactively check if email already exists in our public users table
            const { data: existingUser } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .maybeSingle();

            if (existingUser) {
                alert('This email is already registered. Please log in or use a different university email.');
                setLoading(false);
                return;
            }

            // 2. Securely create the user Auth credential
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email, password
            });
            if (authError) throw authError;

            // Push public profile data
            const { error: dbError } = await supabase.from('users').insert([
                { id: authData.user?.id, email, username, university: selectedUni, gender, phone }
            ]);

            if (dbError) throw dbError;

            alert('Registration complete! Please check your email to verify your account before logging in.');
            onComplete();
        } catch (err: any) {
            console.error('Registration Error:', err);
            alert('Registration failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{ padding: '2.5rem', maxWidth: '500px', margin: '2rem auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', color: '#111827' }}>Student Registration</h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Create an account to verify your student status and gain access to the marketplace.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Username <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" required value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="CoolEngineer99" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>University (Live Source) <span style={{ color: '#ef4444' }}>*</span></label>
                    {loading ? <p style={{ color: '#10b981' }}>Fetching live UK universities list...</p> : (
                        <select required value={selectedUni} onChange={e => setSelectedUni(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                            {universities.map((u, i) => <option key={i} value={u.name}>{u.name}</option>)}
                        </select>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Gender <span style={{ color: '#ef4444' }}>*</span></label>
                    <select required value={gender} onChange={e => setGender(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Student Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="student@university.ac.uk" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="••••••••" minLength={6} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Phone Number <span style={{ color: '#9ca3af', fontWeight: 'normal', fontSize: '0.9rem' }}>(Optional)</span></label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="+44 7123 456789" />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>Complete Registration</button>
            </form>
        </div>
    );
}
