import React from 'react';
import { Trash2, Clock, Calendar as CalendarIcon, Banknote, CreditCard, QrCode, Layers } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { HistoryItem, PaymentMethod } from '../tipos';

interface LogHistoricoProps {
    history: HistoryItem[];
    onClearHistory: () => void;
    onRemoveItem: (id: string) => void;
}

const getPaymentIcon = (method?: PaymentMethod) => {
    switch (method) {
        case 'dinheiro': return <Banknote className="w-2.5 h-2.5 text-green-500" />;
        case 'pix': return <QrCode className="w-2.5 h-2.5 text-teal-400" />;
        case 'debito': return <CreditCard className="w-2.5 h-2.5 text-blue-400" />;
        case 'credito': return <CreditCard className="w-2.5 h-2.5 text-purple-400" />;
        case 'misto': return <Layers className="w-2.5 h-2.5 text-yellow-500" />;
        default: return null;
    }
};

const LogHistorico: React.FC<LogHistoricoProps> = ({ history, onClearHistory, onRemoveItem }) => {
    return (
        <div className="bg-slate-900/80 rounded-lg border border-slate-700 h-full flex flex-col overflow-hidden">
            <div className="p-2 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atendimentos</span>
                <button
                    onClick={onClearHistory}
                    className="text-[9px] font-bold text-red-500 hover:text-red-400 uppercase tracking-tighter flex items-center gap-1 transition-colors"
                >
                    <Trash2 className="w-2.5 h-2.5" />
                    Limpar
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-1 space-y-1 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 py-8">
                        <Clock className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs font-medium italic">Sem atendimentos</p>
                    </div>
                ) : (
                    [...history].reverse().map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center justify-between p-2 bg-slate-800/40 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 transition-all"
                        >
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-bold text-slate-200 leading-tight">
                                        {item.serviceName}
                                        {item.isNavalhado && <span className="text-[9px] text-blue-400 ml-1 font-black uppercase">Navalhado</span>}
                                    </span>
                                    {getPaymentIcon(item.paymentMethod)}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-slate-500 font-medium">
                                        {format(new Date(item.timestamp), 'HH:mm')}
                                    </span>
                                    {!isToday(new Date(item.timestamp)) && (
                                        <span className="text-[9px] text-yellow-600 font-bold flex items-center gap-0.5">
                                            <CalendarIcon className="w-2 h-2" />
                                            {format(new Date(item.timestamp), 'dd/MM')}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold text-blue-500/80">
                                        R$ {item.price}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => onRemoveItem(item.id)}
                                className="p-1.5 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LogHistorico;
