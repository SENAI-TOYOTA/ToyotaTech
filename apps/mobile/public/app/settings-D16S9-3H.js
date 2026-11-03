import { A as e, F as t, I as n, J as r, M as i, N as a, P as o, X as s, a as c, b as l, c as u, et as d, ft as f, mt as p, pt as m, u as h, ut as g, vt as _, w as v, x as y, y as b } from "./vlibras-initial-ym-qZWO7.js";
import { t as x } from "./zus-context-COW58tgU.js";
import { a as S, i as C, n as w, r as T, t as E } from "./dialog-Zii2Mc6Y.js";
// src/widget/dialogs/settings/context.ts
var { Provider: D, useCtx: O } = x(), k = () => {
	let e = m(null), t = i((e) => e.opacity), n = O((e) => e.onOpen), r = f(), o = Number(t) * 100, s = Math.round(Number(t) * 100);
	g(() => () => {
		e.current && clearTimeout(e.current);
	}, []);
	let c = (t) => {
		a.set({ opacity: t / 100 }), e.current && clearTimeout(e.current), e.current = setTimeout(() => u.trackEvent("opacity_change", { opacity: t }), 2e3);
	};
	return /* @__PURE__ */ v("div", { children: [/* @__PURE__ */ v("label", {
		htmlFor: r,
		className: "flex w-full cursor-pointer items-center justify-between py-1 mobile:text-sm text-base",
		children: [/* @__PURE__ */ v("span", {
			className: "mobile:text-sm text-base",
			children: ["Opacidade", /* @__PURE__ */ v(h, {
				gloss: "OPACIDADE",
				label: "Opacidade",
				onFinish: n
			})]
		}), /* @__PURE__ */ v("span", {
			className: "font-semibold",
			"aria-hidden": "true",
			children: [s, "%"]
		})]
	}), /* @__PURE__ */ v("input", {
		type: "range",
		id: r,
		"aria-valuetext": `${s}%`,
		min: 0,
		max: 100,
		step: 5,
		value: o,
		onChange: (e) => c(Number(e.currentTarget.value)),
		onPointerDown: (e) => e.stopPropagation(),
		className: "range-slider",
		style: { background: `linear-gradient(to right, var(--color-primary, #3b82f6) ${o}%, var(--color-muted, #e2e8f0) ${o}%)` }
	})] });
}, A = ({ isSelected: t, region: n, onSelect: r }) => {
	let i = f();
	return /* @__PURE__ */ v("label", {
		htmlFor: i,
		className: e("flex w-full cursor-pointer items-center justify-between whitespace-nowrap rounded-lg p-1.5 pr-3 transition-[colors] hover:bg-muted", t && "bg-muted"),
		children: [/* @__PURE__ */ v("div", {
			className: "flex items-center justify-start gap-2 font-semibold mobile:text-xs text-secondary text-sm dark:text-white",
			children: [/* @__PURE__ */ v("img", {
				src: s(n.flag),
				alt: "",
				className: "h-7 mobile:h-6 w-auto rounded-sm border"
			}), /* @__PURE__ */ v("span", { children: n.name })]
		}), /* @__PURE__ */ v("input", {
			id: i,
			type: "radio",
			name: "region",
			checked: t,
			onChange: r,
			className: "radio mobile:size-4 size-5 border border-primary bg-transparent! p-0.75! text-primary"
		})]
	});
}, j = () => {
	let r = t((e) => e.region), i = O((e) => e.onOpen), a = (e) => {
		o.set({ region: e }), u.trackEvent("change_region", { region: `${e.name} (${e.abbreviation})` });
	};
	return /* @__PURE__ */ v("div", {
		className: "flex w-full items-center justify-between",
		children: [/* @__PURE__ */ v("p", {
			className: "mobile:text-sm text-base",
			children: ["Regionalismo", /* @__PURE__ */ v(h, {
				gloss: "REGIÃO",
				label: "Regionalismo",
				onFinish: i
			})]
		}), /* @__PURE__ */ v(E, {
			nested: !0,
			children: [/* @__PURE__ */ v(S, {
				className: e(y({ variant: "ghost" }), "h-auto border p-1"),
				children: [/* @__PURE__ */ v("span", {
					className: "ml-1 font-semibold mobile:text-xs text-sm",
					children: r.abbreviation
				}), /* @__PURE__ */ v("img", {
					className: "h-6 mobile:h-6 rounded-sm border",
					src: s(r.flag),
					alt: r.name
				})]
			}), /* @__PURE__ */ v(w, {
				className: "max-h-[70%]",
				children: ({ onOpenChange: e }) => /* @__PURE__ */ v(_, { children: [/* @__PURE__ */ v(T, {
					closeProps: { "aria-label": "Fechar regionalismo" },
					children: /* @__PURE__ */ v(C, { children: "Regionalismo" })
				}), /* @__PURE__ */ v("div", {
					role: "radiogroup",
					"aria-label": "Opções de regionalismo",
					className: "flex flex-col overflow-y-auto p-1",
					children: n.map((t) => /* @__PURE__ */ v(A, {
						onSelect: () => {
							a(t), e(!1);
						},
						isSelected: t === r,
						region: t
					}, t.abbreviation))
				})] })
			})]
		})]
	});
}, M = () => {
	let e = r((e) => e.theme), t = O((e) => e.onOpen), n = f();
	return /* @__PURE__ */ v("label", {
		htmlFor: n,
		className: "flex w-full cursor-pointer items-center justify-between py-1",
		children: [/* @__PURE__ */ v("span", {
			className: "mobile:text-sm text-base",
			children: ["Tema escuro", /* @__PURE__ */ v(h, {
				gloss: "TEMA ESCURO",
				label: "Tema escuro",
				onFinish: t
			})]
		}), /* @__PURE__ */ v("input", {
			type: "checkbox",
			id: n,
			onChange: () => {
				let { theme: e, toggleTheme: t } = r.getState(), n = e === "dark" ? "Claro" : "Escuro";
				t(), u.trackEvent("theme", { theme: n });
			},
			checked: e === "dark",
			className: "toggle toggle-sm rounded-full bg-accent text-primary before:size-4 before:rounded-full not-checked:before:bg-background checked:bg-primary checked:text-primary-foreground"
		})]
	});
}, N = ({ open: e, onOpenChange: s }) => {
	let u = d(), f = t((e) => e.region), m = i((e) => e.opacity), { theme: h, setTheme: g } = r(), y = () => {
		let e = n[0];
		g("light"), o.set({ region: e }), a.set({ opacity: 1 });
	}, x = p(() => f.abbreviation === "BR" && m === 1 && h === "light", [
		f,
		m,
		h
	]);
	return /* @__PURE__ */ v(D, {
		data: {
			onOpen: () => s(!0),
			onClose: () => s(!1)
		},
		children: /* @__PURE__ */ v(E, {
			open: e,
			onOpenChange: s,
			children: /* @__PURE__ */ v(w, { children: [/* @__PURE__ */ v(T, {
				className: "relative",
				closeProps: { "aria-label": "Fechar configurações" },
				children: [/* @__PURE__ */ v(C, {
					icon: "settings",
					children: "Configurações"
				}), !x && /* @__PURE__ */ v(_, { children: [/* @__PURE__ */ v(c, {
					className: "-mr-1",
					align: "end",
					placement: "bottom",
					content: "Redefinir",
					arrow: { position: "top-right" },
					visualOnly: !0,
					children: /* @__PURE__ */ v(l, {
						onClick: y,
						"aria-label": "Redefinir configurações",
						variant: "ghost",
						size: u ? "icon-xs" : "icon-sm",
						className: "animate-move-up mobile:text-xs text-sm",
						children: /* @__PURE__ */ v(b, { name: "rotate-left" })
					})
				}), /* @__PURE__ */ v("div", { children: /* @__PURE__ */ v("span", { className: "absolute inset-y-0 w-px bg-border" }) })] })]
			}), /* @__PURE__ */ v("div", {
				className: "space-y-4 p-4",
				children: [
					/* @__PURE__ */ v(M, {}),
					/* @__PURE__ */ v(j, {}),
					/* @__PURE__ */ v(k, {})
				]
			})] })
		})
	});
};
export { N as SettingsDialog };
