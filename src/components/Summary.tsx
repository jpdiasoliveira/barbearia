import React, { useState } from 'react';
import { DollarSign, PieChart, Wallet, Download, Share2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

interface SummaryProps {
    totalRevenue: number;
    commissionRate: number;
    onCommissionChange: (rate: number) => void;
    history: Array<{ serviceName: string; price: number; timestamp: Date; isNavalhado?: boolean }>;
    barberName: string;
}

const Summary: React.FC<SummaryProps> = ({
    totalRevenue,
    commissionRate,
    onCommissionChange,
    history,
    barberName,
}) => {
    const [viewMode, setViewMode] = useState<'all' | 'individual'>('all');
    const [isVisible, setIsVisible] = useState(false);

    const barberShare = totalRevenue * (commissionRate / 100);
    const shopShare = totalRevenue - barberShare;

    // Calculate totals by service type
    const totalsByService = history.reduce((acc, item) => {
        acc[item.serviceName] = (acc[item.serviceName] || 0) + item.price;
        return acc;
    }, {} as Record<string, number>);

    const handleDownloadCSV = () => {
        const headers = ['Data', 'Hora', 'Serviço', 'Valor', 'Navalhado'];
        const rows = history.map(item => [
            format(new Date(item.timestamp), 'dd/MM/yyyy'),
            format(new Date(item.timestamp), 'HH:mm'),
            item.serviceName,
            item.price.toFixed(2).replace('.', ','),
            item.isNavalhado ? 'Sim' : 'Não'
        ]);

        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.join(';')),
            ['', '', 'Total', totalRevenue.toFixed(2).replace('.', ','), ''],
            ['', '', 'Comissão', barberShare.toFixed(2).replace('.', ','), '']
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
            Object.entries(totalsByService).map(([svc, val]) => `- ${svc}: R$ ${val.toFixed(2)}`).join('%0A');

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
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Wallet className="w-5 h-5 text-blue-400" />
                    Financeiro
                </h2>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handleDownloadCSV}
                        title="Baixar Relatório (CSV)"
                        className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleShareWhatsApp}
                        title="Compartilhar no WhatsApp"
                        className="p-1.5 rounded bg-green-900/30 text-green-500 hover:bg-green-900/50 transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-700 mx-1"></div>
                    <button
                        onClick={() => setIsVisible(false)}
                        title="Ocultar Financeiro"
                        className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                    >
                        <EyeOff className="w-4 h-4" />
                    </button>
                </div>
            </div>

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
                <div className="space-y-4">
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
                </div>
            ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {Object.entries(totalsByService).map(([service, total]) => (
                        <div key={service} className="flex justify-between items-center p-2 bg-slate-800 rounded border border-slate-700">
                            <span className="text-sm font-medium text-slate-300">{service}</span>
                            <span className="text-sm font-bold text-blue-400">R$ {total.toFixed(2)}</span>
                        </div>
                    ))}
                    {Object.keys(totalsByService).length === 0 && (
                        <p className="text-center text-slate-500 py-2 text-xs">Sem dados</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Summary;
