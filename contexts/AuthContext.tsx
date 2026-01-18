
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, Company, AccountStatus, UserAccount, UserSubscription } from '../types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    company: Company | null;
    account: UserAccount | null;
    accountStatus: AccountStatus;
    planType: string | null;
    subscription: UserSubscription | null;
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
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [account, setAccount] = useState<UserAccount | null>(null);
    const [accountStatus, setAccountStatus] = useState<AccountStatus>('trial');
    const [planType, setPlanType] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
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

            // Get Account Status
            const { data: accountData } = await supabase
                .from('user_accounts')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (accountData) {
                setAccount(accountData);
                setAccountStatus(accountData.status as AccountStatus);
            }

            // Get Subscription Plan
            const { data: subData } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (subData) {
                setSubscription(subData);
                setPlanType(subData.plan_type);
            }

            // Check Onboarding Logic
            let completed = true;

            if (!profileData || !profileData.status_created) {
                completed = false;
            }

            if (!companyData || !companyData.status_created) {
                completed = false;
            }

            setOnboardingCompleted(completed);

        } catch (error) {
            console.error('Error fetching profile:', error);
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
                // Do not set loading(true) here to avoid unmounting the app and losing local state
                // Just fetch/update data in the background
                fetchProfileData(session.user.id).catch(console.error);
            } else {
                setProfile(null);
                setCompany(null);
                setAccount(null);
                setAccountStatus('trial');
                setPlanType(null);
                setSubscription(null);
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
        <AuthContext.Provider value={{
            session,
            user,
            profile,
            company,
            account,
            accountStatus,
            planType,
            subscription,
            onboardingCompleted,
            refreshProfile,
            signOut,
            signInWithGoogle,
            loading
        }}>
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
