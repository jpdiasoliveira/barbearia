import React, { useState } from 'react';
import { Wallet, RefreshCw, Download, Share2, EyeOff, PieChart, Calendar, Banknote, CreditCard, QrCode, Layers } from 'lucide-react';
import { format, startOfWeek, addDays, eachDayOfInterval, isSameDay, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HistoryItem, PaymentMethod } from '../tipos';

interface ResumoFinanceiroProps {
    totalRevenue: number;
    commissionRate: number;
    onCommissionChange: (rate: number) => void;
    history: HistoryItem[];
    fullHistory: HistoryItem[];
    selectedDate: Date;
    barberName: string;
    barberId: string;
}

const ResumoFinanceiro: React.FC<ResumoFinanceiroProps> = ({
    totalRevenue,
    commissionRate,
    onCommissionChange,
    history,
    fullHistory,
    selectedDate,
    barberName,
    barberId,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [viewMode, setViewMode] = useState<'all' | 'individual'>('all');
    const [isFlipped, setIsFlipped] = useState(false);

    const barberShare = totalRevenue * (commissionRate / 100);
    const shopShare = totalRevenue - barberShare;

    const statsByService = (history || []).reduce((acc, item) => {
        if (!item || !item.serviceName) return acc;
        if (!acc[item.serviceName]) {
            acc[item.serviceName] = { total: 0, count: 0 };
        }
        acc[item.serviceName].total += item.price || 0;
        acc[item.serviceName].count += 1;
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const statsByPayment = (history || []).reduce((acc, item) => {
        const method = item.paymentMethod || 'dinheiro';
        acc[method] = (acc[method] || 0) + (item.price || 0);
        return acc;
    }, {} as Record<string, number>);

    const getWeeklyStats = () => {
        let monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const saturday = addDays(monday, 5);
        const days = eachDayOfInterval({ start: monday, end: saturday });

        const weeklyHistory = fullHistory.filter(item =>
            item.barberId === barberId &&
            item.timestamp >= monday &&
            item.timestamp <= endOfWeek(saturday, { weekStartsOn: 1 })
        );

        const dailyTotals = days.map(day => {
            const dayTotal = weeklyHistory
                .filter(item => isSameDay(item.timestamp, day))
                .reduce((acc, item) => acc + item.price, 0);

            let dayName = format(day, 'EEE', { locale: ptBR });
            if (dayName.toLowerCase().includes('qua')) dayName = 'Quarta';
            else if (dayName.toLowerCase().includes('seg')) dayName = 'Segunda';
            else if (dayName.toLowerCase().includes('ter')) dayName = 'Terça';
            else if (dayName.toLowerCase().includes('qui')) dayName = 'Quinta';
            else if (dayName.toLowerCase().includes('sex')) dayName = 'Sexta';
            else if (dayName.toLowerCase().includes('sáb')) dayName = 'Sábado';

            return {
                dayName,
                total: dayTotal
            };
        });

        const weeklyTotal = dailyTotals.reduce((acc, day) => acc + day.total, 0);
        const weeklyBarberShare = weeklyTotal * (commissionRate / 100);

        return { dailyTotals, weeklyTotal, weeklyBarberShare };
    };

    const { dailyTotals, weeklyTotal, weeklyBarberShare } = getWeeklyStats();

    const handleDownloadCSV = () => {
        const headers = ['Data', 'Hora', 'Serviço', 'Valor', 'Método', 'Navalhado'];
        const rows = history.map(item => [
            format(new Date(item.timestamp), 'dd/MM/yyyy'),
            format(new Date(item.timestamp), 'HH:mm'),
            item.serviceName,
            item.price.toFixed(2).replace('.', ','),
            item.paymentMethod || 'dinheiro',
            item.isNavalhado ? 'Sim' : 'Não'
        ]);

        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.join(';')),
            ['', '', 'Total', totalRevenue.toFixed(2).replace('.', ','), '', ''],
            ['', '', 'Comissão', barberShare.toFixed(2).replace('.', ','), '', '']
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Relatorio_${barberName}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShareWhatsApp = () => {
        const text = `💈 *Relatório - ${barberName}* 💈%0A` +
            `📅 Data: ${format(new Date(), 'dd/MM/yyyy')}%0A%0A` +
            `💰 *Faturamento:* R$ ${totalRevenue.toFixed(2)}%0A` +
            `✂️ *Comissão (${commissionRate}%):* R$ ${barberShare.toFixed(2)}%0A` +
            `🏢 *Líquido:* R$ ${shopShare.toFixed(2)}%0A%0A` +
            `*Resumo por Serviço:*%0A` +
            Object.entries(statsByService).map(([svc, stats]) => `- ${stats.count}x ${svc}: R$ ${stats.total.toFixed(2)}`).join('%0A');

        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-4 rounded-xl border border-slate-700 shadow-lg flex items-center justify-center gap-2 transition-all group"
            >
                <Wallet className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Ver Financeiro</span>
            </button>
        );
    }

    return (
        <div className="relative w-full perspective-1000 h-[280px]">
            <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* LADO DA FRENTE (DIÁRIO) */}
                <div className="absolute inset-0 backface-hidden bg-slate-900 rounded-xl border border-slate-800 shadow-lg flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/30">
                        <h2 className="text-sm font-black flex items-center gap-2 text-white uppercase tracking-tighter">
                            <Wallet className="w-4 h-4 text-blue-400" />
                            Financeiro Hoje
                        </h2>
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => setIsFlipped(true)}
                                title="Ver Resumo Semanal"
                                className="p-1.5 rounded bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleDownloadCSV}
                                title="Baixar Relatório (CSV)"
                                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleShareWhatsApp}
                                title="Compartilhar no WhatsApp"
                                className="p-1.5 rounded bg-green-900/30 text-green-500 hover:bg-green-900/50 transition-colors"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-px h-4 bg-slate-700 mx-1"></div>
                            <button
                                onClick={() => setIsVisible(false)}
                                title="Ocultar Financeiro"
                                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            >
                                <EyeOff className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">

                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 mb-4">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`flex-1 px-3 py-1 rounded text-xs font-bold transition-colors ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Geral
                            </button>
                            <button
                                onClick={() => setViewMode('individual')}
                                className={`flex-1 px-3 py-1 rounded text-xs font-bold transition-colors ${viewMode === 'individual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Detalhado
                            </button>
                        </div>

                        {viewMode === 'all' ? (
                            <div className="space-y-4 flex-1">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                        <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Faturamento</p>
                                        <p className="text-xl font-black text-white">
                                            R$ {totalRevenue.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-slate-400 text-xs uppercase tracking-wider">Comissão</p>
                                            <div className="flex items-center">
                                                <input
                                                    type="number"
                                                    value={commissionRate}
                                                    onChange={(e) => onCommissionChange(Number(e.target.value))}
                                                    className="w-8 bg-slate-900 border border-slate-600 rounded text-center text-[10px] text-white p-0.5 focus:border-blue-500 focus:outline-none"
                                                />
                                                <span className="text-[10px] text-slate-400 ml-0.5">%</span>
                                            </div>
                                        </div>
                                        <p className="text-lg font-bold text-blue-400">
                                            R$ {barberShare.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-slate-700 rounded">
                                            <PieChart className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-300">Líquido (Loja)</p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-slate-400">R$ {shopShare.toFixed(2)}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-slate-800/40 p-2 rounded border border-slate-700/50 flex flex-col items-center">
                                        <Banknote className="w-3 h-3 text-green-500 mb-1" />
                                        <p className="text-[9px] text-slate-500 uppercase font-bold">Dinheiro</p>
                                        <p className="text-xs font-bold text-white">R$ {(statsByPayment['dinheiro'] || 0).toFixed(0)}</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-2 rounded border border-slate-700/50 flex flex-col items-center">
                                        <QrCode className="w-3 h-3 text-teal-400 mb-1" />
                                        <p className="text-[9px] text-slate-500 uppercase font-bold">Pix</p>
                                        <p className="text-xs font-bold text-white">R$ {(statsByPayment['pix'] || 0).toFixed(0)}</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-2 rounded border border-slate-700/50 flex flex-col items-center">
                                        <CreditCard className="w-3 h-3 text-blue-400 mb-1" />
                                        <p className="text-[9px] text-slate-500 uppercase font-bold">Cartão</p>
                                        <p className="text-xs font-bold text-white">R$ {((statsByPayment['debito'] || 0) + (statsByPayment['credito'] || 0)).toFixed(0)}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar flex-1">
                                {Object.entries(statsByService).map(([service, stats]) => (
                                    <div key={service} className="flex justify-between items-center p-2 bg-slate-800 rounded border border-slate-700">
                                        <span className="text-sm font-medium text-slate-300">
                                            {stats.count}x {service}
                                        </span>
                                        <span className="text-sm font-bold text-blue-400">R$ {stats.total.toFixed(2)}</span>
                                    </div>
                                ))}
                                {Object.keys(statsByService).length === 0 && (
                                    <p className="text-center text-slate-500 py-2 text-xs">Sem dados</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* LADO DE TRÁS (SEMANAL) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 rounded-xl border border-blue-900/50 shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-blue-900/30 bg-blue-900/10">
                        <h2 className="text-sm font-black flex items-center gap-2 text-white uppercase tracking-tighter">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            Resumo Semanal
                        </h2>
                        <button
                            onClick={() => setIsFlipped(false)}
                            className="p-1.5 rounded bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="p-4 flex flex-col flex-1">

                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {dailyTotals.map((day, idx) => (
                                <div key={idx} className="bg-slate-800 p-2 rounded border border-slate-700 text-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{day.dayName}</p>
                                    <p className="text-xs font-bold text-white">R$ {day.total.toFixed(0)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 mt-auto">
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Total Semana</p>
                                    <p className="text-xl font-black text-white">R$ {weeklyTotal.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Sua Parte</p>
                                    <p className="text-lg font-bold text-green-400">R$ {weeklyBarberShare.toFixed(2)}</p>
                                </div>
                            </div>

                            <p className="text-[9px] text-slate-500 text-center italic">
                                * Período: Segunda a Sábado da semana atual.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
};

export default ResumoFinanceiro;
