
export interface Profile {
    id: string;
    full_name: string | null;
    whatsapp: string | null;
    role: string;
    created_at: string;
    updated_at: string;
}

export interface Company {
    id: string;
    owner_id: string;
    name: string;
    cnpj: string | null;
    // address removed
    zip_code: string | null;

    website: string | null;
    instagram: string | null;
    facebook: string | null;
    email: string | null;
    whatsapp: string | null;
    linkedin: string | null;
    type_business: 'agencia' | 'empresa';
    created_at: string;
    updated_at: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

export interface ConfirmOptions {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info'; // Determines styling (e.g. red for danger)
    onConfirm: () => void;
    onCancel?: () => void;
}

export interface SupportTicket {
    id: string;
    code: string;
    user_id: string;
    subject: string;
    description: string;
    phone: string;
    status: string;
    created_at: string;
}

export type Theme = 'light' | 'dark';

export interface JobContact {
    type: 'WhatsApp' | 'Email' | 'Endereço' | 'Link';
    value: string;
    date?: string | null;
    time?: string | null;
    noDateTime?: boolean;
}

export interface SavedJobContact {
    id: string;
    user_id: string;
    type: string;
    value: string;
    created_at: string;
}

export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    level: 'company' | 'sector';
}

export interface Vaga {
    id: string;
    folderId?: string;
    companyId?: string | null;
    jobCode: string;
    title: string;
    role: string;
    status: 'Ativa' | 'Pausada';
    date: string;
    type: 'scratch' | 'file';
    companyName: string;
    hideCompany: boolean;
    bond: string;
    city: string;
    region: string;
    activities: string;
    requirements: string;
    benefits: string;
    imageUrl?: string;
    footerEnabled?: boolean;
    observation?: string;
    showObservation?: boolean;
    salary?: string;
    contacts: JobContact[];
    code?: string; // Optional alias if needed
    created_at?: string;
}

export interface Job {
    id: string;
    code?: string;
    title: string;
    company?: string;
    location?: string;
    type?: 'CLT' | 'Freelance' | 'PJ' | 'Estágio';
    salary?: string;
    postedAt?: string;
    description?: string;
    requirements?: string[];
    benefits?: string[];
    activities?: string[];
    isFeatured?: boolean;
    isHidden?: boolean;
    city?: string;
    region?: string;
    schedule?: string;
    anunciante?: string;
    status_anunciante?: boolean;
    application_link?: string;
    application_text?: string;
}

export enum FilterType {
    ALL = 'Todos',
    CLT = 'CLT',
    FREELANCE = 'Freelance',
    PJ = 'PJ',
    ESTAGIO = 'Estágio'
}

export interface CompanyProfile {
    id: string;
    name: string;
    username: string;
    description?: string;
    website?: string;
    profile_header_color?: string;
    profile_title_color?: string;
    zip_code?: string;
    address?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    complement?: string;
    logo_url?: string;
    cover_url?: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    is_public_active?: boolean;
    type_business?: 'agencia' | 'empresa';
}

export interface UserProfile {
    id: string;
    full_name: string | null;
    whatsapp: string | null;
    avatar_url?: string | null;
    role: string;
    status_created?: boolean;
    created_at: string;
    updated_at: string;
}

export type AccountStatus = 'trial' | 'active' | 'suspended' | 'cancelled';

export interface UserAccount {
    id: string;
    user_id: string;
    status: AccountStatus;
    plan_type?: string | null;
    trial_ends_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserSubscription {
    id: string;
    user_id: string;
    plan_type: string;
    status: string;
    stripe_subscription_id?: string | null;
    current_period_start?: string | null;
    current_period_end?: string | null;
    created_at: string;
    updated_at: string;
}
