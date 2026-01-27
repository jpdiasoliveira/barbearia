import React, { useState } from 'react';
import { User, Lock, ChevronRight } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Credenciais simples hardcoded para MVP
        // Em produção real, isso seria validado no backend
        if (username === 'admin' && password === 'admin') {
            onLogin();
        } else {
            setError('Usuário ou senha incorretos');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
                        Barber<span className="text-blue-500">Shop</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Área Administrativa</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-2">Usuário</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                                placeholder="Digite seu usuário"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-2">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                                placeholder="Digite sua senha"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
                    >
                        Entrar no Sistema
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center text-slate-600 text-xs">
                    Sistema de Gestão v1.0
                </div>
            </div>
        </div>
    );
};

export default Login;
