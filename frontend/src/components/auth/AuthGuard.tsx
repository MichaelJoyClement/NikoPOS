'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isInitialized } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isInitialized && !isAuthenticated && pathname !== '/login') {
            router.push('/login');
        }
    }, [isInitialized, isAuthenticated, pathname, router]);

    // Show nothing while initializing
    if (!isInitialized) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium animate-pulse">Initializing application...</p>
                </div>
            </div>
        );
    }

    // If on login page, render children only
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // If not authenticated, don't show any layout components
    if (!isAuthenticated) {
        return null; // The useEffect will handle redirect
    }

    // Authenticated: Show full layout
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6 scrollbar-hide">
                    {children}
                </main>
            </div>
        </div>
    );
};
