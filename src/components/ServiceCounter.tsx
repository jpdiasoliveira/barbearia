import React from 'react';
import { Plus, Minus, Scissors } from 'lucide-react';

interface ServiceCounterProps {
    label: string;
    price: number;
    count: number;
    onAdd: () => void;
    onRemove: () => void;
    isNavalhado?: boolean;
    onToggleNavalhado?: () => void;
    allowNavalhado?: boolean;
    isEditable?: boolean;
    onPriceChange?: (newPrice: number) => void;
}

const ServiceCounter: React.FC<ServiceCounterProps> = ({
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
}) => {
    const currentPrice = price + (isNavalhado ? 5 : 0);

    return (
        <div className="p-2 rounded-lg border border-white/5 hover:bg-white/5 transition-colors group">
            <div className="flex justify-between items-center mb-1">
                <div className="flex-1">
                    <div className="flex items-center justify-between mr-2">
                        <h3 className="font-bold text-sm text-slate-100 group-hover:text-blue-400 transition-colors">{label}</h3>
                        <div className="text-lg font-black text-blue-400 w-6 text-center bg-slate-900 rounded py-0.5 shadow-sm border border-slate-700">
                            {count}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 font-medium text-xs mt-0.5">
                        {isEditable ? (
                            <div className="flex items-center gap-1">
                                <span>R$</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => onPriceChange?.(Number(e.target.value))}
                                    className="w-12 p-0.5 border border-slate-600 rounded bg-slate-800 text-white text-center focus:border-blue-500 focus:outline-none text-xs"
                                />
                            </div>
                        ) : (
                            <span>R$ {currentPrice.toFixed(2)}</span>
                        )}
                        {isNavalhado && <span className="text-[9px] bg-blue-900/50 text-blue-300 px-1 py-0.5 rounded border border-blue-800">+ Navalha</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
                {allowNavalhado && (
                    <button
                        onClick={onToggleNavalhado}
                        className={`flex items-center justify-center gap-1 p-1.5 rounded-md transition-all ${isNavalhado
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        title={isNavalhado ? 'Navalhado Ativo' : 'Adicionar Navalhado'}
                    >
                        <Scissors className="w-3 h-3" />
                    </button>
                )}

                <div className="flex gap-1 flex-1">
                    <button
                        onClick={onRemove}
                        disabled={count === 0}
                        className="flex-1 flex items-center justify-center p-1.5 rounded-md bg-slate-800 text-slate-400 hover:bg-red-900/50 hover:text-red-400 hover:border-red-800/50 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onAdd}
                        className="flex-1 flex items-center justify-center p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-900/20"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceCounter;
