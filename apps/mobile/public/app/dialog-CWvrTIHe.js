import { A as e, E as t, F as n, N as r, P as i, Q as a, T as o, _ as s, _t as c, b as l, et as u, ft as d, ht as f, l as p, n as m, ot as h, pt as g, ut as _, v, w as y, y as b, yt as x } from "./vlibras-initial-Uv9QvrrX.js";
// src/widget/components/ui/dialog.tsx
var S = x(null), C = ({ children: t }) => {
	let [r] = f(a), i = c(S), o = n((e) => e.status === "playing"), [l, u] = f(!0), d = g(null), h = g(null);
	return _(() => void (o && !l && i?.onOpenChange(!1)), [o]), _(() => {
		let { appRoot: e, appContent: t } = s.get();
		if (!i || !t || !e) return;
		if (i.open) {
			u(!1), !i.nested && i.overlay && (t.inert = !0);
			let n = m(`[data-slot='dialog-wrapper']:not([id='dialog-${r}'])`, e);
			return n?.forEach((e) => e.inert = !0), () => {
				!i.nested && i.overlay && (t.inert = !1), n?.forEach((e) => e.inert = !1);
			};
		}
		let n = setTimeout(() => u(!0), 150);
		return () => clearTimeout(n);
	}, [
		i?.open,
		i?.overlay,
		i?.nested
	]), _(() => {
		if (!i?.open) return;
		let { shadowRoot: e } = s.get(), t = e?.activeElement ?? document.activeElement;
		t && t !== document.body && (h.current = t);
	}, [i?.open]), _(() => {
		if (!i?.open || l) return;
		let e = requestAnimationFrame(() => {
			(d.current?.querySelector("[data-slot=\"dialog-content\"]"))?.focus({ preventScroll: !0 });
		});
		return () => cancelAnimationFrame(e);
	}, [i?.open, l]), _(() => {
		if (i?.open) return;
		let e = h.current;
		e?.isConnected && requestAnimationFrame(() => e.focus({ preventScroll: !0 })), h.current = null;
	}, [i?.open]), !i || l ? null : i.overlay ? /* @__PURE__ */ y("div", {
		ref: d,
		id: `dialog-${r}`,
		"data-slot": "dialog-wrapper",
		"data-state": i.open ? "open" : "close",
		className: e("group absolute inset-0 z-99999 flex items-end bg-black/20", i.nested && "bg-transparent!"),
		onClick: () => i.onOpenChange(!1),
		onKeyDown: (e) => {
			e.key === "Escape" ? (e.stopPropagation(), i.onOpenChange(!1)) : p(d.current?.querySelector("[data-slot=\"dialog-content\"]"), e);
		},
		children: t
	}) : /* @__PURE__ */ y("div", {
		className: "absolute inset-0 top-auto",
		children: t
	});
}, w = ({ nested: e = !1, overlay: n = !0, open: a, onOpenChange: s, children: c }) => {
	let [l, u] = f(!1), p = d(), m = a ?? l, h = s ?? u;
	return _(() => {
		if (e) return;
		let { isPausedByUser: n } = r.get(), { gloss: a, isWelcomeFinished: s, status: c } = i.get();
		if (m && c === "playing") return o();
		if (!m && !n && (a || !s)) {
			let e = setTimeout(t, 300);
			return () => clearTimeout(e);
		}
	}, [m, e]), /* @__PURE__ */ y(S.Provider, {
		value: {
			open: m,
			onOpenChange: h,
			nested: e,
			overlay: n,
			titleId: p
		},
		children: c
	});
}, T = ({ children: e, ...t }) => {
	let n = c(S);
	if (!n) throw Error("DialogTrigger deve estar dentro de <Dialog />");
	return /* @__PURE__ */ y("button", {
		type: "button",
		"aria-expanded": n.open,
		"aria-haspopup": "dialog",
		onClick: () => n.onOpenChange(!0),
		...t,
		children: e
	});
}, E = ({ className: t, children: n, closeProps: r, showCloseButton: i = !0, ...a }) => {
	let o = c(S), s = u();
	return /* @__PURE__ */ y("div", {
		"data-slot": "dialog-header",
		className: e("flex items-start gap-2 border-b p-2.5 mobile:py-2 pl-4", t),
		...a,
		children: [n, i && /* @__PURE__ */ y(l, {
			"aria-label": "Fechar diálogo",
			"data-slot": "dialog-close",
			onClick: () => o?.onOpenChange(!1),
			size: s ? "icon-xs" : "icon-sm",
			variant: "ghost",
			...r,
			children: /* @__PURE__ */ y(b, { name: "x" })
		})]
	});
}, D = ({ children: t, icon: n, className: r, ...i }) => {
	let a = c(S);
	return /* @__PURE__ */ y("h3", {
		id: a?.titleId,
		"data-slot": "dialog-title",
		className: e("relative mt-0.75 mr-auto flex items-center gap-1.5 overflow-hidden font-semibold mobile:text-sm text-base leading-normal", r),
		...i,
		children: [n && /* @__PURE__ */ y(b, {
			name: n,
			className: "relative -bottom-px mobile:size-4.5 size-5 shrink-0"
		}), /* @__PURE__ */ y("div", {
			className: "truncate break-all",
			children: t
		})]
	});
}, O = ({ children: t, className: n, ...r }) => {
	let i = c(S), a = v((e) => e.appRoot);
	return !i || !a ? null : h(/* @__PURE__ */ y(C, { children: /* @__PURE__ */ y("div", {
		"data-slot": "dialog-content",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": i.titleId,
		tabIndex: -1,
		className: e("dialog-content widget-radius relative flex max-h-full w-full animate-move-up flex-col border bg-background", "transition-[margin] duration-500 ease-in-out group-data-[state=close]:-mb-100", n),
		style: { boxShadow: "0 -5px 10px -5px rgba(0, 0, 0, 0.15)" },
		onClick: (e) => e.stopPropagation(),
		...r,
		children: typeof t == "function" ? t(i) : t
	}) }), a);
};
export { T as a, D as i, O as n, E as r, w as t };
