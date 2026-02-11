"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
                    <h2 className="text-2xl font-bold mb-4">Algo salió muy mal!</h2>
                    <p className="text-white/60 mb-8">{error.message}</p>
                    <button
                        className="px-4 py-2 bg-white text-black rounded hover:bg-white/90 font-medium"
                        onClick={() => reset()}
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </body>
        </html>
    );
}
