
import React from 'react';

export type Theme = 'light' | 'dark';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  level: 'company' | 'sector';
}

export interface JobContact {
  type: 'WhatsApp' | 'Email' | 'Endereço' | 'Link';
  value: string;
  date?: string;
  time?: string;
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
  city?: string;
  region?: string;
  benefits?: string;
  requirements?: string;
  activities?: string;
  jobCode?: string;
  contacts?: JobContact[];
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
