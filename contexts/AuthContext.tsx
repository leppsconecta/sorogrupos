
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile, Company } from '../types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    company: Company | null;
    onboardingCompleted: boolean;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ error: any }>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState(true); // Default true mainly to avoid flash of blocked state before load
    const [loading, setLoading] = useState(true);

    const fetchProfileData = async (userId: string) => {
        try {
            // Get Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            setProfile(profileData);

            // Get Company
            const { data: companyData } = await supabase
                .from('companies')
                .select('*')
                .eq('owner_id', userId)
                .single();

            setCompany(companyData);

            // Check Onboarding Logic
            let completed = true;

            // 1. Profile Check
            if (!profileData) {
                console.log('Onboarding Check: Profile null');
                completed = false;
            } else if (!profileData.full_name) {
                console.log('Onboarding Check: Profile Name missing');
                completed = false;
            } else if (!profileData.whatsapp) {
                console.log('Onboarding Check: Profile WhatsApp missing');
                completed = false;
            }

            // 2. Company Check
            if (!companyData) {
                console.log('Onboarding Check: Company null');
                completed = false;
            } else if (!companyData.name) {
                console.log('Onboarding Check: Company Name missing');
                completed = false;
            } else if (!companyData.zip_code) {
                console.log('Onboarding Check: Company ZipCode missing');
                completed = false;
            } else if (!companyData.whatsapp) {
                console.log('Onboarding Check: Company WhatsApp missing');
                completed = false;
            } else if (!companyData.email) {
                console.log('Onboarding Check: Company Email missing');
                completed = false;
            }

            setOnboardingCompleted(completed);

        } catch (error) {
            console.error('Error fetching profile:', error);
            // Default to incomplete if error
            setOnboardingCompleted(false);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfileData(session.user.id).then(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfileData(session.user.id).then(() => setLoading(false));
                // If it's a SIGNED_IN event, we might want to ensure fetching happens
            } else {
                setProfile(null);
                setCompany(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshProfile = async () => {
        if (user) {
            await fetchProfileData(user.id);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        return { data, error };
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, company, onboardingCompleted, refreshProfile, signOut, signInWithGoogle, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
