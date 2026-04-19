import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer style={{ background: '#111827', color: '#f9fafb', padding: '3rem 0', marginTop: 'auto' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>

                <div>
                    <h3 style={{ marginBottom: '1rem' }}>engXchange</h3>
                    <p style={{ color: '#9ca3af', lineHeight: 1.5 }}>
                        The premier marketplace and community for engineering students entirely deeply seated across UK Universities.
                    </p>
                </div>

                <div>
                    <h4 style={{ marginBottom: '1rem', color: '#f3f4f6' }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><Link to="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Conditions of Use</Link></li>
                        <li><Link to="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</Link></li>
                        <li><Link to="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact Us</Link></li>
                        <li><Link to="/work" style={{ color: '#9ca3af', textDecoration: 'none' }}>Work with Us</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ marginBottom: '1rem', color: '#f3f4f6' }}>Support</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li style={{ color: '#9ca3af' }}>Email: <a href="mailto:engxedinburgh@gmail.com" style={{ color: '#60a5fa', textDecoration: 'none' }}>engxedinburgh@gmail.com</a></li>
                        <li style={{ color: '#9ca3af' }}>Location: United Kingdom</li>
                    </ul>
                </div>

            </div>

            <div className="container" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #374151', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                &copy; {new Date().getFullYear()} engXchange. All rights reserved.
            </div>
        </footer>
    );
}
