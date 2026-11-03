import { C as e, D as t, G as n, N as r, P as i, b as a, ct as o, et as s, ht as c, i as l, m as u, nt as d, st as f, ut as p, vt as m, w as h, y as g } from "./vlibras-initial-Uv9QvrrX.js";
import { i as _, n as v, r as y, t as b } from "./dialog-CWvrTIHe.js";
// src/widget/utils/feedback/index.ts
var x = () => {
	t("OBRIGADO", `${d.getState().path}/assets/bundles/`), u("Agradecemos sua contribuição!", {
		variant: "primary",
		className: "font-semibold"
	}), r.set({ text: void 0 });
}, S = ({ isPending: t, isMobile: n, onConfirm: r, onCancel: i }) => /* @__PURE__ */ h("div", {
	className: "mobile:mt-2 mt-4 flex w-full animate-move-up flex-col items-center gap-2 [&>button]:w-full [&>button]:rounded-full",
	children: [/* @__PURE__ */ h(a, {
		disabled: t,
		onClick: r,
		size: n ? "default" : "lg",
		className: "w-full",
		children: [t ? /* @__PURE__ */ h(e, { className: "text-primary-foreground" }) : /* @__PURE__ */ h(g, { name: "like" }), t ? "Enviando" : "Confirmar"]
	}), /* @__PURE__ */ h(a, {
		disabled: t,
		onClick: i,
		variant: "outline-gov",
		size: n ? "default" : "lg",
		children: "Voltar"
	})]
}), C = ({ isPending: e, onLike: t, onDislike: n }) => /* @__PURE__ */ h("div", {
	className: "flex animate-move-down items-center justify-center gap-4 mobile:text-sm text-base [&>button]:flex-col [&>button]:text-muted-foreground",
	children: [/* @__PURE__ */ h(a, {
		disabled: e,
		variant: "ghost",
		size: "icon-xl",
		className: "px-7 py-10 font-semibold hover:bg-primary/5 hover:text-primary",
		onClick: t,
		children: [/* @__PURE__ */ h(g, { name: "thumbs-up" }), "Sim"]
	}), /* @__PURE__ */ h(a, {
		disabled: e,
		variant: "ghost",
		size: "icon-xl",
		className: "px-7 py-10 font-semibold hover:bg-destructive/5 hover:text-destructive",
		onClick: n,
		children: [/* @__PURE__ */ h(g, { name: "thumbs-down" }), "Não"]
	})]
}), w = f(() => import("./feedback-suggestion-CvpAtTvB.js").then((e) => ({ default: e.FeedbackSuggestion }))), T = ({ open: e, onOpenChange: t }) => {
	let a = s(), [u, d] = c(), [f, g] = c(!1), T = l((e) => e.reopen), { mutateAsync: E, isPending: D } = n();
	p(() => void (e && g(!1)), [e]);
	let O = () => {
		t(!1), d(!0);
	};
	return p(() => void (T && O()), [T]), /* @__PURE__ */ h(m, { children: [/* @__PURE__ */ h(b, {
		open: e || D,
		onOpenChange: t,
		children: /* @__PURE__ */ h(v, { children: [/* @__PURE__ */ h(y, {
			closeProps: { "aria-label": "Fechar feedback" },
			children: /* @__PURE__ */ h(_, {
				icon: "comment",
				children: "Feedback"
			})
		}), /* @__PURE__ */ h("div", {
			className: "flex flex-col items-center justify-center gap-2 p-6",
			children: [/* @__PURE__ */ h("p", {
				className: "font-semibold mobile:text-sm text-base",
				children: f ? "Confirmar avaliação positiva?" : "Gostou da tradução?"
			}), f ? /* @__PURE__ */ h(S, {
				isPending: D,
				isMobile: a,
				onConfirm: () => {
					let { gloss: e } = i.get(), { text: n } = r.get();
					if (e && n) try {
						E({
							text: n,
							translation: e,
							review: e,
							rating: "good"
						});
					} finally {
						t(!1), g(!1), x();
					}
				},
				onCancel: () => g(!1)
			}) : /* @__PURE__ */ h(C, {
				isPending: D,
				onLike: () => g(!0),
				onDislike: O
			})]
		})] })
	}), u !== void 0 && /* @__PURE__ */ h(o, {
		fallback: null,
		children: /* @__PURE__ */ h(w, {
			open: u,
			onOpenChange: d
		})
	})] });
};
export { T as FeedbackDialog, x as t };
