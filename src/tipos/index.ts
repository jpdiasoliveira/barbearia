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
