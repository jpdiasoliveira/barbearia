import React from 'react';
import { PaymentMethod } from '../tipos';

interface ContadorServicoProps {
    label: string;
    price: number;
    count: number;
    onAdd: () => void;
    onRemove: () => void;
    isNavalhado: boolean;
    onToggleNavalhado: () => void;
    allowNavalhado: boolean;
    isEditable: boolean;
    onPriceChange: (price: number) => void;
    selectedPaymentMethod: PaymentMethod;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    onClick?: () => void;
}

const ContadorServico: React.FC<ContadorServicoProps> = ({
    label,
    price,
    count,
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2 transition-all hover:border-blue-500/50 hover:bg-slate-900/70 active:scale-95 text-left w-full"
        >
            <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">
                    {label}
                </span>
                <span className="text-2xl font-black text-blue-400 leading-none">
                    {count}
                </span>
            </div>

            <div className="text-lg font-bold text-white">
                R$ {price.toFixed(2)}
            </div>
        </button>
    );
};

export default ContadorServico;
