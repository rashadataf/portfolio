import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="pf-notfound-page">
            <style>{`
                .pf-notfound-page {
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    text-align: center;
                }
                .pf-notfound-card {
                    max-width: 480px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .pf-notfound-code {
                    font-size: 96px;
                    font-weight: 800;
                    line-height: 1;
                    margin: 0;
                    color: #9c27b0;
                }
                html.light .pf-notfound-code { color: #6B21A8; }
                .pf-notfound-title {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                }
                .pf-notfound-message {
                    font-size: 16px;
                    margin: 0;
                    opacity: 0.7;
                }
                .pf-notfound-link {
                    margin-top: 8px;
                    padding: 10px 24px;
                    font-size: 15px;
                    font-weight: 600;
                    border-radius: 8px;
                    text-decoration: none;
                    background: #9c27b0;
                    color: #ffffff;
                    transition: opacity 0.2s ease;
                }
                html.light .pf-notfound-link { background: #6B21A8; }
                .pf-notfound-link:hover { opacity: 0.85; }
            `}</style>
            <div className="pf-notfound-card">
                <p className="pf-notfound-code">404</p>
                <h1 className="pf-notfound-title">Page not found</h1>
                <p className="pf-notfound-message">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link href="/" className="pf-notfound-link">
                    Back to home
                </Link>
            </div>
        </div>
    );
}
