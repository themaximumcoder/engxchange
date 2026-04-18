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
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-brand">
                    <img src="/website_logo.png" alt="engXchange Logo" className="nav-logo-img" />
                </Link>

                <div className="nav-actions">
                    <div className="search-group">
                        <input
                            type="text"
                            list="search-suggestions"
                            placeholder={placeholderText}
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="search-input"
                        />
                        {availableLocations && availableLocations.length > 0 && (
                            <select
                                value={locationFilter}
                                onChange={(e) => onLocationFilterChange?.(e.target.value)}
                                className="location-select"
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

                    <div className="nav-right-group">
                        <div className="nav-links-desktop">
                            <Link to="/" className="nav-link-secondary">Marketplace</Link>
                            <Link to="/forum" className="nav-link-secondary">Community</Link>
                            {isLoggedIn && (
                                <>
                                    <Link to="/inbox" className="nav-link-secondary highlight-messages">Messages</Link>
                                    <Link to="/dashboard" className="nav-link-secondary">Dashboard</Link>
                                </>
                            )}
                        </div>

                        {!isLoggedIn ? (
                            <div className="auth-buttons">
                                <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Log In</button>
                                <button className="btn btn-outline btn-sm btn-signup" onClick={() => navigate('/register')}>Sign Up</button>
                            </div>
                        ) : (
                            <div className="user-group">
                                <div className="notification-bell" onClick={() => navigate('/notifications')}>
                                    <span style={{ fontSize: '1.25rem' }}>🔔</span>
                                    {notifications.filter(n => !n.read).length > 0 && (
                                        <span className="notification-badge">
                                            {notifications.filter(n => !n.read).length}
                                        </span>
                                    )}
                                </div>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" onClick={() => navigate('/profile')} className="nav-avatar" />
                                ) : (
                                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/profile')}>Profile</button>
                                )}
                                <button className="btn btn-outline btn-sm btn-logout" onClick={onLogoutClick}>Sign Out</button>
                            </div>
                        )}

                        <Link to="/list" className="btn btn-primary list-btn">
                            List an Item
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
