import React from 'react';
import { User, Edit2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Barber, HistoryItem, ServiceState, PaymentMethod } from '../tipos';
import { INITIAL_SERVICES } from '../constantes/servicos';
import ContadorServico from './ContadorServico';
import LogHistorico from './LogHistorico';
import ResumoFinanceiro from './ResumoFinanceiro';

interface ColunaBarbeiroProps {
    barber: Barber;
    isEditingName: boolean;
    onToggleEditName: () => void;
    onNameChange: (name: string) => void;
    barberHistory: HistoryItem[];
    fullHistory: HistoryItem[];
    barberServices: ServiceState[];
    selectedDate: Date;
    onAddService: (barberId: string, serviceId: string) => void;
    onManualDecrement: (barberId: string, serviceId: string) => void;
    onToggleNavalhado: (barberId: string, serviceId: string) => void;
    onPriceChange: (barberId: string, serviceId: string, price: number) => void;
    onClearHistory: (barberId: string) => void;
    onRemoveHistoryItem: (itemId: string, barberId: string) => void;
    onCommissionChange: (barberId: string, rate: number) => void;
    onPaymentMethodChange: (barberId: string, serviceId: string, method: PaymentMethod) => void;
    totalRevenue: number;
}

const ColunaBarbeiro: React.FC<ColunaBarbeiroProps> = ({
    barber,
    isEditingName,
    onToggleEditName,
    onNameChange,
    barberHistory,
    fullHistory,
    barberServices,
    selectedDate,
    onAddService,
    onManualDecrement,
    onToggleNavalhado,
    onPriceChange,
    onClearHistory,
    onRemoveHistoryItem,
    onCommissionChange,
    onPaymentMethodChange,
    totalRevenue,
}) => {
    return (
        <div className="flex flex-col bg-slate-800/30 rounded-2xl border border-slate-700/50 p-4 h-full shadow-xl backdrop-blur-sm">
            {/* NOME DO BARBEIRO */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={barber.name}
                                onChange={(e) => onNameChange(e.target.value)}
                                className="bg-slate-900 border border-blue-500 rounded px-2 py-1 text-sm font-bold text-white focus:outline-none w-32"
                                autoFocus
                            />
                            <button onClick={onToggleEditName} className="text-green-500">
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                {barber.name}
                            </h2>
                            <button
                                onClick={onToggleEditName}
                                className="text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-400"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Hoje</p>
                    <p className="text-sm font-black text-blue-400">R$ {totalRevenue.toFixed(0)}</p>
                </div>
            </div>

            {/* 1. SERVIÇOS */}
            <div className="space-y-2 mb-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Serviços
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {INITIAL_SERVICES.map(serviceConfig => {
                        let state = barberServices.find(s => s.id === serviceConfig.id);
                        if (!state) {
                            state = { id: serviceConfig.id, count: 0, isNavalhado: false, currentPrice: serviceConfig.price, selectedPaymentMethod: 'dinheiro' };
                        }
                        const currentCount = barberHistory.filter(h => h.serviceName === serviceConfig.label).length;

                        return (
                            <ContadorServico
                                key={serviceConfig.id}
                                label={serviceConfig.label}
                                price={state.currentPrice}
                                count={currentCount}
                                onAdd={() => onAddService(barber.id, serviceConfig.id)}
                                onRemove={() => onManualDecrement(barber.id, serviceConfig.id)}
                                isNavalhado={state.isNavalhado}
                                onToggleNavalhado={() => onToggleNavalhado(barber.id, serviceConfig.id)}
                                allowNavalhado={serviceConfig.allowNavalhado}
                                isEditable={serviceConfig.isEditable}
                                onPriceChange={(price) => onPriceChange(barber.id, serviceConfig.id, price)}
                                selectedPaymentMethod={state.selectedPaymentMethod || 'dinheiro'}
                                onPaymentMethodChange={(method) => onPaymentMethodChange(barber.id, serviceConfig.id, method)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* 2. HISTÓRICO */}
            <div className="space-y-1 flex-1 min-h-0 mb-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-900"></span>
                    Histórico ({format(selectedDate, 'dd/MM')})
                </h3>
                <div className="h-40 lg:h-auto lg:flex-1">
                    <LogHistorico
                        history={barberHistory}
                        onClearHistory={() => onClearHistory(barber.id)}
                        onRemoveItem={(itemId) => onRemoveHistoryItem(itemId, barber.id)}
                    />
                </div>
            </div>

            {/* 3. RESUMO */}
            <div className="mt-auto pt-2 border-t border-slate-700">
                <ResumoFinanceiro
                    totalRevenue={totalRevenue}
                    commissionRate={barber.commissionRate}
                    onCommissionChange={(rate) => onCommissionChange(barber.id, rate)}
                    history={barberHistory}
                    fullHistory={fullHistory}
                    selectedDate={selectedDate}
                    barberName={barber.name}
                    barberId={barber.id}
                />
            </div>
        </div>
    );
};

export default ColunaBarbeiro;
