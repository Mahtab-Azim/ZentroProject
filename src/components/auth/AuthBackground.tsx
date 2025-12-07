import React from 'react';

export function AuthBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Single background layer that adapts to theme */}
            <div className="absolute inset-0 transition-colors duration-500 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                >
                    {/* Large shape top right - light blue in light mode, dark in dark mode */}
                    <path
                        d="M700 0 L1000 0 L1000 600 L600 300 Z"
                        className="transition-all duration-500 fill-blue-200/60 dark:fill-slate-700/40"
                    />
                    {/* Shape bottom right - vibrant blue in light mode, blue in dark mode */}
                    <path
                        d="M800 1000 L1000 1000 L1000 700 L500 1000 Z"
                        className="transition-all duration-500 fill-blue-400/50 dark:fill-blue-900/30"
                    />
                    {/* Shape bottom left - light blue in light mode, dark in dark mode */}
                    <path
                        d="M0 1000 L400 1000 L0 600 Z"
                        className="transition-all duration-500 fill-indigo-200/60 dark:fill-slate-800/50"
                    />
                    {/* Central colorful blobs for glassmorphism - vibrant in light mode */}
                    <circle
                        cx="500"
                        cy="400"
                        r="250"
                        className="transition-all duration-500 fill-blue-300/40 dark:fill-blue-500/20 blur-3xl"
                    />
                    <circle
                        cx="600"
                        cy="600"
                        r="200"
                        className="transition-all duration-500 fill-indigo-300/40 dark:fill-purple-500/20 blur-3xl"
                    />
                </svg>
            </div>
        </div>
    );
}
