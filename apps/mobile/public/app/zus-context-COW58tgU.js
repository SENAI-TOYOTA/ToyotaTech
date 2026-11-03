import { _t as e, at as t, dt as n, lt as r, pt as i, w as a, yt as o } from "./vlibras-initial-ym-qZWO7.js";
// src/common/lib/zus-context.tsx
function s() {
	let s = o(null), c = ({ children: e, data: t }) => {
		let o = i(null);
		return o.current ||= r(() => ({ data: t })), n(() => o.current?.setState({ data: t }), [t]), /* @__PURE__ */ a(s.Provider, {
			value: o.current,
			children: e
		});
	};
	function l(n) {
		let r = e(s);
		if (!r) throw Error("useContext must be used within its Provider");
		return t(r, n);
	}
	function u(e) {
		return l((t) => e ? e(t.data) : t.data);
	}
	return {
		Context: s,
		Provider: c,
		useCtx: u
	};
}
export { s as t };
