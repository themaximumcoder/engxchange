export function TermsPage() {
    return (
        <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', background: '#fff', margin: '2rem auto', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h1 style={{ marginBottom: '1.5rem', color: '#111827' }}>Conditions of Use</h1>
            <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '1rem' }}>
                Welcome to engXchange. By using our platform, you agree strictly to the following terms and conditions. Our community is built primarily for UK engineering students to securely buy, sell, and showcase their projects.
            </p>
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>1. User Authentication</h3>
            <p style={{ color: '#4b5563', lineHeight: 1.6 }}>All users must register using a verified `.ac.uk` university email. Any abuse or fraudulent activity may result in an immediate permanent ban.</p>
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>2. Marketplace Liability</h3>
            <p style={{ color: '#4b5563', lineHeight: 1.6 }}>We are not responsible for transactions gone wrong. Ensure you verify the seller, communicate securely, and always meet in safe, public environments on campus when trading parts or components.</p>
        </div>
    );
}

export function ContactPage() {
    return (
        <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', background: '#fff', margin: '2rem auto', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h1 style={{ marginBottom: '1.5rem', color: '#111827' }}>Contact Us</h1>
            <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '1rem' }}>
                Need help, have a suggestion, or want to report an issue? Our primary support channels are actively monitored!
            </p>
            <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
                <h4 style={{ margin: 0, color: '#374151' }}>Email Us Directly</h4>
                <a href="mailto:engxedinburgh@gmail.com" style={{ display: 'block', fontSize: '1.2rem', color: '#2563eb', fontWeight: 'bold', marginTop: '0.5rem', textDecoration: 'none' }}>engxedinburgh@gmail.com</a>
            </div>
            <p style={{ marginTop: '2rem', color: '#6b7280', fontSize: '0.9rem' }}>We try our absolute best to respond exactly within 48 business hours to all general student inquiries.</p>
        </div>
    );
}

export function WorkWithUsPage() {
    return (
        <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', background: '#fff', margin: '2rem auto', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h1 style={{ marginBottom: '1.5rem', color: '#111827' }}>Work With Us</h1>
            <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '1rem' }}>
                Are you highly passionate about engineering and technology? We are consistently actively looking for campus ambassadors and technical maintainers to join the engXchange team.
            </p>
            <ul style={{ color: '#4b5563', lineHeight: 2, marginTop: '2rem', paddingLeft: '1.5rem' }}>
                <li><strong>Campus Ambassadors:</strong> Help us launch engXchange smoothly at your local university! You'll be the immediate point-of-contact for student outreach.</li>
                <li><strong>Open Source Contributors:</strong> We welcome heavily dedicated React developers specifically to help build out new 3D manipulation engine features.</li>
                <li><strong>Partnerships:</strong> If you represent heavily recognized engineering societies, we want to closely partner with you.</li>
            </ul>
            <p style={{ marginTop: '2rem', color: '#111827', fontWeight: 600 }}>Please send your formal applications or inquiries strictly to: engxedinburgh@gmail.com</p>
        </div>
    );
}

export function PrivacyPage() {
    return (
        <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', background: '#fff', margin: '2rem auto', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h1 style={{ marginBottom: '1.5rem', color: '#111827' }}>Privacy Policy</h1>
            <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '1rem' }}>
                At engXchange, we take student data privacy extremely seriously. This policy is primarily designed to inform you how we collect and use your data when using our marketplace and forum.
            </p>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>1. Information Collection</h3>
            <p style={{ color: '#4b5563', lineHeight: 1.6 }}>We collect your university email address (`.ac.uk`) for authentication purposes and any data you voluntarily provide when creating marketplace listings or forum posts.</p>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>2. Data Usage</h3>
            <p style={{ color: '#4b5563', lineHeight: 1.6 }}>Your contact information is only shared with other users when you explicitly choose to engage in a trade or message them. We do not sell your data to third-party marketing companies.</p>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>3. Cookies & Advertising</h3>
            <p style={{ color: '#4b5563', lineHeight: 1.6 }}>We use cookies to maintain your session and analyze site traffic. We may use third-party advertising services (like Google AdSense) which use cookies to serve ads based on your visits to this and other websites.</p>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>4. Your Rights</h3>
            <p style={{ color: '#4b5563', lineHeight: 1.6 }}>You have the absolute right to request the deletion of your account and all associated data at any time. Please contact us via our support email to initiate this process.</p>
        </div>
    );
}
