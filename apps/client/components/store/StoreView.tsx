"use client";

import {
  Car,
  Check,
  Cpu,
  Minus,
  Plus,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Button, Card, Chip, EmptyState, FormMessage } from "@/components/ui";
import { formatCurrency, formatNumber } from "@/lib/mocks/aftersales";
import { PRODUCT_CATEGORIES, PRODUCTS, type Product } from "@/lib/mocks/engagement";
import {
  addToCart,
  cartTotal,
  changeQuantity,
  checkout,
  useAppDispatch,
  useAppSelector,
} from "@/store";

const categoryIcons: Record<string, LucideIcon> = {
  Acessórios: Car,
  Cuidados: Sparkles,
  Tecnologia: Cpu,
  Coleção: Shirt,
};

const perks = [
  { icon: ShieldCheck, text: "Peças originais com garantia de fábrica" },
  { icon: Store, text: "Retire na sua concessionária" },
  { icon: Sparkles, text: "Ganhe 1 ponto a cada R$ 1" },
];

function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);
  const Icon = categoryIcons[product.category] ?? ShoppingBag;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex h-32 flex-col items-center justify-center gap-2 bg-linear-to-br from-ink to-ink-soft text-white">
        <Icon aria-hidden size={44} strokeWidth={1.4} />
        <span className="text-xs font-medium tracking-wider text-white/60 uppercase">{product.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[17px] font-semibold text-fg">{product.name}</h3>
        <p className="mt-1 flex-1 text-sm text-fg-secondary">{product.description}</p>
        <p className="mt-3 text-2xl font-bold text-fg">{formatCurrency(product.price)}</p>
        <p className="text-sm font-medium text-success">Ganhe {formatNumber(Math.floor(product.price))} pontos</p>
        <Button
          size="md"
          fullWidth
          variant={added ? "secondary" : "primary"}
          iconPosition="left"
          icon={added ? <Check size={16} /> : <ShoppingCart size={16} />}
          className="mt-3"
          onClick={() => {
            dispatch(addToCart(product));
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1200);
          }}
        >
          {added ? "Adicionado" : "Adicionar ao carrinho"}
        </Button>
      </div>
    </article>
  );
}

function CartCard() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.engagement.cart);
  const [message, setMessage] = useState<string | null>(null);
  const total = cartTotal(cart);

  return (
    <Card title="Seu carrinho">
      {cart.length ? (
        <div className="flex flex-col gap-3">
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">{item.product.name}</p>
                <p className="text-sm text-fg-secondary">{formatCurrency(item.product.price * item.quantity)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Remover um ${item.product.name}`}
                  onClick={() => dispatch(changeQuantity({ productId: item.product.id, delta: -1 }))}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border-strong hover:bg-surface-muted"
                >
                  <Minus aria-hidden size={14} />
                </button>
                <span className="w-5 text-center font-semibold text-fg">{item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Adicionar um ${item.product.name}`}
                  onClick={() => dispatch(changeQuantity({ productId: item.product.id, delta: 1 }))}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border-strong hover:bg-surface-muted"
                >
                  <Plus aria-hidden size={14} />
                </button>
              </div>
            </div>
          ))}
          <div className="mt-1 flex justify-between border-t border-border pt-3">
            <span className="text-lg font-semibold text-fg">Total</span>
            <span className="text-xl font-bold text-fg">{formatCurrency(total)}</span>
          </div>
          <p className="text-sm font-medium text-success">
            Você vai ganhar {formatNumber(Math.floor(total))} pontos com este pedido.
          </p>
          <Button
            fullWidth
            onClick={() => {
              const earned = Math.floor(total);
              dispatch(checkout());
              setMessage(`Pedido realizado! Retire na sua concessionária. Você ganhou ${formatNumber(earned)} pontos.`);
            }}
          >
            Finalizar pedido
          </Button>
        </div>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Adicione acessórios e produtos originais ao seu carrinho."
        />
      )}
      <FormMessage message={message} tone="success" className="mt-3" />
    </Card>
  );
}

export default function StoreView() {
  const [category, setCategory] = useState("Todos");
  const cart = useAppSelector((state) => state.engagement.cart);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const filtered = useMemo(
    () => (category === "Todos" ? PRODUCTS : PRODUCTS.filter((item) => item.category === category)),
    [category],
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Loja Toyota"
        title="Loja Toyota"
        description="Acessórios originais, produtos de cuidado e a coleção Toyota."
        action={
          <a href="#carrinho" className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-semibold text-white">
            <ShoppingCart aria-hidden size={18} />
            {count} {count === 1 ? "item" : "itens"}
          </a>
        }
      />

      <ul className="-mt-1 grid gap-3 tablet:grid-cols-3">
        {perks.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
            <Icon aria-hidden size={20} strokeWidth={1.8} className="text-primary" />
            <span className="text-sm font-medium text-fg">{text}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
        {PRODUCT_CATEGORIES.map((item) => (
          <Chip key={item} selected={item === category} onClick={() => setCategory(item)}>
            {item}
          </Chip>
        ))}
      </div>

      <div className="grid items-start gap-5 wide:grid-cols-[1fr_300px]">
        <div className="grid gap-4 tablet:grid-cols-2 wide:grid-cols-2">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div id="carrinho" className="scroll-mt-24 wide:sticky wide:top-24">
          <CartCard />
        </div>
      </div>
    </div>
  );
}
