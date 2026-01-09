import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored auth status on mount
        const loadAuthData = async () => {
            try {
                const storedAuth = await AsyncStorage.getItem('isAuthenticated');
                if (storedAuth === 'true') {
                    setIsAuthenticated(true);
                }
            } catch (e) {
                console.error('Failed to load auth data', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthData();
    }, []);

    const login = async () => {
        try {
            await AsyncStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
        } catch (e) {
            console.error('Failed to save auth data', e);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('isAuthenticated');
            setIsAuthenticated(false);
        } catch (e) {
            console.error('Failed to remove auth data', e);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
