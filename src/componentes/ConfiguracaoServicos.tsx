import React, { useState } from 'react';
import { Settings, Plus, Trash2, Save, X, Edit2 } from 'lucide-react';
import { ServiceConfig } from '../tipos';

interface ConfiguracaoServicosProps {
    services: ServiceConfig[];
    onUpdateServices: (services: ServiceConfig[]) => void;
}

const ConfiguracaoServicos: React.FC<ConfiguracaoServicosProps> = ({ services, onUpdateServices }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<ServiceConfig>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [newService, setNewService] = useState<Partial<ServiceConfig>>({
        label: '',
        price: 0,
        allowNavalhado: false,
        isEditable: true
    });

    const handleEdit = (service: ServiceConfig) => {
        setEditingId(service.id);
        setEditForm(service);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        const updatedServices = services.map(s =>
            s.id === editingId ? { ...s, ...editForm } as ServiceConfig : s
        );

        onUpdateServices(updatedServices);
        setEditingId(null);
        setEditForm({});
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este serviço?')) return;

        const updatedServices = services.filter(s => s.id !== id);
        onUpdateServices(updatedServices);
    };

    const handleAddNew = async () => {
        if (!newService.label || newService.price === undefined) {
            alert('Preencha o nome e o preço do serviço');
            return;
        }

        const serviceId = newService.label.toLowerCase().replace(/\s+/g, '_');
        const serviceToAdd: ServiceConfig = {
            id: serviceId,
            label: newService.label,
            price: newService.price,
            allowNavalhado: newService.allowNavalhado || false,
            isEditable: true
        };

        onUpdateServices([...services, serviceToAdd]);

        setNewService({ label: '', price: 0, allowNavalhado: false, isEditable: true });
        setIsAdding(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Settings className="w-6 h-6 text-blue-400" />
                        <h2 className="text-2xl font-bold text-slate-100">Configuração de Serviços</h2>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Serviço
                    </button>
                </div>

                {/* Lista de Serviços */}
                <div className="space-y-3">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-slate-900 rounded-lg p-4 border border-slate-700"
                        >
                            {editingId === service.id ? (
                                // Modo de Edição
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Nome</label>
                                            <input
                                                type="text"
                                                value={editForm.label || ''}
                                                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1">Preço (R$)</label>
                                            <input
                                                type="number"
                                                value={editForm.price || 0}
                                                onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                                className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`navalhado-${service.id}`}
                                            checked={editForm.allowNavalhado || false}
                                            onChange={(e) => setEditForm({ ...editForm, allowNavalhado: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor={`navalhado-${service.id}`} className="text-sm text-slate-300">
                                            Permitir Navalhado (+R$5)
                                        </label>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            Salvar
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Modo de Visualização
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-slate-100">{service.label}</h3>
                                            <span className="text-xl font-bold text-green-400">R$ {service.price.toFixed(2)}</span>
                                            {service.allowNavalhado && (
                                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                                    Navalhado disponível
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {service.isEditable && (
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Formulário de Novo Serviço */}
                {isAdding && (
                    <div className="mt-4 bg-slate-900 rounded-lg p-4 border-2 border-blue-500">
                        <h3 className="text-lg font-semibold text-slate-100 mb-3">Novo Serviço</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={newService.label || ''}
                                        onChange={(e) => setNewService({ ...newService, label: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ex: Hidratação"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Preço (R$)</label>
                                    <input
                                        type="number"
                                        value={newService.price || 0}
                                        onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="new-navalhado"
                                    checked={newService.allowNavalhado || false}
                                    onChange={(e) => setNewService({ ...newService, allowNavalhado: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="new-navalhado" className="text-sm text-slate-300">
                                    Permitir Navalhado (+R$5)
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddNew}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewService({ label: '', price: 0, allowNavalhado: false, isEditable: true });
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfiguracaoServicos;
