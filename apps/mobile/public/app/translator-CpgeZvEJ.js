import { C as e, E as t, M as n, b as r, c as i, d as a, ht as o, j as s, pt as c, tt as l, u, ut as d, vt as f, w as p, y as m } from "./vlibras-initial-ym-qZWO7.js";
import { i as h, n as g, r as _, t as v } from "./dialog-Zii2Mc6Y.js";
// src/widget/utils/index.ts
var y = (e) => e.trim() ? /[\p{L}\p{N}]/u.test(e) : !1, b = ({ open: b, onOpenChange: x }) => {
	let S = c(null), C = n((e) => e.isTranslating), [w, T] = o(""), { mutateAsync: E, isPending: D } = s(), O = l(T, 300), k = y(w);
	d(() => void (b && i.trackEvent("open_translator")), [b]);
	let A = async () => {
		let e = S.current?.value || "";
		if (e) try {
			let n = await E(e);
			t(n || e), x(!1), a({
				action: () => x(!0),
				content: /* @__PURE__ */ p(f, { children: [/* @__PURE__ */ p(m, { name: "translator" }), "Reabrir Tradutor"] })
			});
		} catch (e) {
			console.error("Falha ao traduzir/reproduzir o texto do tradutor: ", e);
		}
	};
	return /* @__PURE__ */ p(v, {
		open: b,
		onOpenChange: x,
		children: /* @__PURE__ */ p(g, { children: [/* @__PURE__ */ p(_, {
			closeProps: { "aria-label": "Fechar tradutor" },
			children: /* @__PURE__ */ p(h, {
				icon: "translator",
				children: "Tradutor"
			})
		}), /* @__PURE__ */ p("div", {
			className: "space-y-2 overflow-y-auto p-4 pt-2",
			children: [/* @__PURE__ */ p("div", {
				className: "flex flex-col gap-1",
				children: [
					/* @__PURE__ */ p("div", {
						className: "flex h-8 items-center justify-between",
						children: [/* @__PURE__ */ p("label", {
							htmlFor: "translator-text",
							className: "font-semibold text-sm",
							children: ["Insira seu texto", /* @__PURE__ */ p(u, {
								gloss: "INSERIR TEXTO",
								label: "Insira seu texto",
								onFinish: () => x(!0)
							})]
						}), w.length > 0 && /* @__PURE__ */ p(r, {
							"aria-label": "Limpar texto",
							onClick: () => {
								S.current && (S.current.value = "", S.current?.focus(), T(""));
							},
							size: "icon-xs",
							variant: "ghost",
							className: "animate-move-up text-destructive",
							children: /* @__PURE__ */ p(m, { name: "trash" })
						})]
					}),
					/* @__PURE__ */ p("textarea", {
						defaultValue: w,
						ref: S,
						onKeyDown: (e) => {
							e.key === "Enter" && (e.ctrlKey || e.metaKey) && (e.preventDefault(), w.length >= 3 && A());
						},
						onChange: (e) => O(e.currentTarget.value),
						name: "text",
						id: "translator-text",
						"aria-describedby": "translator-text-hint",
						className: "h-32 w-full resize-none rounded-lg border bg-muted p-2 text-sm"
					}),
					/* @__PURE__ */ p("p", {
						id: "translator-text-hint",
						className: "text-muted-foreground text-xs",
						children: "Pressione Ctrl+Enter (ou Cmd+Enter no Mac) para traduzir. Enter insere uma nova linha."
					})
				]
			}), /* @__PURE__ */ p(r, {
				onClick: A,
				disabled: w.length < 3 || C || D || !k,
				className: "h-10 w-full rounded-full text-sm",
				children: [D && /* @__PURE__ */ p(e, { className: "size-4 text-primary-foreground" }), D ? "Traduzindo..." : "Traduzir"]
			})]
		})] })
	});
};
export { b as TranslatorDialog };
