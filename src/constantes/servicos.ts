import { ServiceConfig } from '../tipos';

export const INITIAL_SERVICES: ServiceConfig[] = [
    { id: 'corte', label: 'Corte', price: 40, allowNavalhado: true, isEditable: false },
    { id: 'barba', label: 'Barba', price: 35, allowNavalhado: false, isEditable: false },
    { id: 'maquina', label: 'Maquina', price: 35, allowNavalhado: false, isEditable: false },
    { id: 'acabamento', label: 'Acabamento', price: 15, allowNavalhado: false, isEditable: false },
    { id: 'sobrancelha', label: 'Sobrancelha', price: 15, allowNavalhado: false, isEditable: false },
    { id: 'combo', label: 'Combo', price: 70, allowNavalhado: false, isEditable: false },
    { id: 'outros', label: 'Outros', price: 0, allowNavalhado: false, isEditable: true },
];
