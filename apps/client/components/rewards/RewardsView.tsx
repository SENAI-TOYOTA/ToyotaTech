"use client";

import { Award, Gift, Lock, Ticket, TrendingUp } from "lucide-react";
import { useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Badge, Button, Card, FormMessage, ListRow, ProgressBar } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/mocks/aftersales";
import {
  BADGES,
  EARN_RULES,
  getNextTier,
  getTier,
  REWARD_TIERS,
  REWARDS,
} from "@/lib/mocks/engagement";
import { redeemReward, useAppDispatch, useAppSelector } from "@/store";

function BalanceHero({ points }: { points: number }) {
  const tier = getTier(points);
  const next = getNextTier(points);
  const progress = next ? (points - tier.minPoints) / (next.minPoints - tier.minPoints) : 1;

  return (
    <section className="grid gap-6 rounded-3xl bg-ink p-6 text-white tablet:grid-cols-[1fr_1.2fr] tablet:p-8">
      <div>
        <p className="text-xs font-bold tracking-[2px] text-primary uppercase">Seu saldo</p>
        <p className="mt-1 text-5xl font-bold tablet:text-6xl">
          {formatNumber(points)}
          <span className="text-2xl font-medium text-white/60"> pontos</span>
        </p>
        <span
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
          style={{ backgroundColor: tier.color }}
        >
          <Award aria-hidden size={16} /> Nível {tier.name}
        </span>
      </div>
      <div className="flex flex-col justify-end">
        <div className="flex justify-between text-sm text-white/60">
          {REWARD_TIERS.map((item) => (
            <span key={item.id} className={cn(item.id === tier.id && "font-bold text-white")}>
              {item.name}
            </span>
          ))}
        </div>
        <ProgressBar value={progress} tone="inverse" label="Progresso até o próximo nível" className="mt-2" />
        <p className="mt-2 text-sm text-fg-inverse-muted">
          {next
            ? `Faltam ${formatNumber(next.minPoints - points)} pontos para o nível ${next.name}`
            : "Você chegou ao nível máximo!"}
        </p>
      </div>
    </section>
  );
}

export default function RewardsView() {
  const dispatch = useAppDispatch();
  const { points, vouchers } = useAppSelector((state) => state.engagement);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Toyota Recompensas"
        title="Pontos e recompensas"
        description="Ganhe pontos a cada serviço e troque por benefícios."
      />
      <BalanceHero points={points} />

      <div className="grid items-start gap-5 wide:grid-cols-[1.25fr_1fr]">
        <Card title="Recompensas" subtitle="Troque seus pontos por benefícios.">
          <ul className="flex flex-col gap-3">
            {REWARDS.map((reward) => {
              const canRedeem = points >= reward.cost;
              return (
                <li key={reward.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Gift aria-hidden size={20} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-fg">{reward.title}</p>
                    <p className="text-sm text-fg-secondary">{reward.description}</p>
                    <p className="text-sm font-bold text-primary">{formatNumber(reward.cost)} pontos</p>
                  </div>
                  <Button
                    size="md"
                    variant={canRedeem ? "primary" : "outline"}
                    disabled={!canRedeem}
                    onClick={() => {
                      const action = dispatch(redeemReward(reward));
                      setMessage(`Recompensa resgatada! Apresente o código ${action.payload.code} na concessionária.`);
                    }}
                  >
                    {canRedeem ? "Resgatar" : `Faltam ${formatNumber(reward.cost - points)}`}
                  </Button>
                </li>
              );
            })}
          </ul>
          <FormMessage message={message} tone="success" className="mt-4" />
          {vouchers.length ? (
            <div className="mt-5">
              <h4 className="mb-2 font-semibold text-fg">Meus vouchers</h4>
              <ul className="overflow-hidden rounded-xl border border-border">
                {vouchers.map((voucher, index) => (
                  <li key={voucher.id}>
                    <ListRow
                      icon={Ticket}
                      iconTone="success"
                      title={voucher.reward.title}
                      subtitle={`Código ${voucher.code}`}
                      showDivider={index > 0}
                      trailing={<Badge label="Disponível" tone="success" />}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        <div className="flex flex-col gap-5">
          <Card title="Como ganhar pontos" subtitle="Cada ação com a Toyota soma pontos." padded={false}>
            {EARN_RULES.map((rule, index) => (
              <ListRow
                key={rule.id}
                icon={TrendingUp}
                iconTone="primary"
                title={rule.title}
                subtitle={rule.description}
                showDivider={index > 0}
                trailing={<span className="font-bold whitespace-nowrap text-success">{rule.points}</span>}
              />
            ))}
          </Card>

          <Card title="Selos" subtitle="Conquistas desbloqueadas na sua jornada.">
            <ul className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
              {BADGES.map((badge) => (
                <li
                  key={badge.id}
                  className={cn("flex flex-col items-center rounded-xl bg-surface-muted p-3 text-center", !badge.earned && "opacity-60")}
                >
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full",
                      badge.earned ? "bg-primary text-white" : "bg-gray-light text-fg-muted",
                    )}
                  >
                    {badge.earned ? <Award aria-hidden size={24} /> : <Lock aria-hidden size={20} />}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-fg">{badge.title}</p>
                  <p className="text-xs text-fg-secondary">{badge.description}</p>
                  <span className="sr-only">{badge.earned ? "Conquistado" : "Bloqueado"}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
