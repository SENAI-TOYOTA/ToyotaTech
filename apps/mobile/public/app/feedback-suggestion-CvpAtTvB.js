import { A as e, D as t, G as n, M as r, N as i, P as a, W as o, b as s, d as c, et as l, ft as u, gt as d, ht as f, mt as p, pt as m, r as h, tt as g, ut as _, w as v } from "./vlibras-initial-Uv9QvrrX.js";
import { t as y } from "./trie-BK0pRT-V.js";
import { i as b, n as x, r as S, t as C } from "./dialog-CWvrTIHe.js";
import { t as w } from "./feedback-DYeIQqlY.js";
// src/widget/dialogs/feedback/lib/suggestions.ts
function T(e, t) {
	let n = e.slice(0, t).lastIndexOf(" "), r = e.indexOf(" ", t);
	return e.slice(n + 1, r === -1 ? e.length : r);
}
function E(e, t, n) {
	let r = e.slice(0, t), i = e.slice(t);
	return `${r.replace(/\S+$/, `${n} `)}${i.trimStart()}`;
}
function D(e, t) {
	let n = window.getComputedStyle(e), r = document.createElement("div");
	r.style.position = "absolute", r.style.visibility = "hidden", r.style.whiteSpace = "pre-wrap", r.style.wordWrap = "break-word", r.style.width = `${e.clientWidth}px`, r.style.font = n.font, r.style.padding = n.padding, r.style.lineHeight = n.lineHeight, r.style.letterSpacing = n.letterSpacing, r.textContent = e.value.slice(0, t);
	let i = document.createElement("span");
	i.textContent = "|", r.appendChild(i), document.body.appendChild(r);
	let a = e.parentElement?.clientWidth ?? e.clientWidth, o = i.offsetLeft + 15;
	o + 160 > a && (o = i.offsetLeft - 160), o = Math.max(0, o);
	let s = {
		top: i.offsetTop + Number.parseInt(n.lineHeight || "20", 10),
		left: o
	};
	return document.body.removeChild(r), s;
}
// src/widget/dialogs/feedback/suggestion-popup.tsx
var O = ({ id: t, activeIndex: n, suggestions: r, coords: i, onSelect: a }) => {
	let o = m([]);
	return _(() => {
		n >= 0 && o.current[n]?.scrollIntoView?.({ block: "nearest" });
	}, [n]), r.length === 0 ? null : /* @__PURE__ */ v("div", {
		role: "listbox",
		id: t,
		"aria-label": "Sugestões de glosa",
		className: "absolute z-50 flex max-h-30 max-w-45 flex-col gap-1 overflow-x-auto overflow-y-auto rounded-md border bg-background p-1 shadow-md",
		style: {
			top: `${i.top}px`,
			left: `${i.left}px`
		},
		children: r.map((r, i) => /* @__PURE__ */ v("button", {
			ref: (e) => {
				o.current[i] = e;
			},
			id: `${t}-${i}`,
			type: "button",
			tabIndex: -1,
			role: "option",
			"aria-selected": i === n,
			onClick: () => a(r),
			className: e("rounded px-2 py-1 text-left text-sm hover:cursor-pointer hover:bg-muted", i === n && "bg-muted"),
			children: r
		}, r))
	});
}, k = ({ open: e, onOpenChange: k }) => {
	let A = m(null), j = l(), M = r((e) => e.text), { data: N } = o(), { mutateAsync: P, isPending: F } = n(), [I, L] = f([]), [R, z] = f({
		top: 0,
		left: 0
	}), [B, V] = f(""), [H, U] = f(-1), W = u(), G = I.length > 0;
	_(() => {
		let { draftValue: e } = h.get();
		V(e ?? a.get().gloss ?? ""), h.set({
			reopen: !1,
			draftValue: void 0
		});
	}, []);
	let K = p(() => N ? new y(N) : null, [N]), q = !B.trim();
	_(() => void U(-1), [I]);
	let J = g(() => {
		if (!A.current) return;
		let e = A.current, t = e.selectionStart ?? 0, n = e.value;
		V(n);
		let r = T(n, t);
		r.length < 2 ? L([]) : (L(K ? K.searchSigns(r) : []), z(D(e, t)));
	}, 300), Y = () => {
		let { text: e } = i.get(), { gloss: t } = a.get();
		if (e && t && B) try {
			P({
				text: e,
				translation: t,
				review: B.toUpperCase(),
				rating: "bad"
			});
		} finally {
			k(!1), w();
		}
	}, X = (e) => {
		if (!A.current) return;
		let t = A.current.selectionStart ?? 0;
		V(E(B, t, e)), L([]), A.current.focus();
	}, Z = (e) => {
		G && (e.key === "ArrowDown" ? (e.preventDefault(), U((e) => Math.min(e + 1, I.length - 1))) : e.key === "ArrowUp" ? (e.preventDefault(), U((e) => Math.max(e - 1, 0))) : e.key === "Enter" && H >= 0 ? (e.preventDefault(), X(I[H])) : e.key === "Escape" && (e.stopPropagation(), L([])));
	}, Q = d(() => {
		B && (t(B), c({
			action: () => h.set({
				reopen: !0,
				draftValue: B
			}),
			auto: !0
		}));
	}, [B]);
	return /* @__PURE__ */ v(C, {
		open: e,
		onOpenChange: k,
		children: /* @__PURE__ */ v(x, { children: [/* @__PURE__ */ v(S, {
			closeProps: { "aria-label": "Fechar sugestão de glosa" },
			children: /* @__PURE__ */ v(b, {
				icon: "comment",
				children: "Feedback"
			})
		}), /* @__PURE__ */ v("div", {
			className: "flex h-full flex-col gap-2 overflow-y-auto px-4 py-4",
			children: [
				!!M && /* @__PURE__ */ v("div", { children: /* @__PURE__ */ v("p", {
					title: M,
					className: "break-anywhere line-clamp-3 text-muted-foreground text-xs",
					children: [
						/* @__PURE__ */ v("strong", { children: "Texto traduzido:" }),
						" ",
						M
					]
				}) }),
				/* @__PURE__ */ v("div", {
					className: "flex items-center justify-between",
					children: /* @__PURE__ */ v("label", {
						for: "translator-input",
						className: "font-semibold text-sm",
						children: "Informe a glosa correta"
					})
				}),
				/* @__PURE__ */ v("div", {
					className: "relative",
					children: [/* @__PURE__ */ v("textarea", {
						ref: A,
						id: "translator-input",
						value: B,
						placeholder: "Digite aqui...",
						role: "combobox",
						"aria-autocomplete": "list",
						"aria-expanded": G,
						"aria-controls": G ? W : void 0,
						"aria-activedescendant": H >= 0 ? `${W}-${H}` : void 0,
						className: "h-40 mobile:h-32 w-full resize-none rounded-lg border bg-muted p-3 text-sm uppercase placeholder:normal-case",
						rows: j ? 4 : 6,
						onChange: J,
						onKeyDown: Z
					}), /* @__PURE__ */ v(O, {
						id: W,
						activeIndex: H,
						onSelect: X,
						suggestions: I,
						coords: R
					})]
				}),
				/* @__PURE__ */ v("div", {
					className: "space-y-2 [&>button]:h-10 [&>button]:w-full [&>button]:rounded-full mobile:[&>button]:text-sm",
					children: [/* @__PURE__ */ v(s, {
						variant: "default",
						onClick: Y,
						disabled: F || q,
						children: F ? "Enviando..." : "Enviar sugestão"
					}), /* @__PURE__ */ v(s, {
						disabled: F || q,
						variant: "outline",
						onClick: Q,
						children: "Reproduzir"
					})]
				})
			]
		})] })
	});
};
export { k as FeedbackSuggestion };
