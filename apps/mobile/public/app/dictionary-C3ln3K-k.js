import { $ as e, A as t, C as n, E as r, H as i, K as a, U as o, W as s, X as c, Y as l, Z as u, b as d, c as f, d as p, et as m, gt as h, h as g, ht as _, it as v, j as y, mt as b, pt as x, q as S, tt as ee, ut as C, vt as w, w as T, y as E } from "./vlibras-initial-ym-qZWO7.js";
import { t as D } from "./zus-context-COW58tgU.js";
import { t as te } from "./trie-BK0pRT-V.js";
import { i as O, n as k, r as A, t as j } from "./components-CzmJ8uNX.js";
// src/widget/screens/dictionary/actions/index.ts
var M = () => {
	let e = new AbortController();
	return {
		controller: e,
		timeoutId: setTimeout(() => e.abort(), S.REQUEST_TIMEOUT)
	};
}, ne = async () => {
	let { controller: e, timeoutId: t } = M();
	try {
		let t = await fetch(`${S.DICTIONARY_CATEGORIES_URL}/tags`, {
			method: "GET",
			signal: e.signal
		});
		if (!t.ok) throw Error(`Erro na API: ${t.status}`);
		return {
			data: await t.json(),
			success: !0
		};
	} catch (e) {
		return console.error("Falha na busca pelas categorias: ", e), e.name === "AbortError" ? {
			success: !1,
			error: a.SIGNS_TIMEOUT_ERROR,
			code: "SIGNS_TIMEOUT_ERROR"
		} : {
			success: !1,
			error: a.SIGNS_ERROR,
			code: "SIGNS_ERROR"
		};
	} finally {
		clearTimeout(t);
	}
}, re = async (e) => {
	let { controller: t, timeoutId: n } = M();
	try {
		let n = await fetch(`${S.DICTIONARY_CATEGORIES_URL}/tagsigns?tag=${e}`, {
			method: "GET",
			signal: t.signal
		});
		if (!n.ok) throw Error(`Erro na API: ${n.status}`);
		return {
			data: await n.json(),
			success: !0
		};
	} catch (e) {
		return console.error("Falha na busca pelos sinais da categoria: ", e), e.name === "AbortError" ? {
			success: !1,
			error: a.SIGNS_TIMEOUT_ERROR,
			code: "SIGNS_TIMEOUT_ERROR"
		} : {
			success: !1,
			error: a.SIGNS_ERROR,
			code: "SIGNS_ERROR"
		};
	} finally {
		clearTimeout(n);
	}
}, N = {
	3: "categories/measures",
	2: "categories/numbers",
	4: "categories/verbs",
	5: "categories/alphabet",
	6: "categories/foods",
	17: "categories/machines",
	11: "categories/feelings",
	19: "categories/health",
	12: "categories/body",
	13: "categories/animals",
	18: "categories/locations",
	24: "categories/jobs",
	8: "categories/countries",
	27: "categories/sports",
	26: "categories/family",
	25: "categories/nature",
	21: "categories/art",
	15: "categories/economy",
	22: "categories/education",
	16: "categories/people",
	7: "categories/religion",
	23: "categories/fashion",
	10: "categories/politics",
	20: "categories/communication",
	9: "categories/technology",
	14: "categories/adjective"
}, P = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")], F = {
	"1S_": "EU",
	"2S_": "VOCÊ",
	"3S_": "ELE(A)",
	"1P_": "NÓS",
	"2P_": "VOCÊS",
	"3P_": "ELES(AS)"
}, ie = {
	_1S: "MIM",
	_2S: "VOCÊ",
	_3S: "ELE(A)",
	_1P: "NÓS",
	_2P: "VOCÊS",
	_3P: "ELES(AS)"
}, I = /* @__PURE__ */ "EU PARA MIM.EU PARA VOCÊ.EU PARA ELE(A).EU PARA NÓS.EU PARA VOCÊS.EU PARA ELES(AS).VOCÊ PARA MIM.VOCÊ PARA VOCÊ.VOCÊ PARA ELE(A).VOCÊ PARA NÓS.VOCÊ PARA VOCÊS.VOCÊ PARA ELES(AS).ELE(A) PARA MIM.ELE(A) PARA VOCÊ.ELE(A) PARA ELE(A).ELE(A) PARA NÓS.ELE(A) PARA VOCÊS.ELE(A) PARA ELES(AS).NÓS PARA MIM.NÓS PARA VOCÊ.NÓS PARA ELE(A).NÓS PARA NÓS.NÓS PARA VOCÊS.NÓS PARA ELES(AS).VOCÊS PARA MIM.VOCÊS PARA VOCÊ.VOCÊS PARA ELE(A).VOCÊS PARA NÓS.VOCÊS PARA VOCÊS.VOCÊS PARA ELES(AS).ELES(AS) PARA MIM.ELES(AS) PARA VOCÊ.ELES(AS) PARA ELE(A).ELES(AS) PARA NÓS.ELES(AS) PARA VOCÊS.ELES(AS) PARA ELES(AS)".split("."), L = /* @__PURE__ */ RegExp("^(1S_|2S_|3S_|1P_|2P_|3P_)?([A-ZÇÕÂÊÍÓÚ]+(?:_(?![123][SP])[A-ZÇÕÂÊÍÓÚ]+)*)(_1S|_2S|_3S|_1P|_2P|_3P)?$");
// src/widget/screens/dictionary/lib/alphabet.ts
function ae(e) {
	let t = {};
	for (let n of e) {
		let e = n.trim().charAt(0).toUpperCase();
		/[0-9]/.test(e) && (e = "#"), t[e] || (t[e] = []), t[e].push(n);
	}
	for (let e in t) t[e].sort((e, t) => e.localeCompare(t));
	return P.map((e) => ({
		letter: e,
		items: t[e] || []
	})).filter((e) => e.items.length > 0);
}
// src/widget/screens/dictionary/lib/group-signs.ts
function oe(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = n.includes("&") ? n.split("&", 1)[0] : n;
		t.has(e) || t.set(e, {
			base: e,
			variants: [],
			hasBase: !1
		});
		let r = t.get(e);
		r && (n.includes("&") ? r.variants.push(n) : r.hasBase = !0);
	}
	return Array.from(t.values());
}
function se(e) {
	let t = {};
	for (let n of e) {
		let e = n.includes("&") ? n.split("&", 1)[0] : n.match(L)?.[2] ?? n;
		if (t[e] ??= {
			conjugation: [],
			desambiguation: []
		}, n.includes("&")) t[e].desambiguation.push(n);
		else {
			let e = n.match(L);
			if (e) {
				let r = e[1] ?? "", i = e[2], a = e[3] ?? "", o = F[r] ?? "", s = ie[a] ?? "";
				o && s ? t[i].conjugation.push({
					original: n,
					transformed: `${o} PARA ${s}`,
					prefix: o,
					suffix: s
				}) : t[i].conjugation.unshift({
					original: n,
					transformed: n,
					prefix: o,
					suffix: s
				});
			}
		}
	}
	for (let e in t) t[e].conjugation.sort((e, t) => I.indexOf(e.transformed) - I.indexOf(t.transformed));
	return Object.fromEntries(Object.entries(t).sort(([e], [t]) => e.localeCompare(t)));
}
// src/widget/screens/dictionary/stores/use-dictionary.store.ts
var R = v()(o((e) => ({
	isMaxRetries: !1,
	retriesCount: 0
}), {
	name: "@vlibras/dictionary",
	version: 1,
	storage: i(() => sessionStorage),
	partialize: (e) => u(e, "isMaxRetries"),
	onRehydrateStorage: () => (e) => {
		e && (e.retriesCount = 0, e.isMaxRetries = !1);
	}
}));
R.getState, R.setState, R.subscribe;
// src/widget/screens/dictionary/stores/use-dictionary-history.store.ts
var z = v()(o(() => ({ signs: [""] }), {
	name: "@vlibras/dictionary-history",
	version: 1,
	partialize: (e) => e
})), B = {
	get: z.getState,
	set: z.setState,
	subscribe: z.subscribe
}, V = 50, ce = () => {
	let t = x(null), n = x(null), r = x(null), i = R(), [a, o] = _("categories"), { data: c, isLoading: l, refetch: u } = s(), { signs: d } = z(), [f, p] = _(null), [m, g] = _(null), { data: v = [], isLoading: y } = e({
		queryKey: ["categories"],
		queryFn: ne,
		select: ({ data: e }) => e.filter((e) => e.name !== "INDEFINIDO")
	}), { data: S = [], isLoading: w } = e({
		queryKey: ["categorySigns", f?.name],
		queryFn: () => re(f?.name ?? ""),
		enabled: !!f,
		select: ({ data: e }) => e.signs.filter((e) => e !== "1S_FARTAR1S" && e !== "2S_ESCOLHER__1S")
	}), T = async () => {
		await u();
		let e = i.retriesCount + 1;
		R.setState({ retriesCount: e }), e >= 5 && R.setState({ isMaxRetries: !0 });
	}, E = b(() => c ? new te(c).searchSigns("") : [], [c]), [{ filteredSigns: D, visibleCount: O, search: k }, A] = _({
		filteredSigns: [],
		search: "",
		visibleCount: V
	}), j = b(() => {
		if (!f) return [];
		let e = k.toLowerCase().trim(), t = new Set(S);
		return S.filter((n) => t.has(n) && (e === "" || n.toLowerCase().includes(e)));
	}, [
		f,
		E,
		k,
		S
	]), M = h((e) => {
		let t = e.toUpperCase().trim(), n = (a === "all" ? E : d).filter((e) => e.toUpperCase().includes(t));
		A((t) => ({
			...t,
			search: e,
			filteredSigns: n,
			visibleCount: V
		})), r.current && r.current.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	}, [
		a,
		d,
		E
	]), N = f?.name === "VERBOS", P = b(() => N ? se(j) : {}, [j, N]), F = b(() => Object.entries(P), [P]), [ie, I] = _(V);
	C(() => {
		W(V), I(20);
	}, [f]);
	let L = F.slice(0, ie), oe = h((e) => {
		let t = e.currentTarget;
		t.scrollTop + t.clientHeight >= t.scrollHeight - 50 && I((e) => Math.min(e + 20, F.length));
	}, [F.length]), B = ee(M, 500), ce = () => {
		n.current && (M(""), n.current.value = "", n.current.focus());
	}, le = () => {
		z.setState({ signs: [] }), a === "recents" && (o("all"), A((e) => ({
			...e,
			filteredSigns: []
		})));
	};
	C(() => {
		p(null), M(k);
	}, [a]), C(() => {
		E.length > 0 && A((e) => ({
			...e,
			filteredSigns: E
		}));
	}, [E]), C(() => {
		let e = new IntersectionObserver((e) => {
			e[0].isIntersecting && D.length > O && A((e) => ({
				...e,
				visibleCount: e.visibleCount + V
			}));
		}, { threshold: .1 });
		return t.current && e.observe(t.current), () => e.disconnect();
	}, [D.length, O]);
	let H = D.slice(0, O), ue = {
		all: E.length,
		recents: d.length
	}, [U, W] = _(V), de = b(() => j.slice(0, U), [j, U]), G = h((e) => {
		let t = e.currentTarget;
		t.scrollTop + t.clientHeight >= t.scrollHeight - 50 && W((e) => e >= j.length ? e : e + V);
	}, [j.length]);
	C(() => {
		W(V);
	}, [f]);
	let K = b(() => ae(E), [E]), q = b(() => {
		if (!m) return [];
		let e = k.toLowerCase().trim(), t = K.find((e) => e.letter === m)?.items ?? [];
		return e === "" ? t : t.filter((t) => t.toLowerCase().includes(e));
	}, [
		m,
		K,
		k
	]), [J, Y] = _(V), X = b(() => q.slice(0, J), [q, J]), Z = h((e) => {
		let t = e.currentTarget;
		t.scrollTop + t.clientHeight >= t.scrollHeight - 50 && Y((e) => e >= q.length ? e : e + V);
	}, [q.length]);
	return C(() => {
		Y(V);
	}, [m]), {
		search: k,
		isLoading: l,
		filteredSigns: D,
		visibleSigns: H,
		visibleCount: O,
		loaderRef: t,
		listRef: r,
		searchRef: n,
		handleSearchChange: B,
		handleClearSearch: ce,
		handleHistoryClear: le,
		data: c,
		retry: T,
		filter: a,
		setFilter: o,
		count: ue,
		selectedCategory: f,
		setSelectedCategory: p,
		filteredCategoryWords: j,
		onCategoryScroll: G,
		visibleCategoryWords: de,
		selectedLetter: m,
		setSelectedLetter: g,
		groupedSigns: K,
		filteredLetterWords: q,
		onLetterScroll: Z,
		visibleLetterWords: X,
		isVerbCategory: N,
		visibleVerbGroups: L,
		verbGroupEntries: F,
		onVerbScroll: oe,
		categories: v,
		isLoadingCategories: y,
		isLoadingCategorySigns: w,
		...i
	};
}, { Provider: le, useCtx: H } = D(), ue = ({ children: e }) => {
	let t = ce();
	return /* @__PURE__ */ T(le, {
		data: t,
		children: e
	});
}, U = () => (e) => {
	r(e);
	let t = [e, ...B.get().signs.filter((t) => t !== e)];
	B.set({ signs: t }), g.set({ screen: "main" }), p({
		action: () => g.set({ screen: "dictionary" }),
		content: /* @__PURE__ */ T(w, { children: [/* @__PURE__ */ T(E, { name: "dictionary" }), "Reabrir Dicionário"] })
	}), f.trackEvent("dictionary_gloss", { sign: e });
}, W = [
	"masculino",
	"feminino",
	"neutro"
];
function de(e) {
	let t, n = Array.from(e.querySelectorAll("h2, h3")).find((e) => e.textContent?.toLowerCase().includes("etimologia"));
	return n && (t = (n.parentElement?.nextElementSibling)?.firstChild?.textContent?.trim()), t;
}
async function G(e) {
	let t = e.toLowerCase().replace(/_/g, " "), n = `https://pt.wiktionary.org/w/api.php?action=parse&redirects=1&
				 format=json&origin=*&page=${encodeURIComponent(t)}&prop=text&formatversion=2`;
	try {
		let e = await fetch(n);
		return e.ok && (await e.json())?.parse?.text || null;
	} catch (e) {
		return console.error(e), null;
	}
}
async function K(e) {
	let t = e.toLowerCase().replace(/_/g, " "), n = `https://pt.wiktionary.org/w/rest.php/v1/search/title?
					   q=${encodeURIComponent(t)}&limit=1`;
	try {
		let e = await fetch(n);
		return e.ok && (await e.json()).pages?.[0]?.key || null;
	} catch (e) {
		return console.error(e), null;
	}
}
async function q(e) {
	let t = await G(e), n = t ? X(t, e) : null;
	if (!n?.definitions?.length) {
		let r = await K(e);
		r && r !== e && (t = await G(r), n = t ? X(t, e) : null);
	}
	return n;
}
var J = (e) => {
	if (!e) return "";
	let t = e;
	if (t = t.replace(/<style[\s\S]*?<\/style>/gi, ""), t = t.replace(/<script[\s\S]*?<\/script>/gi, ""), t = t.replace(/<noscript[\s\S]*?<\/noscript>/gi, ""), t = t.replace(/<[^>]+>/g, ""), typeof document < "u") {
		let e = document.createElement("div");
		e.innerHTML = t, t = e.textContent || e.innerText || t;
	}
	return t = t.replace(/\[[^\]]*\]/g, ""), t = t.replace(/\s+/g, " ").trim(), t;
}, Y = (e) => {
	let t = e.cloneNode(!0);
	return t.querySelectorAll("ul, ol").forEach((e) => e.remove()), t.querySelectorAll("style, script, link, meta, noscript").forEach((e) => e.remove()), t.querySelectorAll("span.mw-cite-backlink, sup.reference, sup.cite_ref").forEach((e) => e.remove()), J(t.textContent || "");
}, X = (e, t) => {
	let n = new DOMParser().parseFromString(e, "text/html"), r = n.querySelector("tbody")?.innerHTML.match(RegExp(`title='(?<gender>${W.join("|")})'`))?.groups?.gender, i = Array.from(n.querySelectorAll("ol > li")).map((e) => {
		let t = Y(e), n = e.querySelectorAll(":scope > ul > li, :scope > ol > li");
		if (n.length) {
			let e = Array.from(n).map((e) => Y(e)).filter(Boolean);
			e.length && (t = `${t} §${e.join("§")}`);
		}
		return t;
	}).filter((e) => e && e !== t).filter((e, t, n) => n.indexOf(e) === t).filter(Boolean), a = n.querySelector("h2")?.textContent?.trim(), o = Array.from(n.querySelectorAll("b")).find((e) => e.innerHTML.includes("<u>") || e.innerHTML.includes("."))?.textContent?.trim(), s = de(n), c = {}, l = n.querySelector("table.traduções");
	return l && l.querySelectorAll("tr").forEach((e) => {
		let t = e.querySelector("td"), n = e.querySelectorAll("td ~ td a");
		if (t && n.length > 0) {
			let e = t.textContent?.trim().toLowerCase(), r = Array.from(n).map((e) => e.textContent?.trim()).filter(Boolean);
			e && (c[e] = r);
		}
	}), {
		wordClass: a,
		pronunciation: o,
		definitions: i,
		etymology: s,
		gender: r,
		imgUrl: n.querySelector("img")?.getAttribute("src") || void 0,
		translations: Object.keys(c).length > 0 ? c : void 0
	};
}, Z = () => {
	let [t, n] = _(null), { data: r, isFetching: i } = e({
		queryKey: ["wordMeaning", t],
		queryFn: () => q(t ?? ""),
		enabled: !!t
	}), a = (e) => {
		n((t) => t === e ? null : e);
	};
	return {
		expandedWord: t,
		wordMeanings: t && r !== void 0 ? { [t]: r } : {},
		loadingMeaning: i ? t : null,
		toggleWordMeaning: a
	};
}, Q = ({ meaning: e, isLoading: r, onPlayDefinition: i }) => {
	let a = m();
	return r ? /* @__PURE__ */ T("div", {
		className: "flex animate-pulse items-center gap-1.5 px-6 py-2 text-muted-foreground text-xs",
		children: [/* @__PURE__ */ T(n, { className: "size-3" }), "Buscando significado..."]
	}) : e?.definitions?.length ? /* @__PURE__ */ T("div", {
		className: "w-full border-primary/20 border-l-2 bg-muted pr-3 pb-5 pl-4 text-black dark:text-white",
		children: [/* @__PURE__ */ T("p", {
			className: "mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide",
			children: "Significado"
		}), /* @__PURE__ */ T("ol", {
			className: "flex flex-col gap-5",
			children: e.definitions.slice(0, 3).map((e, n) => {
				let r = J(e.split("§")[0]);
				return /* @__PURE__ */ T("li", {
					className: "break-word flex min-w-0 flex-1 items-center justify-between pl-4",
					children: [/* @__PURE__ */ T("span", {
						className: t("min-w-0 max-w-50 flex-1 mobile:text-xs text-sm", a ? "max-w-40" : "max-w-50"),
						children: `${n + 1}. ${r}`
					}), /* @__PURE__ */ T("button", {
						type: "button",
						onClick: () => i(r),
						className: "shrink-0 cursor-pointer text-primary hover:opacity-70",
						"aria-label": "Traduzir definição",
						children: /* @__PURE__ */ T(E, {
							name: "libras",
							className: t(a ? "size-5" : "size-6")
						})
					})]
				}, n);
			})
		})]
	}) : /* @__PURE__ */ T("div", {
		className: "px-6 py-2 text-muted-foreground text-xs",
		children: "Significado não encontrado."
	});
}, $ = 50, fe = () => {
	let e = H(l("filteredSigns", "search", "filter", "listRef", "visibleSigns", "setSelectedLetter", "groupedSigns")), n = U(), { mutateAsync: i } = y(), { expandedWord: a, wordMeanings: o, loadingMeaning: s, toggleWordMeaning: c } = Z(), u = async (e) => {
		try {
			let t = await i(e);
			r(t || e), p({
				action: () => g.set({ screen: "dictionary" }),
				content: /* @__PURE__ */ T(w, { children: [/* @__PURE__ */ T(E, { name: "dictionary" }), "Reabrir Dicionário"] })
			});
		} catch (e) {
			console.error("Erro ao reproduzir definição: ", e);
		}
	}, [f, m] = _($), v = x(null);
	if (C(() => {
		if (!e.search) return;
		let t = v.current;
		if (!t) return;
		let n = new IntersectionObserver(([t]) => {
			t.isIntersecting && m((t) => Math.min(t + $, e.filteredSigns.length));
		}, { threshold: .1 });
		return n.observe(t), () => n.disconnect();
	}, [e.search, e.filteredSigns.length]), C(() => {
		m($);
	}, [e.search]), e.filter === "recents") return /* @__PURE__ */ T("div", {
		ref: e.listRef,
		className: "h-full overflow-auto",
		children: /* @__PURE__ */ T("ul", {
			className: "flex flex-col text-sm",
			children: e.visibleSigns.map((e) => {
				let t = (e || "").replace(/_/g, " ");
				return /* @__PURE__ */ T("li", { children: [/* @__PURE__ */ T("button", {
					type: "button",
					onClick: () => n(e),
					className: "block w-full bg-background px-4 py-1.5 text-left mobile:text-xs text-sm hover:cursor-pointer hover:bg-muted",
					children: t
				}), /* @__PURE__ */ T("div", { className: "mx-4 border-border/30 border-t" })] }, e);
			})
		})
	});
	let b = (e) => {
		let r = a === e, i = s === e, l = (e || "").replace(/_/g, " ");
		return /* @__PURE__ */ T("li", {
			className: "hover:bg-muted",
			children: [
				/* @__PURE__ */ T("div", {
					className: t("flex min-w-0 items-center", r ? "bg-muted" : ""),
					children: [/* @__PURE__ */ T("button", {
						type: "button",
						onClick: () => n(e),
						className: "w-full cursor-pointer whitespace-normal break-all px-6 py-1.25 text-left mobile:text-xs text-sm focus:bg-primary focus:text-primary-foreground",
						children: l
					}), /* @__PURE__ */ T(d, {
						size: "icon-sm",
						variant: "ghost",
						className: "text-muted-foreground",
						onClick: () => c(e),
						"aria-label": r ? "Fechar significado" : "Ver significado",
						children: /* @__PURE__ */ T(E, {
							name: r ? "chevron-up" : "chevron-down",
							className: "size-4"
						})
					})]
				}),
				r && /* @__PURE__ */ T(Q, {
					wordName: e,
					meaning: o[e],
					isLoading: i,
					onPlayDefinition: u
				}),
				/* @__PURE__ */ T("div", { className: "mx-4 border-border/30 border-t" })
			]
		}, e);
	}, S = h((t) => {
		let n = t.currentTarget;
		n.scrollTop + n.clientHeight >= n.scrollHeight - 100 && m((t) => Math.min(t + $, e.filteredSigns.length));
	}, [e.filteredSigns.length]);
	return e.search ? /* @__PURE__ */ T("div", {
		ref: e.listRef,
		className: "h-full overflow-auto",
		onScroll: S,
		children: /* @__PURE__ */ T("ul", {
			className: "flex flex-col text-sm",
			children: [e.filteredSigns.slice(0, f).map((e) => b(e)), f < e.filteredSigns.length && /* @__PURE__ */ T("li", {
				ref: v,
				className: "py-2 text-center text-muted-foreground text-xs",
				children: "Carregando..."
			})]
		})
	}) : /* @__PURE__ */ T("div", {
		ref: e.listRef,
		className: "h-full overflow-auto",
		children: /* @__PURE__ */ T("ul", {
			className: "flex flex-col text-sm",
			children: e.groupedSigns.map(({ letter: t, items: n }) => /* @__PURE__ */ T("li", { children: [/* @__PURE__ */ T("button", {
				type: "button",
				onClick: () => e.setSelectedLetter(t),
				className: "flex w-full items-center justify-between px-4 py-2 text-left font-semibold mobile:text-xs text-sm hover:cursor-pointer hover:bg-muted",
				children: [/* @__PURE__ */ T("span", { children: t === "#" ? "0–9" : t }), /* @__PURE__ */ T("span", {
					className: "font-normal text-muted-foreground text-xs",
					children: n.length
				})]
			}), /* @__PURE__ */ T("div", { className: "mx-4 border-border/30 border-t" })] }, t))
		})
	});
}, pe = () => /* @__PURE__ */ T("div", {
	className: "grid h-full place-content-center",
	children: /* @__PURE__ */ T(n, {})
}), me = () => {
	let { search: e, setSelectedCategory: n, categories: r, listRef: i, setFilter: a, isLoadingCategories: o } = H(l("categories", "isLoadingCategories", "search", "setSelectedCategory", "listRef", "setFilter"));
	if (o) return /* @__PURE__ */ T(pe, {});
	let s = b(() => r.filter((t) => t.name.toLowerCase().includes(e.toLocaleLowerCase())).sort((e, t) => e.name.localeCompare(t.name)), [r, e]);
	return r.length ? s.length ? /* @__PURE__ */ T("div", {
		ref: i,
		className: "h-full overflow-auto",
		children: /* @__PURE__ */ T("ul", {
			className: "flex flex-col",
			children: [s.map((e) => {
				let r = N[e.id] || "categories/undefined";
				return /* @__PURE__ */ T("li", { children: [/* @__PURE__ */ T("button", {
					type: "button",
					onClick: () => n(e),
					className: t("flex w-full items-center justify-between px-4 mobile:py-2 py-0 mobile:text-xs text-sm hover:cursor-pointer hover:bg-muted"),
					children: /* @__PURE__ */ T("div", {
						className: "flex items-center gap-2 py-2",
						children: [/* @__PURE__ */ T(E, {
							name: r,
							className: "mobile:size-5 size-6 shrink-0 dark:text-foreground"
						}), /* @__PURE__ */ T("span", { children: e.name.replace(/_/g, " ") })]
					})
				}), /* @__PURE__ */ T("div", { className: "mx-4 border-border/30 border-t" })] }, e.id);
			}), /* @__PURE__ */ T("li", { children: [/* @__PURE__ */ T("button", {
				type: "button",
				onClick: () => a("all"),
				className: t("flex w-full items-center justify-between px-4 mobile:py-2 py-0 mobile:text-xs text-sm hover:cursor-pointer hover:bg-muted"),
				children: /* @__PURE__ */ T("div", {
					className: "flex items-center gap-2 py-2",
					children: [/* @__PURE__ */ T(E, {
						name: "categories/all",
						className: "mobile:size-5 size-6 shrink-0 dark:text-foreground"
					}), /* @__PURE__ */ T("span", { children: "TODOS" })]
				})
			}), /* @__PURE__ */ T("div", { className: "mx-4 border-border/30 border-t" })] }, "all-signs")]
		})
	}) : /* @__PURE__ */ T("div", {
		className: "flex h-10 items-center justify-center",
		children: "Nenhuma categoria encontrada"
	}) : /* @__PURE__ */ T("div", {
		className: "flex h-full w-full items-start justify-center p-6",
		children: "Sem conexão com a internet. Não é possível estabelecer conexão com o banco de sinais."
	});
}, he = () => {
	let { selectedCategory: e, setSelectedCategory: t } = H(l("selectedCategory", "setSelectedCategory"));
	if (!e) return null;
	let n = N[e.id] || "categories/undefined";
	return e && /* @__PURE__ */ T("div", {
		className: "flex w-full animate-move-up items-center gap-1 bg-primary/20 mobile:px-3 px-4 mobile:py-2 py-3",
		children: /* @__PURE__ */ T("button", {
			type: "button",
			"aria-label": "Voltar para a lista de categorias",
			onClick: () => t(null),
			className: "group flex h-full w-full items-center justify-start gap-2 text-xs hover:cursor-pointer",
			children: [
				/* @__PURE__ */ T(E, {
					name: "chevron-left",
					className: "size-4 text-muted-foreground group-hover:text-foreground"
				}),
				/* @__PURE__ */ T(E, {
					name: n,
					className: "mobile:size-5 size-6 shrink-0"
				}),
				/* @__PURE__ */ T("span", {
					className: "font-semibold mobile:text-xs text-sm",
					children: e.name.replace(/_/g, " ")
				})
			]
		})
	});
}, ge = () => {
	let e = U(), n = H(l("visibleVerbGroups", "onVerbScroll", "listRef")), { mutateAsync: i } = y(), { expandedWord: a, wordMeanings: o, loadingMeaning: s, toggleWordMeaning: c } = Z(), u = async (e) => {
		try {
			let t = await i(e);
			r(t || e), p({
				action: () => g.set({ screen: "dictionary" }),
				content: /* @__PURE__ */ T(w, { children: [/* @__PURE__ */ T(E, { name: "dictionary" }), "Reabrir Dicionário"] })
			});
		} catch (e) {
			console.error("Erro ao reproduzir definição: ", e);
		}
	};
	return /* @__PURE__ */ T("div", {
		ref: n.listRef,
		onScroll: n.onVerbScroll,
		className: "h-full overflow-auto",
		children: /* @__PURE__ */ T("ul", {
			className: "flex w-full flex-col text-sm",
			children: n.visibleVerbGroups.map(([n, r]) => {
				let i = a === n, l = s === n, d = r.conjugation.slice(+(n === r.conjugation[0]?.original));
				return /* @__PURE__ */ T("li", { children: [
					/* @__PURE__ */ T("div", {
						className: t("flex min-w-0 items-center hover:bg-muted", i && "bg-muted"),
						children: [/* @__PURE__ */ T("button", {
							type: "button",
							onClick: () => e(n),
							className: "flex-1 cursor-pointer whitespace-normal break-all px-4 py-1.25 text-left mobile:text-xs text-sm focus:bg-primary focus:text-primary-foreground",
							children: n
						}), /* @__PURE__ */ T("button", {
							type: "button",
							onClick: () => c(n),
							className: "px-2 py-1.25 hover:cursor-pointer hover:text-foreground",
							"aria-label": i ? "Fechar" : "Expandir",
							children: /* @__PURE__ */ T(E, {
								name: i ? "chevron-up" : "chevron-down",
								className: "size-4"
							})
						})]
					}),
					i && /* @__PURE__ */ T("div", {
						className: "bg-muted pb-1",
						children: [
							/* @__PURE__ */ T(Q, {
								wordName: n,
								meaning: o[n],
								isLoading: l,
								onPlayDefinition: u
							}),
							d.length > 0 && /* @__PURE__ */ T("div", {
								className: "mt-1",
								children: [/* @__PURE__ */ T("p", {
									className: "px-4 py-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide",
									children: "Concordância verbal"
								}), /* @__PURE__ */ T("ul", {
									className: "ml-4 border-border/40 border-l",
									children: d.map((t) => /* @__PURE__ */ T("li", { children: /* @__PURE__ */ T("button", {
										type: "button",
										onClick: () => e(t.original),
										className: "flex w-full items-center gap-2 px-4 py-1.25 mobile:text-xs text-sm hover:cursor-pointer focus:bg-primary focus:text-primary-foreground",
										children: [
											/* @__PURE__ */ T("span", {
												className: "w-20 shrink-0 text-right text-muted-foreground",
												children: t.prefix
											}),
											/* @__PURE__ */ T(E, {
												name: "arrow-right",
												className: "size-4"
											}),
											/* @__PURE__ */ T("span", { children: t.suffix })
										]
									}) }, t.original))
								})]
							}),
							r.desambiguation.length > 0 && /* @__PURE__ */ T("div", {
								className: "mt-1",
								children: [/* @__PURE__ */ T("p", {
									className: "px-4 py-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide",
									children: "Contexto"
								}), /* @__PURE__ */ T("ul", {
									className: "ml-4 border-border/40 border-l",
									children: r.desambiguation.map((t) => {
										let [n, r] = t.split("&", 2);
										return /* @__PURE__ */ T("li", { children: /* @__PURE__ */ T("button", {
											type: "button",
											onClick: () => e(t),
											className: "flex w-full items-center gap-2 px-4 py-1.25 mobile:text-xs text-sm hover:bg-muted focus:bg-primary focus:text-primary-foreground",
											children: [
												n,
												" (",
												r,
												")"
											]
										}) }, t);
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ T("div", { className: "mx-4 border-border/30 border-t" })
				] }, n);
			})
		})
	});
}, _e = () => {
	let e = U(), n = H(l("visibleCategoryWords", "isVerbCategory", "listRef", "onCategoryScroll")), { mutateAsync: i } = y(), { expandedWord: a, wordMeanings: o, loadingMeaning: s, toggleWordMeaning: c } = Z(), u = async (e) => {
		try {
			let t = await i(e);
			r(t || e), p({
				action: () => g.set({ screen: "dictionary" }),
				content: /* @__PURE__ */ T(w, { children: [/* @__PURE__ */ T(E, { name: "dictionary" }), "Reabrir Dicionário"] })
			});
		} catch (e) {
			console.error("Erro ao reproduzir definição: ", e);
		}
	};
	if (n.isVerbCategory) return /* @__PURE__ */ T(ge, {});
	let f = b(() => oe(n.visibleCategoryWords), [n.visibleCategoryWords]);
	return /* @__PURE__ */ T("div", {
		ref: n.listRef,
		onScroll: n.onCategoryScroll,
		className: "h-full overflow-auto",
		children: /* @__PURE__ */ T("ul", {
			className: "flex h-full w-full flex-col text-sm",
			children: f.map((n) => {
				let r = a === n.base, i = s === n.base, l = (n.base || "").replace(/_/g, " ");
				return /* @__PURE__ */ T("li", {
					className: "hover:bg-muted",
					children: [
						/* @__PURE__ */ T("div", {
							className: t("flex min-w-0 items-center", r ? "bg-muted" : ""),
							children: [/* @__PURE__ */ T("button", {
								type: "button",
								onClick: () => e(n.base),
								className: "w-full cursor-pointer whitespace-normal break-all px-4 py-1.25 text-left mobile:text-xs text-sm focus:bg-primary focus:text-primary-foreground",
								children: l
							}), /* @__PURE__ */ T(d, {
								size: "icon-sm",
								variant: "ghost",
								className: "text-muted-foreground",
								onClick: () => c(n.base),
								"aria-label": r ? "Fechar significado" : "Ver significado",
								children: /* @__PURE__ */ T(E, {
									name: r ? "chevron-up" : "chevron-down",
									className: "size-4"
								})
							})]
						}),
						r && /* @__PURE__ */ T(w, { children: [/* @__PURE__ */ T(Q, {
							wordName: n.base,
							meaning: o[n.base],
							isLoading: i,
							onPlayDefinition: u
						}), n.variants.length > 0 && /* @__PURE__ */ T("div", {
							className: "mt-1",
							children: [/* @__PURE__ */ T("p", {
								className: "px-4 py-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide",
								children: "Contexto"
							}), /* @__PURE__ */ T("ul", {
								className: "ml-4 border-border/40 border-l",
								children: n.variants.map((t) => {
									let [, r] = t.split("&", 2), i = (n.base || "").replace(/_/g, " "), a = (r || "").replace(/_/g, " ");
									return /* @__PURE__ */ T("li", { children: /* @__PURE__ */ T("button", {
										type: "button",
										onClick: () => {
											e(t);
										},
										className: "flex w-full px-4 py-1 text-left mobile:text-xs text-sm hover:bg-muted focus:bg-primary focus:text-primary-foreground",
										children: [
											i,
											" (",
											a,
											")"
										]
									}) }, t);
								})
							})]
						})] }),
						/* @__PURE__ */ T("div", { className: "mx-4 border-border/30 border-t" })
					]
				}, n.base);
			})
		})
	});
}, ve = () => {
	let e = H((e) => e.isLoadingCategorySigns);
	return /* @__PURE__ */ T(w, { children: [/* @__PURE__ */ T(he, {}), T(e ? pe : _e, {})] });
}, ye = "images/emojis/sad-face.webp", be = ({ onRetry: e, isMaxRetries: t }) => {
	let n = m();
	return /* @__PURE__ */ T("div", {
		className: "flex h-full flex-col items-center justify-center gap-2 px-4",
		children: [
			/* @__PURE__ */ T("img", {
				src: c(ye),
				alt: "Emoji de rosto triste",
				className: "size-7 sm:size-8"
			}),
			/* @__PURE__ */ T("p", {
				className: "mb-3 px-4 text-center font-semibold mobile:text-sm text-base",
				children: "Não foi possível carregar o dicionário de sinais."
			}),
			!t && /* @__PURE__ */ T(d, {
				onClick: e,
				size: n ? "xs" : "sm",
				className: "rounded-full",
				variant: "outline-gov",
				children: "Tentar novamente"
			}),
			t && /* @__PURE__ */ T("span", {
				className: "mobile:text-xs text-muted-foreground text-sm",
				children: "Tente novamente mais tarde."
			})
		]
	});
}, xe = [
	{
		label: "Categorias",
		value: "categories"
	},
	{
		label: "A-Z",
		value: "all"
	},
	{
		label: "Recentes",
		value: "recents"
	}
], Se = () => {
	let { signs: e } = z(), { setFilter: n, filter: r, handleHistoryClear: i } = H(l("setFilter", "filter", "handleHistoryClear")), a = m(), o = !e.length;
	return /* @__PURE__ */ T("div", {
		className: "flex items-center gap-2 px-4 [&_button]:rounded-full",
		children: [xe.map((e) => {
			let i = r === e.value;
			return o && e.value === "recents" ? null : /* @__PURE__ */ T(d, {
				"aria-pressed": i,
				variant: i ? "default" : "outline",
				onClick: () => n(e.value),
				className: t("animate-move-down", a ? "p-1" : "p-2"),
				size: a ? "xs" : "sm",
				children: e.label
			}, e.value);
		}), r === "recents" && /* @__PURE__ */ T(d, {
			onClick: i,
			className: "text-muted-foreground not-focus:outline-0 outline-destructive hover:text-destructive focus:[&_svg]:text-destructive",
			size: a ? "icon-xs" : "icon-sm",
			variant: "ghost",
			"aria-label": "Limpar histórico",
			children: /* @__PURE__ */ T(E, { name: "trash" })
		})]
	});
}, Ce = () => {
	let { selectedLetter: e, setSelectedLetter: t } = H(l("selectedLetter", "setSelectedLetter"));
	return e ? /* @__PURE__ */ T("div", {
		className: "flex w-full animate-move-up items-center gap-1 bg-primary/20 mobile:px-3 px-4 mobile:py-2 py-3",
		children: /* @__PURE__ */ T("button", {
			type: "button",
			"aria-label": "Voltar para a lista de letras",
			onClick: () => t(null),
			className: "group flex h-full w-full items-center justify-start gap-2 text-xs hover:cursor-pointer",
			children: [/* @__PURE__ */ T(E, {
				name: "chevron-left",
				className: "size-4 text-muted-foreground group-hover:text-foreground"
			}), /* @__PURE__ */ T("span", {
				className: "font-semibold mobile:text-xs text-sm",
				children: e === "#" ? "0–9" : e
			})]
		})
	}) : null;
}, we = () => {
	let e = H(l("visibleLetterWords", "onLetterScroll", "listRef")), n = U(), { mutateAsync: i } = y(), { expandedWord: a, wordMeanings: o, loadingMeaning: s, toggleWordMeaning: c } = Z(), u = async (e) => {
		try {
			let t = await i(e);
			r(t || e), p({
				action: () => g.set({ screen: "dictionary" }),
				content: /* @__PURE__ */ T(w, { children: [/* @__PURE__ */ T(E, { name: "dictionary" }), "Reabrir Dicionário"] })
			});
		} catch (e) {
			console.error("Erro ao reproduzir definição: ", e);
		}
	};
	return /* @__PURE__ */ T("div", {
		ref: e.listRef,
		onScroll: e.onLetterScroll,
		className: "h-full overflow-auto",
		children: /* @__PURE__ */ T("ul", {
			className: "flex h-full w-full flex-col text-sm",
			children: e.visibleLetterWords.map((e) => {
				let r = a === e, i = s === e, l = (e || "").replace(/_/g, " ");
				return /* @__PURE__ */ T("li", {
					className: "hover:bg-muted",
					children: [
						/* @__PURE__ */ T("div", {
							className: t("flex min-w-0 items-center", r ? "bg-muted" : ""),
							children: [/* @__PURE__ */ T("button", {
								type: "button",
								onClick: () => n(e),
								className: "w-full cursor-pointer whitespace-normal break-all px-6 py-1.25 text-left mobile:text-xs text-sm focus:bg-primary focus:text-primary-foreground",
								children: l
							}), /* @__PURE__ */ T(d, {
								size: "icon-sm",
								variant: "ghost",
								className: "text-muted-foreground",
								onClick: () => c(e),
								"aria-label": r ? "Fechar significado" : "Ver significado",
								children: /* @__PURE__ */ T(E, {
									name: r ? "chevron-up" : "chevron-down",
									className: "size-4"
								})
							})]
						}),
						r && /* @__PURE__ */ T(Q, {
							wordName: e,
							meaning: o[e],
							isLoading: i,
							onPlayDefinition: u
						}),
						/* @__PURE__ */ T("div", { className: "mx-4 border-border/30 border-t" })
					]
				}, e);
			})
		})
	});
}, Te = () => /* @__PURE__ */ T(w, { children: [/* @__PURE__ */ T(Ce, {}), /* @__PURE__ */ T(we, {})] }), Ee = () => {
	let { search: e, searchRef: t, handleSearchChange: n, handleClearSearch: r } = H(l("search", "searchRef", "handleSearchChange", "handleClearSearch"));
	return /* @__PURE__ */ T("div", {
		className: "relative flex items-center p-4 pb-0",
		children: [
			/* @__PURE__ */ T("label", {
				for: "dictionary-search",
				className: "sr-only",
				children: "Pesquisar sinal no dicionário"
			}),
			/* @__PURE__ */ T("input", {
				ref: t,
				id: "dictionary-search",
				type: "text",
				placeholder: "Pesquisar (ex: AJUDAR)...",
				onInput: (e) => n(e.currentTarget.value),
				className: "h-9 w-full rounded-md border p-2 pr-8 outline-primary placeholder:text-muted-foreground placeholder:text-sm focus:outline-2 focus:outline-solid"
			}),
			e && /* @__PURE__ */ T(d, {
				onClick: r,
				"aria-label": "Limpar busca",
				variant: "ghost",
				size: "icon-xs",
				className: "absolute right-5 rounded-sm bg-transparent! text-muted-foreground outline-destructive hover:text-destructive focus:text-destructive",
				children: /* @__PURE__ */ T(E, { name: "x" })
			})
		]
	});
}, De = () => {
	let e = H(l("isLoading", "data", "filter", "search", "selectedLetter", "selectedCategory", "retry", "isMaxRetries", "filteredLetterWords", "filteredCategoryWords", "filteredSigns"));
	if (e.isLoading) return /* @__PURE__ */ T(pe, {});
	if (!e.data && e.filter === "all") return /* @__PURE__ */ T(be, {
		onRetry: e.retry,
		isMaxRetries: e.isMaxRetries
	});
	let t = e.filter === "all" && !!e.selectedLetter, n = b(() => t ? !e.filteredLetterWords.length && !!e.search : e.filter === "categories" ? e.selectedCategory ? !e.filteredCategoryWords.length && !!e.search : !1 : !e.filteredSigns.length && !!e.search, [e]);
	return /* @__PURE__ */ T("div", {
		className: "flex h-full flex-col gap-2 overflow-hidden text-primary dark:text-white",
		children: [
			/* @__PURE__ */ T(Ee, {}),
			/* @__PURE__ */ T(Se, {}),
			e.filter === "categories" && !e.selectedCategory && /* @__PURE__ */ T(me, {}),
			e.filter === "categories" && e.selectedCategory && /* @__PURE__ */ T(ve, {}),
			t && /* @__PURE__ */ T(Te, {}),
			e.filter !== "categories" && !t && !n && /* @__PURE__ */ T(fe, {}),
			n && /* @__PURE__ */ T("p", {
				className: "break-all px-4 font-semibold mobile:text-xs text-muted-foreground text-sm",
				children: ["Sem resultados para ", /* @__PURE__ */ T("q", {
					className: "text-foreground",
					children: e.search
				})]
			})
		]
	});
}, Oe = () => /* @__PURE__ */ T(ue, { children: /* @__PURE__ */ T(j, { children: [/* @__PURE__ */ T(A, {
	close: !0,
	children: /* @__PURE__ */ T(O, { children: "Dicionário" })
}), /* @__PURE__ */ T(k, {
	className: "overflow-hidden p-0",
	children: /* @__PURE__ */ T(De, {})
})] }) });
export { Oe as DictionaryScreen };
