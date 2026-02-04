import React, { useState } from 'react';
import { X, Plus, Minus, Zap, Banknote, CreditCard, QrCode, Layers } from 'lucide-react';
import { PaymentMethod } from '../tipos';

interface ModalServicoProps {
    isOpen: boolean;
    onClose: () => void;
    serviceName: string;
    count: number;
    price: number;
    isNavalhado: boolean;
    allowNavalhado: boolean;
    isEditable: boolean;
    selectedPaymentMethod: PaymentMethod;
    onAdd: () => void;
    onRemove: () => void;
    onToggleNavalhado: () => void;
    onPriceChange: (price: number) => void;
    onPaymentMethodChange: (method: PaymentMethod) => void;
}

const ModalServico: React.FC<ModalServicoProps> = ({
    isOpen,
    onClose,
    serviceName,
    count,
    price,
    isNavalhado,
    allowNavalhado,
    isEditable,
    selectedPaymentMethod,
    onAdd,
    onRemove,
    onToggleNavalhado,
    onPriceChange,
    onPaymentMethodChange,
}) => {
    const [tempPrice, setTempPrice] = useState(price);

    const paymentMethods: { id: PaymentMethod; icon: any; label: string }[] = [
        { id: 'dinheiro', icon: Banknote, label: 'Dinheiro' },
        { id: 'pix', icon: QrCode, label: 'Pix' },
        { id: 'debito', icon: CreditCard, label: 'Débito' },
        { id: 'credito', icon: CreditCard, label: 'Crédito' },
        { id: 'misto', icon: Layers, label: 'Misto' },
    ];

    if (!isOpen) return null;

    const handlePriceUpdate = () => {
        if (tempPrice !== price) {
            onPriceChange(tempPrice);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-slate-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl border border-slate-700 shadow-2xl max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{serviceName}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Count Display */}
                    <div className="text-center">
                        <p className="text-sm text-slate-400 mb-2">Quantidade</p>
                        <div className="text-6xl font-black text-blue-400">{count}</div>
                    </div>

                    {/* Add/Remove Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onRemove}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 rounded-xl transition-colors font-bold text-lg"
                        >
                            <Minus className="w-6 h-6" />
                            Remover
                        </button>
                        <button
                            onClick={() => {
                                onAdd();
                                onClose();
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg active:scale-95 transition-all font-bold text-lg"
                        >
                            <Plus className="w-6 h-6" />
                            Adicionar
                        </button>
                    </div>

                    {/* Price */}
                    <div className="bg-slate-800/50 rounded-xl p-4">
                        <label className="block text-sm text-slate-400 mb-2">Preço</label>
                        {isEditable ? (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl text-slate-400">R$</span>
                                <input
                                    type="number"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(Number(e.target.value))}
                                    onBlur={handlePriceUpdate}
                                    className="flex-1 bg-slate-900 border border-slate-700 text-white text-2xl font-bold rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ) : (
                            <div className="text-3xl font-bold text-blue-400">R$ {price}</div>
                        )}
                    </div>

                    {/* Navalhado Toggle */}
                    {allowNavalhado && (
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-white">Navalhado</p>
                                    <p className="text-sm text-slate-400">+R$ 5,00</p>
                                </div>
                                <button
                                    onClick={onToggleNavalhado}
                                    className={`relative w-16 h-9 rounded-full transition-all ${isNavalhado ? 'bg-blue-600' : 'bg-slate-700'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md transition-transform flex items-center justify-center ${isNavalhado ? 'translate-x-7' : 'translate-x-0'
                                            }`}
                                    >
                                        {isNavalhado && <Zap className="w-4 h-4 text-blue-600 fill-current" />}
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Payment Method */}
                    <div className="bg-slate-800/50 rounded-xl p-4">
                        <label className="block text-sm text-slate-400 mb-3">Forma de Pagamento</label>
                        <div className="grid grid-cols-2 gap-2">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => onPaymentMethodChange(method.id)}
                                    className={`flex items-center gap-3 p-4 rounded-lg transition-all ${selectedPaymentMethod === method.id
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                        }`}
                                >
                                    <method.icon className="w-5 h-5" />
                                    <span className="font-medium">{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-4">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-bold"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalServico;
