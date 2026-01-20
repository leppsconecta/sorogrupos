
import React from 'react';

export type Theme = 'light' | 'dark';

export interface ConfirmOptions {
  type: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  level: 'company' | 'sector';
}

export interface UserProfile {
  id: string;
  email: string;
  role?: string;
  status_created: number;
  full_name?: string;
  whatsapp?: string;
}

export interface Company {
  id: string;
  name: string;
  status_created: number;
  email?: string;
  whatsapp?: string;
  zip_code?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  owner_id?: string;
  is_public_active?: boolean;
}

export interface JobContact {
  type: 'WhatsApp' | 'Email' | 'Endereço' | 'Link';
  value: string;
  date?: string;
  time?: string;
  noDateTime?: boolean;
}

export interface SavedJobContact {
  id: string;
  user_id: string;
  type: 'WhatsApp' | 'Email' | 'Endereço' | 'Link';
  value: string;
  label?: string;
  created_at?: string;
}

export interface Vaga {
  id: string;
  title: string;
  companyId: string;
  folderId: string;
  status: 'Ativa' | 'Finalizada' | 'Pausada';
  date: string;
  type: 'scratch' | 'file';

  // Detalhes da Vaga
  role?: string;
  companyName?: string;
  hideCompany?: boolean;
  bond?: 'CLT' | 'Jurídico' | 'Freelance' | 'Temporário';
  salary?: string;
  city?: string;
  region?: string;
  benefits?: string;
  requirements?: string;
  activities?: string;
  jobCode?: string;
  contacts: JobContact[];
  imageUrl?: string;
  footerEnabled?: boolean;
  observation?: string;
  showObservation?: boolean;
  is_featured?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export type TicketStatus = 'Pendente' | 'Em análise' | 'Concluído';

export interface SupportTicket {
  id: string;
  code: string;
  subject: string;
  description: string;
  phone: string;
  status: TicketStatus;
  date: string;
  hasAttachment: boolean;
}

export interface Payment {
  id: string;
  date: string;
  amount: string;
  method: string;
  status: 'Pago' | 'Pendente' | 'Cancelado';
}

export type AccountStatus = 'trial' | 'active' | 'inactive';

export interface UserAccount {
  id: string;
  user_id: string;
  status: AccountStatus;
  trial_start_at: string;
  trial_end_at: string;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_type?: string;
  status?: string;
  current_period_end?: string;
  plan_amount?: number;
  plan_interval?: string;
  plan_currency?: string;
}
