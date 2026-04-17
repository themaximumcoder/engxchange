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
    locationFilter?: string;
    onLocationFilterChange?: (loc: string) => void;
    availableLocations?: string[];
}

export function Navbar({ isLoggedIn, searchQuery, onSearchChange, onLogoutClick, suggestions, notifications = [], avatarUrl, locationFilter, onLocationFilterChange, availableLocations }: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine context-aware placeholder
    const isForum = location.pathname === '/forum';
    const placeholderText = isForum ? "Search forum conversations..." : "Search items for sale...";

    return (
        <nav className="navbar" style={{ height: '140px' }}>
            <div className="container nav-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '1rem', padding: '0 0.5rem' }}>
                <Link to="/" className="nav-brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none', marginLeft: '-15px' }}>
                    <img src="/website_logo.png" alt="engXchange Logo" style={{ height: '112px', objectFit: 'contain' }} />
                </Link>

                <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div className="search-group" style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '480px' }}>
                        <input
                            type="text"
                            list="search-suggestions"
                            placeholder={placeholderText}
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            style={{ padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', flex: 2, minWidth: '120px', fontSize: '0.95rem', color: '#374151', outline: 'none' }}
                        />
                        {availableLocations && availableLocations.length > 0 && (
                            <select
                                value={locationFilter}
                                onChange={(e) => onLocationFilterChange?.(e.target.value)}
                                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #d1d5db', flex: 1, maxWidth: '160px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer', outline: 'none', background: '#fff' }}
                            >
                                <option value="all">All Locations</option>
                                {availableLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        )}
                        {suggestions && suggestions.length > 0 && (
                            <datalist id="search-suggestions">
                                {Array.from(new Set(suggestions)).map((s, idx) => (
                                    <option key={idx} value={s} />
                                ))}
                            </datalist>
                        )}
                    </div>

                    <div className="nav-right-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                        <div className="nav-links-desktop" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderRight: '1px solid #e5e7eb', paddingRight: '0.75rem' }}>
                            <Link to="/forum" className="nav-link-secondary" style={{ fontSize: '0.9rem' }}>Community</Link>
                            {isLoggedIn && (
                                <>
                                    <Link to="/inbox" className="nav-link-secondary" style={{ color: '#10b981', fontSize: '0.9rem' }}>Messages</Link>
                                    <Link to="/dashboard" className="nav-link-secondary" style={{ fontSize: '0.9rem' }}>Dashboard</Link>
                                </>
                            )}
                        </div>

                        {!isLoggedIn ? (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => navigate('/login')}>Log In</button>
                                <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', borderColor: '#6366f1', color: '#6366f1', fontWeight: 'bold' }} onClick={() => navigate('/register')}>Sign Up</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/notifications')}>
                                    <span style={{ fontSize: '1.25rem' }}>🔔</span>
                                    {notifications.filter(n => !n.read).length > 0 && (
                                        <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', padding: '0.1rem 0.3rem', borderRadius: '50%' }}>
                                            {notifications.filter(n => !n.read).length}
                                        </span>
                                    )}
                                </div>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" onClick={() => navigate('/profile')} style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover', border: '1.5px solid #2563eb' }} />
                                ) : (
                                    <button className="btn btn-outline" onClick={() => navigate('/profile')} style={{ color: '#2563eb', borderColor: '#2563eb', padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}>Profile</button>
                                )}
                                <button className="btn btn-outline" onClick={onLogoutClick} style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}>Sign Out</button>
                            </div>
                        )}

                        <Link to="/list" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            List an Item
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
