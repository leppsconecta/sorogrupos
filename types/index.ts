
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
    tiktok: string | null;
    kwai: string | null;
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
