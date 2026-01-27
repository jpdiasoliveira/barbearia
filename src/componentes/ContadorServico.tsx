import React from 'react';
import { Plus, Minus, Zap, Banknote, CreditCard, QrCode, Layers } from 'lucide-react';
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
}

const ContadorServico: React.FC<ContadorServicoProps> = ({
    label,
    price,
    count,
    onAdd,
    onRemove,
    isNavalhado,
    onToggleNavalhado,
    allowNavalhado,
    isEditable,
    onPriceChange,
    selectedPaymentMethod,
    onPaymentMethodChange,
}) => {
    const paymentMethods: { id: PaymentMethod; icon: any; label: string }[] = [
        { id: 'dinheiro', icon: Banknote, label: 'Dinheiro' },
        { id: 'pix', icon: QrCode, label: 'Pix' },
        { id: 'debito', icon: CreditCard, label: 'Débito' },
        { id: 'credito', icon: CreditCard, label: 'Crédito' },
        { id: 'misto', icon: Layers, label: 'Misto' },
    ];

    return (
        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 flex flex-col gap-1.5 transition-all hover:border-blue-900/50">
            <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight truncate pr-1">
                    {label}
                </span>
                <span className="text-[13px] font-black text-white leading-none">
                    {count}
                </span>
            </div>

            <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                    {isEditable ? (
                        <div className="flex items-center bg-slate-800 rounded px-1 border border-slate-700">
                            <span className="text-[9px] text-slate-500 mr-0.5">R$</span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => onPriceChange(Number(e.target.value))}
                                className="w-8 bg-transparent text-[11px] font-bold text-blue-400 focus:outline-none p-0"
                            />
                        </div>
                    ) : (
                        <span className="text-[11px] font-bold text-blue-400">R$ {price}</span>
                    )}

                    {allowNavalhado && (
                        <button
                            onClick={onToggleNavalhado}
                            className={`p-1 rounded transition-all ${isNavalhado
                                    ? 'bg-blue-600 text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]'
                                    : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                                }`}
                            title="Navalhado (+R$ 5)"
                        >
                            <Zap className={`w-3 h-3 ${isNavalhado ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-0.5 bg-slate-800/50 p-0.5 rounded">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => onPaymentMethodChange(method.id)}
                            className={`p-1 rounded transition-all ${selectedPaymentMethod === method.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            title={method.label}
                        >
                            <method.icon className="w-2.5 h-2.5" />
                        </button>
                    ))}
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={onRemove}
                        className="p-1.5 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <button
                        onClick={onAdd}
                        className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-lg active:scale-95 transition-all"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContadorServico;
