import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays, startOfDay, isToday } from 'date-fns';

// Tipos e Constantes
import { Barber, HistoryItem, ServiceState, PaymentMethod, Appointment } from './tipos';
import { INITIAL_SERVICES } from './constantes/servicos';
import { BIBLE_VERSES } from './constantes/versiculos';

// Componentes
import Cabecalho from './componentes/Cabecalho';
import ColunaBarbeiro from './componentes/ColunaBarbeiro';
import Agendamentos from './componentes/Agendamentos';

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
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [currentView, setCurrentView] = useState<'services' | 'appointments'>('services');
    const [selectedBarberIndex, setSelectedBarberIndex] = useState(0);

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
                const [barbersRes, historyRes, servicesRes, appointmentsRes] = await Promise.all([
                    fetch(`${API_URL}/barbers`),
                    fetch(`${API_URL}/history`),
                    fetch(`${API_URL}/servicesState`),
                    fetch(`${API_URL}/appointments`)
                ]);

                if (barbersRes.ok) setBarbers(await barbersRes.json());
                if (historyRes.ok) {
                    const data = await historyRes.json();
                    setHistory(data.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) })));
                }
                if (servicesRes.ok) setServicesState(await servicesRes.json());
                if (appointmentsRes.ok) {
                    const data = await appointmentsRes.json();
                    setAppointments(data.map((item: any) => ({ ...item, scheduledTime: new Date(item.scheduledTime) })));
                }
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

    // APPOINTMENT HANDLERS
    const handleCreateAppointment = async (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
        const newAppointment: Appointment = {
            ...appointmentData,
            id: uuidv4(),
            status: 'scheduled'
        };

        setAppointments(prev => [...prev, newAppointment]);

        fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAppointment)
        }).catch(console.error);
    };

    const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt));

        fetch(`${API_URL}/appointments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        }).catch(console.error);
    };

    const handleDeleteAppointment = async (id: string) => {
        setAppointments(prev => prev.filter(apt => apt.id !== id));

        fetch(`${API_URL}/appointments/${id}`, {
            method: 'DELETE'
        }).catch(console.error);
    };

    // BARBER MANAGEMENT HANDLERS
    const handleAddBarber = async () => {
        const newBarber: Barber = {
            id: `barber${Date.now()}`,
            name: 'Novo Barbeiro',
            commissionRate: 50
        };

        setBarbers(prev => [...prev, newBarber]);
        setSelectedBarberIndex(barbers.length); // Select the new barber
        setEditingBarberId(newBarber.id); // Auto-edit name

        fetch(`${API_URL}/barbers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBarber)
        }).catch(console.error);
    };

    const handleRemoveBarber = async (barberId: string) => {
        if (barbers.length <= 1) {
            alert('Você precisa ter pelo menos um barbeiro!');
            return;
        }

        if (!confirm('Deseja realmente remover este barbeiro?')) {
            return;
        }

        setBarbers(prev => prev.filter(b => b.id !== barberId));

        // Adjust selected index if needed
        if (selectedBarberIndex >= barbers.length - 1) {
            setSelectedBarberIndex(Math.max(0, barbers.length - 2));
        }

        fetch(`${API_URL}/barbers/${barberId}`, {
            method: 'DELETE'
        }).catch(console.error);
    };

    const handlePrevBarber = () => {
        setSelectedBarberIndex(prev => prev === 0 ? barbers.length - 1 : prev - 1);
    };

    const handleNextBarber = () => {
        setSelectedBarberIndex(prev => prev === barbers.length - 1 ? 0 : prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
            <Cabecalho
                versiculo={versiculo}
                selectedDate={selectedDate}
                onPrevDate={() => setSelectedDate(prev => subDays(prev, 1))}
                onNextDate={() => setSelectedDate(prev => addDays(prev, 1))}
                onToday={() => setSelectedDate(startOfDay(new Date()))}
                currentView={currentView}
                onViewChange={setCurrentView}
                appointmentCount={appointments.filter(apt =>
                    apt.status === 'scheduled' &&
                    startOfDay(new Date(apt.scheduledTime)).getTime() === selectedDate.getTime()
                ).length}
            />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {currentView === 'services' ? (
                    <div className="space-y-4">
                        {/* Barber Navigation Controls */}
                        <div className="flex items-center justify-between bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <button
                                onClick={handlePrevBarber}
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                title="Barbeiro anterior"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>

                            <div className="text-center">
                                <div className="text-lg font-bold text-slate-100">
                                    {barbers[selectedBarberIndex]?.name || 'Nenhum barbeiro'}
                                </div>
                                <div className="text-sm text-slate-400">
                                    Barbeiro {selectedBarberIndex + 1} de {barbers.length}
                                </div>
                            </div>

                            <button
                                onClick={handleNextBarber}
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                title="Próximo barbeiro"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>

                        {/* Add/Remove Barber Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddBarber}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Adicionar Barbeiro
                            </button>
                            {barbers.length > 1 && (
                                <button
                                    onClick={() => handleRemoveBarber(barbers[selectedBarberIndex]?.id)}
                                    className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                                    title="Remover barbeiro atual"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Current Barber Panel */}
                        {barbers.length > 0 && barbers[selectedBarberIndex] && (() => {
                            const barber = barbers[selectedBarberIndex];
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
                        })()}
                    </div>
                ) : (
                    <Agendamentos
                        appointments={appointments}
                        barbers={barbers}
                        selectedDate={selectedDate}
                        onCreateAppointment={handleCreateAppointment}
                        onUpdateAppointment={handleUpdateAppointment}
                        onDeleteAppointment={handleDeleteAppointment}
                    />
                )}
            </main>
        </div>
    );
}

export default App;
