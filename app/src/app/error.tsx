'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Report to your observability stack (Loki/Grafana) instead of swallowing
        console.error('Unhandled application error:', error);
    }, [error]);

    return (
        <div className="pf-error-page">
            <style>{`
                .pf-error-page {
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    text-align: center;
                    font-family: inherit;
                }
                .pf-error-card {
                    max-width: 480px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .pf-error-code {
                    font-size: 72px;
                    font-weight: 800;
                    line-height: 1;
                    margin: 0;
                    color: #9c27b0;
                }
                html.light .pf-error-code { color: #6B21A8; }
                .pf-error-title {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                }
                .pf-error-message {
                    font-size: 16px;
                    margin: 0;
                    opacity: 0.7;
                }
                .pf-error-button {
                    margin-top: 8px;
                    padding: 10px 24px;
                    font-size: 15px;
                    font-weight: 600;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    background: #9c27b0;
                    color: #ffffff;
                    transition: opacity 0.2s ease;
                }
                html.light .pf-error-button { background: #6B21A8; }
                .pf-error-button:hover { opacity: 0.85; }
                .pf-error-digest {
                    font-size: 12px;
                    opacity: 0.4;
                    font-family: monospace;
                }
            `}</style>
            <div className="pf-error-card" role="alert">
                <p className="pf-error-code">Oops!</p>
                <h1 className="pf-error-title">Something went wrong</h1>
                <p className="pf-error-message">
                    An unexpected error occurred while loading this page. Please try again.
                </p>
                {error.digest && <p className="pf-error-digest">Error ID: {error.digest}</p>}
                <button className="pf-error-button" onClick={() => reset()}>
                    Try again
                </button>
            </div>
        </div>
    );
}
