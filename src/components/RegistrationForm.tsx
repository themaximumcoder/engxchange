import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UNIVERSITY_PRESETS } from '../lib/universityData';

export function RegistrationForm({ onComplete }: { onComplete: () => void }) {
    const [selectedCountry, setSelectedCountry] = useState<'UK' | 'Malaysia'>('UK');
    const [universities, setUniversities] = useState<{ name: string }[]>([]);
    const [selectedUni, setSelectedUni] = useState('');
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const filtered = UNIVERSITY_PRESETS
            .filter(u => u.country === selectedCountry)
            .map(u => ({ name: u.name }))
            .sort((a, b) => a.name.localeCompare(b.name));
        
        setUniversities(filtered);
        if (filtered.length > 0) {
            setSelectedUni(filtered[0].name);
        }
    }, [selectedCountry]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isUK = selectedCountry === 'UK';
        const requiredDomain = isUK ? '.ac.uk' : '.edu.my';
        
        if (!email.toLowerCase().endsWith(requiredDomain)) {
            alert(`Only ${selectedCountry} university student accounts (${requiredDomain}) are permitted for this region.`);
            return;
        }

        setLoading(true);
        try {
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

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email, password
            });
            if (authError) throw authError;

            const { error: dbError } = await supabase.from('users').insert([
                { id: authData.user?.id, email, username, university: selectedUni, gender, phone, country: selectedCountry }
            ]);

            if (dbError) throw dbError;

            alert('Registration complete! Please check your email to verify your account before logging in.');
            onComplete();
        } catch (err: unknown) {
            console.error('Registration Error:', err);
            alert('Registration failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{ padding: '2.5rem', maxWidth: '500px', margin: '2rem auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                 <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>Student Verification</div>
            </div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', color: '#111827' }}>Create Account</h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Please use your official university credentials to join the marketplace.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Select Your Region <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            type="button"
                            onClick={() => setSelectedCountry('UK')}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '2px solid', borderColor: selectedCountry === 'UK' ? '#2563eb' : '#e5e7eb', background: selectedCountry === 'UK' ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            🇬🇧 UK
                        </button>
                        <button 
                            type="button"
                            onClick={() => setSelectedCountry('Malaysia')}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '2px solid', borderColor: selectedCountry === 'Malaysia' ? '#2563eb' : '#e5e7eb', background: selectedCountry === 'Malaysia' ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            🇲🇾 Malaysia
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Username <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" required value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="e.g. FutureEngineer" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Select University <span style={{ color: '#ef4444' }}>*</span></label>
                    <select required value={selectedUni} onChange={e => setSelectedUni(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                        {universities.map((u, i) => <option key={i} value={u.name}>{u.name}</option>)}
                    </select>
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
                    <label style={{ fontWeight: 600, color: '#374151' }}>University Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} 
                        placeholder={selectedCountry === 'UK' ? "student@university.ac.uk" : "student@university.edu.my"} 
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="••••••••" minLength={6} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, color: '#374151' }}>Phone Number <span style={{ color: '#9ca3af', fontWeight: 'normal', fontSize: '0.9rem' }}>(Optional)</span></label>
                    <input 
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} 
                        placeholder={selectedCountry === 'UK' ? "+44 7XXX XXXXXX" : "+60 1X-XXXXXXX"} 
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                    style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                    {loading ? 'Verifying...' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
}
