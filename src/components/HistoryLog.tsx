import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryItem {
    id: string;
    serviceName: string;
    price: number;
    timestamp: Date;
    isNavalhado?: boolean;
}

interface HistoryLogProps {
    history: HistoryItem[];
    onClearHistory: () => void;
    onRemoveItem: (id: string) => void;
}

const HistoryLog: React.FC<HistoryLogProps> = ({ history, onClearHistory, onRemoveItem }) => {
    if (history.length === 0) {
        return (
            <div className="text-center py-4 text-slate-500 border border-dashed border-slate-400 rounded-lg bg-slate-300 h-full flex flex-col justify-center items-center">
                <Clock className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs font-medium">Sem atendimentos</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-300 rounded-lg border border-slate-400 overflow-hidden flex flex-col h-full shadow-sm">
            <div className="p-2 border-b border-slate-400 flex justify-between items-center bg-slate-400/50">
                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                    {history.length} itens
                </span>
                <button
                    onClick={onClearHistory}
                    className="text-[9px] text-red-800 hover:text-red-950 font-bold uppercase tracking-wider border border-red-400/50 px-1.5 py-0.5 rounded hover:bg-red-200 transition-colors"
                >
                    Limpar
                </button>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1">
                {history.slice().reverse().map((item) => {
                    const isToday = isSameDay(item.timestamp, new Date());
                    const timeFormat = isToday ? "HH:mm" : "dd/MM HH:mm";

                    return (
                        <div key={item.id} className="p-2 border-b border-slate-400/50 flex justify-between items-center hover:bg-slate-200 transition-colors group">
                            <div>
                                <div className="font-bold text-slate-900 text-xs">
                                    {item.serviceName}
                                    {item.isNavalhado && <span className="text-[9px] text-blue-900 ml-1 bg-blue-200 px-1 rounded border border-blue-300">+ Navalha</span>}
                                </div>
                                <div className="text-[9px] text-slate-600">
                                    {format(item.timestamp, timeFormat, { locale: ptBR })}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">R$ {item.price.toFixed(2)}</span>
                                <button
                                    onClick={() => onRemoveItem(item.id)}
                                    className="text-slate-500 hover:text-red-700 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
                                    title="Remover item"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HistoryLog;
