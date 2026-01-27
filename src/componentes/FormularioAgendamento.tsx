import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Scissors } from 'lucide-react';
import { Appointment, ServiceDuration, Barber } from '../tipos';
import { INITIAL_SERVICES } from '../constantes/servicos';

interface FormularioAgendamentoProps {
    barbers: Barber[];
    onClose: () => void;
    onSave: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
    editingAppointment?: Appointment;
}

const FormularioAgendamento: React.FC<FormularioAgendamentoProps> = ({
    barbers,
    onClose,
    onSave,
    editingAppointment
}) => {
    const [clientName, setClientName] = useState(editingAppointment?.clientName || '');
    const [clientPhone, setClientPhone] = useState(editingAppointment?.clientPhone || '');
    const [barberId, setBarberId] = useState(editingAppointment?.barberId || barbers[0]?.id || '');
    const [serviceType, setServiceType] = useState(editingAppointment?.serviceType || 'Corte');
    const [duration, setDuration] = useState<ServiceDuration>(editingAppointment?.duration || 30);
    const [scheduledDate, setScheduledDate] = useState(
        editingAppointment?.scheduledTime
            ? new Date(editingAppointment.scheduledTime).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [scheduledTime, setScheduledTime] = useState(
        editingAppointment?.scheduledTime
            ? new Date(editingAppointment.scheduledTime).toTimeString().slice(0, 5)
            : '09:00'
    );

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                .replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
                .replace(/(\d{2})(\d{0,5})/, '($1) $2');
        }
        return value;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setClientPhone(formatted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientName.trim() || !clientPhone.trim()) {
            alert('Por favor, preencha nome e telefone do cliente');
            return;
        }

        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

        onSave({
            clientName: clientName.trim(),
            clientPhone: clientPhone.trim(),
            barberId,
            serviceType,
            duration,
            scheduledTime: scheduledDateTime
        });

        onClose();
    };

    const serviceOptions = INITIAL_SERVICES.filter(s => s.id !== 'outros').map(s => s.label);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-100">
                        {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Nome do Cliente */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            <User size={16} className="inline mr-1" />
                            Nome do Cliente *
                        </label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Digite o nome"
                            required
                        />
                    </div>

                    {/* Telefone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Phone size={16} className="inline mr-1" />
                            Celular *
                        </label>
                        <input
                            type="tel"
                            value={clientPhone}
                            onChange={handlePhoneChange}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="(11) 99999-9999"
                            required
                        />
                    </div>

                    {/* Barbeiro */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Scissors size={16} className="inline mr-1" />
                            Barbeiro
                        </label>
                        <select
                            value={barberId}
                            onChange={(e) => setBarberId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {barbers.map(barber => (
                                <option key={barber.id} value={barber.id}>
                                    {barber.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo de Serviço */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Tipo de Serviço
                        </label>
                        <select
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {serviceOptions.map(service => (
                                <option key={service} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Duração */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Clock size={16} className="inline mr-1" />
                            Duração
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value) as ServiceDuration)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={15}>15 minutos</option>
                            <option value={30}>30 minutos</option>
                            <option value={45}>45 minutos</option>
                            <option value={60}>60 minutos</option>
                        </select>
                    </div>

                    {/* Data */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Calendar size={16} className="inline mr-1" />
                            Data
                        </label>
                        <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Horário */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Clock size={16} className="inline mr-1" />
                            Horário
                        </label>
                        <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                            {editingAppointment ? 'Salvar' : 'Criar Agendamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioAgendamento;
