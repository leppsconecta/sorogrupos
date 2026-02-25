
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, Company, AccountStatus, UserAccount, UserSubscription, Affiliate } from '../types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    company: Company | null;
    account: UserAccount | null;
    accountStatus: AccountStatus;
    planType: string | null;
    subscription: UserSubscription | null;
    affiliate: Affiliate | null;
    onboardingCompleted: boolean | null;
    affiliateOnboardingCompleted: boolean | null;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ error: any }>;
    updateCompany: (updates: Partial<Company>) => void;
    logOperatorAction: (action: string, details?: any) => Promise<void>;
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
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
    const [affiliateOnboardingCompleted, setAffiliateOnboardingCompleted] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [ipAddress, setIpAddress] = useState<string | null>(null);

    // Fetch IP on mount
    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setIpAddress(data.ip))
            .catch(err => console.error('Error fetching IP:', err));
    }, []);

    const getDeviceInfo = () => {
        const ua = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        return {
            type: isMobile ? 'mobile' : 'desktop',
            userAgent: ua,
            platform: navigator.platform
        };
    };

    const logOperatorAction = async (action: string, details: any = {}) => {
        if (!user) return;

        try {
            await supabase.from('operator_logs').insert({
                user_id: user.id,
                action,
                ip_address: ipAddress,
                device_info: getDeviceInfo(),
                details,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error logging operator action:', error);
        }
    };

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
                .maybeSingle();

            setCompany(companyData);

            // Get Account Status
            const { data: accountData } = await supabase
                .from('user_accounts')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (accountData) {
                setAccount(accountData);
                setAccountStatus(accountData.status as AccountStatus);
            }

            // Get Subscription Plan
            const { data: subData } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (subData) {
                setSubscription(subData);
                setPlanType(subData.plan_type);
            }

            // Get Affiliate optionally
            const { data: affiliateData } = await supabase
                .from('affiliates')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (affiliateData) {
                setAffiliate(affiliateData);
                // Affiliate Onboarding Completed se houver "name"
                setAffiliateOnboardingCompleted(!!affiliateData.name);
            } else {
                setAffiliate(null);
                setAffiliateOnboardingCompleted(null);
            }

            // Check Onboarding Logic (Candidatos e Empresas)
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
                // Just fetch/update data in the background
                fetchProfileData(session.user.id).catch(console.error);

                // Log Login only if it's a fresh session start (optional refinement, or just log every auth state change that has user)
                // To avoid spamming on refresh, we might need a flag or check.
                // Ideally, we log on explicit SIGN_IN event, but onAuthStateChange gives generic session updates.
                // For now, let's rely on the fact that this runs on mount/login.

                // However, calling logOperatorAction inside here might be tricky if 'user' state isn't set yet or if logOperatorAction depends on 'user' state.
                // Better to call it directly.
                // Actually, let's execute the log usage here directly to ensure we have the session user ID.

                /* 
                   NOTE: This runs on every auth change (token refresh, etc). 
                   To log only "LOGIN", we should check the event type if available, but the listener provides (event, session).
                */
                if (_event === 'SIGNED_IN') {
                    // We need to wait for IP, but it might not be ready.
                    // Let's force a quick fetch or use what we have.
                    // Since we can't await IP here easily without blocking, we'll just fire and forget.
                    // But we should use the `session.user.id` directly as `user` state might be stale.

                    const logLogin = async () => {
                        let ip = ipAddress;
                        if (!ip) {
                            try {
                                const res = await fetch('https://api.ipify.org?format=json');
                                const data = await res.json();
                                ip = data.ip;
                                setIpAddress(ip);
                            } catch { }
                        }

                        const ua = navigator.userAgent;
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
                        const deviceInfo = {
                            type: isMobile ? 'mobile' : 'desktop',
                            userAgent: ua,
                            platform: navigator.platform
                        };

                        await supabase.from('operator_logs').insert({
                            user_id: session.user.id,
                            action: 'LOGIN',
                            ip_address: ip,
                            device_info: deviceInfo,
                            details: {},
                            created_at: new Date().toISOString()
                        });
                    };
                    logLogin();
                }

            } else {
                setProfile(null);
                setCompany(null);
                setAccount(null);
                setAccountStatus('trial');
                setPlanType(null);
                setPlanType(null);
                setSubscription(null);
                setAffiliate(null);
                setOnboardingCompleted(null);
                setAffiliateOnboardingCompleted(null);
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
        if (user) {
            await logOperatorAction('LOGOUT');
        }
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

    const updateCompany = (updates: Partial<Company>) => {
        if (company) {
            setCompany({ ...company, ...updates });
        }
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
            affiliate,
            onboardingCompleted,
            affiliateOnboardingCompleted,
            refreshProfile,
            updateCompany,
            logOperatorAction,
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
