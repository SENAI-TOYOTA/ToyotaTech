import { A as e, _ as t, _t as n, b as r, et as i, ft as a, g as o, l as s, o as c, pt as l, ut as u, w as d, y as f, yt as p } from "./vlibras-initial-ym-qZWO7.js";
// src/widget/screens/components.tsx
var m = p(""), h = ({ children: n, className: r, ...i }) => {
	let c = l(null), f = l(null), p = a(), h = o((e) => e.closeAll);
	return u(() => {
		let { shadowRoot: e } = t.get(), n = e?.activeElement ?? document.activeElement;
		n && n !== document.body && (f.current = n);
		let r = requestAnimationFrame(() => c.current?.focus({ preventScroll: !0 }));
		return () => {
			cancelAnimationFrame(r);
			let e = f.current;
			f.current = null, e?.isConnected ? e.focus({ preventScroll: !0 }) : t.get().appRoot?.querySelector("#header-menu-button")?.focus({ preventScroll: !0 });
		};
	}, []), /* @__PURE__ */ d(m.Provider, {
		value: p,
		children: /* @__PURE__ */ d("div", {
			ref: c,
			tabIndex: -1,
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": p,
			onKeyDown: (e) => {
				e.key === "Escape" ? (e.stopPropagation(), h()) : s(c.current, e);
			},
			className: e("widget-radius absolute inset-0 z-999999 flex animate-move-right flex-col bg-background", r),
			...i,
			children: n
		})
	});
}, g = ({ children: t, className: n, ...r }) => /* @__PURE__ */ d("div", {
	className: "relative",
	children: [/* @__PURE__ */ d("div", {
		className: e("pointer-events-none flex h-min items-center gap-3 border-b p-2 *:z-10 [&_button]:pointer-events-auto", n),
		...r,
		children: [r.close && /* @__PURE__ */ d(_, {}), t]
	}), /* @__PURE__ */ d(c, {})]
}), _ = ({ className: e, ...t }) => {
	let n = o((e) => e.closeAll), a = i();
	return /* @__PURE__ */ d(r, {
		"aria-label": "Voltar",
		onClick: n,
		variant: "outline",
		size: a ? "icon-sm" : "icon",
		className: e,
		...t,
		children: /* @__PURE__ */ d(f, { name: "arrow-left" })
	});
}, v = ({ children: t, className: r, ...i }) => {
	let a = n(m);
	return /* @__PURE__ */ d("h2", {
		id: a,
		className: e("pointer-events-none font-semibold mobile:text-sm text-base", r),
		...i,
		children: t
	});
}, y = ({ children: t, className: n, ...r }) => /* @__PURE__ */ d("div", {
	className: e("flex h-full flex-col gap-4 overflow-y-auto p-4", n),
	...r,
	children: t
});
export { v as i, y as n, g as r, h as t };
