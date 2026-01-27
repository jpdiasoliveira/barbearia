import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays, startOfDay, isToday } from 'date-fns';

// Tipos e Constantes
import { Barber, HistoryItem, ServiceState, PaymentMethod } from './tipos';
import { INITIAL_SERVICES } from './constantes/servicos';
import { BIBLE_VERSES } from './constantes/versiculos';

// Componentes
import Cabecalho from './componentes/Cabecalho';
import ColunaBarbeiro from './componentes/ColunaBarbeiro';

const API_URL = `http://${window.location.hostname}:3000`;

function App() {
    // ESTADOS PRINCIPAIS
    const [barbers, setBarbers] = useState<Barber[]>([
        { id: '1', name: 'João', commissionRate: 50 },
        { id: '2', name: 'Pedro', commissionRate: 50 }
    ]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [servicesState, setServicesState] = useState<Record<string, ServiceState[]>>({});
    const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
    const [editingBarberId, setEditingBarberId] = useState<string | null>(null);

    // VERSÍCULO DO DIA (Muda 2x ao dia)
    const versiculo = useMemo(() => {
        const now = new Date();
        const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
        const isEvening = now.getHours() >= 18;
        const index = (dayOfYear * 2 + (isEvening ? 1 : 0)) % BIBLE_VERSES.length;
        return BIBLE_VERSES[index];
    }, []);

    // FETCH DATA
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [barbersRes, historyRes, servicesRes] = await Promise.all([
                    fetch(`${API_URL}/barbers`),
                    fetch(`${API_URL}/history`),
                    fetch(`${API_URL}/servicesState`)
                ]);

                if (barbersRes.ok) setBarbers(await barbersRes.json());
                if (historyRes.ok) {
                    const data = await historyRes.json();
                    setHistory(data.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) })));
                }
                if (servicesRes.ok) setServicesState(await servicesRes.json());
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    // HANDLERS
    const handleAddService = async (barberId: string, serviceId: string) => {
        const serviceConfig = INITIAL_SERVICES.find(s => s.id === serviceId);
        if (!serviceConfig) return;

        const barberServices = servicesState[barberId] || [];
        const state = barberServices.find(s => s.id === serviceId);
        const price = state ? state.currentPrice : serviceConfig.price;
        const isNavalhado = state ? state.isNavalhado : false;
        const finalPrice = isNavalhado ? price + 5 : price;
        const paymentMethod = state?.selectedPaymentMethod || 'dinheiro';

        const newItem: HistoryItem = {
            id: uuidv4(),
            barberId,
            serviceName: serviceConfig.label,
            price: finalPrice,
            timestamp: isToday(selectedDate) ? new Date() : selectedDate,
            isNavalhado,
            paymentMethod
        };

        setHistory(prev => [...prev, newItem]);

        // Reset navalhado but keep payment method
        const updatedServices = (servicesState[barberId] || []).map(s =>
            s.id === serviceId ? { ...s, isNavalhado: false } : s
        );
        setServicesState(prev => ({ ...prev, [barberId]: updatedServices }));
        fetch(`${API_URL}/servicesState`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [barberId]: updatedServices })
        }).catch(console.error);

        fetch(`${API_URL}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        }).catch(console.error);
    };

    const handleManualDecrement = async (barberId: string, serviceId: string) => {
        const serviceConfig = INITIAL_SERVICES.find(s => s.id === serviceId);
        if (!serviceConfig) return;

        const barberHistory = history.filter(h =>
            h.barberId === barberId &&
            h.serviceName === serviceConfig.label &&
            startOfDay(h.timestamp).getTime() === selectedDate.getTime()
        );

        if (barberHistory.length > 0) {
            const lastItem = barberHistory[barberHistory.length - 1];
            setHistory(prev => prev.filter(h => h.id !== lastItem.id));
            fetch(`${API_URL}/history/${lastItem.id}`, { method: 'DELETE' }).catch(console.error);
        }
    };

    const handleToggleNavalhado = async (barberId: string, serviceId: string) => {
        const currentServices = servicesState[barberId] || [];
        const service = currentServices.find(s => s.id === serviceId);

        const updatedServices = service
            ? currentServices.map(s => s.id === serviceId ? { ...s, isNavalhado: !s.isNavalhado } : s)
            : [...currentServices, { id: serviceId, count: 0, isNavalhado: true, currentPrice: INITIAL_SERVICES.find(s => s.id === serviceId)?.price || 0, selectedPaymentMethod: 'dinheiro' }];

        setServicesState(prev => ({ ...prev, [barberId]: updatedServices }));

        fetch(`${API_URL}/servicesState`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [barberId]: updatedServices })
        }).catch(console.error);
    };

    const handlePriceChange = async (barberId: string, serviceId: string, price: number) => {
        const currentServices = servicesState[barberId] || [];
        const service = currentServices.find(s => s.id === serviceId);

        const updatedServices = service
            ? currentServices.map(s => s.id === serviceId ? { ...s, currentPrice: price } : s)
            : [...currentServices, { id: serviceId, count: 0, isNavalhado: false, currentPrice: price, selectedPaymentMethod: 'dinheiro' }];

        setServicesState(prev => ({ ...prev, [barberId]: updatedServices }));

        fetch(`${API_URL}/servicesState`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [barberId]: updatedServices })
        }).catch(console.error);
    };

    const handlePaymentMethodChange = async (barberId: string, serviceId: string, method: PaymentMethod) => {
        const currentServices = servicesState[barberId] || [];
        const service = currentServices.find(s => s.id === serviceId);

        const updatedServices = service
            ? currentServices.map(s => s.id === serviceId ? { ...s, selectedPaymentMethod: method } : s)
            : [...currentServices, { id: serviceId, count: 0, isNavalhado: false, currentPrice: INITIAL_SERVICES.find(s => s.id === serviceId)?.price || 0, selectedPaymentMethod: method }];

        setServicesState(prev => ({ ...prev, [barberId]: updatedServices }));

        fetch(`${API_URL}/servicesState`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [barberId]: updatedServices })
        }).catch(console.error);
    };

    const handleRemoveHistoryItem = async (itemId: string, barberId: string) => {
        setHistory(prev => prev.filter(h => h.id !== itemId));
        fetch(`${API_URL}/history/${itemId}`, { method: 'DELETE' }).catch(console.error);
    };

    const handleClearHistory = async (barberId: string) => {
        const itemsToRemove = history.filter(h =>
            h.barberId === barberId &&
            startOfDay(h.timestamp).getTime() === selectedDate.getTime()
        );

        setHistory(prev => prev.filter(h => !itemsToRemove.find(item => item.id === h.id)));

        itemsToRemove.forEach(item => {
            fetch(`${API_URL}/history/${item.id}`, { method: 'DELETE' }).catch(console.error);
        });
    };

    const handleCommissionChange = async (barberId: string, rate: number) => {
        setBarbers(prev => prev.map(b => b.id === barberId ? { ...b, commissionRate: rate } : b));
        fetch(`${API_URL}/barbers/${barberId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commissionRate: rate })
        }).catch(console.error);
    };

    const handleNameChange = async (barberId: string, name: string) => {
        setBarbers(prev => prev.map(b => b.id === barberId ? { ...b, name } : b));
        fetch(`${API_URL}/barbers/${barberId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        }).catch(console.error);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
            <Cabecalho
                versiculo={versiculo}
                selectedDate={selectedDate}
                onPrevDate={() => setSelectedDate(prev => subDays(prev, 1))}
                onNextDate={() => setSelectedDate(prev => addDays(prev, 1))}
                onToday={() => setSelectedDate(startOfDay(new Date()))}
            />

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {barbers.map(barber => {
                        const barberHistory = history.filter(h =>
                            h.barberId === barber.id &&
                            startOfDay(h.timestamp).getTime() === selectedDate.getTime()
                        );
                        const totalRevenue = barberHistory.reduce((acc, item) => acc + item.price, 0);
                        const barberServices = servicesState[barber.id] || [];

                        return (
                            <ColunaBarbeiro
                                key={barber.id}
                                barber={barber}
                                isEditingName={editingBarberId === barber.id}
                                onToggleEditName={() => setEditingBarberId(editingBarberId === barber.id ? null : barber.id)}
                                onNameChange={(name) => handleNameChange(barber.id, name)}
                                barberHistory={barberHistory}
                                fullHistory={history}
                                barberServices={barberServices}
                                selectedDate={selectedDate}
                                onAddService={handleAddService}
                                onManualDecrement={handleManualDecrement}
                                onToggleNavalhado={handleToggleNavalhado}
                                onPriceChange={handlePriceChange}
                                onClearHistory={handleClearHistory}
                                onRemoveHistoryItem={handleRemoveHistoryItem}
                                onCommissionChange={handleCommissionChange}
                                onPaymentMethodChange={handlePaymentMethodChange}
                                totalRevenue={totalRevenue}
                            />
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

export default App;
