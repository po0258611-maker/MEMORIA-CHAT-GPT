import React from 'react';
import { User, Settings, LogOut, Shield, Bell } from 'lucide-react';

export default function ProfileScreen() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="space-y-4">
        <h1 className="text-2xl font-display font-bold text-white">Perfil</h1>
      </header>

      <section className="bg-surface border border-white/5 rounded-3xl p-6 flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-surface-light rounded-full flex items-center justify-center border-2 border-primary">
          <User size={48} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Criador Pro</h2>
          <p className="text-text-muted">criador@superclipe.com</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mt-2">
          Plano Premium
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 px-2">Configurações</h3>
        
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <ProfileOption icon={<Settings size={20} />} label="Preferências da Conta" />
          <ProfileOption icon={<Bell size={20} />} label="Notificações" />
          <ProfileOption icon={<Shield size={20} />} label="Privacidade e Segurança" />
        </div>
      </section>

      <section className="pt-4">
        <button className="w-full bg-surface border border-red-500/20 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors">
          <LogOut size={20} />
          Sair da Conta
        </button>
      </section>
    </div>
  );
}

function ProfileOption({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 cursor-pointer hover:bg-surface-light transition-colors">
      <div className="flex items-center gap-3 text-white">
        <div className="text-text-muted">{icon}</div>
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-text-muted">›</div>
    </div>
  );
}
