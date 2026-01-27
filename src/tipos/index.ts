export type PaymentMethod = 'dinheiro' | 'debito' | 'credito' | 'pix' | 'misto';

export interface ServiceState {
    id: string;
    count: number;
    isNavalhado: boolean;
    currentPrice: number;
    selectedPaymentMethod?: PaymentMethod;
}

export interface HistoryItem {
    id: string;
    barberId: string;
    serviceName: string;
    price: number;
    timestamp: Date;
    isNavalhado?: boolean;
    paymentMethod?: PaymentMethod;
}

export interface Barber {
    id: string;
    name: string;
    commissionRate: number;
}

export interface ServiceConfig {
    id: string;
    label: string;
    price: number;
    allowNavalhado: boolean;
    isEditable: boolean;
}

// Tipos para Agendamentos
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';
export type ServiceDuration = 15 | 30 | 45 | 60;

export interface Appointment {
    id: string;
    clientName: string;
    clientPhone: string;
    barberId: string;
    serviceType: string;
    duration: ServiceDuration;
    scheduledTime: Date;
    status: AppointmentStatus;
}
