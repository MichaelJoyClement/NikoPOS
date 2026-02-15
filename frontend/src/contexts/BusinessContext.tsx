'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

interface Business {
    id: string;
    name: string;
}

interface BusinessContextType {
    businessId: string | null;
    setBusinessId: (id: string) => void;
    businesses: Business[];
    refreshBusinesses: () => Promise<void>;
    isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshBusinesses = async () => {
        try {
            const response = await api.get('/businesses');
            setBusinesses(response.data);
            // Auto-select first business if none selected
            if (!businessId && response.data.length > 0) {
                setBusinessId(response.data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch businesses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshBusinesses();
    }, []);

    return (
        <BusinessContext.Provider
            value={{
                businessId,
                setBusinessId,
                businesses,
                refreshBusinesses,
                isLoading,
            }}
        >
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusiness() {
    const context = useContext(BusinessContext);
    if (context === undefined) {
        throw new Error('useBusiness must be used within a BusinessProvider');
    }
    return context;
}
