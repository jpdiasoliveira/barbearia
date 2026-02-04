import React from 'react';
import { Scissors, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CabecalhoProps {
    versiculo: string;
    selectedDate: Date;
    onPrevDate: () => void;
    onNextDate: () => void;
    onToday: () => void;
    currentView: 'services' | 'appointments' | 'settings';
    onViewChange: (view: 'services' | 'appointments' | 'settings') => void;
    appointmentCount?: number;
}

const Cabecalho: React.FC<CabecalhoProps> = ({
    versiculo,
    selectedDate,
    onPrevDate,
    onNextDate,
    onToday,
    currentView,
    onViewChange,
    appointmentCount = 0,
}) => {
    return (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
                            <Scissors className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tighter uppercase">
                                Barber<span className="text-blue-500">Shop</span>
                            </h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sistema de Gestão</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-xl bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700/50">
                        <p className="text-xs text-blue-400 font-medium italic text-center leading-relaxed">
                            "{versiculo}"
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onViewChange('services')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${currentView === 'services'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            Serviços
                        </button>
                        <button
                            onClick={() => onViewChange('appointments')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all relative ${currentView === 'appointments'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            Agendamentos
                            {appointmentCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {appointmentCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => onViewChange('settings')}
                            className={`p-2 rounded-lg transition-all ${currentView === 'settings'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                            title="Configurações"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 self-center md:self-auto">
                        <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                            <button
                                onClick={onPrevDate}
                                className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onToday}
                                className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-700 rounded-md transition-all group"
                            >
                                <CalendarIcon className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-slate-200">
                                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                                </span>
                            </button>
                            <button
                                onClick={onNextDate}
                                className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Cabecalho;
