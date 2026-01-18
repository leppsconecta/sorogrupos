
export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: 'CLT' | 'Freelance' | 'PJ';
    salary?: string;
    postedAt: string;
    description: string;
    requirements: string[];
    benefits: string[];
    activities: string[];
    isFeatured?: boolean;
    isHidden?: boolean;
}

export interface JobAlert {
    id: string;
    keyword: string;
    location: string;
    email: string;
}

export enum FilterType {
    ALL = 'Todos',
    CLT = 'CLT',
    FREELANCE = 'Freelance',
    PJ = 'PJ'
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
}
