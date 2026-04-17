import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { Notification } from '../types';
import './Navbar.css';

interface NavbarProps {
    isLoggedIn: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onLogoutClick: () => void;
    suggestions?: string[];
    notifications?: Notification[];
    avatarUrl?: string;
}

export function Navbar({ isLoggedIn, searchQuery, onSearchChange, onLogoutClick, suggestions, notifications = [], avatarUrl }: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine context-aware placeholder
    const isForum = location.pathname === '/forum';
    const placeholderText = isForum ? "Search forum conversations..." : "Search items for sale...";

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <img src="/website_logo.png" alt="engXchange Logo" style={{ height: '48px', objectFit: 'contain' }} />
                    <span className="brand-text-container" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', fontFamily: '"Inter", sans-serif' }}>
                        <span style={{ color: '#000000' }}>Engineering</span>
                        <span style={{ color: '#ef4444', marginLeft: '0.2rem' }}>Exchange</span>
                    </span>
                </Link>
                <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            list="search-suggestions"
                            placeholder={placeholderText}
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', maxWidth: '300px', minWidth: '150px', fontSize: '1rem', color: '#374151' }}
                        />
                        {suggestions && suggestions.length > 0 && (
                            <datalist id="search-suggestions">
                                {Array.from(new Set(suggestions)).map((s, idx) => (
                                    <option key={idx} value={s} />
                                ))}
                            </datalist>
                        )}
                    </div>
                    {!isLoggedIn ? (
                        <>
                            <button className="btn btn-outline" onClick={() => navigate('/login')}>Log In</button>
                            <button className="btn btn-outline" onClick={() => navigate('/register')} style={{ borderColor: '#6366f1', color: '#6366f1', fontWeight: 'bold' }}>Sign Up</button>
                        </>
                    ) : (
                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" onClick={() => navigate('/profile')} style={{ width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover', border: '2px solid #2563eb', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            ) : (
                                <button className="btn btn-outline" onClick={() => navigate('/profile')} style={{ color: '#2563eb', borderColor: '#2563eb' }}>Profile</button>
                            )}
                            <button className="btn btn-outline" onClick={onLogoutClick} style={{ color: '#ef4444', borderColor: '#ef4444' }}>Sign Out</button>

                            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/notifications')}>
                                <span style={{ fontSize: '1.5rem' }}>🔔</span>
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '0.1rem 0.4rem', borderRadius: '50%' }}>
                                        {notifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="desktop-nav-group" style={{ display: 'flex', gap: '0.75rem', borderLeft: '1px solid #e5e7eb', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                        <Link to="/forum" className="nav-link-secondary" title="Community Forum">
                             Community
                        </Link>
                        {isLoggedIn && (
                            <>
                                <Link to="/inbox" className="nav-link-secondary" style={{ color: '#10b981' }} title="Private Messages">
                                    Messages
                                </Link>
                                <Link to="/dashboard" className="nav-link-secondary" title="My Dashboard">
                                    Dashboard
                                </Link>
                            </>
                        )}
                        <Link to="/list" className="btn btn-primary" style={{ textDecoration: 'none', marginLeft: '0.5rem', padding: '0.4rem 1rem' }}>
                            List an Item
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
