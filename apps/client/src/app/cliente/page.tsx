import { VehicleCard } from '@/src/components/portal/VehicleCard';
import { VehicleJourney } from '@/src/components/portal/VehicleJourney';
import { QuickAccess } from '@/src/components/portal/QuickAccess';
import { UpdatesFeed } from '@/src/components/portal/UpdatesFeed';
import { ChatbotCard } from '@/src/components/portal/ChatbotCard';

export default function PortalPage() {
  return (
    <>
      {/* Boas-vindas */}
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink">Olá, Tiago!</h1>
        <p className="text-ink-soft text-sm font-medium">Bem-vindo ao Portal ToyotaTech. Seu veículo está em produção.</p>
      </header>

      {/* Cartão de Destaque e Linha do Tempo */}
      <VehicleCard />
      <VehicleJourney />

      {/* Grid Inferior de Funcionalidades */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <div className="space-y-2">
          <QuickAccess />
          <UpdatesFeed />
        </div>
        <aside>
          <ChatbotCard />
        </aside>
      </div>
    </>
  );
}