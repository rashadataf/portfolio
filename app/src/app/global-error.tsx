'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // global-error replaces the root layout, so it must render its own <html> and <body>.
    // It cannot rely on the theme provider or any app styling — keep it fully self-contained.
    return (
        <html lang="en">
            <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 24,
                        textAlign: 'center',
                        background: '#1a1a1a',
                        color: '#ffffff',
                    }}
                    role="alert"
                >
                    <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <p style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, margin: 0, color: '#9c27b0' }}>
                            Oops!
                        </p>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
                            Something went wrong
                        </h1>
                        <p style={{ fontSize: 16, margin: 0, opacity: 0.7 }}>
                            The application encountered a critical error. Please try reloading the page.
                        </p>
                        {error.digest && (
                            <p style={{ fontSize: 12, opacity: 0.4, fontFamily: 'monospace', margin: 0 }}>
                                Error ID: {error.digest}
                            </p>
                        )}
                        <button
                            onClick={() => reset()}
                            style={{
                                marginTop: 8,
                                padding: '10px 24px',
                                fontSize: 15,
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: '#9c27b0',
                                color: '#ffffff',
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
