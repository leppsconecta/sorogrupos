export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            companies: {
                Row: {
                    cnpj: string | null
                    created_at: string | null
                    email: string | null
                    facebook: string | null
                    id: string
                    instagram: string | null
                    linkedin: string | null
                    name: string | null
                    owner_id: string
                    short_id: string | null
                    updated_at: string | null
                    website: string | null
                    whatsapp: string | null
                    zip_code: string | null
                }
                Insert: {
                    cnpj?: string | null
                    created_at?: string | null
                    email?: string | null
                    facebook?: string | null
                    id?: string
                    instagram?: string | null
                    linkedin?: string | null
                    name?: string | null
                    owner_id: string
                    short_id?: string | null
                    updated_at?: string | null
                    website?: string | null
                    whatsapp?: string | null
                    zip_code?: string | null
                }
                Update: {
                    cnpj?: string | null
                    created_at?: string | null
                    email?: string | null
                    facebook?: string | null
                    id?: string
                    instagram?: string | null
                    linkedin?: string | null
                    name?: string | null
                    owner_id?: string
                    short_id?: string | null
                    updated_at?: string | null
                    website?: string | null
                    whatsapp?: string | null
                    zip_code?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    created_at: string | null
                    full_name: string | null
                    id: string
                    updated_at: string | null
                    whatsapp: string | null
                }
                Insert: {
                    created_at?: string | null
                    full_name?: string | null
                    id: string
                    updated_at?: string | null
                    whatsapp?: string | null
                }
                Update: {
                    created_at?: string | null
                    full_name?: string | null
                    id?: string
                    updated_at?: string | null
                    whatsapp?: string | null
                }
                Relationships: []
            }
            tags_group: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
                    user_id?: string
                }
                Relationships: []
            }
            whatsapp_conections: {
                Row: {
                    created_at: string
                    id: number
                    Instance: string | null
                    phone: string | null
                    status: string | null
                    token: string | null
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string
                    id?: number
                    Instance?: string | null
                    phone?: string | null
                    status?: string | null
                    token?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string
                    id?: number
                    Instance?: string | null
                    phone?: string | null
                    status?: string | null
                    token?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: []
            }
            whatsapp_groups: {
                Row: {
                    admin: boolean | null
                    created_at: string | null
                    description: string | null
                    id: string
                    id_group: string | null
                    link_invite: string | null
                    name_group: string
                    total: number | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    admin?: boolean | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    id_group?: string | null
                    link_invite?: string | null
                    name_group: string
                    total?: number | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    admin?: boolean | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    id_group?: string | null
                    link_invite?: string | null
                    name_group?: string
                    total?: number | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            whatsapp_groups_tags: {
                Row: {
                    group_id: string
                    tag_id: string
                }
                Insert: {
                    group_id: string
                    tag_id: string
                }
                Update: {
                    group_id?: string
                    tag_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "whatsapp_groups_tags_group_id_fkey"
                        columns: ["group_id"]
                        isOneToOne: false
                        referencedRelation: "whatsapp_groups"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "whatsapp_groups_tags_tag_id_fkey"
                        columns: ["tag_id"]
                        isOneToOne: false
                        referencedRelation: "tags_group"
                        referencedColumns: ["id"]
                    },
                ]
            }
            candidates: {
                Row: {
                    id: string
                    name: string
                    email: string
                    phone: string | null
                    city: string | null
                    state: string | null
                    sex: string | null
                    birth_date: string | null
                    resume_url: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    phone?: string | null
                    city?: string | null
                    state?: string | null
                    sex?: string | null
                    birth_date?: string | null
                    resume_url?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    phone?: string | null
                    city?: string | null
                    state?: string | null
                    sex?: string | null
                    birth_date?: string | null
                    resume_url?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            job_applications: {
                Row: {
                    id: string
                    job_id: string
                    candidate_id: string
                    status: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    job_id: string
                    candidate_id: string
                    status?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    job_id?: string
                    candidate_id?: string
                    status?: string | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "job_applications_job_id_fkey"
                        columns: ["job_id"]
                        isOneToOne: false
                        referencedRelation: "jobs"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "job_applications_candidate_id_fkey"
                        columns: ["candidate_id"]
                        isOneToOne: false
                        referencedRelation: "candidates"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
