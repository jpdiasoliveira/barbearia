import React, { useState } from 'react';
import { Calendar, Clock, Plus, X, Check, User, Phone } from 'lucide-react';
import { format, isSameDay, isAfter, isBefore, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, Barber } from '../tipos';
import FormularioAgendamento from './FormularioAgendamento';

interface AgendamentosProps {
    appointments: Appointment[];
    barbers: Barber[];
    selectedDate: Date;
    onCreateAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
    onUpdateAppointment: (id: string, updates: Partial<Appointment>) => void;
    onDeleteAppointment: (id: string) => void;
}

const Agendamentos: React.FC<AgendamentosProps> = ({
    appointments,
    barbers,
    selectedDate,
    onCreateAppointment,
    onUpdateAppointment,
    onDeleteAppointment
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
    const [selectedBarber, setSelectedBarber] = useState<string>('all');

    // Filtrar agendamentos do dia selecionado
    const todayAppointments = appointments.filter(apt =>
        isSameDay(new Date(apt.scheduledTime), selectedDate) &&
        (selectedBarber === 'all' || apt.barberId === selectedBarber)
    ).sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

    // Agendamentos futuros
    const futureAppointments = appointments.filter(apt =>
        isAfter(new Date(apt.scheduledTime), selectedDate) &&
        !isSameDay(new Date(apt.scheduledTime), selectedDate) &&
        (selectedBarber === 'all' || apt.barberId === selectedBarber)
    ).sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
        .slice(0, 5);

    const getBarberName = (barberId: string) => {
        return barbers.find(b => b.id === barberId)?.name || 'Desconhecido';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Agendado';
            case 'completed': return 'Concluído';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const handleEdit = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setShowForm(true);
    };

    const handleSave = (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
        if (editingAppointment) {
            onUpdateAppointment(editingAppointment.id, appointmentData);
        } else {
            onCreateAppointment(appointmentData);
        }
        setShowForm(false);
        setEditingAppointment(undefined);
    };

    const handleComplete = (id: string) => {
        onUpdateAppointment(id, { status: 'completed' });
    };

    const handleCancel = (id: string) => {
        if (confirm('Deseja realmente cancelar este agendamento?')) {
            onUpdateAppointment(id, { status: 'cancelled' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">Agendamentos</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingAppointment(undefined);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                    <Plus size={20} />
                    Novo Agendamento
                </button>
            </div>

            {/* Filtro por Barbeiro */}
            <div className="flex gap-2">
                <button
                    onClick={() => setSelectedBarber('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${selectedBarber === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    Todos
                </button>
                {barbers.map(barber => (
                    <button
                        key={barber.id}
                        onClick={() => setSelectedBarber(barber.id)}
                        className={`px-4 py-2 rounded-lg transition-colors ${selectedBarber === barber.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        {barber.name}
                    </button>
                ))}
            </div>

            {/* Agendamentos do Dia */}
            <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Agendamentos do Dia ({todayAppointments.length})
                </h3>

                {todayAppointments.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">
                        Nenhum agendamento para este dia
                    </p>
                ) : (
                    <div className="space-y-3">
                        {todayAppointments.map(appointment => (
                            <div
                                key={appointment.id}
                                className={`border rounded-lg p-4 ${getStatusColor(appointment.status)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-lg font-semibold">
                                                {format(new Date(appointment.scheduledTime), 'HH:mm')}
                                            </span>
                                            <span className="text-sm px-2 py-1 rounded bg-slate-900/30">
                                                {appointment.duration} min
                                            </span>
                                            <span className="text-sm font-medium">
                                                {getBarberName(appointment.barberId)}
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User size={14} />
                                                <span>{appointment.clientName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} />
                                                <span>{appointment.clientPhone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{appointment.serviceType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {appointment.status === 'scheduled' && (
                                            <>
                                                <button
                                                    onClick={() => handleComplete(appointment.id)}
                                                    className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded transition-colors"
                                                    title="Marcar como concluído"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(appointment)}
                                                    className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <Calendar size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(appointment.id)}
                                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                                                    title="Cancelar"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                        )}
                                        {appointment.status !== 'scheduled' && (
                                            <span className="text-xs px-2 py-1 rounded bg-slate-900/30">
                                                {getStatusLabel(appointment.status)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Próximos Agendamentos */}
            {futureAppointments.length > 0 && (
                <div className="bg-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                        <Clock size={20} />
                        Próximos Agendamentos
                    </h3>

                    <div className="space-y-2">
                        {futureAppointments.map(appointment => (
                            <div
                                key={appointment.id}
                                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                                onClick={() => handleEdit(appointment)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-400">
                                            {format(new Date(appointment.scheduledTime), 'dd/MM')}
                                        </div>
                                        <div className="font-semibold">
                                            {format(new Date(appointment.scheduledTime), 'HH:mm')}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-medium">{appointment.clientName}</div>
                                        <div className="text-sm text-slate-400">
                                            {appointment.serviceType} • {getBarberName(appointment.barberId)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-400">
                                    {appointment.duration} min
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de Formulário */}
            {showForm && (
                <FormularioAgendamento
                    barbers={barbers}
                    onClose={() => {
                        setShowForm(false);
                        setEditingAppointment(undefined);
                    }}
                    onSave={handleSave}
                    editingAppointment={editingAppointment}
                />
            )}
        </div>
    );
};

export default Agendamentos;
