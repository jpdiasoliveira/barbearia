import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays, startOfDay, isToday, endOfDay } from 'date-fns';
import { supabase } from './services/supabase';

// Tipos e Constantes
import { Barber, HistoryItem, ServiceState, PaymentMethod, Appointment, ServiceConfig } from './tipos';
import { INITIAL_SERVICES } from './constantes/servicos';
import { BIBLE_VERSES } from './constantes/versiculos';

// Componentes
import Cabecalho from './componentes/Cabecalho';
import ColunaBarbeiro from './componentes/ColunaBarbeiro';
import Agendamentos from './componentes/Agendamentos';
import Login from './componentes/Login';
import ConfiguracaoServicos from './componentes/ConfiguracaoServicos';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [servicesState, setServicesState] = useState<Record<string, ServiceState[]>>({});
    const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
    const [editingBarberId, setEditingBarberId] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [currentView, setCurrentView] = useState<'services' | 'appointments' | 'settings'>('services');
    const [selectedBarberIndex, setSelectedBarberIndex] = useState(0);
    const [services, setServices] = useState<ServiceConfig[]>(INITIAL_SERVICES);

    // VERSÍCULO DO DIA
    const versiculo = useMemo(() => {
        const now = new Date();
        const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
        const isEvening = now.getHours() >= 18;
        const index = (dayOfYear * 2 + (isEvening ? 1 : 0)) % BIBLE_VERSES.length;
        return BIBLE_VERSES[index];
    }, []);

    // FETCH DATA
    const fetchData = async () => {
        try {
            // 1. Fetch Barbers
            const { data: barbersData } = await supabase.from('barbers').select('*');
            if (barbersData) setBarbers(barbersData);

            // 2. Fetch History for selected range (optimization: fetch all for now or filter by date)
            // Filtering by date to avoid fetching getting too heavy over time
            // For simplicity in this view, let's fetch everything or just this month? 
            // The app filters in memory: `startOfDay(h.timestamp).getTime() === selectedDate.getTime()`
            // Let's fetch all "relevant" history, maybe last 30 days? 
            // Or just fetch ALL for now as the app expects full history for some reason?
            // "handleManualDecrement" filters locally. 
            // Let's fetch ALL for now to maintain behavior, but filtering by date in query is better.
            const { data: historyData } = await supabase.from('history').select('*');

            if (historyData) {
                const mappedHistory = historyData.map((item: any) => ({
                    ...item,
                    barberId: item.barber_id,
                    serviceName: item.service_name,
                    isNavalhado: item.is_navalhado,
                    paymentMethod: item.payment_method,
                    timestamp: new Date(item.timestamp)
                }));
                setHistory(mappedHistory);
            }

            // 3. Fetch Service Configs
            const { data: configsData } = await supabase.from('barber_service_configs').select('*');

            // 4. Fetch Services from Database
            const { data: servicesData } = await supabase.from('services').select('*').order('display_order');
            if (servicesData && servicesData.length > 0) {
                const mappedServices: ServiceConfig[] = servicesData.map((s: any) => ({
                    id: s.id,
                    label: s.label,
                    price: Number(s.price),
                    allowNavalhado: s.allow_navalhado,
                    isEditable: s.is_editable
                }));
                setServices(mappedServices);
            } else {
                // Fallback to INITIAL_SERVICES if no data in database
                setServices(INITIAL_SERVICES);
            }

            // 5. Fetch Appointments
            const { data: appointmentsData } = await supabase.from('appointments').select('*');
            if (appointmentsData) {
                const mappedAppointments = appointmentsData.map((item: any) => ({
                    ...item,
                    clientName: item.client_name,
                    clientPhone: item.client_phone,
                    barberId: item.barber_id,
                    serviceType: item.service_type,
                    scheduledTime: new Date(item.scheduled_time)
                }));
                setAppointments(mappedAppointments);
            }

            // RECONSTRUCT SERVICES STATE derived from history + configs
            if (barbersData && historyData && servicesData) {
                const newServicesState: Record<string, ServiceState[]> = {};

                const currentServices = servicesData.length > 0 ? servicesData : INITIAL_SERVICES;

                barbersData.forEach((barber: Barber) => {
                    const barberConfigs = configsData?.filter((c: any) => c.barber_id === barber.id) || [];

                    const barberServicesValid = currentServices.map((serviceInit: any) => {
                        // Find config
                        const config = barberConfigs.find((c: any) => c.service_id === serviceInit.id);

                        return {
                            id: serviceInit.id,
                            count: 0,
                            isNavalhado: config?.is_navalhado ?? false,
                            currentPrice: Number(config?.current_price) || Number(serviceInit.price),
                            selectedPaymentMethod: config?.selected_payment_method || 'dinheiro' as PaymentMethod
                        };
                    });
                    newServicesState[barber.id] = barberServicesValid;
                });
                setServicesState(newServicesState);
            }

        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    };

    useEffect(() => {
        fetchData();
        // Polling every 5s for updates
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [selectedDate]); // Re-fetch if date changes? No, fetching all history.

    // HANDLERS
    const handleAddService = async (barberId: string, serviceId: string) => {
        const serviceConfig = services.find(s => s.id === serviceId);
        if (!serviceConfig) return;

        const barberServices = servicesState[barberId] || [];
        const state = barberServices.find(s => s.id === serviceId);
        const price = state ? state.currentPrice : serviceConfig.price;
        const isNavalhado = state ? state.isNavalhado : false;
        const finalPrice = isNavalhado ? price + 5 : price;
        const paymentMethod = state?.selectedPaymentMethod || 'dinheiro';

        const newItem = {
            barber_id: barberId,
            service_name: serviceConfig.label,
            price: finalPrice,
            timestamp: isToday(selectedDate) ? new Date().toISOString() : selectedDate.toISOString(),
            is_navalhado: isNavalhado,
            payment_method: paymentMethod
        };

        // Optimistic Update
        const tempId = uuidv4();
        setHistory(prev => [...prev, {
            id: tempId,
            barberId,
            serviceName: serviceConfig.label,
            price: finalPrice,
            timestamp: new Date(newItem.timestamp),
            isNavalhado,
            paymentMethod: paymentMethod as PaymentMethod
        }]);

        // Reset Navalhado locally
        setServicesState(prev => ({
            ...prev,
            [barberId]: (prev[barberId] || []).map(s =>
                s.id === serviceId ? { ...s, isNavalhado: false } : s
            )
        }));

        // DB Updates
        // 1. Insert History
        await supabase.from('history').insert([newItem]);

        // 2. Update Config (reset navalhado)
        const { error } = await supabase.from('barber_service_configs').upsert({
            barber_id: barberId,
            service_id: serviceId,
            is_navalhado: false,
            current_price: price, // Establish current price if not exists
            selected_payment_method: paymentMethod
        });

        if (error) console.error("Error updating config:", error);

        fetchData(); // Sync
    };

    const handleManualDecrement = async (barberId: string, serviceId: string) => {
        const serviceConfig = services.find(s => s.id === serviceId);
        if (!serviceConfig) return;

        // Find last item for this barber/service/date to delete
        const relevantHistory = history.filter(h =>
            h.barberId === barberId &&
            h.serviceName === serviceConfig.label &&
            startOfDay(h.timestamp).getTime() === selectedDate.getTime()
        );

        if (relevantHistory.length > 0) {
            // Sort by time desc (assuming array order usually matches, but safe to verify)
            // Array usually appended, so last is last.
            const lastItem = relevantHistory[relevantHistory.length - 1];

            setHistory(prev => prev.filter(h => h.id !== lastItem.id));

            await supabase.from('history').delete().eq('id', lastItem.id);
        }
    };

    const handleToggleNavalhado = async (barberId: string, serviceId: string) => {
        const currentServices = servicesState[barberId] || [];
        const service = currentServices.find(s => s.id === serviceId);
        const newValue = !service?.isNavalhado;

        // Optimistic
        setServicesState(prev => ({
            ...prev,
            [barberId]: currentServices.map(s => s.id === serviceId ? { ...s, isNavalhado: newValue } : s)
        }));

        // DB
        await supabase.from('barber_service_configs').upsert({
            barber_id: barberId,
            service_id: serviceId,
            is_navalhado: newValue,
            current_price: service?.currentPrice || 0,
            selected_payment_method: service?.selectedPaymentMethod || 'dinheiro'
        });
    };

    const handlePriceChange = async (barberId: string, serviceId: string, price: number) => {
        const currentServices = servicesState[barberId] || [];
        const service = currentServices.find(s => s.id === serviceId);

        setServicesState(prev => ({
            ...prev,
            [barberId]: currentServices.map(s => s.id === serviceId ? { ...s, currentPrice: price } : s)
        }));

        await supabase.from('barber_service_configs').upsert({
            barber_id: barberId,
            service_id: serviceId,
            current_price: price,
            is_navalhado: service?.isNavalhado || false,
            selected_payment_method: service?.selectedPaymentMethod || 'dinheiro'
        });
    };

    const handlePaymentMethodChange = async (barberId: string, serviceId: string, method: PaymentMethod) => {
        const currentServices = servicesState[barberId] || [];
        const service = currentServices.find(s => s.id === serviceId);

        setServicesState(prev => ({
            ...prev,
            [barberId]: currentServices.map(s => s.id === serviceId ? { ...s, selectedPaymentMethod: method } : s)
        }));

        await supabase.from('barber_service_configs').upsert({
            barber_id: barberId,
            service_id: serviceId,
            selected_payment_method: method,
            current_price: service?.currentPrice || 0,
            is_navalhado: service?.isNavalhado || false
        });
    };

    const handleRemoveHistoryItem = async (itemId: string, barberId: string) => {
        setHistory(prev => prev.filter(h => h.id !== itemId));
        await supabase.from('history').delete().eq('id', itemId);
    };

    const handleClearHistory = async (barberId: string) => {
        const itemsToRemove = history.filter(h =>
            h.barberId === barberId &&
            startOfDay(h.timestamp).getTime() === selectedDate.getTime()
        );

        setHistory(prev => prev.filter(h => !itemsToRemove.find(item => item.id === h.id)));

        const ids = itemsToRemove.map(i => i.id);
        if (ids.length > 0) {
            await supabase.from('history').delete().in('id', ids);
        }
    };

    const handleCommissionChange = async (barberId: string, rate: number) => {
        setBarbers(prev => prev.map(b => b.id === barberId ? { ...b, commissionRate: rate } : b));
        await supabase.from('barbers').update({ commission_rate: rate }).eq('id', barberId);
    };

    const handleNameChange = async (barberId: string, name: string) => {
        setBarbers(prev => prev.map(b => b.id === barberId ? { ...b, name } : b));
        await supabase.from('barbers').update({ name }).eq('id', barberId);
    };

    // APPOINTMENT HANDLERS
    const handleCreateAppointment = async (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
        const newItem = {
            client_name: appointmentData.clientName,
            client_phone: appointmentData.clientPhone,
            barber_id: appointmentData.barberId,
            service_type: appointmentData.serviceType,
            duration: appointmentData.duration,
            scheduled_time: appointmentData.scheduledTime.toISOString(),
            status: 'scheduled'
        };

        const { data } = await supabase.from('appointments').insert([newItem]).select().single();

        if (data) {
            const newAppointment: Appointment = {
                id: data.id,
                clientName: data.client_name,
                clientPhone: data.client_phone,
                barberId: data.barber_id,
                serviceType: data.service_type,
                duration: data.duration,
                scheduledTime: new Date(data.scheduled_time),
                status: data.status as any
            };
            setAppointments(prev => [...prev, newAppointment]);
        }
    };

    const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
        // Map updates to DB columns
        const dbUpdates: any = {};
        if (updates.clientName) dbUpdates.client_name = updates.clientName;
        if (updates.clientPhone) dbUpdates.client_phone = updates.clientPhone;
        if (updates.barberId) dbUpdates.barber_id = updates.barberId;
        if (updates.serviceType) dbUpdates.service_type = updates.serviceType;
        if (updates.duration) dbUpdates.duration = updates.duration;
        if (updates.scheduledTime) dbUpdates.scheduled_time = updates.scheduledTime.toISOString();
        if (updates.status) dbUpdates.status = updates.status;

        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt));
        await supabase.from('appointments').update(dbUpdates).eq('id', id);
    };

    const handleDeleteAppointment = async (id: string) => {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
        await supabase.from('appointments').delete().eq('id', id);
    };

    // BARBER MANAGEMENT HANDLERS
    const handleAddBarber = async () => {
        const newBarber = {
            id: `barber${Date.now()}`, // Keep ID generation or let DB do it? 
            // Existing logic uses string IDs relying on this format sometimes? 
            // Let's keep it for now but ideally let DB generate UUID.
            name: 'Novo Barbeiro',
            commission_rate: 50
        };

        setBarbers(prev => [...prev, { id: newBarber.id, name: newBarber.name, commissionRate: 50 }]);
        setSelectedBarberIndex(barbers.length);
        setEditingBarberId(newBarber.id);

        await supabase.from('barbers').insert([newBarber]);
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

        if (selectedBarberIndex >= barbers.length - 1) {
            setSelectedBarberIndex(Math.max(0, barbers.length - 2));
        }

        await supabase.from('barbers').delete().eq('id', barberId);
    };

    const handlePrevBarber = () => {
        setSelectedBarberIndex(prev => prev === 0 ? barbers.length - 1 : prev - 1);
    };

    const handleNextBarber = () => {
        setSelectedBarberIndex(prev => prev === barbers.length - 1 ? 0 : prev + 1);
    };

    // SERVICE CONFIGURATION HANDLER
    const handleUpdateServices = async (updatedServices: ServiceConfig[]) => {
        // Optimistic update
        setServices(updatedServices);

        // Sync with database
        try {
            // Delete all existing services
            await supabase.from('services').delete().neq('id', '');

            // Insert updated services with display_order
            const servicesWithOrder = updatedServices.map((service, index) => ({
                id: service.id,
                label: service.label,
                price: service.price,
                allow_navalhado: service.allowNavalhado,
                is_editable: service.isEditable,
                display_order: index
            }));

            const { error } = await supabase.from('services').insert(servicesWithOrder);

            if (error) {
                console.error('Error updating services:', error);
                // Revert on error
                fetchData();
            }
        } catch (error) {
            console.error('Error updating services:', error);
            fetchData();
        }
    };

    if (!isAuthenticated) {
        return <Login onLogin={() => setIsAuthenticated(true)} />;
    }

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
                ) : currentView === 'appointments' ? (
                    <Agendamentos
                        appointments={appointments}
                        barbers={barbers}
                        selectedDate={selectedDate}
                        onCreateAppointment={handleCreateAppointment}
                        onUpdateAppointment={handleUpdateAppointment}
                        onDeleteAppointment={handleDeleteAppointment}
                    />
                ) : (
                    <ConfiguracaoServicos
                        services={services}
                        onUpdateServices={handleUpdateServices}
                    />
                )}
            </main>
        </div>
    );
}

export default App;
