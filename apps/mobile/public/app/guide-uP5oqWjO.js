import { A as e, E as t, F as n, M as r, N as i, O as a, P as o, S as s, Y as c, _ as l, b as u, et as d, f, ft as p, ht as m, k as h, mt as g, n as _, p as v, pt as y, s as b, t as x, ut as S, v as C, w, y as T } from "./vlibras-initial-ym-qZWO7.js";
import { t as E } from "./zus-context-COW58tgU.js";
// src/widget/components/guide/actions.tsx
var D = () => {
	let e = M((e) => e.onClose), { status: t, gloss: r } = n(c("gloss", "status")), i = g(() => r && t === "idle", [r, t]);
	return /* @__PURE__ */ w("div", {
		className: "widget-radius absolute top-1 right-1 flex flex-col",
		children: [/* @__PURE__ */ w(u, {
			onClick: e,
			size: "icon-xs",
			"aria-label": "Fechar guia",
			children: /* @__PURE__ */ w(T, { name: "x" })
		}), i && /* @__PURE__ */ w(u, {
			"aria-label": "Repetir texto",
			onClick: a,
			size: "icon-xs",
			className: "animate-move-right",
			children: /* @__PURE__ */ w(T, { name: "repeat" })
		})]
	});
}, O = [
	{
		selector: "#header-menu-button",
		text: "Clique no Menu para acessar o Tradutor, o Dicionário ou saber mais sobre o VLibras.",
		gloss: "CLIQUE MENU ACESSAR TRADUTOR DICIONÁRIO SABER MAIS&QUANTIDADE SOBRE&ASSUNTO VLIBRAS",
		guideClx: "top-0! bottom-auto!",
		focus: !0
	},
	{
		selector: "#header-actions",
		text: "Aqui você pode aumentar o tamanho da janela e fechar a aplicação.",
		gloss: "AQUI VOCÊ PODER&POSSIBILIDADE AUMENTAR&TAMANHO JANELA FECHAR&INFORMÁTICA APLICAÇÃO",
		guideClx: "top-0! bottom-auto!"
	},
	{
		selector: "#toggle-avatar-button",
		text: "Aqui você pode alterar o avatar. Você pode escolher entre Ícaro, Hosana e Guga.",
		gloss: "AQUI VOCÊ PODER&POSSIBILIDADE TROCAR AVATAR [PONTO] VOCÊ PODER&POSSIBILIDADE ESCOLHER ENTRE [WLCM]ICARO_SINAL [WLCM]HOZANA_SINAL [WLCM]GUGA_SINAL ",
		guideClx: "top-auto! bottom-6.5!",
		guideClxExpanded: "mr-12!"
	},
	{
		selector: "#main-action-speed-options",
		text: "Aqui você pode pausar, retomar, reiniciar ou alterar a velocidade da animação.",
		gloss: "AQUI VOCÊ PODER&POSSIBILIDADE RETOMAR RETOMAR REINICIAR OU ALTERAR VELOCIDADE ANIMAR",
		guideClx: "top-auto! bottom-0!"
	},
	{
		selector: "#emotions-subtitles-options",
		text: "Estas opções permitem alterar a emoção do avatar e ativar ou desativar as legendas.",
		gloss: "OPÇÃO PERMITIR&LIBERAR ALTERAR EMOÇÃO AVATAR ATIVAR OU DESATIVAR LEGENDA",
		guideClx: "top-auto! bottom-0!"
	},
	{
		selector: "#settings-option",
		text: "Opção para acessar as configurações do VLibras. Aqui você pode alterar o tema, regionalismo e transparência do fundo do avatar.",
		gloss: "OPÇÃO ACESSAR CONFIGURAÇÃO [PONTO] AQUI VOCÊ PODER&POSSIBILIDADE ALTERAR TEMA&ASSUNTO ALTERAR REGIONAL ALTERAR TRANSPARÊNCIA&NITIDEZ ALTERAR FUNDO&ATRÁS AVATAR",
		guideClx: "top-auto! bottom-0!"
	}
], k = () => {
	let e = y(null), t = y(null), { index: n, setIndex: r, onClose: i } = M(c("index", "setIndex", "onClose")), a = g(() => n === 0, [n]), o = g(() => n === O.length - 1, [n]);
	return S(() => e.current?.focus(), [a]), S(() => t.current?.focus(), [o]), /* @__PURE__ */ w("div", {
		className: "flex items-center justify-between gap-2",
		children: [
			/* @__PURE__ */ w(u, {
				ref: t,
				disabled: a,
				variant: "ghost",
				size: "sm",
				className: "text-primary-foreground outline-primary-foreground hover:bg-primary-foreground/5",
				onClick: () => r(n - 1),
				children: [/* @__PURE__ */ w(T, { name: "arrow-left" }), "Voltar"]
			}),
			/* @__PURE__ */ w("div", {
				className: "flex h-4 w-40 items-center justify-center gap-1 [&_span]:rounded-full [&_span]:bg-primary-foreground/30",
				children: O.map((e, t) => /* @__PURE__ */ w("span", {
					"data-active": t === n,
					className: "size-2 rounded-full data-[active=true]:bg-primary-foreground!"
				}, t))
			}),
			/* @__PURE__ */ w(u, {
				ref: e,
				variant: "ghost",
				size: "sm",
				className: "text-primary-foreground outline-primary-foreground hover:bg-primary-foreground/5",
				onClick: o ? i : () => r((e) => e + 1),
				children: [o ? "Concluir" : "Avançar", !o && /* @__PURE__ */ w(T, { name: "arrow-right" })]
			})
		]
	});
}, A = s("absolute flex flex-col gap-4 z-50 widget-radius bg-primary p-4 transition-position", {
	variants: {
		isMobile: {
			true: "",
			false: ""
		},
		isLeft: {
			true: "",
			false: ""
		},
		isTop: {
			true: "",
			false: ""
		},
		isExpanded: {
			true: "",
			false: ""
		}
	},
	compoundVariants: [
		{
			isExpanded: !1,
			class: "w-screen max-w-xs"
		},
		{
			isMobile: !1,
			isExpanded: !1,
			isLeft: !0,
			class: "top-0 -right-3 translate-x-full"
		},
		{
			isMobile: !1,
			isExpanded: !1,
			isLeft: !1,
			class: "top-0 -left-3 -translate-x-full"
		},
		{
			isMobile: !0,
			isExpanded: !1,
			isTop: !0,
			class: "inset-x-0 -bottom-2 left-1/2 min-w-xs -translate-x-1/2 translate-y-full"
		},
		{
			isMobile: !0,
			isExpanded: !1,
			isTop: !1,
			class: "inset-x-0 -top-2 left-1/2 min-w-xs -translate-x-1/2 -translate-y-full"
		},
		{
			isExpanded: !0,
			class: "z-2147483647 inset-x-4 bottom-16"
		}
	],
	defaultVariants: {
		isMobile: !1,
		isExpanded: !1,
		isLeft: !1,
		isTop: !1
	}
}), { Provider: j, useCtx: M } = E(), N = () => {
	let { pos: n } = b(), { innerWidth: a, innerHeight: s } = window, [c, u] = m(0), T = v(), E = r((e) => e.isExpanded), M = r((e) => e.isTranslating), N = C((e) => e.appRoot), P = d(), F = p(), I = y(null), L = y(null), R = g(() => n.x < (a - (N?.clientWidth || 0)) / 2, [n.x, a]), z = g(() => n.y < (s - (N?.clientHeight || 0)) / 2, [n.y, s]), B = g(() => O[c], [c]), V = () => {
		i.set({ text: void 0 }), o.set({ gloss: void 0 }), f.get().reset(), U(), h();
	}, H = y(V);
	if (H.current = V, S(() => void (M && V()), [M]), S(() => {
		let { shadowRoot: e } = l.get(), t = e?.activeElement ?? document.activeElement;
		return t && t !== document.body && (I.current = t), () => {
			let e = I.current;
			I.current = null, e?.isConnected ? e.focus({ preventScroll: !0 }) : l.get().appRoot?.querySelector("#header-menu-button")?.focus({ preventScroll: !0 });
		};
	}, []), S(() => {
		let e = (e) => {
			e.key === "Escape" && (e.stopPropagation(), H.current());
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}, []), S(() => {
		let e = requestAnimationFrame(() => L.current?.focus({ preventScroll: !0 }));
		return () => cancelAnimationFrame(e);
	}, []), S(() => {
		if (!N) return;
		U(), t(B.gloss), B.action?.();
		let e = x(B.selector, N);
		e && (f.set({ element: B }), e.dataset.highlight = "true", B.focus && e.focus());
	}, [B]), !N) return null;
	let U = () => {
		N && _("[data-highlight=true]", N)?.forEach((e) => e.dataset.highlight = "false");
	};
	return /* @__PURE__ */ w(j, {
		data: {
			index: c,
			setIndex: u,
			onClose: V,
			...T
		},
		children: /* @__PURE__ */ w("div", {
			ref: L,
			tabIndex: -1,
			role: "dialog",
			"aria-label": "Guia rápido do VLibras",
			"aria-describedby": F,
			onKeyDown: (e) => {
				e.key === "Escape" && (e.stopPropagation(), V());
			},
			className: e(A({
				isMobile: P,
				isLeft: R,
				isTop: z,
				isExpanded: E
			}), !E && !P && B.guideClx, E && B.guideClxExpanded),
			children: [
				/* @__PURE__ */ w("div", {
					className: "pr-4",
					children: /* @__PURE__ */ w("span", {
						id: F,
						role: "status",
						className: "break-anywhere expanded:text-base! mobile:text-sm text-base text-primary-foreground",
						children: B.text
					})
				}),
				/* @__PURE__ */ w(D, {}),
				/* @__PURE__ */ w(k, {}),
				!E && /* @__PURE__ */ w("span", { className: e("absolute -z-10 my-4 size-4 rotate-45 rounded-xs bg-primary max-lg:hidden", B.guideClx, R ? "-left-1" : "-right-1") })
			]
		})
	});
};
export { N as Guide };
