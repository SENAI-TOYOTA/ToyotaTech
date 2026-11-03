// \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n, r, i, a, o, s, c, l, u, d, f, p, m, h, g = 32, _ = "http://www.w3.org/2000/svg", v = "http://www.w3.org/1999/xhtml", y = "http://www.w3.org/1998/Math/MathML", b = null, x = void 0, S = {}, ee = [], C = /m(i|n|o|s$|te|sp)/, w = typeof Element < "u" && "moveBefore" in Element.prototype, te = Array.isArray, ne = ee.slice, T = Object.assign;
function re(e) {
	e && e.parentNode && e.remove();
}
function E(e, t, n) {
	var r, i, a, o = {}, s = arguments.length;
	for (a in t) a == "key" ? r = t[a] : a == "ref" && typeof e != "function" ? i = t[a] : o[a] = t[a];
	return s > 2 && (o.children = s > 3 ? ne.call(arguments, 2) : n), O(e, o, r, i, b);
}
function D(e, t, n) {
	var r, i, a, o = T({}, e.props), s = arguments.length;
	for (a in t) a == "key" ? r = t[a] : a == "ref" && typeof e.type != "function" ? i = t[a] : o[a] = t[a];
	return s > 2 && (o.children = s > 3 ? ne.call(arguments, 2) : n), O(e.type, o, r === x ? e.key : r, i === x ? e.ref : i, b);
}
function O(e, t, i, a, o) {
	var s = {
		type: e,
		props: t,
		key: i,
		ref: a,
		__k: b,
		__: b,
		__b: 0,
		__e: b,
		__c: b,
		constructor: x,
		__v: o || ++r,
		__i: -1,
		__u: 0
	};
	return !o && n.vnode && n.vnode(s), s;
}
function ie() {
	return { current: b };
}
function k(e) {
	return e.children;
}
function ae(e, t) {
	this.props = e, this.context = t, this.__g = 0;
}
function oe(e, t) {
	if (t == b) return e.__ ? oe(e.__, e.__i + 1) : b;
	for (var n; t < e.__k.length; t++) if ((n = e.__k[t]) && n.__e) return n.__e;
	return typeof e.type != "function" || e.props.__P ? b : oe(e);
}
function se(e) {
	var t, r = e.__v, i = r.__e, a = [], o = [], s = e.__P;
	s && ((t = T({ constructor: x }, r)).__v = r.__v + 1, n.vnode && n.vnode(t), ge(s, t, r, e.__n, s.namespaceURI, r.__u & g ? [i] : b, a, i || oe(r), r.__u & g, o), t.__v = r.__v, t.__.__k[t.__i] = t, ve(a, t, o), r.__ = r.__e = b, t.__e != i && ce(t));
}
function ce(e) {
	if ((e = e.__) && e.__c && !e.props.__P) return e.__e = b, e.__k.some(function(t) {
		return t && (e.__e = t.__e);
	}), ce(e);
}
function A(e) {
	(8 & e.__g || !(e.__g |= 8) || !a.push(e) || s++) && o == n.debounceRendering || ((o = n.debounceRendering) || queueMicrotask)(j);
}
function j() {
	try {
		for (var e, t = 1; a.length;) a.length > t && a.sort(c), e = a.shift(), t = a.length, 8 & e.__g && se(e);
	} finally {
		a.length = s = 0;
	}
}
function le(e, t, n, r, i, a, o, s, c, l, u) {
	var d, f, p, m, h, g, _ = r.__k || ee, v = t.length;
	for (c = ue(n, t, _, c, v), d = 0; d < v; d++) (p = n.__k[d]) != b && (f = ~p.__i && _[p.__i] || S, p.__i = d, g = ge(e, p, f, i, a, o, s, c, l, u), m = p.__e, p.ref && f.ref != p.ref && (f.ref && xe(f.ref, b, p), u.push(p.ref, p.__c || m, p)), h ||= m, 4 & p.__u ? (c = M(p, c, e, !f.__v), f.__e && (f.__e = b)) : typeof p.type == "function" && g !== x ? c = g : m && (c = m.nextSibling), p.__u &= -7);
	return n.__e = h, c;
}
function ue(e, t, n, r, i) {
	var a, o, s, c, l, u, d, f, p, m, h = n.length, g = h, _ = 0, v = !1, y = e.__k = Array(i);
	for (a = 0; a < i; a++) (o = t[a]) != b && typeof o != "boolean" && typeof o != "function" ? (typeof o != "object" || o.constructor == String ? o = y[a] = O(b, o) : te(o) ? o = y[a] = O(k, { children: o }) : o.constructor === x && o.__b ? o = y[a] = O(o.type, o.props, o.key, o.ref, o.__v) : y[a] = o, c = a + _, o.__ = e, o.__b = e.__b + 1, l = o.__i = fe(o, n, c, g), s = b, ~l && (g--, (s = n[l]) && (s.__u |= 2)), s && s.__v ? (o.__u |= 2, l == c - 1 ? _-- : l == c + 1 ? _++ : l != c && (l > c ? _-- : _++, v = !0)) : (~l || (i > h ? _-- : i < h && _++), typeof o.type != "function" && (o.__u |= 4))) : y[a] = b;
	if (v) {
		for (u = [], d = [], a = 0; a < i; a++) if ((o = y[a]) && 2 & o.__u) {
			for (f = 0, p = u.length; f < p;) u[m = f + p >> 1] < o.__i ? f = m + 1 : p = m;
			u[f] = o.__i, d[a] = f + 1;
		}
		for (_ = u.length; a--;) d[a] && (d[a] == _ ? _-- : y[a].__u |= 4);
	}
	if (g) for (a = 0; a < h; a++) !(s = n[a]) || 2 & s.__u || (s.__e == r && (r = oe(s)), Se(s, s));
	return r;
}
function M(e, t, n, r) {
	var i, a;
	if (typeof e.type == "function") {
		if (e.props.__P) return t;
		if (i = e.__k) for (a = 0; a < i.length; a++) i[a] && (i[a].__ = e, t = M(i[a], t, n, !1));
		return t;
	}
	for (e.__e != t && (t && e.type && !t.parentNode && (t = oe(e)), w && !r ? n.moveBefore(e.__e, t) : n.insertBefore(e.__e, t || b), t = e.__e); (t &&= t.nextSibling) && t.nodeType == 8;);
	return t;
}
function de(e, t) {
	return t ||= [], e != b && typeof e != "boolean" && (te(e) ? e.some(function(e) {
		de(e, t);
	}) : t.push(e)), t;
}
function fe(e, t, n, r) {
	var i, a, o, s = e.key, c = e.type, l = t[n], u = l && !(2 & l.__u);
	if (l === b && s == b || u && s == l.key && c == l.type) return n;
	if (r > +!!u) {
		for (i = n - 1, a = n + 1; i >= 0 || a < t.length;) if ((l = t[o = i >= 0 ? i-- : a++]) && !(2 & l.__u) && s == l.key && c == l.type) return o;
	}
	return -1;
}
function pe(e, t, n) {
	n == b && (n = ""), t[0] == "-" ? e.setProperty(t, n) : e[t] = n;
}
function me(e, t, n, r, i) {
	var a;
	n: if (t == "style") {
		if (typeof n == "string") e.style.cssText = n;
		else {
			if (typeof r == "string" && (e.style.cssText = r = ""), r) for (t in r) n && t in n || pe(e.style, t, "");
			if (n) for (t in n) r && n[t] == r[t] || pe(e.style, t, n[t]);
		}
	} else if (t[0] == "o" && t[1] == "n") a = t != (t = t.replace(d, "$1")), t = t.slice(2).toLowerCase(), (e.__e ||= {})[t + a] = n, n ? r ? n[u] = r[u] : (n[u] = f, e.addEventListener(t, a ? m : p, a)) : e.removeEventListener(t, a ? m : p, a);
	else {
		if (i == _) t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
		else if (t != "width" && t != "height" && t != "href" && t != "list" && t != "form" && t != "tabIndex" && t != "download" && t != "rowSpan" && t != "colSpan" && t != "role" && t != "popover" && t in e) try {
			e[t] = n == b ? "" : n;
			break n;
		} catch {}
		typeof n == "function" || (n == b || !1 === n && t[4] != "-" ? e.removeAttribute(t) : e.setAttribute(t, t == "popover" && n == 1 ? "" : n));
	}
}
function he(e) {
	return function(t) {
		if (this.__e) {
			var r = this.__e[t.type + e];
			if (t[l] == b) t[l] = f++;
			else if (t[l] < r[u]) return;
			return r(n.event ? n.event(t) : t);
		}
	};
}
function ge(e, t, r, i, a, o, s, c, l, u) {
	var d, f, p, m, h, _, v, y, S, C, w, ne, E, D, O, ie, se, ce, A, j = t.type;
	if (t.constructor !== x) return b;
	if (128 & r.__u && (l = r.__u & g) && (d = r.__c.__z)) {
		if (t.__u |= g, o = [], d.nodeType == 8) for (f = 1, p = d.nextSibling; p; p = p.nextSibling) {
			if (p.nodeType == 8) {
				if (p.data.startsWith("$s")) f++;
				else if (p.data.startsWith("/$s") && !--f) break;
			}
			o.push(p);
		}
		else o.push(d);
		c = o[0], r.__c.__z = b;
	}
	(d = n.__b) && d(t);
	n: if (typeof j == "function") {
		m = s.length;
		try {
			if (S = t.props, C = (d = j.prototype) && d.render, w = (d = j.contextType) && i[d.__c], ne = d ? w ? w.props.value : d.__ : i, r.__c ? 2 & (h = t.__c = r.__c).__g && (h.__g |= 1) : (C ? t.__c = h = new j(S, ne) : (t.__c = h = new ae(S, ne), h.constructor = j, h.render = Ce), w && w.sub(h), h.state || (h.state = {}), h.__n = i, h.__g |= 8, h.__h = [], h.__k = []), C && (h.__s || (h.__s = h.state), j.getDerivedStateFromProps && (h.__s == h.state && (h.__s = T({}, h.__s)), T(h.__s, j.getDerivedStateFromProps(S, h.__s)))), _ = h.props, v = h.state, h.__v = t, r.__c) {
				if (C && !j.getDerivedStateFromProps && S !== _ && h.componentWillReceiveProps && h.componentWillReceiveProps(S, ne), t.__v == r.__v && !(8 & h.__g) || !(4 & h.__g) && h.shouldComponentUpdate && !1 === h.shouldComponentUpdate(S, h.__s, ne)) {
					t.__v != r.__v && (h.props = S, h.state = h.__s, h.__g &= -9), t.__e = r.__e, t.__k = r.__k, t.__k.some(function(e) {
						e && (e.__ = t);
					}), ee.push.apply(h.__h, h.__k), h.__k = [], h.__h.length && s.push(h), c = oe(r);
					break n;
				}
				h.componentWillUpdate && h.componentWillUpdate(S, h.__s, ne), C && h.componentDidUpdate && h.__h.push(function() {
					h.componentDidUpdate(_, v, y);
				});
			} else C && !j.getDerivedStateFromProps && h.componentWillMount && h.componentWillMount(), C && h.componentDidMount && h.__h.push(h.componentDidMount);
			if (h.context = ne, h.props = S, h.__P = e, h.__g &= -5, E = n.__r, D = 0, C) h.state = h.__s, h.__g &= -9, E && E(t), d = h.render(h.props, h.state, h.context), ee.push.apply(h.__h, h.__k), h.__k = [];
			else do
				h.__g &= -9, E && E(t), d = h.render(h.props, h.state, h.context), h.state = h.__s;
			while (8 & h.__g && ++D < 25);
			h.state = h.__s, h.getChildContext && (i = T({}, i, h.getChildContext())), C && r.__c && h.getSnapshotBeforeUpdate && (y = h.getSnapshotBeforeUpdate(_, v)), O = d && d.type === k && d.key == b ? ye(d.props.children) : d, S.__P && (d = c, a = (e = S.__P).namespaceURI, r.props && r.props.__P != e && (r.__k.some(function(e) {
				e && Se(e, e);
			}), r.__k = b), c = r.__k ? oe(r, 0) : b), c = le(e, te(O) ? O : [O], t, r, i, a, o, s, c, l, u), S.__P && (t.__e = b, c = d), t.__u &= -161, h.__h.length && s.push(h), h.__g &= -4;
		} catch (e) {
			if (s.length = m, t.__v = b, l || o) {
				if (e.then) {
					if (ie = 0, t.__u |= l ? 160 : 128, o) {
						for (ce = 0; ce < o.length; ce++) if (A = o[ce]) {
							if (A.nodeType == 8) {
								if (o[ce] = b, A.data.startsWith("$s")) ie++ || (se = A);
								else if (A.data.startsWith("/$s") && !--ie) {
									c = A;
									break;
								}
							} else ie && (o[ce] = b);
						}
					}
					if (!se) {
						for (; c && c.nodeType == 8 && c.nextSibling;) c = c.nextSibling;
						o && (o[o.indexOf(c)] = b), se = c;
					}
					t.__c.__z = se, t.__e = c;
				} else o && o.some(re);
			} else t.__e = r.__e;
			t.__k ||= r.__k || [], e.then || _e(t), n.__e(e, t, r);
		}
	} else c = t.__e = be(r.__e, t, r, i, a, o, s, l, u, e);
	return (d = n.diffed) && d(t), 128 & t.__u ? x : c;
}
function _e(e) {
	e && (e.__c && (e.__c.__g |= 4), e.__k && e.__k.some(_e));
}
function ve(e, t, r) {
	for (var i = 0; i < r.length;) xe(r[i++], r[i++], r[i++]);
	n.__c && n.__c(t, e), e.some(function(t) {
		try {
			e = t.__h, t.__h = [], e.some(function(e) {
				e.call(t);
			});
		} catch (e) {
			n.__e(e, t.__v);
		}
	});
}
function ye(e) {
	return typeof e != "object" || e == b || e.__b ? e : te(e) ? e.map(ye) : e.constructor === x ? T({ constructor: x }, e) : b;
}
function be(e, t, r, i, a, o, s, c, l, u) {
	var d, f, p, m, h, g, ee, w, T, E = r.props || S, D = t.props, O = t.type;
	if (O == "svg" ? a = _ : O == "math" ? a = y : a ||= v, o) {
		for (d = 0; d < o.length; d++) if ((h = o[d]) && (O ? h.localName == O : h.nodeType == 3)) {
			e = h, o[d] = b;
			break;
		}
	}
	if (!e) {
		if (w = u.ownerDocument, !O) return w.createTextNode(D);
		e = w.createElementNS(a, O, D.is && D), c &&= (n.__m && n.__m(t, o), !1), o = b;
	}
	if (O) {
		if (u = O == "template" ? e.content : e, o = O == "textarea" && D.defaultValue != b ? b : o && ne.call(u.childNodes), !c && o) for (E = {}, d = 0; d < e.attributes.length; d++) E[(h = e.attributes[d]).name] = h.value;
		for (d in E) h = E[d], d == "dangerouslySetInnerHTML" ? p = h : d == "children" || d in D || d == "value" && "defaultValue" in D || d == "checked" && "defaultChecked" in D || me(e, d, b, h, a);
		for (d in T = 1 & r.__u, D) h = D[d], d == "children" ? m = h : d == "dangerouslySetInnerHTML" ? f = h : d == "value" ? g = h : d == "checked" ? ee = h : c && typeof h != "function" || !(E[d] !== h || T && h != b) || me(e, d, h, E[d], a);
		f ? (c || p && (f.__html == p.__html || f.__html == e.innerHTML) || (e.innerHTML = f.__html), t.__k = []) : (p && (e.textContent = ""), (O == "foreignObject" || a == y && C.test(O)) && (a = v), le(u, te(m) ? m : [m], t, r, i, a, o, s, o ? o[0] : r.__k && oe(r, 0), c, l), o && o.some(re)), c && O != "textarea" || (d = "value", O == "progress" && g == b ? e.removeAttribute(d) : g == x || g === e[d] && (O != "progress" || g) || me(e, d, g, E[d], a), d = "checked", ee != x && ee != e[d] && me(e, d, ee, E[d], a));
	} else E === D || c && e.data == D || (e.data = D);
	return e;
}
function xe(e, t, r) {
	try {
		typeof e == "function" ? (typeof e.__u == "function" && e.__u(), (typeof e.__u != "function" || t) && (e.__u = e(t))) : e.current = t;
	} catch (e) {
		n.__e(e, r);
	}
}
function Se(e, t, r) {
	var i, a;
	if (n.unmount && n.unmount(e), !(i = e.ref) || i.current && i.current != e.__e || xe(i, b, t), i = e.__c) {
		if (i.componentWillUnmount) try {
			i.componentWillUnmount();
		} catch (e) {
			n.__e(e, t);
		}
		i.__P = i.__n = b;
	}
	if (i = e.__k) for (a = 0; a < i.length; a++) i[a] && Se(i[a], t, typeof e.type != "function" || r && !e.props.__P);
	(i = e.__e) && (r || re(i), i.__e && (i.__e = b)), e.__e = e.__c = e.__ = b;
}
function Ce(e, t, n) {
	return this.constructor(e, n);
}
function we(e, t) {
	var r, i, a, o;
	n.__ && n.__(e, t), t.nodeType == 9 && (t = t.documentElement), i = (r = e && e.__u & g) ? b : t.__k, t.__k = E(k, b, [e]), a = [], o = [], ge(t, t.__k, i || S, S, t.namespaceURI, i ? b : t.firstChild ? ne.call(t.childNodes) : b, a, i ? i.__e : t.firstChild, r, o), ve(a, t.__k, o), t.__k.props.children = b;
}
function Te(e, t) {
	e.__u |= g, we(e, t);
}
function Ee(e) {
	function t(e) {
		var n, r;
		return this.getChildContext || (n = /* @__PURE__ */ new Set(), (r = {})[t.__c] = this, this.getChildContext = function() {
			return r;
		}, this.shouldComponentUpdate = function(e) {
			this.props.value != e.value && n.forEach(function(e) {
				e.__g |= 4, A(e);
			});
		}, this.sub = function(e) {
			n.add(e);
			var t = e.componentWillUnmount;
			e.componentWillUnmount = function() {
				n.delete(e), t && t.call(e);
			};
		}), e.children;
	}
	return t.__c = "__cC" + h++, t.__ = e, t.Provider = (t.Consumer = function(e, t) {
		return e.children(t);
	}).contextType = t, t;
}
function De(e) {
	return e.children;
}
function Oe(e, t) {
	return E(De, { __P: t }, e);
}
n = { __e: function(e, t, n, r) {
	for (var i, a; t = t.__;) if ((i = t.__c) && !(1 & i.__g)) {
		i.__g |= 4;
		try {
			if ((a = i.constructor) && a.getDerivedStateFromError && i.setState(a.getDerivedStateFromError(e)), i.componentDidCatch && i.componentDidCatch(e, r || {}), 8 & i.__g) return void (i.__g |= 2);
		} catch (t) {
			e = t;
		}
	}
	throw s = 0, e;
} }, r = 0, i = function(e) {
	return e != b && e.constructor === x;
}, ae.prototype.setState = function(e, t) {
	var n = this.__s;
	n && n != this.state || (n = this.__s = T({}, this.state)), typeof e == "function" && (e = e(T({}, n), this.props)), e && (T(n, e), this.__v && (t && this.__k.push(t), A(this)));
}, ae.prototype.forceUpdate = function(e) {
	this.__v && (this.__g |= 4, e && this.__h.push(e), A(this));
}, ae.prototype.render = k, a = [], s = 0, c = function(e, t) {
	return e.__v.__b - t.__v.__b;
}, l = Symbol(), u = Symbol(), d = /(PointerCapture)$|Capture$/i, f = 0, p = he(!1), m = he(!0), h = 0;
// node_modules/.pnpm/preact@11.0.0-rc.1/node_modules/preact/hooks/dist/hooks.mjs
var ke, N, Ae, je, Me = Object.is, Ne = 0, Pe = [], Fe = [], P = n, Ie = P.__b, Le = P.__r, Re = P.diffed, ze = P.__c, Be = P.unmount, Ve = P.__;
function He(e, t) {
	P.__h && P.__h(N, e, Ne || t), Ne = 0;
	var n = N.__H || (N.__H = {
		__: [],
		__h: []
	});
	return e >= n.__.length && n.__.push({}), n.__[e];
}
function F(e) {
	return Ne = 1, Ue(it, e);
}
function Ue(e, t, n) {
	var r = He(ke++, 2);
	if (r.t = e, !r.__c && (r.__ = [n ? n(t) : it(void 0, t), function(e) {
		var t = r.__N ? r.__N[0] : r.__[0], n = r.t(t, e);
		Me(t, n) || (r.__N = [n, r.__[1]], r.__c.setState({}));
	}], r.__c = N, !N.__f)) {
		N.__f = !0;
		var i = N.shouldComponentUpdate;
		N.shouldComponentUpdate = function(e, t, n) {
			var r = this.__H;
			if (!r) return !0;
			var a = !1, o = this.props != e;
			if (r.__.some(function(e) {
				e.__N && (a = !0, Me(e.__[0], e.__N[0]) || (o = !0));
			}), i) {
				var s = i.call(this, e, t, n);
				return a ? s || o : s;
			}
			return !a || o;
		};
	}
	return r.__;
}
function I(e, t) {
	var n = He(ke++, 3);
	!P.__s && rt(n.__H, t) && (n.u = !0, n.__ = e, n.i = t, N.__H.__h.push(n));
}
function We(e, t) {
	var n = He(ke++, 4);
	!P.__s && rt(n.__H, t) && (n.__ = e, n.i = t, N.__h.push(n));
}
function L(e) {
	return Ne = 5, Ke(function() {
		return { current: e };
	}, []);
}
function Ge(e, t, n) {
	Ne = 6, We(function() {
		if (typeof e == "function") {
			var n = e(t());
			return function() {
				e(null), n && typeof n == "function" && n();
			};
		}
		if (e) return e.current = t(), function() {
			return e.current = null;
		};
	}, n == null ? n : n.concat(e));
}
function Ke(e, t) {
	var n = He(ke++, 7);
	return rt(n.__H, t) && (n.__ = e(), n.__H = t), n.__;
}
function qe(e, t) {
	return Ne = 8, Ke(function() {
		return e;
	}, t);
}
function Je(e) {
	var t = N.context[e.__c], n = He(ke++, 9);
	return n.c = e, t ? (n.__ ?? (n.__ = !0, t.sub(N)), t.props.value) : e.__;
}
function Ye(e, t) {
	P.useDebugValue && P.useDebugValue(t ? t(e) : e);
}
function Xe() {
	var e = He(ke++, 11);
	if (!e.__) {
		for (var t = N.__v; !t.__m && t.__;) t = t.__;
		var n = t.__m || (t.__m = [0, 0]);
		e.__ = "P" + n[0] + "-" + n[1]++;
	}
	return e.__;
}
function Ze() {
	var e;
	do {
		for (; e = Fe.shift();) try {
			tt(e);
		} catch (t) {
			P.__e(t, { __: (e = e.u) && e.__v });
		}
		for (; e = Pe.shift();) {
			var t = e.__H;
			if (e.__P && t) try {
				t.__h.some(tt), t.__h.some(nt), t.__h = [];
			} catch (n) {
				t.__h = [], P.__e(n, e.__v);
			}
		}
	} while (Fe.length);
}
P.__b = function(e) {
	N = null, Ie && Ie(e);
}, P.__ = function(e, t) {
	e && t.__k && t.__k.__m && (e.__m = t.__k.__m), Ve && Ve(e, t);
}, P.__r = function(e) {
	Le && Le(e), ke = 0;
	var t = (N = e.__c).__H;
	t && (Ae == N ? N.__h = [] : (t.__h.some(tt), t.__h.some(nt), ke = 0), t.__h = [], t.__.some(function(e) {
		e.__N && (e.__ = e.__N), e.i = e.__N = void 0;
	})), Ae = N;
}, P.diffed = function(e) {
	Re && Re(e);
	var t = e.__c;
	t && t.__H && (t.__H.__h.length && et(Pe.push(t)), t.__H.__.some(function(e) {
		e.i && (e.__H = e.i);
	})), Ae = N = null;
}, P.__c = function(e, t) {
	t.some(function(e) {
		try {
			e.__h.some(tt), e.__h = e.__h.filter(function(e) {
				return !e.__ || nt(e);
			});
		} catch (n) {
			t.some(function(e) {
				e.__h &&= [];
			}), t = [], P.__e(n, e.__v);
		}
	}), ze && ze(e, t);
}, P.unmount = function(e) {
	Be && Be(e);
	var t = e.__c;
	if (t && t.__H) {
		for (var n, r = e.__; r && (!r.__c || !r.__c.__P);) r = r.__;
		t.__H.__.some(function(e) {
			try {
				e.u ? (e.u = r && r.__c, et(Fe.push(e))) : tt(e);
			} catch (e) {
				n = e;
			}
		}), t.__H = void 0, n && P.__e(n, t.__v);
	}
};
var Qe = typeof requestAnimationFrame == "function";
function $e(e) {
	var t, n = function() {
		clearTimeout(r), Qe && cancelAnimationFrame(t), setTimeout(e);
	}, r = setTimeout(n, 35);
	Qe && (t = requestAnimationFrame(n));
}
function et(e) {
	e != 1 && je == P.requestAnimationFrame || ((je = P.requestAnimationFrame) || $e)(Ze);
}
function tt(e) {
	var t = N, n = e.__c;
	typeof n == "function" && (e.__c = void 0, n()), N = t;
}
function nt(e) {
	var t = N;
	e.__c = e.__(), N = t;
}
function rt(e, t) {
	return !e || e.length != t.length || t.some(function(t, n) {
		return !Me(t, e[n]);
	});
}
function it(e, t) {
	return typeof t == "function" ? t(e) : t;
}
// node_modules/.pnpm/zustand@5.0.11_react@19.1.0/node_modules/zustand/esm/vanilla.mjs
var at = (e) => {
	let t, n = /* @__PURE__ */ new Set(), r = (e, r) => {
		let i = typeof e == "function" ? e(t) : e;
		if (!Object.is(i, t)) {
			let e = t;
			t = r ?? (typeof i != "object" || !i) ? i : Object.assign({}, t, i), n.forEach((n) => n(t, e));
		}
	}, i = () => t, a = {
		setState: r,
		getState: i,
		getInitialState: () => o,
		subscribe: (e) => (n.add(e), () => n.delete(e))
	}, o = t = e(r, i, a);
	return a;
}, ot = ((e) => e ? at(e) : at), st = function(e, t, n) {
	return e == null ? null : de(de(e).map(t.bind(n)));
}, ct = {
	map: st,
	forEach: st,
	count: function(e) {
		return e ? de(e).length : 0;
	},
	only: function(e) {
		var t = de(e);
		if (t.length != 1) throw "Children.only";
		return t[0];
	},
	toArray: de
}, lt = Object.assign;
function ut(e, t) {
	for (var n in e) if (n != "__source" && e[n] !== t[n]) return !0;
	for (var r in t) if (r != "__source" && !(r in e)) return !0;
	return !1;
}
var dt = /^(-|f[lo].*[^se]$|g.{5,}[^ps]$|z|o[pr]|(W.{5})?[lL]i.*(t|mp)$|an|(bo|s).{4}Im|sca|m.{6}[ds]|ta|c.*[st]$|wido|ini)/;
function ft(e, t) {
	this.props = e, this.context = t;
}
(ft.prototype = new ae()).isPureReactComponent = !0, ft.prototype.shouldComponentUpdate = function(e, t) {
	return ut(this.props, e) || ut(this.state, t);
};
var pt = Symbol.for("react.forward_ref");
function mt(e) {
	function t(t) {
		var n = lt({}, t);
		return delete n.ref, e(n, t.ref || null);
	}
	return t.$$typeof = pt, t.render = e, t.prototype.isReactComponent = !0, t.displayName = "ForwardRef(" + (e.displayName || e.name) + ")", t;
}
function ht(e) {
	e();
}
function gt(e) {
	return e;
}
function _t() {
	return [!1, ht];
}
var vt = We;
function yt(e) {
	var t = L(e);
	return t.current = e, function() {
		return t.current.apply(void 0, arguments);
	};
}
function bt(e, t) {
	function n(e) {
		var n = this.props.ref;
		return n != e.ref && n && (typeof n == "function" ? n(null) : n.current = null), t ? !t(this.props, e) || n != e.ref : ut(this.props, e);
	}
	function r(t) {
		return this.shouldComponentUpdate = n, E(e, t);
	}
	return r.displayName = "Memo(" + (e.displayName || e.name) + ")", r.prototype.isReactComponent = !0, r.type = e, r;
}
function xt(e, t) {
	var n = Oe(e, t);
	return n.containerInfo = t, n;
}
var St, Ct, wt, Tt = Symbol.for("react.element"), Et = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/, Dt = /[A-Z0-9]/g, Ot = typeof document < "u", kt = /* @__PURE__ */ Lt(function(e, t, r) {
	var i = n.__s || Ct ? (r || t)() : t(), a = F({ t: {
		__: i,
		u: t
	} }), o = a[0].t, s = a[1];
	return We(function() {
		o.__ = i, o.u = t, At(o) && s({ t: o });
	}, [
		e,
		i,
		t
	]), I(function() {
		return At(o) && s({ t: o }), e(function() {
			At(o) && s({ t: o });
		});
	}, [e]), i;
});
function At(e) {
	try {
		return !Object.is(e.__, e.u());
	} catch {
		return !0;
	}
}
var jt = function(e) {
	return /fil|che|rad/.test(e);
};
function Mt(e, t, n) {
	return t.__k ?? (t.textContent = ""), we(e, t), typeof n == "function" && n(), e ? e.__c : null;
}
function Nt(e, t, n) {
	return Te(e, t), typeof n == "function" && n(), e ? e.__c : null;
}
ae.prototype.isReactComponent = !0, [
	"componentWillMount",
	"componentWillReceiveProps",
	"componentWillUpdate"
].forEach(function(e) {
	Object.defineProperty(ae.prototype, e, {
		configurable: !0,
		get: function() {
			return this["UNSAFE_" + e];
		},
		set: function(t) {
			Object.defineProperty(this, e, {
				configurable: !0,
				writable: !0,
				value: t
			});
		}
	});
});
var Pt = n.event;
n.event = function(e) {
	return Pt && (e = Pt(e)), e.persist = function() {}, e.isPropagationStopped = function() {
		return this.cancelBubble;
	}, e.isDefaultPrevented = function() {
		return this.defaultPrevented;
	}, e.nativeEvent = e;
};
var Ft = {
	configurable: !0,
	get: function() {
		return this.class;
	}
}, It = n.vnode;
function Lt(e) {
	if (!wt) {
		wt = !0;
		var t = n.__r;
		n.__r = function(e) {
			t && t(e), 32 & e.__u && (Ct = e), St = e.__c;
		};
		var r = n.diffed;
		n.diffed = function(e) {
			r && r(e), St = null, Ct == e && (Ct = null);
		};
	}
	return e;
}
n.vnode = function(e) {
	if (typeof e.type == "string") (function(e) {
		var t = e.props, n = e.type, r = {}, i = n.indexOf("-") == -1;
		for (var a in t) {
			var o = t[a];
			if (!(a == "value" && "defaultValue" in t && o == null || Ot && a == "children" && n == "noscript" || a == "class" || a == "className")) {
				if (a == "style" && typeof o == "object") {
					var s = void 0;
					for (var c in o) typeof o[c] != "number" || dt.test(c) || (s ||= o = lt({}, o), o[c] += "px");
				} else if (a == "defaultValue" && "value" in t && t.value == null) a = "value";
				else if (a == "download" && !0 === o) o = "";
				else if (a == "translate" && o === "no") o = !1;
				else if (a[0] == "o" && a[1] == "n") {
					var l = a.toLowerCase();
					l == "ondoubleclick" ? a = "ondblclick" : l != "onchange" || n != "input" && n != "textarea" || jt(t.type) ? l == "onfocus" ? a = "onfocusin" : l == "onblur" && (a = "onfocusout") : l = a = "oninput", l == "oninput" && r[a = l] && (a = "oninputCapture");
				} else i && Et.test(a) ? a = a.replace(Dt, "-$&").toLowerCase() : o === null && (o = void 0);
				r[a] = o;
			}
		}
		n == "select" && (r.multiple && Array.isArray(r.value) && (r.value = de(t.children).forEach(function(e) {
			e.props.selected = r.value.indexOf(e.props.value) != -1;
		})), r.defaultValue != null && (r.value = de(t.children).forEach(function(e) {
			e.props.selected = r.multiple ? r.defaultValue.indexOf(e.props.value) != -1 : r.defaultValue == e.props.value;
		}))), t.class && !t.className ? (r.class = t.class, Object.defineProperty(r, "className", Ft)) : t.className && (r.class = r.className = t.className), e.props = r;
	})(e);
	else if (typeof e.type == "function" && ("ref" in e.props && "prototype" in e.type && e.type.prototype.render && (e.ref = e.props.ref, delete e.props.ref), e.type.defaultProps)) {
		var t = lt({}, e.props);
		for (var n in e.type.defaultProps) t[n] === void 0 && (t[n] = e.type.defaultProps[n]);
		e.props = t;
	}
	e.$$typeof = Tt, It && It(e);
};
var Rt = /* @__PURE__ */ Lt(function(e) {
	if (e.then) {
		if (e.status == "fulfilled") return e.value;
		throw e.status == "rejected" ? e.reason : (e.status || (e.status = "pending", e.then(function(t) {
			e.status = "fulfilled", e.value = t;
		}, function(t) {
			e.status = "rejected", e.reason = t;
		})), e);
	}
	var t = e.__c, n = St.__n[t];
	return n ? (St[t] || (St[t] = !0, n.sub(St)), n.props.value) : e.__;
}), zt = { ReactCurrentDispatcher: { current: {
	readContext: Rt,
	useCallback: qe,
	useContext: Je,
	useDebugValue: Ye,
	useDeferredValue: gt,
	useEffect: I,
	useId: Xe,
	useImperativeHandle: Ge,
	useInsertionEffect: vt,
	useLayoutEffect: We,
	useMemo: Ke,
	useReducer: Ue,
	useRef: L,
	useState: F,
	useSyncExternalStore: kt,
	useTransition: _t
} } };
function Bt(e, t, n) {
	return e && (e.__c && e.__c.__H && (e.__c.__H.__.forEach(function(e) {
		typeof e.__c == "function" && e.__c();
	}), e.__c.__H = null), (e = lt({ constructor: void 0 }, e)).__c != null && (e.__c.__P == n && (e.__c.__P = t), e.__c.__g |= 4, e.__c = null), e.__k = e.__k && e.__k.map(function(e) {
		return Bt(e, t, n);
	})), e;
}
function Vt(e, t, n) {
	return e && n && (typeof e.type == "string" && (e.__u |= 1), e.__v = null, e.__k = e.__k && e.__k.map(function(e) {
		return Vt(e, t, n);
	}), e.__c && e.__c.__P == t && (e.__e && n.appendChild(e.__e), e.__c.__g |= 4, e.__c.__P = n)), e;
}
function Ht() {
	function e() {
		this.__u = 0, this.o = null, this.__b = null;
	}
	return function() {
		var e = n.__e;
		n.__e = function(t, n, r, i) {
			if (t.then) {
				for (var a, o = n; o = o.__;) if ((a = o.__c) && a.__c) return n.__e ?? (n.__e = r.__e, n.__k = r.__k || []), a.__c(t, n);
			}
			e(t, n, r, i);
		};
		var t = n.unmount;
		n.unmount = function(e) {
			var n = e.__c;
			n && (n.__z = !0), n && n.__R && n.__R(), t && t(e);
		};
	}(), (e.prototype = new ae()).__c = function(e, t) {
		var n = this, r = t.__c;
		this.o ??= [], this.o.push(r);
		var i = !1, a = function() {
			i || n.__z || (i = !0, r.__R = null, s());
		};
		r.__R = a;
		var o = r.__P;
		r.__P = null;
		var s = function() {
			if (!--n.__u) {
				if (n.state.__a) {
					var e = n.state.__a;
					n.__v.__k[0] = Vt(e, e.__c.__P, e.__c.__O);
				}
				var t;
				for (n.setState({ __a: n.__b = null }); t = n.o.pop();) t.__P = o, t.forceUpdate();
			}
		};
		this.__u++ || 32 & t.__u || this.setState({ __a: this.__b = this.__v.__k[0] }), e.then(a, a);
	}, e.prototype.componentWillUnmount = function() {
		this.o = [];
	}, e.prototype.render = function(e, t) {
		if (this.__b) {
			if (this.__v.__k) {
				var n = document.createElement("div"), r = this.__v.__k[0].__c;
				this.__v.__k[0] = Bt(this.__b, n, r.__O = r.__P);
			}
			this.__b = null;
		}
		return [E(k, null, t.__a ? null : e.children), t.__a && E(k, null, e.fallback)];
	}, e;
}
var Ut = /* @__PURE__ */ Ht();
function Wt(e) {
	var t, n, r, i = null;
	function a(a) {
		if (t || (t = e()).then(function(e) {
			e && (i = e.default || e), r = !0;
		}, function(e) {
			n = e, r = !0;
		}), n) throw n;
		if (!r) throw t;
		return i ? E(i, a) : null;
	}
	return a.displayName = "Lazy", a;
}
var Gt = "19.0.0";
function Kt(e) {
	return E.bind(null, e);
}
function qt(e) {
	return !!e && e.$$typeof === Tt;
}
function Jt(e) {
	return qt(e) && e.type == k;
}
function Yt(e) {
	return !!e && typeof e.displayName == "string" && e.displayName.indexOf("Memo(") == 0;
}
function Xt(e) {
	return qt(e) ? D.apply(null, arguments) : e;
}
function Zt(e) {
	return !!e.__k && (we(null, e), !0);
}
function Qt(e) {
	return e && (e.__v && e.__v.__e || e.nodeType == 1 && e) || null;
}
var $t = function(e, t) {
	var r, i = n.debounceRendering;
	n.debounceRendering = function(e) {
		r = e;
	};
	try {
		var a = e(t);
		return r && r(), a;
	} finally {
		n.debounceRendering = i;
	}
};
function en(e, t) {
	return e(t);
}
var tn = {
	useState: F,
	useId: Xe,
	useReducer: Ue,
	useEffect: I,
	useLayoutEffect: We,
	useInsertionEffect: vt,
	useTransition: _t,
	useDeferredValue: gt,
	useSyncExternalStore: kt,
	useEffectEvent: yt,
	startTransition: ht,
	useRef: L,
	useImperativeHandle: Ge,
	useMemo: Ke,
	useCallback: qe,
	useContext: Je,
	use: Rt,
	useDebugValue: Ye,
	version: Gt,
	Children: ct,
	render: Mt,
	hydrate: Nt,
	unmountComponentAtNode: Zt,
	createPortal: xt,
	createElement: E,
	createContext: Ee,
	createFactory: Kt,
	cloneElement: Xt,
	createRef: ie,
	Fragment: k,
	isValidElement: qt,
	isElement: qt,
	isFragment: Jt,
	isMemo: Yt,
	findDOMNode: Qt,
	Component: ae,
	PureComponent: ft,
	memo: bt,
	forwardRef: mt,
	flushSync: $t,
	unstable_batchedUpdates: en,
	StrictMode: k,
	Suspense: Ut,
	lazy: Wt,
	__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: zt
}, nn = (e) => e;
function rn(e, t = nn) {
	let n = tn.useSyncExternalStore(e.subscribe, tn.useCallback(() => t(e.getState()), [e, t]), tn.useCallback(() => t(e.getInitialState()), [e, t]));
	return tn.useDebugValue(n), n;
}
var an = (e) => {
	let t = ot(e), n = (e) => rn(t, e);
	return Object.assign(n, t), n;
}, on = ((e) => e ? an(e) : an), sn = on()(() => ({
	path: "",
	version: ""
})), cn = () => (I(() => {
	let e = sn.getState();
	e.path && e.version || sn.setState({
		path: window?.VLibrasWidget?.path ?? "./",
		version: "7.12.3"
	});
}, []), sn());
// src/common/hooks/use-debounced-callback.ts
function ln(e, t) {
	let n = L(null);
	return I(() => () => {
		n.current && clearTimeout(n.current);
	}, []), (r) => {
		n.current && clearTimeout(n.current), n.current = setTimeout(() => e(r), t);
	};
}
// src/common/hooks/use-media-query.ts
var un = (e) => {
	let [t, n] = F(!1);
	return I(() => {
		function t(e) {
			n(e.matches);
		}
		let r = matchMedia(e);
		return r.addEventListener("change", t), n(r.matches), () => r.removeEventListener("change", t);
	}, [e]), t;
}, dn = on()(() => ({ isExpanded: !1 })), fn = () => {
	let e = dn((e) => e.isExpanded);
	return un("(max-width: 640px)") && !e;
}, pn = {
	get: dn.getState,
	set: dn.setState
}, mn = ({ mutationFn: e, onMutate: t, onSettled: n }) => {
	let [r, i] = F(!1), [a, o] = F(null);
	return {
		mutateAsync: async (r) => {
			i(!0), o(null), t?.(r);
			let a, s = null;
			try {
				return a = await e(r), a;
			} catch (e) {
				throw s = e instanceof Error ? e : Error(String(e)), o(s), s;
			} finally {
				i(!1), n?.(a, s, r);
			}
		},
		isPending: r,
		error: a
	};
}, hn = /* @__PURE__ */ new Map(), gn = (e) => {
	let t = hn.get(e);
	return t || (t = {
		timestamp: 0,
		listeners: /* @__PURE__ */ new Set()
	}, hn.set(e, t)), t;
}, _n = (e, t) => {
	let n = gn(e);
	return n.promise ||= t().then((e) => (n.data = e, n.error = void 0, n.timestamp = Date.now(), e)).catch((e) => {
		throw n.error = e instanceof Error ? e : Error(String(e)), n.error;
	}).finally(() => {
		n.promise = void 0;
		for (let e of n.listeners) e();
	}), n.promise;
}, vn = 3e5, yn = ({ queryKey: e, queryFn: t, enabled: n = !0, select: r, staleTime: i = vn }) => {
	let a = JSON.stringify(e), [, o] = F(0), s = L({});
	I(() => {
		if (!n) return;
		let e = gn(a);
		Date.now() - e.timestamp > i && _n(a, t).catch(() => {});
		let r = () => o((e) => e + 1);
		return e.listeners.add(r), () => e.listeners.delete(r);
	}, [
		a,
		n,
		i
	]);
	let c = gn(a), l = n && !!c.promise, u, d;
	if (c.data === void 0) u = void 0;
	else if (!r) u = c.data;
	else if (s.current.source === c.data) u = s.current.result;
	else try {
		u = r(c.data), s.current = {
			source: c.data,
			result: u
		};
	} catch (e) {
		d = e instanceof Error ? e : Error(String(e)), console.error("Erro ao processar resposta da API (formato inesperado):", d);
	}
	return {
		data: n ? u : void 0,
		error: n ? d ?? c.error ?? null : null,
		isLoading: n && c.data === void 0 && l,
		isFetching: l,
		refetch: async () => {
			await _n(a, t).catch(() => {});
		}
	};
}, bn = (e) => Symbol.iterator in e, xn = (e) => "entries" in e, Sn = (e, t) => {
	let n = e instanceof Map ? e : new Map(e.entries()), r = t instanceof Map ? t : new Map(t.entries());
	if (n.size !== r.size) return !1;
	for (let [e, t] of n) if (!r.has(e) || !Object.is(t, r.get(e))) return !1;
	return !0;
}, Cn = (e, t) => {
	let n = e[Symbol.iterator](), r = t[Symbol.iterator](), i = n.next(), a = r.next();
	for (; !i.done && !a.done;) {
		if (!Object.is(i.value, a.value)) return !1;
		i = n.next(), a = r.next();
	}
	return !!i.done && !!a.done;
};
function wn(e, t) {
	return Object.is(e, t) ? !0 : typeof e != "object" || !e || typeof t != "object" || !t || Object.getPrototypeOf(e) !== Object.getPrototypeOf(t) ? !1 : bn(e) && bn(t) ? xn(e) && xn(t) ? Sn(e, t) : Cn(e, t) : Sn({ entries: () => Object.entries(e) }, { entries: () => Object.entries(t) });
}
// node_modules/.pnpm/zustand@5.0.11_react@19.1.0/node_modules/zustand/esm/react/shallow.mjs
function Tn(e) {
	let t = tn.useRef(void 0);
	return (n) => {
		let r = e(n);
		return wn(t.current, r) ? t.current : t.current = r;
	};
}
// src/common/utils/index.ts
function En(e, ...t) {
	let n = { ...e };
	for (let e of t) delete n[e];
	return n;
}
function Dn(e, ...t) {
	let n = {};
	for (let r of t) n[r] = e[r];
	return n;
}
var On = (e) => new Promise((t) => setTimeout(t, e)), kn = (e) => {
	let [, t = "", n = e] = e.match(/^([a-z][a-z\d+.-]*:\/\/)(.*)$/i) ?? [];
	return t + n.replace(/\/+/g, "/");
}, An = (e) => {
	let { path: t } = sn.getState();
	return kn(`${t}/assets/${e}`);
}, jn = () => Math.random().toString(36).slice(2, 8), Mn = (...e) => Tn(Ke(() => (t) => Dn(t, ...e), [JSON.stringify(e)])), Nn = "@vlibras-theme", Pn = (e) => ["light", "dark"].includes(e), Fn = () => {
	try {
		let e = localStorage.getItem(Nn) || "";
		return Pn(e) ? e : "light";
	} catch {
		return "light";
	}
}, In = (e) => {
	try {
		localStorage.setItem(Nn, e);
	} catch {}
}, Ln = on((e) => ({
	theme: Fn(),
	toggleTheme: () => e((e) => {
		let t = e.theme === "dark" ? "light" : "dark";
		return In(t), {
			theme: t,
			isDark: t === "dark"
		};
	}),
	setTheme: (t) => {
		In(t), e({ theme: t });
	}
})), Rn = () => {
	let [e, t] = F(!1);
	return I(() => {
		let e = () => {
			t(window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches);
		};
		return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
	}, []), e;
}, zn = "vlibras-app-root", Bn = {}, Vn = {}, Hn = (e) => !e.isConnected, Un = () => {
	let e = Bn[zn];
	(!e || Hn(e)) && (e = document.getElementById(zn) ?? void 0, (!e || Hn(e)) && (e = document.createElement("div"), e.id = zn, e.style.zIndex = "2147483647"), document.body.appendChild(e), Bn[zn] = e), e.lang = "pt-BR";
	let t = e.shadowRoot || e.attachShadow({ mode: "open" });
	return {
		root: e,
		shadowRoot: t,
		isRootActive: () => e?.getAttribute("data-active") === "true"
	};
}, Wn = (e, t, n) => {
	let r = Vn[t];
	if (r && !Hn(r)) return r;
	let i = r ?? document.createElement("style");
	i.id = t, i.innerHTML = e, Vn[t] = i, document.head.appendChild(i), n?.();
}, Gn = (e) => {
	let t = Vn[e];
	t && (t.remove(), delete Vn[e]);
}, Kn = "VLibrasWidget_Font", qn = [
	{
		file: "rawline-500.woff2",
		weight: "500",
		style: "normal"
	},
	{
		file: "rawline-500i.woff2",
		weight: "500",
		style: "italic"
	},
	{
		file: "rawline-600.woff2",
		weight: "600",
		style: "normal"
	},
	{
		file: "rawline-600i.woff2",
		weight: "600",
		style: "italic"
	},
	{
		file: "rawline-700.woff2",
		weight: "700",
		style: "normal"
	},
	{
		file: "rawline-700i.woff2",
		weight: "700",
		style: "italic"
	}
], Jn = !1, Yn = async (e, t) => {
	if (Jn) return;
	if (Jn = !0, typeof FontFace > "u") {
		Zn(e, t);
		return;
	}
	let n = qn.map(({ file: t, weight: n, style: r }) => new FontFace(Kn, `url(${e}/assets/fonts/rawline/${t}) format('woff2')`, {
		weight: n,
		style: r
	}));
	try {
		await Xn(n);
	} catch (n) {
		console.error("Error loading default font, falling back to @font-face:", n), Zn(e, t);
	}
}, Xn = async (e) => {
	await Promise.all(e.map((e) => e.load())), e.forEach((e) => document.fonts.add(e));
}, Zn = (e, t) => {
	let n = document.createElement("style");
	n.textContent = qn.map(({ file: t, weight: n, style: r }) => `
			@font-face {
				font-family: "${Kn}";
				src: url("${e}/assets/fonts/rawline/${t}") format("woff2");
				font-weight: ${n};
				font-style: ${r};
			}
		`).join("\n"), t.appendChild(n);
}, Qn = "inert", $n = "data-inert-prev-tabindex", er = "a[href], area[href], button, input, select, textarea, iframe, object, embed, [contenteditable], [tabindex]", tr = /* @__PURE__ */ new WeakMap(), nr = (e) => [...e.matches(er) ? [e] : [], ...e.querySelectorAll(er)], rr = (e) => {
	e.hasAttribute($n) || (e.setAttribute($n, e.getAttribute("tabindex") ?? ""), e.setAttribute("tabindex", "-1"));
}, ir = (e) => {
	let t = e.getAttribute($n);
	t ? e.setAttribute("tabindex", t) : e.removeAttribute("tabindex"), e.removeAttribute($n);
}, ar = (e) => {
	e.setAttribute("aria-hidden", "true");
	for (let t of nr(e)) rr(t);
	let t = new MutationObserver((e) => {
		for (let { addedNodes: t } of e) for (let e of t) if (e instanceof HTMLElement) for (let t of nr(e)) rr(t);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0
	}), tr.set(e, t);
}, or = (e) => {
	e.removeAttribute("aria-hidden"), tr.get(e)?.disconnect(), tr.delete(e), e.hasAttribute($n) && ir(e);
	for (let t of e.querySelectorAll(`[${$n}]`)) ir(t);
}, sr = !1, cr = (e) => {
	if (sr || typeof HTMLElement > "u" || Qn in HTMLElement.prototype) return;
	sr = !0;
	let t = document.createElement("style");
	t.textContent = `[${Qn}] { pointer-events: none !important; user-select: none !important; }`, e.appendChild(t), e.addEventListener("focusin", (e) => {
		let t = e.target;
		t instanceof HTMLElement && t.closest(`[${Qn}]`) && t.blur();
	}, !0), Object.defineProperty(HTMLElement.prototype, Qn, {
		configurable: !0,
		get() {
			return this.hasAttribute(Qn);
		},
		set(e) {
			e ? (this.setAttribute(Qn, ""), ar(this)) : (this.removeAttribute(Qn), or(this));
		}
	});
}, lr = [
	"startsWith",
	"endsWith",
	"includes"
], ur = () => {
	try {
		return !String.prototype.startsWith.call("[", "[") || !String.prototype.endsWith.call("]", "]") || !String.prototype.includes.call("[]", "[");
	} catch {
		return !0;
	}
}, dr = () => {
	try {
		let e = document.createElement("iframe");
		e.style.display = "none", e.setAttribute("aria-hidden", "true"), document.documentElement.appendChild(e);
		let t = e.contentWindow?.String.prototype ?? null;
		return e.remove(), t;
	} catch {
		return null;
	}
}, fr = !1, pr = () => {
	if (fr) return;
	fr = !0;
	let e = ur(), t = e ? dr() : null;
	if (!e || t) for (let e of lr) try {
		let n = t ? t[e] : String.prototype[e];
		if (typeof n != "function") continue;
		Object.defineProperty(String.prototype, e, {
			value: n,
			writable: !1,
			configurable: !1,
			enumerable: !1
		});
	} catch {}
}, mr = 1e4, hr = {
	development: {
		TRANSLATE_URL: "https://traducao2.vlibras.gov.br/translate",
		DICTIONARY_URL: "https://dicionario2-dth.vlibras.gov.br/2018.3.1/WEBGL/",
		DICTIONARY_STATIC_URL: "https://dicionario2-dth.vlibras.gov.br/static/BUNDLES/2018.3.1/WEBGL/",
		DICTIONARY_CATEGORIES_URL: "https://repositorio-dth.vlibras.gov.br/api",
		SIGNS_URL: "https://dicionario2-dth.vlibras.gov.br/signs?version=2018.3.1",
		REVIEW_URL: "https://traducao2-dth.vlibras.gov.br/review",
		BUNDLES_URL: "https://dicionario2-dth.vlibras.gov.br/bundles"
	},
	homolog: {
		TRANSLATE_URL: "https://traducao2-dth.vlibras.gov.br/translate",
		DICTIONARY_URL: "https://dicionario2-dth.vlibras.gov.br/2018.3.1/WEBGL/",
		DICTIONARY_STATIC_URL: "https://dicionario2-dth.vlibras.gov.br/static/BUNDLES/2018.3.1/WEBGL/",
		DICTIONARY_CATEGORIES_URL: "https://repositorio-dth.vlibras.gov.br/api",
		SIGNS_URL: "https://dicionario2-dth.vlibras.gov.br/signs?version=2018.3.1",
		REVIEW_URL: "https://traducao2-dth.vlibras.gov.br/review",
		BUNDLES_URL: "https://dicionario2-dth.vlibras.gov.br/bundles"
	},
	production: {
		TRANSLATE_URL: "https://traducao2.vlibras.gov.br/translate",
		DICTIONARY_URL: "https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/",
		DICTIONARY_STATIC_URL: "https://dicionario2.vlibras.gov.br/static/BUNDLES/2018.3.1/WEBGL/",
		DICTIONARY_CATEGORIES_URL: "https://repositorio.vlibras.gov.br/api",
		SIGNS_URL: "https://dicionario2.vlibras.gov.br/static/TREES/2018.3.1.json",
		REVIEW_URL: "https://traducao2.vlibras.gov.br/review",
		BUNDLES_URL: "https://dicionario2.vlibras.gov.br/bundles"
	}
}, gr = "production", _r = {
	BASE_URL: "/",
	DEV: !1,
	MODE: "production",
	PROD: !0,
	SSR: !1,
	...hr[gr] || hr.development,
	REQUEST_TIMEOUT: mr,
	MODE: gr
}, vr = {
	TRANSLATION_ERROR: "Não foi possível traduzir o texto.",
	TRANSLATION_EMPTY_ERROR: "Nenhum dado recebido do servidor.",
	TRANSLATION_TIMEOUT_ERROR: "A tradução demorou muito e foi cancelada.",
	TRANSLATION_SUPERSEDED_ERROR: "Tradução cancelada por uma solicitação mais recente.",
	SEND_REVIEW_ERROR: "Não foi possível enviar seu feedback.",
	SEND_REVIEW_TIMEOUT_ERROR: "O envio do feedback demorou muito e foi cancelado.",
	SIGNS_ERROR: "Erro ao buscar os sinais.",
	SIGNS_EMPTY_ERROR: "Nenhum dado recebido do servidor.",
	SIGNS_TIMEOUT_ERROR: "A busca dos sinais demorou muito e foi cancelada.",
	UNKNOWN_ERROR: "Erro desconhecido."
};
Object.keys(vr);
// src/core/actions/index.ts
var yr = () => {
	let e = new AbortController();
	return {
		controller: e,
		timeoutId: setTimeout(() => e.abort(), _r.REQUEST_TIMEOUT)
	};
}, br = 0, xr = null, Sr = async (e) => {
	xr?.();
	let t = ++br, { controller: n, timeoutId: r } = yr();
	xr = () => n.abort();
	try {
		let r = await fetch(_r.TRANSLATE_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: e }),
			signal: n.signal
		});
		if (!r.ok) throw Error(`Erro na API: ${r.status}`);
		let i = await r.text();
		try {
			let e = JSON.parse(i);
			e.traducao && (i = e.traducao);
		} catch {}
		return t === br ? {
			data: i,
			success: !0
		} : {
			success: !1,
			error: vr.TRANSLATION_SUPERSEDED_ERROR,
			code: "TRANSLATION_SUPERSEDED_ERROR"
		};
	} catch (e) {
		let n = e;
		return n.name === "AbortError" && t !== br ? {
			success: !1,
			error: vr.TRANSLATION_SUPERSEDED_ERROR,
			code: "TRANSLATION_SUPERSEDED_ERROR"
		} : (_r.DEV && console.error("Falha na tradução: ", e), n.name === "AbortError" ? {
			success: !1,
			error: vr.TRANSLATION_TIMEOUT_ERROR,
			code: "TRANSLATION_TIMEOUT_ERROR"
		} : {
			success: !1,
			error: vr.TRANSLATION_ERROR,
			code: "TRANSLATION_ERROR"
		});
	} finally {
		clearTimeout(r);
	}
}, Cr = async () => {
	let { controller: e, timeoutId: t } = yr();
	try {
		let t = await fetch(_r.SIGNS_URL, {
			method: "GET",
			signal: e.signal
		});
		if (!t.ok) throw Error(`Erro na API: ${t.status}`);
		return {
			data: await t.json(),
			success: !0
		};
	} catch (e) {
		return _r.DEV && console.error("Falha na tradução: ", e), e.name === "AbortError" ? {
			success: !1,
			error: vr.SIGNS_TIMEOUT_ERROR,
			code: "SIGNS_TIMEOUT_ERROR"
		} : {
			success: !1,
			error: vr.SIGNS_ERROR,
			code: "SIGNS_ERROR"
		};
	} finally {
		clearTimeout(t);
	}
}, wr = async (e) => {
	let { controller: t, timeoutId: n } = yr();
	try {
		let n = await fetch(_r.REVIEW_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e),
			signal: t.signal
		});
		if (!n.ok) throw Error(`Erro na API: ${n.status}`);
		return { success: !0 };
	} catch (e) {
		return _r.DEV && console.error("Falha no envio do feedback: ", e), e.name === "AbortError" ? {
			success: !1,
			error: vr.SEND_REVIEW_TIMEOUT_ERROR,
			code: "SEND_REVIEW_TIMEOUT_ERROR"
		} : {
			success: !1,
			error: vr.SEND_REVIEW_ERROR,
			code: "SEND_REVIEW_ERROR"
		};
	} finally {
		clearTimeout(n);
	}
}, Tr = () => yn({
	queryKey: ["dictionary_signs"],
	queryFn: async () => {
		let e = await Cr();
		if (e.error) throw Error(e.error);
		if (!e.data) throw Error(vr.SIGNS_EMPTY_ERROR);
		return e.data;
	}
}), Er = () => mn({ mutationFn: async (e) => {
	let t = await wr(e);
	if (t.error) throw Error(t.error);
	return !0;
} }), Dr = (e) => mn({
	...e,
	mutationFn: async (e) => {
		let t = await Sr(e);
		if (t.code !== "TRANSLATION_SUPERSEDED_ERROR") return t.error && console.error(t.error), t.data || console.error(vr.TRANSLATION_EMPTY_ERROR), t.data;
	}
});
// node_modules/.pnpm/zustand@5.0.11_react@19.1.0/node_modules/zustand/esm/middleware.mjs
function Or(e, t) {
	let n;
	try {
		n = e();
	} catch {
		return;
	}
	return {
		getItem: (e) => {
			let r = (e) => e === null ? null : JSON.parse(e, t?.reviver), i = n.getItem(e) ?? null;
			return i instanceof Promise ? i.then(r) : r(i);
		},
		setItem: (e, r) => n.setItem(e, JSON.stringify(r, t?.replacer)),
		removeItem: (e) => n.removeItem(e)
	};
}
var kr = (e) => (t) => {
	try {
		let n = e(t);
		return n instanceof Promise ? n : {
			then(e) {
				return kr(e)(n);
			},
			catch(e) {
				return this;
			}
		};
	} catch (e) {
		return {
			then(e) {
				return this;
			},
			catch(t) {
				return kr(t)(e);
			}
		};
	}
}, Ar = (e, t) => (n, r, i) => {
	let a = {
		storage: Or(() => window.localStorage),
		partialize: (e) => e,
		version: 0,
		merge: (e, t) => ({
			...t,
			...e
		}),
		...t
	}, o = !1, s = 0, c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), u = a.storage;
	if (!u) return e((...e) => {
		console.warn(`[zustand persist middleware] Unable to update item '${a.name}', the given storage is currently unavailable.`), n(...e);
	}, r, i);
	let d = () => {
		let e = a.partialize({ ...r() });
		return u.setItem(a.name, {
			state: e,
			version: a.version
		});
	}, f = i.setState;
	i.setState = (e, t) => (f(e, t), d());
	let p = e((...e) => (n(...e), d()), r, i);
	i.getInitialState = () => p;
	let m, h = () => {
		if (!u) return;
		let e = ++s;
		o = !1, c.forEach((e) => e(r() ?? p));
		let t = a.onRehydrateStorage?.call(a, r() ?? p) || void 0;
		return kr(u.getItem.bind(u))(a.name).then((e) => {
			if (e) {
				if (typeof e.version == "number" && e.version !== a.version) {
					if (a.migrate) {
						let t = a.migrate(e.state, e.version);
						return t instanceof Promise ? t.then((e) => [!0, e]) : [!0, t];
					}
					console.error("State loaded from storage couldn't be migrated since no migrate function was provided");
				} else return [!1, e.state];
			}
			return [!1, void 0];
		}).then((t) => {
			if (e !== s) return;
			let [i, o] = t;
			if (m = a.merge(o, r() ?? p), n(m, !0), i) return d();
		}).then(() => {
			e === s && (t?.(m, void 0), m = r(), o = !0, l.forEach((e) => e(m)));
		}).catch((n) => {
			e === s && t?.(void 0, n);
		});
	};
	return i.persist = {
		setOptions: (e) => {
			a = {
				...a,
				...e
			}, e.storage && (u = e.storage);
		},
		clearStorage: () => {
			u?.removeItem(a.name);
		},
		getOptions: () => a,
		rehydrate: () => h(),
		hasHydrated: () => o,
		onHydrate: (e) => (c.add(e), () => {
			c.delete(e);
		}),
		onFinishHydration: (e) => (l.add(e), () => {
			l.delete(e);
		})
	}, a.skipHydration || h(), m || p;
}, jr = "images/camara-deputados.webp", Mr = "images/lavid.webp", Nr = "images/ministerioDireitosHumanos.webp", Pr = "images/ministerioGestao.webp", Fr = "images/rnp.webp", R = {
	MT: "images/flags/MT.webp",
	AC: "images/flags/AC.webp",
	AL: "images/flags/AL.webp",
	AM: "images/flags/AM.webp",
	AP: "images/flags/AP.webp",
	BA: "images/flags/BA.webp",
	BR: "images/flags/BR.webp",
	CE: "images/flags/CE.webp",
	DF: "images/flags/DF.webp",
	ES: "images/flags/ES.webp",
	GO: "images/flags/GO.webp",
	MA: "images/flags/MA.webp",
	MG: "images/flags/MG.webp",
	MS: "images/flags/MS.webp",
	PA: "images/flags/PA.webp",
	PB: "images/flags/PB.webp",
	PE: "images/flags/PE.webp",
	PI: "images/flags/PI.webp",
	PR: "images/flags/PR.webp",
	RJ: "images/flags/RJ.webp",
	RN: "images/flags/RN.webp",
	RO: "images/flags/RO.webp",
	RR: "images/flags/RR.webp",
	RS: "images/flags/RS.webp",
	SC: "images/flags/SC.webp",
	SE: "images/flags/SE.webp",
	SP: "images/flags/SP.webp",
	TO: "images/flags/TO.webp"
}, Ir = [
	{
		name: "BR - Padrão Nacional",
		flag: R.BR,
		abbreviation: "BR"
	},
	{
		name: "Acre",
		flag: R.AC,
		abbreviation: "AC"
	},
	{
		name: "Alagoas",
		flag: R.AL,
		abbreviation: "AL"
	},
	{
		name: "Amapá",
		flag: R.AP,
		abbreviation: "AP"
	},
	{
		name: "Amazonas",
		flag: R.AM,
		abbreviation: "AM"
	},
	{
		name: "Bahia",
		flag: R.BA,
		abbreviation: "BA"
	},
	{
		name: "Ceará",
		flag: R.CE,
		abbreviation: "CE"
	},
	{
		name: "Distrito Federal",
		flag: R.DF,
		abbreviation: "DF"
	},
	{
		name: "Espirito Santo",
		flag: R.ES,
		abbreviation: "ES"
	},
	{
		name: "Goiás",
		flag: R.GO,
		abbreviation: "GO"
	},
	{
		name: "Maranhão",
		flag: R.MA,
		abbreviation: "MA"
	},
	{
		name: "Mato Grosso",
		flag: R.MT,
		abbreviation: "MT"
	},
	{
		name: "Mato Grosso do Sul",
		flag: R.MS,
		abbreviation: "MS"
	},
	{
		name: "Minas Gerais",
		flag: R.MG,
		abbreviation: "MG"
	},
	{
		name: "Pará",
		flag: R.PA,
		abbreviation: "PA"
	},
	{
		name: "Paraíba",
		flag: R.PB,
		abbreviation: "PB"
	},
	{
		name: "Paraná",
		flag: R.PR,
		abbreviation: "PR"
	},
	{
		name: "Pernambuco",
		flag: R.PE,
		abbreviation: "PE"
	},
	{
		name: "Piaui",
		flag: R.PI,
		abbreviation: "PI"
	},
	{
		name: "Rio de Janeiro",
		flag: R.RJ,
		abbreviation: "RJ"
	},
	{
		name: "Rio Grande do Norte",
		flag: R.RN,
		abbreviation: "RN"
	},
	{
		name: "Rio Grande do Sul",
		flag: R.RS,
		abbreviation: "RS"
	},
	{
		name: "Rondônia",
		flag: R.RO,
		abbreviation: "RO"
	},
	{
		name: "Roraima",
		flag: R.RR,
		abbreviation: "RR"
	},
	{
		name: "Santa Catarina",
		flag: R.SC,
		abbreviation: "SC"
	},
	{
		name: "São Paulo",
		flag: R.SP,
		abbreviation: "SP"
	},
	{
		name: "Sergipe",
		flag: R.SE,
		abbreviation: "SE"
	},
	{
		name: "Tocantins",
		flag: R.TO,
		abbreviation: "TO"
	}
], z = {
	PLAYER: "PlayerManager",
	EMOTION: "EmotionBridge",
	CUSTOMIZATION: "CustomizationBridge"
}, B = {
	PLAY_WELCOME: "playWellcome",
	PLAY: "playNow",
	STOP: "stopAll",
	REPEAT: "repeat",
	SET_SPEED: "setSlider",
	SET_AVATAR: "Change",
	SET_PAUSE_STATE: "setPauseState",
	SET_BASE_URL: "setBaseUrl",
	SET_PERSONALIZATION: "setURL",
	SET_SUBTITLES_STATE: "setSubtitlesState",
	SET_SUBTITLE_COLOR: "SetSubtitleColor",
	SET_SUBTITLE_OUTLINE_COLOR: "SetSubtitleOutlineColor",
	SET_SUBTITLE_SHADOW_COLOR: "SetSubtitleShadowColor",
	APPLY_DEFAULT_EMOTION: "ApplyDefaultEmotion",
	APPLY_HAPPY_EMOTION: "ApplyHappyEmotion",
	APPLY_SAD_EMOTION: "ApplySadEmotion",
	APPLY_ANGRY_EMOTION: "ApplyAngryEmotion",
	APPLY_DISGUST_EMOTION: "ApplyDisgustEmotion",
	APPLY_FEAR_EMOTION: "ApplyFearEmotion",
	APPLY_SURPRISE_EMOTION: "ApplySurpriseEmotion",
	APPLY_UPSET_EMOTION: "ApplyUpsetEmotion"
}, Lr = {
	ON_LOAD_PLAYER: "on_load_player",
	ON_PLAYING_STATE_CHANGE: "on_playing_state_change",
	COUNTER_GLOSS: "counter_gloss",
	UPDATE_PROGRESS: "update_progress",
	GET_AVATAR: "get_avatar",
	FINISH_WELCOME: "finish_welcome"
}, Rr = [
	"default",
	"happy",
	"sad",
	"angry",
	"disgust",
	"fear",
	"surprise",
	"upset"
], zr = {
	default: {
		name: "Padrão",
		action: B.APPLY_DEFAULT_EMOTION,
		icon: "emotions/default",
		intensity: 2
	},
	happy: {
		name: "Feliz",
		action: B.APPLY_HAPPY_EMOTION,
		icon: "emotions/happy",
		intensity: 2
	},
	sad: {
		name: "Triste",
		action: B.APPLY_SAD_EMOTION,
		icon: "emotions/sad",
		intensity: 2
	},
	angry: {
		name: "Raiva",
		action: B.APPLY_ANGRY_EMOTION,
		icon: "emotions/angry",
		intensity: 2
	},
	disgust: {
		name: "Nojo",
		action: B.APPLY_DISGUST_EMOTION,
		icon: "emotions/disgust",
		intensity: 2
	},
	fear: {
		name: "Medo",
		action: B.APPLY_FEAR_EMOTION,
		icon: "emotions/fear",
		intensity: 2
	},
	surprise: {
		name: "Surpresa",
		action: B.APPLY_SURPRISE_EMOTION,
		icon: "emotions/surprise",
		intensity: 2
	},
	upset: {
		name: "Chateado",
		action: B.APPLY_UPSET_EMOTION,
		icon: "emotions/upset",
		intensity: 2
	}
}, Br = {
	countGloss: {
		count: 0,
		max: 0
	},
	config: {
		baseUrl: "",
		personalizationUrl: ""
	},
	avatar: "icaro",
	status: "idle",
	speed: 1,
	progress: 0,
	gloss: void 0,
	instance: void 0,
	isBroken: !1,
	showSubtitles: !0,
	isPlayingWelcome: !0,
	isWelcomeFinished: !1,
	isLoaded: !1,
	isMounted: !0,
	region: Ir[0],
	emotion: zr.default
}, V = on()(Ar((e) => ({
	...Br,
	send: () => {},
	retryLoad: () => {},
	reset: () => e((e) => ({
		...Br,
		avatar: e.avatar
	}))
}), {
	name: "@vlibras/player",
	version: 1,
	partialize: (e) => Dn(e, "speed", "showSubtitles", "avatar", "config")
})), H = {
	get: V.getState,
	set: V.setState,
	subscribe: V.subscribe
}, Vr = (e, t) => e instanceof Function ? e(t) : e, Hr = {
	position: "right",
	text: void 0,
	isOpen: !1,
	isExpanded: !1,
	isLoaded: !1,
	isTranslating: !1,
	isPausedByUser: void 0,
	opacity: 1
}, U = on()(Ar((e) => ({
	...Hr,
	setLoaded: (t) => e({ isLoaded: t }),
	setExpanded: (t) => e((e) => ({ isExpanded: Vr(t, e.isExpanded) })),
	setOpen: (t) => e((e) => ({ isOpen: Vr(t, e.isOpen) })),
	reset: () => e(Hr)
}), {
	name: "@vlibras-widget",
	partialize: (e) => Dn(e, "isOpen", "opacity"),
	version: 1
}));
U.subscribe((e) => {
	let { instance: t } = H.get();
	t && (e.isOpen ? t.Module.resumeMainLoop() : t.Module.pauseMainLoop());
});
var W = {
	get: U.getState,
	set: U.setState,
	subscribe: U.subscribe
}, Ur = (e = !0) => Dr({
	onMutate: (t) => {
		W.set({
			text: t,
			isTranslating: e
		});
	},
	onSettled: (e) => {
		H.set({
			gloss: e,
			isGlossTranslated: !!e
		}), W.set({ isTranslating: !1 });
	}
});
// node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function Wr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Wr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Gr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Wr(e)) && (r && (r += " "), r += t);
	return r;
}
// node_modules/.pnpm/tailwind-merge@3.4.0/node_modules/tailwind-merge/dist/bundle-mjs.mjs
var Kr = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, qr = (e, t) => ({
	classGroupId: e,
	validator: t
}), Jr = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Yr = "-", Xr = [], Zr = "arbitrary..", Qr = (e) => {
	let t = ti(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return ei(e);
			let n = e.split(Yr);
			return $r(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? Kr(i, t) : t : i || Xr;
			}
			return n[e] || Xr;
		}
	};
}, $r = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = $r(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Yr) : e.slice(t).join(Yr), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, ei = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Zr + r : void 0;
})(), ti = (e) => {
	let { theme: t, classGroups: n } = e;
	return ni(n, t);
}, ni = (e, t) => {
	let n = Jr();
	for (let r in e) {
		let i = e[r];
		ri(i, n, r, t);
	}
	return n;
}, ri = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		ii(i, t, n, r);
	}
}, ii = (e, t, n, r) => {
	typeof e == "string" ? ai(e, t, n) : typeof e == "function" ? oi(e, t, n, r) : si(e, t, n, r);
}, ai = (e, t, n) => {
	let r = e === "" ? t : ci(t, e);
	r.classGroupId = n;
}, oi = (e, t, n, r) => {
	li(e) ? ri(e(r), t, n, r) : (t.validators === null && (t.validators = []), t.validators.push(qr(n, e)));
}, si = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		ri(o, ci(t, a), n, r);
	}
}, ci = (e, t) => {
	let n = e, r = t.split(Yr), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = Jr(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, li = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, ui = (e) => {
	if (e < 1) return {
		get: () => void 0,
		set: () => {}
	};
	let t = 0, n = Object.create(null), r = Object.create(null), i = (i, a) => {
		n[i] = a, t++, t > e && (t = 0, r = n, n = Object.create(null));
	};
	return {
		get(e) {
			let t = n[e];
			if (t !== void 0) return t;
			if ((t = r[e]) !== void 0) return i(e, t), t;
		},
		set(e, t) {
			e in n ? n[e] = t : i(e, t);
		}
	};
}, di = "!", fi = ":", pi = [], mi = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), hi = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === fi) {
					t.push(e.slice(i, s)), i = s + 1;
					continue;
				}
				if (o === "/") {
					a = s;
					continue;
				}
			}
			o === "[" ? n++ : o === "]" ? n-- : o === "(" ? r++ : o === ")" && r--;
		}
		let s = t.length === 0 ? e : e.slice(i), c = s, l = !1;
		s.endsWith(di) ? (c = s.slice(0, -1), l = !0) : s.startsWith(di) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return mi(t, l, c, u);
	};
	if (t) {
		let e = t + fi, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : mi(pi, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, gi = (e) => {
	let t = /* @__PURE__ */ new Map();
	return e.orderSensitiveModifiers.forEach((e, n) => {
		t.set(e, 1e6 + n);
	}), (e) => {
		let n = [], r = [];
		for (let i = 0; i < e.length; i++) {
			let a = e[i], o = a[0] === "[", s = t.has(a);
			o || s ? (r.length > 0 && (r.sort(), n.push(...r), r = []), n.push(a)) : r.push(a);
		}
		return r.length > 0 && (r.sort(), n.push(...r)), n;
	};
}, _i = (e) => ({
	cache: ui(e.cacheSize),
	parseClassName: hi(e),
	sortModifiers: gi(e),
	...Qr(e)
}), vi = /\s+/, yi = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a } = t, o = [], s = e.trim().split(vi), c = "";
	for (let e = s.length - 1; e >= 0; --e) {
		let t = s[e], { isExternal: l, modifiers: u, hasImportantModifier: d, baseClassName: f, maybePostfixModifierPosition: p } = n(t);
		if (l) {
			c = t + (c.length > 0 ? " " + c : c);
			continue;
		}
		let m = !!p, h = r(m ? f.substring(0, p) : f);
		if (!h) {
			if (!m || (h = r(f), !h)) {
				c = t + (c.length > 0 ? " " + c : c);
				continue;
			}
			m = !1;
		}
		let g = u.length === 0 ? "" : u.length === 1 ? u[0] : a(u).join(":"), _ = d ? g + di : g, v = _ + h;
		if (o.indexOf(v) > -1) continue;
		o.push(v);
		let y = i(h, m);
		for (let e = 0; e < y.length; ++e) {
			let t = y[e];
			o.push(_ + t);
		}
		c = t + (c.length > 0 ? " " + c : c);
	}
	return c;
}, bi = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = xi(n)) && (i && (i += " "), i += r);
	return i;
}, xi = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = xi(e[r])) && (n && (n += " "), n += t);
	return n;
}, Si = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = _i(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = yi(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(bi(...e));
}, Ci = [], G = (e) => {
	let t = (t) => t[e] || Ci;
	return t.isThemeGetter = !0, t;
}, wi = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Ti = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Ei = /^\d+\/\d+$/, Di = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Oi = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, ki = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, Ai = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, ji = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Mi = (e) => Ei.test(e), K = (e) => !!e && !Number.isNaN(Number(e)), Ni = (e) => !!e && Number.isInteger(Number(e)), Pi = (e) => e.endsWith("%") && K(e.slice(0, -1)), Fi = (e) => Di.test(e), Ii = () => !0, Li = (e) => Oi.test(e) && !ki.test(e), Ri = () => !1, zi = (e) => Ai.test(e), Bi = (e) => ji.test(e), Vi = (e) => !q(e) && !J(e), Hi = (e) => ea(e, ia, Ri), q = (e) => wi.test(e), Ui = (e) => ea(e, aa, Li), Wi = (e) => ea(e, oa, K), Gi = (e) => ea(e, na, Ri), Ki = (e) => ea(e, ra, Bi), qi = (e) => ea(e, ca, zi), J = (e) => Ti.test(e), Ji = (e) => ta(e, aa), Yi = (e) => ta(e, sa), Xi = (e) => ta(e, na), Zi = (e) => ta(e, ia), Qi = (e) => ta(e, ra), $i = (e) => ta(e, ca, !0), ea = (e, t, n) => {
	let r = wi.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, ta = (e, t, n = !1) => {
	let r = Ti.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, na = (e) => e === "position" || e === "percentage", ra = (e) => e === "image" || e === "url", ia = (e) => e === "length" || e === "size" || e === "bg-size", aa = (e) => e === "length", oa = (e) => e === "number", sa = (e) => e === "family-name", ca = (e) => e === "shadow", la = /*#__PURE__*/ Si(() => {
	let e = G("color"), t = G("font"), n = G("text"), r = G("font-weight"), i = G("tracking"), a = G("leading"), o = G("breakpoint"), s = G("container"), c = G("spacing"), l = G("radius"), u = G("shadow"), d = G("inset-shadow"), f = G("text-shadow"), p = G("drop-shadow"), m = G("blur"), h = G("perspective"), g = G("aspect"), _ = G("ease"), v = G("animate"), y = () => [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	], b = () => [
		"center",
		"top",
		"bottom",
		"left",
		"right",
		"top-left",
		"left-top",
		"top-right",
		"right-top",
		"bottom-right",
		"right-bottom",
		"bottom-left",
		"left-bottom"
	], x = () => [
		...b(),
		J,
		q
	], S = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	], ee = () => [
		"auto",
		"contain",
		"none"
	], C = () => [
		J,
		q,
		c
	], w = () => [
		Mi,
		"full",
		"auto",
		...C()
	], te = () => [
		Ni,
		"none",
		"subgrid",
		J,
		q
	], ne = () => [
		"auto",
		{ span: [
			"full",
			Ni,
			J,
			q
		] },
		Ni,
		J,
		q
	], T = () => [
		Ni,
		"auto",
		J,
		q
	], re = () => [
		"auto",
		"min",
		"max",
		"fr",
		J,
		q
	], E = () => [
		"start",
		"end",
		"center",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline",
		"center-safe",
		"end-safe"
	], D = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], O = () => ["auto", ...C()], ie = () => [
		Mi,
		"auto",
		"full",
		"dvw",
		"dvh",
		"lvw",
		"lvh",
		"svw",
		"svh",
		"min",
		"max",
		"fit",
		...C()
	], k = () => [
		e,
		J,
		q
	], ae = () => [
		...b(),
		Xi,
		Gi,
		{ position: [J, q] }
	], oe = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], se = () => [
		"auto",
		"cover",
		"contain",
		Zi,
		Hi,
		{ size: [J, q] }
	], ce = () => [
		Pi,
		Ji,
		Ui
	], A = () => [
		"",
		"none",
		"full",
		l,
		J,
		q
	], j = () => [
		"",
		K,
		Ji,
		Ui
	], le = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], ue = () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	], M = () => [
		K,
		Pi,
		Xi,
		Gi
	], de = () => [
		"",
		"none",
		m,
		J,
		q
	], fe = () => [
		"none",
		K,
		J,
		q
	], pe = () => [
		"none",
		K,
		J,
		q
	], me = () => [
		K,
		J,
		q
	], he = () => [
		Mi,
		"full",
		...C()
	];
	return {
		cacheSize: 500,
		theme: {
			animate: [
				"spin",
				"ping",
				"pulse",
				"bounce"
			],
			aspect: ["video"],
			blur: [Fi],
			breakpoint: [Fi],
			color: [Ii],
			container: [Fi],
			"drop-shadow": [Fi],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [Vi],
			"font-weight": [
				"thin",
				"extralight",
				"light",
				"normal",
				"medium",
				"semibold",
				"bold",
				"extrabold",
				"black"
			],
			"inset-shadow": [Fi],
			leading: [
				"none",
				"tight",
				"snug",
				"normal",
				"relaxed",
				"loose"
			],
			perspective: [
				"dramatic",
				"near",
				"normal",
				"midrange",
				"distant",
				"none"
			],
			radius: [Fi],
			shadow: [Fi],
			spacing: ["px", K],
			text: [Fi],
			"text-shadow": [Fi],
			tracking: [
				"tighter",
				"tight",
				"normal",
				"wide",
				"wider",
				"widest"
			]
		},
		classGroups: {
			aspect: [{ aspect: [
				"auto",
				"square",
				Mi,
				q,
				J,
				g
			] }],
			container: ["container"],
			columns: [{ columns: [
				K,
				q,
				J,
				s
			] }],
			"break-after": [{ "break-after": y() }],
			"break-before": [{ "break-before": y() }],
			"break-inside": [{ "break-inside": [
				"auto",
				"avoid",
				"avoid-page",
				"avoid-column"
			] }],
			"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
			box: [{ box: ["border", "content"] }],
			display: [
				"block",
				"inline-block",
				"inline",
				"flex",
				"inline-flex",
				"table",
				"inline-table",
				"table-caption",
				"table-cell",
				"table-column",
				"table-column-group",
				"table-footer-group",
				"table-header-group",
				"table-row-group",
				"table-row",
				"flow-root",
				"grid",
				"inline-grid",
				"contents",
				"list-item",
				"hidden"
			],
			sr: ["sr-only", "not-sr-only"],
			float: [{ float: [
				"right",
				"left",
				"none",
				"start",
				"end"
			] }],
			clear: [{ clear: [
				"left",
				"right",
				"both",
				"none",
				"start",
				"end"
			] }],
			isolation: ["isolate", "isolation-auto"],
			"object-fit": [{ object: [
				"contain",
				"cover",
				"fill",
				"none",
				"scale-down"
			] }],
			"object-position": [{ object: x() }],
			overflow: [{ overflow: S() }],
			"overflow-x": [{ "overflow-x": S() }],
			"overflow-y": [{ "overflow-y": S() }],
			overscroll: [{ overscroll: ee() }],
			"overscroll-x": [{ "overscroll-x": ee() }],
			"overscroll-y": [{ "overscroll-y": ee() }],
			position: [
				"static",
				"fixed",
				"absolute",
				"relative",
				"sticky"
			],
			inset: [{ inset: w() }],
			"inset-x": [{ "inset-x": w() }],
			"inset-y": [{ "inset-y": w() }],
			start: [{ start: w() }],
			end: [{ end: w() }],
			top: [{ top: w() }],
			right: [{ right: w() }],
			bottom: [{ bottom: w() }],
			left: [{ left: w() }],
			visibility: [
				"visible",
				"invisible",
				"collapse"
			],
			z: [{ z: [
				Ni,
				"auto",
				J,
				q
			] }],
			basis: [{ basis: [
				Mi,
				"full",
				"auto",
				s,
				...C()
			] }],
			"flex-direction": [{ flex: [
				"row",
				"row-reverse",
				"col",
				"col-reverse"
			] }],
			"flex-wrap": [{ flex: [
				"nowrap",
				"wrap",
				"wrap-reverse"
			] }],
			flex: [{ flex: [
				K,
				Mi,
				"auto",
				"initial",
				"none",
				q
			] }],
			grow: [{ grow: [
				"",
				K,
				J,
				q
			] }],
			shrink: [{ shrink: [
				"",
				K,
				J,
				q
			] }],
			order: [{ order: [
				Ni,
				"first",
				"last",
				"none",
				J,
				q
			] }],
			"grid-cols": [{ "grid-cols": te() }],
			"col-start-end": [{ col: ne() }],
			"col-start": [{ "col-start": T() }],
			"col-end": [{ "col-end": T() }],
			"grid-rows": [{ "grid-rows": te() }],
			"row-start-end": [{ row: ne() }],
			"row-start": [{ "row-start": T() }],
			"row-end": [{ "row-end": T() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": re() }],
			"auto-rows": [{ "auto-rows": re() }],
			gap: [{ gap: C() }],
			"gap-x": [{ "gap-x": C() }],
			"gap-y": [{ "gap-y": C() }],
			"justify-content": [{ justify: [...E(), "normal"] }],
			"justify-items": [{ "justify-items": [...D(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...D()] }],
			"align-content": [{ content: ["normal", ...E()] }],
			"align-items": [{ items: [...D(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...D(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": E() }],
			"place-items": [{ "place-items": [...D(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...D()] }],
			p: [{ p: C() }],
			px: [{ px: C() }],
			py: [{ py: C() }],
			ps: [{ ps: C() }],
			pe: [{ pe: C() }],
			pt: [{ pt: C() }],
			pr: [{ pr: C() }],
			pb: [{ pb: C() }],
			pl: [{ pl: C() }],
			m: [{ m: O() }],
			mx: [{ mx: O() }],
			my: [{ my: O() }],
			ms: [{ ms: O() }],
			me: [{ me: O() }],
			mt: [{ mt: O() }],
			mr: [{ mr: O() }],
			mb: [{ mb: O() }],
			ml: [{ ml: O() }],
			"space-x": [{ "space-x": C() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": C() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: ie() }],
			w: [{ w: [
				s,
				"screen",
				...ie()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...ie()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...ie()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...ie()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...ie()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...ie()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				Ji,
				Ui
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				J,
				Wi
			] }],
			"font-stretch": [{ "font-stretch": [
				"ultra-condensed",
				"extra-condensed",
				"condensed",
				"semi-condensed",
				"normal",
				"semi-expanded",
				"expanded",
				"extra-expanded",
				"ultra-expanded",
				Pi,
				q
			] }],
			"font-family": [{ font: [
				Yi,
				q,
				t
			] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				J,
				q
			] }],
			"line-clamp": [{ "line-clamp": [
				K,
				"none",
				J,
				Wi
			] }],
			leading: [{ leading: [a, ...C()] }],
			"list-image": [{ "list-image": [
				"none",
				J,
				q
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				J,
				q
			] }],
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			"placeholder-color": [{ placeholder: k() }],
			"text-color": [{ text: k() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...le(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				K,
				"from-font",
				"auto",
				J,
				Ui
			] }],
			"text-decoration-color": [{ decoration: k() }],
			"underline-offset": [{ "underline-offset": [
				K,
				"auto",
				J,
				q
			] }],
			"text-transform": [
				"uppercase",
				"lowercase",
				"capitalize",
				"normal-case"
			],
			"text-overflow": [
				"truncate",
				"text-ellipsis",
				"text-clip"
			],
			"text-wrap": [{ text: [
				"wrap",
				"nowrap",
				"balance",
				"pretty"
			] }],
			indent: [{ indent: C() }],
			"vertical-align": [{ align: [
				"baseline",
				"top",
				"middle",
				"bottom",
				"text-top",
				"text-bottom",
				"sub",
				"super",
				J,
				q
			] }],
			whitespace: [{ whitespace: [
				"normal",
				"nowrap",
				"pre",
				"pre-line",
				"pre-wrap",
				"break-spaces"
			] }],
			break: [{ break: [
				"normal",
				"words",
				"all",
				"keep"
			] }],
			wrap: [{ wrap: [
				"break-word",
				"anywhere",
				"normal"
			] }],
			hyphens: [{ hyphens: [
				"none",
				"manual",
				"auto"
			] }],
			content: [{ content: [
				"none",
				J,
				q
			] }],
			"bg-attachment": [{ bg: [
				"fixed",
				"local",
				"scroll"
			] }],
			"bg-clip": [{ "bg-clip": [
				"border",
				"padding",
				"content",
				"text"
			] }],
			"bg-origin": [{ "bg-origin": [
				"border",
				"padding",
				"content"
			] }],
			"bg-position": [{ bg: ae() }],
			"bg-repeat": [{ bg: oe() }],
			"bg-size": [{ bg: se() }],
			"bg-image": [{ bg: [
				"none",
				{
					linear: [
						{ to: [
							"t",
							"tr",
							"r",
							"br",
							"b",
							"bl",
							"l",
							"tl"
						] },
						Ni,
						J,
						q
					],
					radial: [
						"",
						J,
						q
					],
					conic: [
						Ni,
						J,
						q
					]
				},
				Qi,
				Ki
			] }],
			"bg-color": [{ bg: k() }],
			"gradient-from-pos": [{ from: ce() }],
			"gradient-via-pos": [{ via: ce() }],
			"gradient-to-pos": [{ to: ce() }],
			"gradient-from": [{ from: k() }],
			"gradient-via": [{ via: k() }],
			"gradient-to": [{ to: k() }],
			rounded: [{ rounded: A() }],
			"rounded-s": [{ "rounded-s": A() }],
			"rounded-e": [{ "rounded-e": A() }],
			"rounded-t": [{ "rounded-t": A() }],
			"rounded-r": [{ "rounded-r": A() }],
			"rounded-b": [{ "rounded-b": A() }],
			"rounded-l": [{ "rounded-l": A() }],
			"rounded-ss": [{ "rounded-ss": A() }],
			"rounded-se": [{ "rounded-se": A() }],
			"rounded-ee": [{ "rounded-ee": A() }],
			"rounded-es": [{ "rounded-es": A() }],
			"rounded-tl": [{ "rounded-tl": A() }],
			"rounded-tr": [{ "rounded-tr": A() }],
			"rounded-br": [{ "rounded-br": A() }],
			"rounded-bl": [{ "rounded-bl": A() }],
			"border-w": [{ border: j() }],
			"border-w-x": [{ "border-x": j() }],
			"border-w-y": [{ "border-y": j() }],
			"border-w-s": [{ "border-s": j() }],
			"border-w-e": [{ "border-e": j() }],
			"border-w-t": [{ "border-t": j() }],
			"border-w-r": [{ "border-r": j() }],
			"border-w-b": [{ "border-b": j() }],
			"border-w-l": [{ "border-l": j() }],
			"divide-x": [{ "divide-x": j() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": j() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...le(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...le(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: k() }],
			"border-color-x": [{ "border-x": k() }],
			"border-color-y": [{ "border-y": k() }],
			"border-color-s": [{ "border-s": k() }],
			"border-color-e": [{ "border-e": k() }],
			"border-color-t": [{ "border-t": k() }],
			"border-color-r": [{ "border-r": k() }],
			"border-color-b": [{ "border-b": k() }],
			"border-color-l": [{ "border-l": k() }],
			"divide-color": [{ divide: k() }],
			"outline-style": [{ outline: [
				...le(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				K,
				J,
				q
			] }],
			"outline-w": [{ outline: [
				"",
				K,
				Ji,
				Ui
			] }],
			"outline-color": [{ outline: k() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				$i,
				qi
			] }],
			"shadow-color": [{ shadow: k() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				$i,
				qi
			] }],
			"inset-shadow-color": [{ "inset-shadow": k() }],
			"ring-w": [{ ring: j() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: k() }],
			"ring-offset-w": [{ "ring-offset": [K, Ui] }],
			"ring-offset-color": [{ "ring-offset": k() }],
			"inset-ring-w": [{ "inset-ring": j() }],
			"inset-ring-color": [{ "inset-ring": k() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				$i,
				qi
			] }],
			"text-shadow-color": [{ "text-shadow": k() }],
			opacity: [{ opacity: [
				K,
				J,
				q
			] }],
			"mix-blend": [{ "mix-blend": [
				...ue(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": ue() }],
			"mask-clip": [{ "mask-clip": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }, "mask-no-clip"],
			"mask-composite": [{ mask: [
				"add",
				"subtract",
				"intersect",
				"exclude"
			] }],
			"mask-image-linear-pos": [{ "mask-linear": [K] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": M() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": M() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": k() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": k() }],
			"mask-image-t-from-pos": [{ "mask-t-from": M() }],
			"mask-image-t-to-pos": [{ "mask-t-to": M() }],
			"mask-image-t-from-color": [{ "mask-t-from": k() }],
			"mask-image-t-to-color": [{ "mask-t-to": k() }],
			"mask-image-r-from-pos": [{ "mask-r-from": M() }],
			"mask-image-r-to-pos": [{ "mask-r-to": M() }],
			"mask-image-r-from-color": [{ "mask-r-from": k() }],
			"mask-image-r-to-color": [{ "mask-r-to": k() }],
			"mask-image-b-from-pos": [{ "mask-b-from": M() }],
			"mask-image-b-to-pos": [{ "mask-b-to": M() }],
			"mask-image-b-from-color": [{ "mask-b-from": k() }],
			"mask-image-b-to-color": [{ "mask-b-to": k() }],
			"mask-image-l-from-pos": [{ "mask-l-from": M() }],
			"mask-image-l-to-pos": [{ "mask-l-to": M() }],
			"mask-image-l-from-color": [{ "mask-l-from": k() }],
			"mask-image-l-to-color": [{ "mask-l-to": k() }],
			"mask-image-x-from-pos": [{ "mask-x-from": M() }],
			"mask-image-x-to-pos": [{ "mask-x-to": M() }],
			"mask-image-x-from-color": [{ "mask-x-from": k() }],
			"mask-image-x-to-color": [{ "mask-x-to": k() }],
			"mask-image-y-from-pos": [{ "mask-y-from": M() }],
			"mask-image-y-to-pos": [{ "mask-y-to": M() }],
			"mask-image-y-from-color": [{ "mask-y-from": k() }],
			"mask-image-y-to-color": [{ "mask-y-to": k() }],
			"mask-image-radial": [{ "mask-radial": [J, q] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": M() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": M() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": k() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": k() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [K] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": M() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": M() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": k() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": k() }],
			"mask-mode": [{ mask: [
				"alpha",
				"luminance",
				"match"
			] }],
			"mask-origin": [{ "mask-origin": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }],
			"mask-position": [{ mask: ae() }],
			"mask-repeat": [{ mask: oe() }],
			"mask-size": [{ mask: se() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				J,
				q
			] }],
			filter: [{ filter: [
				"",
				"none",
				J,
				q
			] }],
			blur: [{ blur: de() }],
			brightness: [{ brightness: [
				K,
				J,
				q
			] }],
			contrast: [{ contrast: [
				K,
				J,
				q
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				$i,
				qi
			] }],
			"drop-shadow-color": [{ "drop-shadow": k() }],
			grayscale: [{ grayscale: [
				"",
				K,
				J,
				q
			] }],
			"hue-rotate": [{ "hue-rotate": [
				K,
				J,
				q
			] }],
			invert: [{ invert: [
				"",
				K,
				J,
				q
			] }],
			saturate: [{ saturate: [
				K,
				J,
				q
			] }],
			sepia: [{ sepia: [
				"",
				K,
				J,
				q
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				J,
				q
			] }],
			"backdrop-blur": [{ "backdrop-blur": de() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				K,
				J,
				q
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				K,
				J,
				q
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				K,
				J,
				q
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				K,
				J,
				q
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				K,
				J,
				q
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				K,
				J,
				q
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				K,
				J,
				q
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				K,
				J,
				q
			] }],
			"border-collapse": [{ border: ["collapse", "separate"] }],
			"border-spacing": [{ "border-spacing": C() }],
			"border-spacing-x": [{ "border-spacing-x": C() }],
			"border-spacing-y": [{ "border-spacing-y": C() }],
			"table-layout": [{ table: ["auto", "fixed"] }],
			caption: [{ caption: ["top", "bottom"] }],
			transition: [{ transition: [
				"",
				"all",
				"colors",
				"opacity",
				"shadow",
				"transform",
				"none",
				J,
				q
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				K,
				"initial",
				J,
				q
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				J,
				q
			] }],
			delay: [{ delay: [
				K,
				J,
				q
			] }],
			animate: [{ animate: [
				"none",
				v,
				J,
				q
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				J,
				q
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: fe() }],
			"rotate-x": [{ "rotate-x": fe() }],
			"rotate-y": [{ "rotate-y": fe() }],
			"rotate-z": [{ "rotate-z": fe() }],
			scale: [{ scale: pe() }],
			"scale-x": [{ "scale-x": pe() }],
			"scale-y": [{ "scale-y": pe() }],
			"scale-z": [{ "scale-z": pe() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: me() }],
			"skew-x": [{ "skew-x": me() }],
			"skew-y": [{ "skew-y": me() }],
			transform: [{ transform: [
				J,
				q,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: he() }],
			"translate-x": [{ "translate-x": he() }],
			"translate-y": [{ "translate-y": he() }],
			"translate-z": [{ "translate-z": he() }],
			"translate-none": ["translate-none"],
			accent: [{ accent: k() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: k() }],
			"color-scheme": [{ scheme: [
				"normal",
				"dark",
				"light",
				"light-dark",
				"only-dark",
				"only-light"
			] }],
			cursor: [{ cursor: [
				"auto",
				"default",
				"pointer",
				"wait",
				"text",
				"move",
				"help",
				"not-allowed",
				"none",
				"context-menu",
				"progress",
				"cell",
				"crosshair",
				"vertical-text",
				"alias",
				"copy",
				"no-drop",
				"grab",
				"grabbing",
				"all-scroll",
				"col-resize",
				"row-resize",
				"n-resize",
				"e-resize",
				"s-resize",
				"w-resize",
				"ne-resize",
				"nw-resize",
				"se-resize",
				"sw-resize",
				"ew-resize",
				"ns-resize",
				"nesw-resize",
				"nwse-resize",
				"zoom-in",
				"zoom-out",
				J,
				q
			] }],
			"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
			"pointer-events": [{ "pointer-events": ["auto", "none"] }],
			resize: [{ resize: [
				"none",
				"",
				"y",
				"x"
			] }],
			"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
			"scroll-m": [{ "scroll-m": C() }],
			"scroll-mx": [{ "scroll-mx": C() }],
			"scroll-my": [{ "scroll-my": C() }],
			"scroll-ms": [{ "scroll-ms": C() }],
			"scroll-me": [{ "scroll-me": C() }],
			"scroll-mt": [{ "scroll-mt": C() }],
			"scroll-mr": [{ "scroll-mr": C() }],
			"scroll-mb": [{ "scroll-mb": C() }],
			"scroll-ml": [{ "scroll-ml": C() }],
			"scroll-p": [{ "scroll-p": C() }],
			"scroll-px": [{ "scroll-px": C() }],
			"scroll-py": [{ "scroll-py": C() }],
			"scroll-ps": [{ "scroll-ps": C() }],
			"scroll-pe": [{ "scroll-pe": C() }],
			"scroll-pt": [{ "scroll-pt": C() }],
			"scroll-pr": [{ "scroll-pr": C() }],
			"scroll-pb": [{ "scroll-pb": C() }],
			"scroll-pl": [{ "scroll-pl": C() }],
			"snap-align": [{ snap: [
				"start",
				"end",
				"center",
				"align-none"
			] }],
			"snap-stop": [{ snap: ["normal", "always"] }],
			"snap-type": [{ snap: [
				"none",
				"x",
				"y",
				"both"
			] }],
			"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
			touch: [{ touch: [
				"auto",
				"none",
				"manipulation"
			] }],
			"touch-x": [{ "touch-pan": [
				"x",
				"left",
				"right"
			] }],
			"touch-y": [{ "touch-pan": [
				"y",
				"up",
				"down"
			] }],
			"touch-pz": ["touch-pinch-zoom"],
			select: [{ select: [
				"none",
				"text",
				"all",
				"auto"
			] }],
			"will-change": [{ "will-change": [
				"auto",
				"scroll",
				"contents",
				"transform",
				J,
				q
			] }],
			fill: [{ fill: ["none", ...k()] }],
			"stroke-w": [{ stroke: [
				K,
				Ji,
				Ui,
				Wi
			] }],
			stroke: [{ stroke: ["none", ...k()] }],
			"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
		},
		conflictingClassGroups: {
			overflow: ["overflow-x", "overflow-y"],
			overscroll: ["overscroll-x", "overscroll-y"],
			inset: [
				"inset-x",
				"inset-y",
				"start",
				"end",
				"top",
				"right",
				"bottom",
				"left"
			],
			"inset-x": ["right", "left"],
			"inset-y": ["top", "bottom"],
			flex: [
				"basis",
				"grow",
				"shrink"
			],
			gap: ["gap-x", "gap-y"],
			p: [
				"px",
				"py",
				"ps",
				"pe",
				"pt",
				"pr",
				"pb",
				"pl"
			],
			px: ["pr", "pl"],
			py: ["pt", "pb"],
			m: [
				"mx",
				"my",
				"ms",
				"me",
				"mt",
				"mr",
				"mb",
				"ml"
			],
			mx: ["mr", "ml"],
			my: ["mt", "mb"],
			size: ["w", "h"],
			"font-size": ["leading"],
			"fvn-normal": [
				"fvn-ordinal",
				"fvn-slashed-zero",
				"fvn-figure",
				"fvn-spacing",
				"fvn-fraction"
			],
			"fvn-ordinal": ["fvn-normal"],
			"fvn-slashed-zero": ["fvn-normal"],
			"fvn-figure": ["fvn-normal"],
			"fvn-spacing": ["fvn-normal"],
			"fvn-fraction": ["fvn-normal"],
			"line-clamp": ["display", "overflow"],
			rounded: [
				"rounded-s",
				"rounded-e",
				"rounded-t",
				"rounded-r",
				"rounded-b",
				"rounded-l",
				"rounded-ss",
				"rounded-se",
				"rounded-ee",
				"rounded-es",
				"rounded-tl",
				"rounded-tr",
				"rounded-br",
				"rounded-bl"
			],
			"rounded-s": ["rounded-ss", "rounded-es"],
			"rounded-e": ["rounded-se", "rounded-ee"],
			"rounded-t": ["rounded-tl", "rounded-tr"],
			"rounded-r": ["rounded-tr", "rounded-br"],
			"rounded-b": ["rounded-br", "rounded-bl"],
			"rounded-l": ["rounded-tl", "rounded-bl"],
			"border-spacing": ["border-spacing-x", "border-spacing-y"],
			"border-w": [
				"border-w-x",
				"border-w-y",
				"border-w-s",
				"border-w-e",
				"border-w-t",
				"border-w-r",
				"border-w-b",
				"border-w-l"
			],
			"border-w-x": ["border-w-r", "border-w-l"],
			"border-w-y": ["border-w-t", "border-w-b"],
			"border-color": [
				"border-color-x",
				"border-color-y",
				"border-color-s",
				"border-color-e",
				"border-color-t",
				"border-color-r",
				"border-color-b",
				"border-color-l"
			],
			"border-color-x": ["border-color-r", "border-color-l"],
			"border-color-y": ["border-color-t", "border-color-b"],
			translate: [
				"translate-x",
				"translate-y",
				"translate-none"
			],
			"translate-none": [
				"translate",
				"translate-x",
				"translate-y",
				"translate-z"
			],
			"scroll-m": [
				"scroll-mx",
				"scroll-my",
				"scroll-ms",
				"scroll-me",
				"scroll-mt",
				"scroll-mr",
				"scroll-mb",
				"scroll-ml"
			],
			"scroll-mx": ["scroll-mr", "scroll-ml"],
			"scroll-my": ["scroll-mt", "scroll-mb"],
			"scroll-p": [
				"scroll-px",
				"scroll-py",
				"scroll-ps",
				"scroll-pe",
				"scroll-pt",
				"scroll-pr",
				"scroll-pb",
				"scroll-pl"
			],
			"scroll-px": ["scroll-pr", "scroll-pl"],
			"scroll-py": ["scroll-pt", "scroll-pb"],
			touch: [
				"touch-x",
				"touch-y",
				"touch-pz"
			],
			"touch-x": ["touch"],
			"touch-y": ["touch"],
			"touch-pz": ["touch"]
		},
		conflictingClassGroupModifiers: { "font-size": ["leading"] },
		orderSensitiveModifiers: [
			"*",
			"**",
			"after",
			"backdrop",
			"before",
			"details-content",
			"file",
			"first-letter",
			"first-line",
			"marker",
			"placeholder",
			"selection"
		]
	};
});
// src/common/lib/utils.ts
function Y(...e) {
	return la(Gr(e));
}
// src/player/constants/index.ts
var ua = [
	"icaro",
	"guga",
	"hosana"
], da = on(() => ({ isInitialized: !1 })), fa = {
	get: da.getState,
	set: da.setState,
	subscribe: da.subscribe
}, pa = /* @__PURE__ */ t({
	pause: () => xa,
	play: () => ga,
	playStatic: () => va,
	playWelcome: () => _a,
	repeat: () => ya,
	send: () => X,
	setConfig: () => ha,
	setEmotion: () => Ea,
	setRegion: () => Ta,
	setSpeed: () => Sa,
	setSubtitleColor: () => Da,
	stop: () => ba,
	toggleAvatar: () => Ca,
	toggleSubtitles: () => wa
}), ma = () => {
	H.set({
		isPlayingWelcome: !1,
		isWelcomeFinished: !0
	});
}, X = (e, t, n) => {
	H.get().send(e, t, n);
}, ha = (e) => {
	if (!e.baseUrl && !e.personalizationUrl) return;
	e.baseUrl && X(z.PLAYER, B.SET_BASE_URL, e.baseUrl), e.personalizationUrl && X(z.CUSTOMIZATION, B.SET_PERSONALIZATION, e.personalizationUrl);
	let { config: t } = H.get();
	H.set({ config: {
		...t,
		...e
	} });
}, ga = (e) => {
	if (!e) return X(z.PLAYER, B.SET_PAUSE_STATE, 0);
	X(z.PLAYER, B.PLAY, e), H.set({ gloss: e }), fa.get().onPlay?.(e), H.get().isWelcomeFinished || ma();
}, _a = () => {
	let { showSubtitles: e } = H.get();
	X(z.PLAYER, B.PLAY_WELCOME), X(z.PLAYER, B.SET_SUBTITLES_STATE, Number(e)), H.set({ isPlayingWelcome: !0 });
}, va = (e, t) => {
	let { region: n } = H.get(), r = t || `${_r.DICTIONARY_STATIC_URL}${n.abbreviation}/`, i = _r.DICTIONARY_URL;
	ha({ baseUrl: r }), e ? (X(z.PLAYER, B.PLAY, e), fa.get().onPlayStatic?.(e)) : X(z.PLAYER, B.SET_PAUSE_STATE, 0), ha({ baseUrl: i }), H.get().isWelcomeFinished || ma();
}, ya = () => {
	let { gloss: e } = H.get();
	e && ga(e), fa.get().onRepeat?.();
}, ba = () => {
	X(z.PLAYER, B.STOP), fa.get().onStop?.();
}, xa = () => {
	X(z.PLAYER, B.SET_PAUSE_STATE, 1), fa.get().onPause?.();
}, Sa = (e) => {
	typeof e == "number" && (X(z.PLAYER, B.SET_SPEED, e), H.set({ speed: e }));
}, Ca = (e) => {
	let t = H.get().avatar;
	if (e && !ua.includes(e)) {
		console.error(`Avatar "${e}" inválido!`);
		return;
	}
	let n = ua[(ua.indexOf(e || t) + +!e) % ua.length];
	X(z.PLAYER, B.SET_AVATAR, n), H.set({ avatar: n });
}, wa = (e) => {
	let { showSubtitles: t } = H.get(), n = e ?? !t;
	X(z.PLAYER, B.SET_SUBTITLES_STATE, Number(n)), H.set({ showSubtitles: n });
}, Ta = (e) => {
	ha({ baseUrl: `${_r.DICTIONARY_URL}${e.abbreviation}/` }), H.set({ region: e });
}, Ea = (e, t) => {
	if (!Rr.includes(e)) return console.error(`Emoção "${e}" inválida!`);
	let n = zr[e];
	H.set({ emotion: n }), X(z.EMOTION, n.action, t || n.intensity);
}, Da = ({ color: e, outline: t, shadow: n }) => {
	X(z.CUSTOMIZATION, B.SET_SUBTITLE_COLOR, e), X(z.CUSTOMIZATION, B.SET_SUBTITLE_OUTLINE_COLOR, t || e), X(z.CUSTOMIZATION, B.SET_SUBTITLE_SHADOW_COLOR, n || e);
}, Oa = 0;
Array.isArray;
function Z(e, t, r, i, a, o) {
	t ||= {};
	var s, c, l = t;
	if ("ref" in l && typeof e != "function") for (c in l = {}, t) c == "ref" ? s = t[c] : l[c] = t[c];
	var u = {
		type: e,
		props: l,
		key: r,
		ref: s,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__c: null,
		constructor: void 0,
		__v: --Oa,
		__i: -1,
		__u: 0,
		__source: a,
		__self: o
	};
	return n.vnode && n.vnode(u), u;
}
// src/widget/components/ui/spinner.tsx
var ka = ({ className: e, size: t = 24, ...n }) => /* @__PURE__ */ Z("span", {
	className: Y("flex shrink-0 items-center justify-center text-primary", e),
	...n,
	children: [/* @__PURE__ */ Z("svg", {
		"aria-hidden": "true",
		xmlns: "http://www.w3.org/2000/svg",
		width: t,
		height: t,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.5",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		className: "animate-spin",
		children: /* @__PURE__ */ Z("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
	}), /* @__PURE__ */ Z("span", {
		className: "sr-only",
		children: "Carregando..."
	})]
}), Aa = () => /* @__PURE__ */ Z("output", {
	className: "absolute bottom-15 left-1/2 grid -translate-x-1/2 animate-move-up place-content-center rounded-full border bg-background p-0.5 pr-2",
	children: /* @__PURE__ */ Z("span", {
		className: "flex items-center gap-1 font-semibold text-primary text-xs dark:text-secondary-foreground",
		children: [/* @__PURE__ */ Z(ka, { className: "size-4 text-current" }), "Traduzindo..."]
	})
}), ja = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, Ma = Gr, Na = (e, t) => (n) => {
	if (t?.variants == null) return Ma(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = ja(t) || ja(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return Ma(e, a, t?.compoundVariants?.reduce((e, t) => {
		let { class: n, className: r, ...a } = t;
		return Object.entries(a).every((e) => {
			let [t, n] = e;
			return Array.isArray(n) ? n.includes({
				...i,
				...o
			}[t]) : {
				...i,
				...o
			}[t] === n;
		}) ? [
			...e,
			n,
			r
		] : e;
	}, []), n?.class, n?.className);
}, Pa = Na("flex cursor-pointer items-center justify-center [&>svg]:shrink-0 [&>i:not([class*='size-'])]:size-5.25 gap-x-2 rounded-lg text-foreground", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground outline-primary-foreground hover:brightness-115",
			outline: "border border-foreground/20 hover:bg-foreground/5",
			ghost: "bg-transparent hover:bg-muted",
			muted: "bg-muted text-foreground hover:bg-accent",
			secondary: "bg-secondary text-secondary-foreground hover:brightness-110",
			destructive: "bg-destructive text-destructive-foreground outline-destructive-foreground hover:brightness-125",
			"outline-gov": "border border-primary hover:bg-primary/15 text-primary active:bg-primary/20",
			"muted-gov": "bg-primary/15 text-primary hover:bg-primary/20",
			"ghost-gov": "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20"
		},
		size: {
			default: "h-9 px-3.5 py-2",
			xl: "h-12 px-4.5 py-2",
			lg: "h-10 px-4 py-1.25",
			sm: "h-8 gap-1.5 px-3 py-1.25 text-sm [&>i:not([class*='size-'])]:size-5",
			xs: "h-7 gap-1 px-2.5 py-1 text-xs [&>i:not([class*='size-'])]:size-4",
			icon: "size-9 shrink-0 [&>i:not([class*='size-'])]:size-5.25",
			"icon-xl": "size-12 shrink-0 [&>i:not([class*='size-'])]:size-6.5",
			"icon-lg": "size-10 shrink-0 [&>i:not([class*='size-'])]:size-6",
			"icon-sm": "size-8 shrink-0 text-sm [&>i:not([class*='size-'])]:size-4.5",
			"icon-xs": "size-7 shrink-0 [&>i:not([class*='size-'])]:size-4"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
}), Q = ({ children: e, disabled: t, className: n, variant: r, size: i, ref: a, ...o }) => /* @__PURE__ */ Z("button", {
	inert: t,
	tabIndex: t ? -1 : 0,
	disabled: t,
	ref: a,
	className: Y(Pa({
		variant: r,
		size: i
	}), t && "opacity-50", n),
	type: o.type || "button",
	...o,
	children: e
}), Fa = 256, Ia = {
	draggable: !1,
	decoding: "sync"
}, $ = ({ className: e, name: t, colored: n = !1, style: r, ...i }) => {
	let a = An(`icons/${t}.webp`);
	return /* @__PURE__ */ Z("i", {
		"aria-hidden": "true",
		className: Y("inline-block shrink-0", !n && "overflow-hidden", e),
		...i,
		children: /* @__PURE__ */ Z("img", {
			alt: "",
			...Ia,
			src: a,
			className: "block size-full object-contain object-center",
			style: n ? r : {
				...r,
				filter: `drop-shadow(0 ${Fa}px 0 currentColor)`,
				transform: "translateY(-256px) translateZ(0)"
			}
		})
	});
}, La = () => {
	let [e, t] = F(!1), { progress: n, isBroken: r } = V(Mn("progress", "isBroken"));
	return I(() => {
		if (n !== 100) return;
		let e = setTimeout(() => t(!0), 1e3);
		return () => clearTimeout(e);
	}, [n]), /* @__PURE__ */ Z("div", {
		className: Y("absolute inset-0 z-9999999 flex flex-col items-center justify-between border bg-background p-4", "widget-radius"),
		children: [
			/* @__PURE__ */ Z(Q, {
				onClick: () => W.get().setOpen(!1),
				"aria-label": "Fechar",
				size: "icon-sm",
				variant: "ghost",
				className: "absolute top-2 right-2",
				children: /* @__PURE__ */ Z($, { name: "x" })
			}),
			/* @__PURE__ */ Z("div", {
				className: "grid place-content-center rounded-full border px-2 py-1",
				children: /* @__PURE__ */ Z($, {
					name: "govbr",
					colored: !0,
					className: "h-4 w-12"
				})
			}),
			/* @__PURE__ */ Z("div", {
				className: "-mt-4 flex flex-col items-center",
				children: [
					/* @__PURE__ */ Z("div", {
						className: "mb-2 overflow-hidden rounded-full border-6 border-primary/30",
						children: /* @__PURE__ */ Z("div", {
							className: "relative flex mobile:size-18 size-20 justify-center overflow-hidden rounded-full bg-primary",
							children: /* @__PURE__ */ Z($, {
								name: "icaro",
								className: "absolute bottom-0 mobile:size-14 size-15 text-primary-foreground"
							})
						})
					}),
					/* @__PURE__ */ Z("p", {
						className: "mobile:mb-1 font-bold mobile:text-sm text-base",
						children: "VLibras Widget"
					}),
					/* @__PURE__ */ Z("span", {
						className: "text-muted-foreground text-xs",
						children: ["v", "7.12.3"]
					})
				]
			}),
			e && /* @__PURE__ */ Z("output", {
				className: "absolute bottom-8 animate-move-up font-semibold text-muted-foreground text-xs",
				children: "Iniciando..."
			}),
			n === 0 && !r && /* @__PURE__ */ Z(ka, {
				className: "absolute bottom-8",
				size: 16
			}),
			r && /* @__PURE__ */ Z("div", {
				className: "absolute inset-x-6 top-auto bottom-4 flex animate-move-up flex-col items-center gap-2",
				children: [/* @__PURE__ */ Z("p", {
					role: "alert",
					className: "font-semibold text-muted-foreground text-xs",
					children: "Não foi possível carregar o player."
				}), /* @__PURE__ */ Z(Q, {
					size: "xs",
					variant: "default",
					className: "rounded-full",
					onClick: () => H.get().retryLoad(),
					children: "Tentar novamente"
				})]
			}),
			/* @__PURE__ */ Z("div", {
				role: "progressbar",
				"aria-label": "Carregamento do player",
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-valuenow": n,
				"aria-valuetext": `${n}%`,
				className: Y("bottom-4 h-2 w-44 rounded-full bg-foreground/10", r && "invisible bg-destructive"),
				children: /* @__PURE__ */ Z("span", {
					className: "block h-full rounded-full bg-primary transition-[width]",
					style: { width: `${n}%` }
				})
			})
		]
	});
}, Ra = ({ className: e, ...t }) => /* @__PURE__ */ Z("div", {
	...t,
	className: `animate-pulse rounded-lg bg-accent ${e}`
}), za = on()(() => ({})), Ba = {
	get: za.getState,
	set: za.setState,
	subscribe: za.subscribe
}, Va = ({ className: e }) => {
	let t = za((e) => e.appRoot);
	return t ? xt(/* @__PURE__ */ Z("output", {
		style: { boxShadow: "0 -5px 10px -5px rgba(0, 0, 0, 0.15)" },
		className: Y("widget-radius absolute inset-0 top-auto z-100 flex min-h-40 flex-col bg-background", e),
		children: [/* @__PURE__ */ Z("div", {
			className: "flex items-center gap-2 border-b p-4",
			children: [/* @__PURE__ */ Z(Ra, { className: "size-4 shrink-0" }), /* @__PURE__ */ Z(Ra, { className: "h-4 w-24" })]
		}), /* @__PURE__ */ Z("div", {
			className: "grid flex-1 place-content-center",
			children: /* @__PURE__ */ Z(ka, {})
		})]
	}), t) : null;
}, Ha = on()((e) => ({
	screen: "main",
	open: (t) => e({ screen: t }),
	closeAll: () => e({ screen: "main" })
})), Ua = {
	get: Ha.getState,
	set: Ha.setState,
	subscribe: Ha.subscribe
}, Wa = Wt(() => import("./dictionary-Bfke6aBC.js").then((e) => ({ default: e.DictionaryScreen }))), Ga = Wt(() => import("./about-CzkVI8WV.js").then((e) => ({ default: e.AboutScreen }))), Ka = () => {
	let e = Ha((e) => e.screen);
	return /* @__PURE__ */ Z(k, { children: [e === "dictionary" && /* @__PURE__ */ Z(Ut, {
		fallback: /* @__PURE__ */ Z(Va, { className: "top-0" }),
		children: /* @__PURE__ */ Z(Wa, {})
	}), e === "about" && /* @__PURE__ */ Z(Ut, {
		fallback: /* @__PURE__ */ Z(Va, { className: "top-0" }),
		children: /* @__PURE__ */ Z(Ga, {})
	})] });
}, qa = [], Ja = [], Ya = () => Ja.forEach((e) => e([...qa])), Xa = (e, t) => {
	let n = jn(), r = t?.duration || 3e3;
	qa.push({
		id: n,
		message: e,
		duration: r,
		...t
	}), Ya(), setTimeout(() => {
		let e = qa.findIndex((e) => e.id === n);
		e > -1 && (qa[e].isExiting = !0, Ya()), setTimeout(() => {
			qa = qa.filter((e) => e.id !== n), Ya();
		}, 500);
	}, r);
}, Za = (e) => (Ja.push(e), () => {
	Ja = Ja.filter((t) => t !== e);
}), Qa = Na("absolute mobile:text-center w-auto! inset-x-0 overflow-hidden mx-auto flex items-center justify-center transition-all duration-500", {
	variants: {
		position: {
			top: "top-0 animate-move-down",
			bottom: "bottom-0 animate-move-up"
		},
		align: {
			start: "justify-start",
			end: "justify-end",
			center: "justify-center"
		}
	},
	defaultVariants: {
		position: "bottom",
		align: "center"
	}
}), $a = ({ message: e, isExiting: t, position: n = "bottom", align: r = "center", variant: i = "default", className: a }) => {
	let o = i === "light" || i === "dark", s = i === "destructive";
	return /* @__PURE__ */ Z("div", {
		"data-theme": o ? i : void 0,
		className: Y(Qa({
			position: n,
			align: r
		}), t && (n === "top" ? "-top-100!" : "-bottom-100!"), a),
		children: /* @__PURE__ */ Z("div", {
			"data-slot": "toast-content",
			role: s ? "alert" : "status",
			className: Y("pointer-events-auto w-full border bg-background px-2.5 py-3.5 mobile:text-xs text-sm transition-all duration-500 ease-in-out", i === "success" && "border-none bg-success text-success-foreground", i === "destructive" && "border-none bg-destructive text-destructive-foreground", i === "primary" && "border-none bg-primary text-primary-foreground"),
			children: /* @__PURE__ */ Z("div", {
				className: "break-anywhere text-center",
				children: e
			})
		})
	});
}, eo = () => {
	let [e, t] = F([]), n = za((e) => e.appRoot);
	return I(() => Za(t), []), n ? xt(/* @__PURE__ */ Z("div", {
		className: "pointer-events-none absolute inset-0 z-2147483647",
		"aria-live": "polite",
		"aria-atomic": "false",
		children: e.map((e) => /* @__PURE__ */ Z($a, { ...e }, e.id))
	}), n) : null;
}, to = () => {
	let e = U((e) => e.isTranslating);
	return /* @__PURE__ */ Z(k, { children: [
		!V((e) => e.isLoaded) && /* @__PURE__ */ Z(La, {}),
		/* @__PURE__ */ Z(Ka, {}),
		/* @__PURE__ */ Z(eo, {}),
		e && /* @__PURE__ */ Z(Aa, {})
	] });
}, no = on((e) => ({
	open: !1,
	onOpenChange: (t) => e((e) => ({ open: Vr(t, e.open) })),
	reset: () => e({
		open: !1,
		element: void 0
	})
})), ro = {
	get: no.getState,
	set: no.setState
}, io = Wt(() => import("./guide-BH26ZXaQ.js").then((e) => ({ default: e.Guide }))), ao = () => /* @__PURE__ */ Z(k, { children: no((e) => e.open) && /* @__PURE__ */ Z(Ut, {
	fallback: null,
	children: /* @__PURE__ */ Z(io, {})
}) }), oo = Na("fixed z-2147483647", {
	variants: {
		isDragging: {
			true: "",
			false: "transition-all"
		},
		isOpen: {
			true: "",
			false: "opacity-0"
		},
		hasMoved: {
			true: "top-0 left-0",
			false: ""
		},
		isExpanded: {
			true: "",
			false: ""
		},
		position: {
			left: "",
			right: ""
		}
	},
	compoundVariants: [
		{
			hasMoved: !1,
			position: "left",
			class: "top-1/2 left-2 -translate-y-1/2 animate-move-left"
		},
		{
			hasMoved: !1,
			position: "right",
			class: "top-1/2 right-2 -translate-y-1/2 animate-move-right"
		},
		{
			isOpen: !1,
			position: "left",
			class: "top-1/2 left-2 -translate-y-1/2 animate-move-left -left-200"
		},
		{
			isOpen: !1,
			position: "right",
			class: "top-1/2 right-2 -translate-y-1/2 animate-move-right -right-200"
		},
		{
			isExpanded: !0,
			isOpen: !0,
			class: ["w-dvw max-w-dvw sm:h-auto sm:w-xl sm:[--player-height:800px] max-sm:inset-x-0!", "mobile:translate-none! mobile:transform-none! [--player-height:calc(100dvh-52px)] mobile:inset-0 mobile:rounded-none! mobile:border-none!"]
		}
	],
	defaultVariants: {
		isDragging: !1,
		isOpen: !0,
		hasMoved: !1,
		isExpanded: !1
	}
}), so = on()(() => ({
	openId: null,
	showOverlay: !0
})), co = {
	get: so.getState,
	set: so.setState,
	subscribe: so.subscribe,
	close: () => {
		so.getState().onClose?.(), so.setState({
			openId: null,
			showOverlay: !0,
			onClose: void 0
		});
	}
}, lo = ({ className: e, ...t }) => {
	let n = so((e) => e.openId !== null), r = so((e) => e.showOverlay), i = no((e) => e.open);
	return !n || i ? null : /* @__PURE__ */ Z("div", {
		onClick: co.close,
		...t,
		className: Y("absolute inset-0", r && "bg-black/5", e)
	});
}, uo = (e) => {
	let [t, n, r, i, a] = e.map((e) => e === "True");
	return {
		isPlaying: t,
		isPaused: n,
		isPlayingIntervalAnimation: r,
		isLoading: i,
		isRepeatable: a
	};
}, fo = () => ua[Math.floor(Math.random() * ua.length)], po = (e, t, n) => Math.min(t * 2 ** e, n), mo = 5e3, ho = async (e) => {
	let t = new AbortController(), n = setTimeout(() => t.abort(), mo);
	try {
		return (await fetch(e, {
			method: "HEAD",
			mode: "cors",
			cache: "no-store",
			credentials: "omit",
			signal: t.signal
		})).status >= 500 ? "unavailable" : "ok";
	} catch {
		return "unknown";
	} finally {
		clearTimeout(n);
	}
}, go = 5, _o = 1e3, vo = 8e3, yo = 3e4, bo = (e, t) => {
	let [n, r] = F(0), [i, a] = F(), o = V((e) => e.isLoaded);
	return I(() => {
		H.set({ retryLoad: () => {
			H.set({ isBroken: !1 }), a(void 0), r(0);
		} });
	}, []), I(() => {
		if (!e) return;
		if (n >= go) return void H.set({ isBroken: !0 });
		let i = !1, o = kn(`${e}/unity/index.html?v=${t}${n ? `&retry=${n}` : ""}`);
		return ho(o).then(async (e) => {
			i || (e === "unavailable" ? (await On(_o), i || r((e) => e + 1)) : a(o));
		}), () => {
			i = !0;
		};
	}, [
		e,
		t,
		n
	]), I(() => {
		if (!i || o || n >= go) return;
		let e = po(n, vo, yo), t = setTimeout(() => r((e) => e + 1), e);
		return () => clearTimeout(t);
	}, [
		i,
		o,
		n
	]), i;
}, xo = ({ path: e, iframeRef: t }) => (I(() => {
	if (!e) return;
	let n = (e) => {
		if (e.source === t.current?.contentWindow && e.data?.type === "unity_event") {
			if (e.data.event === Lr.FINISH_WELCOME) {
				let t = e.data.data === "True";
				if (H.get().isWelcomeFinished) return;
				H.set({
					isPlayingWelcome: !t,
					isWelcomeFinished: t,
					...t ? { countGloss: {
						count: 0,
						max: 0
					} } : {}
				}), t && fa.get().onWelcomeFinish?.();
			}
			if (e.data.event === Lr.ON_LOAD_PLAYER && (H.set({ isLoaded: !0 }), fa.get().onLoaded?.()), e.data.event === Lr.UPDATE_PROGRESS) {
				let t = Number(e.data.data);
				Number.isNaN(t) || H.set({ progress: Number((t * 100).toFixed(0)) });
			}
			if (e.data.event === Lr.ON_PLAYING_STATE_CHANGE) {
				let { isPlaying: t, isPaused: n, isLoading: r } = uo(e.data.data);
				n ? H.set({ status: "paused" }) : t && !n ? H.set({ status: "playing" }) : !t && !r && H.set({ status: "idle" });
			}
			if (e.data.event === Lr.COUNTER_GLOSS) {
				let [t, n] = e.data.data;
				H.set({ countGloss: {
					count: t,
					max: n
				} });
			}
		}
	};
	return window.addEventListener("message", n), () => window.removeEventListener("message", n);
}, [e, t]), null), So = (e) => {
	let { path: t, version: n } = cn(), r = V((e) => e.isLoaded), i = L(null), a = bo(t, n), o = (e, t, n) => {
		if (!i.current) return;
		let { contentWindow: r } = i.current, { instance: a } = H.get();
		if (r && (r.postMessage({
			type: "unity",
			object: e,
			method: t,
			params: n
		}, "*"), !a)) try {
			let e = r.postMessage({ type: "get_unity_instance" }, "*");
			e && H.set({ instance: e });
		} catch (e) {
			console.error("Error setting instance:", e);
		}
	};
	if (I(() => {
		i.current && H.set({ send: o });
	}, []), I(() => {
		e.options && !fa.get().isInitialized && fa.set({
			...e.options,
			isInitialized: !0
		});
	}, [e.options]), t) return /* @__PURE__ */ Z(k, { children: [/* @__PURE__ */ Z("iframe", {
		tabindex: -1,
		ref: i,
		title: "vlibras-player",
		sandbox: "allow-scripts allow-same-origin allow-pointer-lock",
		src: a,
		style: {
			border: "none",
			overflow: "hidden",
			opacity: +!!r
		},
		...e
	}), /* @__PURE__ */ Z(xo, {
		path: t,
		iframeRef: i
	})] });
}, Co = on()(Ar((e) => ({
	status: "pending",
	accept: () => e({ status: "accepted" }),
	decline: () => e({ status: "declined" })
}), {
	name: "@vlibras-consent",
	version: 1
})), wo = {
	get: Co.getState,
	set: Co.setState,
	subscribe: Co.subscribe
}, To = {
	content: void 0,
	action: void 0,
	auto: !1
}, Eo = on()(() => ({ ...To })), Do = () => Eo.setState(To), Oo = (e) => {
	setTimeout(() => Eo.setState(e), 300);
}, ko = {
	get: Eo.getState,
	set: Eo.setState
}, Ao = ({ className: e, gloss: t, onFinish: n, onClick: r, label: i, ...a }) => /* @__PURE__ */ Z("button", {
	onClick: (e) => {
		Do(), va(t), r?.(e), n && Oo({
			action: n,
			auto: !0
		});
	},
	type: "button",
	"aria-label": i ? `Traduzir: ${i}` : "Traduzir texto",
	className: Y("pointer-events-auto relative -bottom-1 inline cursor-pointer rounded-sm p-0.5 hover:text-primary", e),
	...a,
	children: /* @__PURE__ */ Z($, {
		name: "hands",
		className: "size-4"
	})
}), jo = ({ className: e, orientation: t = "horizontal", ...n }) => /* @__PURE__ */ Z("div", {
	className: Y("bg-border", t === "horizontal" ? "min-h-px" : "min-w-px", e),
	...n
}), Mo = "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex=\"-1\"])", No = (e) => e.closest("[inert]") === null && e.getClientRects().length > 0, Po = () => {
	let { shadowRoot: e } = Ba.get();
	return e?.activeElement ?? document.activeElement;
}, Fo = (e, t) => {
	if (t.key !== "Tab" || !e) return;
	t.stopPropagation();
	let n = Array.from(e.querySelectorAll(Mo)).filter(No);
	if (!n.length) {
		t.preventDefault();
		return;
	}
	let r = n[0], i = n[n.length - 1], a = Po();
	(t.shiftKey ? a === r || !e.contains(a) : a === i || !e.contains(a)) && (t.preventDefault(), (t.shiftKey ? i : r).focus({ preventScroll: !0 }));
}, Io = () => {
	(document.querySelector("#vlibras-access-wrapper")?.shadowRoot?.querySelector("#vlibras-button"))?.focus({ preventScroll: !0 });
}, Lo = () => {
	(document.querySelector("#vlibras-app-panel") ?? document.querySelector("#vlibras-app-content"))?.focus({ preventScroll: !0 });
}, Ro = () => {
	if (typeof window > "u") return !1;
	let e = location.hostname;
	return e === "localhost" || e === "127.0.0.1" || e === "[::1]" || e.endsWith(".local") || e.endsWith(".localhost") || e.startsWith("192.168.") || e.startsWith("10.");
}, zo = .07, Bo = !Ro(), Vo = !1, Ho = Bo && !0, Uo = (async () => {
	if (!Bo || typeof window > "u") return null;
	try {
		let e = (await import(
			/* @vite-ignore */
			"https://cdn.jsdelivr.net/npm/posthog-js@1.404.0/+esm"
)).default;
		return e.init(void 0, {
			api_host: void 0,
			autocapture: !1,
			capture_pageview: !1,
			capture_performance: !1,
			persistence: "memory",
			debug: Vo
		}), e;
	} catch (e) {
		return console.error("Erro ao carregar PostHog:", e), null;
	}
})(), Wo = {
	_getContext: () => ({
		host: location.hostname,
		origin: `${location.origin}${location.pathname}`
	}),
	trackLoad: async () => {
		let e = await Uo;
		Bo && e && Math.random() < zo && e.capture("widget_initialized", {
			...Wo._getContext(),
			sampling_rate: zo
		});
	},
	trackEvent: async (e, t) => {
		if (wo.get().status !== "accepted") return;
		let n = await Uo;
		Bo && n && n.capture(e, {
			...Wo._getContext(),
			...t
		});
	}
}, Go = () => {
	let e = Co((e) => e.status), t = no((e) => e.open), n = V((e) => e.status === "playing" && !!e.gloss);
	return Ho && e === "pending" && !t && !n;
}, Ko = () => {
	let e = L(null), t = Xe(), n = Go();
	if (I(() => {
		if (!n) return;
		let t = requestAnimationFrame(() => e.current?.focus({ preventScroll: !0 }));
		return () => cancelAnimationFrame(t);
	}, [n]), !n) return null;
	let r = () => {
		wo.get().decline(), requestAnimationFrame(() => Lo());
	}, i = () => {
		wo.get().accept(), requestAnimationFrame(() => Lo());
	}, a = () => {
		r();
	};
	return /* @__PURE__ */ Z("div", {
		ref: e,
		tabIndex: -1,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Consentimento de coleta de dados",
		"aria-describedby": t,
		onKeyDown: (t) => {
			t.key === "Escape" ? (t.stopPropagation(), a()) : Fo(e.current, t);
		},
		className: "absolute inset-2 top-auto z-100 flex animate-move-up flex-col gap-2 rounded-lg border bg-background p-2.5 text-sm shadow-2xl dark:bg-muted",
		children: [
			/* @__PURE__ */ Z("p", { children: [
				"Podemos coletar dados anônimos de uso para melhorar o ",
				/* @__PURE__ */ Z("strong", { children: "VLibras" }),
				"?",
				/* @__PURE__ */ Z(Ao, {
					gloss: "COLETAR DADO&INFORMAÇÃO ANÔNIMO USAR MELHORAR VLIBRAS [INTERROGAÇÃO]",
					label: "Consentimento de coleta de dados"
				})
			] }),
			/* @__PURE__ */ Z("p", {
				id: t,
				className: "text-muted-foreground text-xs",
				children: "Fechar este aviso ou pressionar Esc equivale a não aceitar."
			}),
			/* @__PURE__ */ Z(jo, { className: "-mx-2.5" }),
			/* @__PURE__ */ Z("div", {
				className: "flex justify-end gap-2",
				children: [/* @__PURE__ */ Z(Q, {
					className: "hover:bg-destructive/5 hover:text-destructive",
					onClick: r,
					variant: "ghost",
					size: "sm",
					children: "Não aceitar"
				}), /* @__PURE__ */ Z(Q, {
					onClick: i,
					variant: "default",
					size: "sm",
					children: "Aceitar"
				})]
			})
		]
	});
}, qo = 24, Jo = (e, t, n) => ({
	x: Math.max(0, Math.min(e, window.innerWidth - n.width)),
	y: Math.max(0, Math.min(t, window.innerHeight - n.height))
}), Yo = {
	ArrowUp: {
		x: 0,
		y: -24
	},
	ArrowDown: {
		x: 0,
		y: qo
	},
	ArrowLeft: {
		x: -24,
		y: 0
	},
	ArrowRight: {
		x: qo,
		y: 0
	}
}, Xo = Ee(null), Zo = () => {
	let e = Je(Xo);
	if (!e) throw Error("useDraggable deve ser usado dentro de <Draggable />");
	return e;
};
function Qo({ children: e }) {
	let t = L(null), n = L({
		x: 0,
		y: 0
	}), r = U((e) => e.isExpanded), [i, a] = F({
		x: 0,
		y: 0
	}), [o, s] = F(!1), [c, l] = F(!1), u = () => {
		a({
			x: 0,
			y: 0
		}), s(!1);
	};
	I(() => {
		if (!t.current || !o || !r) return;
		let e = setTimeout(() => {
			if (!t.current) return;
			let e = t.current.getBoundingClientRect();
			a((t) => {
				let n = Jo(t.x, t.y, e);
				return n.x === t.x && n.y === t.y ? t : n;
			});
		}, 200);
		return () => clearTimeout(e);
	}, [r]), I(() => {
		let e = null, n = () => {
			t.current && o && e === null && (e = requestAnimationFrame(() => {
				if (e = null, !t.current) return;
				let n = t.current.getBoundingClientRect();
				a((e) => {
					let t = Jo(e.x, e.y, n);
					return t.x !== e.x || t.y !== e.y ? t : e;
				});
			}));
		};
		return window.addEventListener("resize", n), () => {
			window.removeEventListener("resize", n), e !== null && cancelAnimationFrame(e);
		};
	}, [o]), I(() => {
		let e = null, r = {
			x: 0,
			y: 0
		}, i = (i) => {
			c && t.current && (i.cancelable && i.preventDefault(), r.x = i.clientX, r.y = i.clientY, e === null && (e = requestAnimationFrame(() => {
				if (e = null, !t.current) return;
				let i = r.x - n.current.x, c = r.y - n.current.y, l = t.current.getBoundingClientRect();
				a(Jo(i, c, l)), o || s(!0);
			})));
		}, u = () => {
			l(!1), document.body.style.userSelect = "", document.body.style.touchAction = "";
		};
		return window.addEventListener("pointermove", i), window.addEventListener("pointerup", u), window.addEventListener("pointercancel", u), () => {
			window.removeEventListener("pointermove", i), window.removeEventListener("pointerup", u), window.removeEventListener("pointercancel", u), e !== null && cancelAnimationFrame(e);
		};
	}, [o, c]), I(() => {
		if (t.current) {
			let e = t.current.getBoundingClientRect();
			a({
				x: e.left,
				y: e.top
			});
		}
	}, []);
	let d = (e) => {
		if (!t.current) return;
		e.cancelable && e.preventDefault(), e.currentTarget.setPointerCapture(e.pointerId), l(!0);
		let r = t.current.getBoundingClientRect();
		n.current = {
			x: e.clientX - r.left,
			y: e.clientY - r.top
		}, o || (a({
			x: r.left,
			y: r.top
		}), s(!0)), document.body.style.userSelect = "none", document.body.style.touchAction = "none";
	}, f = () => {
		l(!0), requestAnimationFrame(() => requestAnimationFrame(() => l(!1)));
	}, p = {
		ref: t,
		hasMoved: o,
		pos: i,
		isDragging: c,
		reset: u,
		onPointerDown: d,
		onKeyDown: (e) => {
			if (!t.current) return;
			if (e.key === "Enter" || e.key === "0") {
				e.preventDefault(), o && f(), u();
				return;
			}
			let n = Yo[e.key];
			if (!n) return;
			e.preventDefault();
			let r = t.current.getBoundingClientRect(), c = o ? i : {
				x: r.left,
				y: r.top
			};
			a(Jo(c.x + n.x, c.y + n.y, r)), o || (f(), s(!0));
		}
	};
	return /* @__PURE__ */ Z(Xo.Provider, {
		value: p,
		children: e(p)
	});
}
var $o = ({ className: e, focusable: t = !0 }) => {
	let { onPointerDown: n, onKeyDown: r } = Zo();
	return /* @__PURE__ */ Z("button", {
		type: "button",
		"data-slot": "drag-handle",
		"aria-label": "Mover janela VLibras. Use as setas para mover; Enter ou 0 para redefinir a posição.",
		tabIndex: t ? void 0 : -1,
		onPointerDown: n,
		onKeyDown: r,
		className: Y("absolute inset-0 -z-1! touch-none outline-none! not-expanded:hover:cursor-move sm:hover:cursor-move", e)
	});
}, es = Y("pointer-events-none absolute z-2147483647 size-0 opacity-0 drop-shadow-sm transition-opacity duration-150", "group-has-[[data-slot=drag-handle]:focus-visible]/widget:opacity-100"), ts = () => /* @__PURE__ */ Z(k, { children: [
	/* @__PURE__ */ Z("span", {
		"aria-hidden": "true",
		className: Y(es, "-top-2.5 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-0 border-b-primary")
	}),
	/* @__PURE__ */ Z("span", {
		"aria-hidden": "true",
		className: Y(es, "top-1/2 -right-2.5 -translate-y-1/2 border-8 border-transparent border-r-0 border-l-primary")
	}),
	/* @__PURE__ */ Z("span", {
		"aria-hidden": "true",
		className: Y(es, "-bottom-2.5 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-primary border-b-0")
	}),
	/* @__PURE__ */ Z("span", {
		"aria-hidden": "true",
		className: Y(es, "top-1/2 -left-2.5 -translate-y-1/2 border-8 border-transparent border-r-primary border-l-0")
	})
] }), ns = "[role^=\"menuitem\"]", rs = (e) => Array.from(e.querySelectorAll(ns)).filter((e) => e.closest("[inert]") === null), is = Ee(null), as = () => {
	let e = Je(is);
	if (!e) throw Error("Dropdown.Trigger e Dropdown.Content devem ser usados dentro de <Dropdown>");
	return e;
}, os = ({ className: e, children: t, showOverlay: n = !0, open: r, ...i }) => {
	let a = Xe(), o = so((e) => e.openId === a), s = r ?? o, c = L(null), l = L(null), u = (e) => {
		let t = l.current;
		if (!t) return;
		let n = rs(t);
		if (n.length === 0) return;
		let r = e && n.includes(e) ? e : null, i = n.find((e) => e.getAttribute("aria-checked") === "true") ?? n[0], a = r ?? i;
		for (let e of n) e.tabIndex = e === a ? 0 : -1;
	};
	I(() => {
		if (!s) return;
		let { shadowRoot: e } = Ba.get(), t = e?.activeElement ?? document.activeElement;
		u(t);
	});
	let d = (e) => {
		(typeof e == "function" ? e(co.get().openId === a) : e) ? co.set({
			openId: a,
			showOverlay: n,
			onClose: () => c.current?.focus()
		}) : co.close();
	};
	return /* @__PURE__ */ Z("div", {
		ref: l,
		onBlurCapture: (e) => {
			if (!s) return;
			let t = e.relatedTarget;
			t && e.currentTarget.contains(t) || co.set({
				openId: null,
				onClose: void 0
			});
		},
		onFocusCapture: (e) => {
			let t = e.target;
			t?.matches?.(ns) && u(t);
		},
		onKeyDown: (e) => {
			if (!s) return;
			if (e.key === "Escape") {
				e.stopPropagation(), co.close();
				return;
			}
			if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
			let t = rs(e.currentTarget);
			if (!t.length) return;
			e.preventDefault();
			let { shadowRoot: n } = Ba.get(), r = n?.activeElement ?? document.activeElement, i = r ? t.indexOf(r) : -1, a = i;
			e.key === "ArrowDown" ? a = i < t.length - 1 ? i + 1 : 0 : e.key === "ArrowUp" ? a = i > 0 ? i - 1 : t.length - 1 : e.key === "Home" ? a = 0 : e.key === "End" && (a = t.length - 1), t[a]?.focus();
		},
		className: Y("dropdown focus-within:**:data-[slot=tooltip-content]:hidden", s ? "dropdown-open" : "dropdown-close", e),
		...i,
		children: /* @__PURE__ */ Z(is.Provider, {
			value: {
				open: s,
				setOpen: d,
				triggerRef: c
			},
			children: t
		})
	});
}, ss = ({ children: e, "aria-describedby": t }) => {
	let { open: n, setOpen: r, triggerRef: a } = as();
	return i(e) ? D(e, {
		ref: a,
		"aria-expanded": n,
		"aria-haspopup": "menu",
		"aria-describedby": t,
		onClick: (t) => {
			e.props.onClick?.(t), r((e) => !e);
		}
	}) : e;
}, cs = ({ className: e, ...t }) => (as(), /* @__PURE__ */ Z("div", {
	tabIndex: -1,
	role: "menu",
	className: Y("dropdown-content widget-radius", e),
	...t
})), ls = Na("border bg-popover", { variants: { variant: {
	default: "bg-background backdrop-blur-sm **:text-foreground",
	primary: "border-primary bg-primary *:text-primary-foreground",
	destructive: "border-destructive bg-destructive *:text-destructive-foreground",
	info: "border-blue-500 bg-blue-500 *:text-blue-50",
	warning: "border-orange-500 bg-orange-500 *:text-orange-50",
	success: "border-green-700 bg-green-700 *:text-green-50",
	reverse: "border-foreground/10 bg-foreground *:text-background"
} } }), us = ({ children: e, disabled: t, content: n, arrow: r, offset: a = -4, align: o = "center", placement: s = "top", variant: c = "default", className: l, open: u, onOpenChange: d, visualOnly: f = !1, ...p }) => {
	let [m, h] = F(!1), g = Rn(), _ = Xe(), v = t || g ? !1 : u ?? m;
	if (!n) return e;
	let y = () => {
		switch (s) {
			case "top": return { marginTop: a * -1 };
			case "bottom": return { marginBottom: a * -1 };
			case "left": return { marginRight: a };
			case "right": return { marginLeft: a };
			default: return { top: `calc((-100% + 8px) - ${a}px)` };
		}
	}, b = (e) => {
		u === void 0 && h(e), d?.(e);
	};
	return /* @__PURE__ */ Z("div", {
		className: "relative inline-block has-[>[role=button][aria-disabled=true]]:pointer-events-none has-[>button:disabled]:pointer-events-none",
		onMouseEnter: () => b(!0),
		onMouseLeave: () => b(!1),
		onFocus: () => b(!0),
		onBlur: () => b(!1),
		onKeyDown: (e) => {
			e.key === "Escape" && v && (e.stopPropagation(), b(!1));
		},
		children: [i(e) ? D(e, { "aria-describedby": v && !t && !f ? _ : void 0 }) : e, v && !t && /* @__PURE__ */ Z("div", {
			"data-slot": "tooltip-content",
			role: "tooltip",
			id: _,
			"aria-hidden": f || void 0,
			style: y(),
			className: Y(ls({ variant: c }), "absolute z-99999 rounded-lg px-3 py-1.5 expanded:text-sm text-popover-foreground text-xs shadow-lg transition-opacity duration-200", s === "bottom" && "-bottom-4 left-1/2 -translate-x-1/2 translate-y-full animate-move-down", s === "top" && "-top-4 left-1/2 -translate-x-1/2 -translate-y-full animate-move-up", s === "right" && "top-1/2 translate-x-1/2 -translate-y-1/2", s === "left" && "top-1/2 -translate-y-1/2", o === "start" && "right-auto! left-0! translate-x-0", o === "end" && "right-0! left-auto! translate-x-0", l),
			...p,
			children: /* @__PURE__ */ Z("div", {
				className: "relative font-semibold",
				children: [n, r && /* @__PURE__ */ Z("div", {
					"data-slot": "arrow-container",
					className: Y("absolute left-1/2 -ml-2 flex max-h-2 items-center justify-center overflow-hidden", r.position.includes("top") && "-top-3.5", r.position.includes("bottom") && "-bottom-3.5", r.position.includes("left") && "left-2", r.position.includes("right") && "-right-1 left-auto", r.position === "right" && "top-1/2 -right-6 left-auto -translate-y-1/2 -rotate-90", r.position === "left" && "top-1/2 right-auto -left-4 -translate-y-1/2 rotate-90", r.containerClassName),
					children: /* @__PURE__ */ Z("span", {
						"data-slot": "arrow",
						className: Y("-z-50 h-4 w-4 rotate-45", ls({ variant: c }), r.position.includes("top") ? "mt-3.5" : "mb-3.5", r.className)
					})
				})]
			})
		})]
	});
}, ds = () => {
	let e = fn(), t = V((e) => e.emotion), n = t === zr.default, r = (e) => {
		let n = zr[e];
		n !== t && (Ea(e), Wo.trackEvent("change_emotion", { emotion: n.name }));
	};
	return /* @__PURE__ */ Z(os, {
		className: "dropdown-center dropdown-top",
		children: [/* @__PURE__ */ Z(us, {
			offset: 8,
			content: "Emoções",
			placement: "top",
			arrow: { position: "bottom" },
			visualOnly: !0,
			children: /* @__PURE__ */ Z(ss, { children: /* @__PURE__ */ Z(Q, {
				"aria-label": n ? "Alterar emoção" : "Alterar emoção (emoção não padrão selecionada)",
				className: "group relative",
				variant: "ghost-gov",
				size: e ? "icon-sm" : "icon",
				children: [/* @__PURE__ */ Z($, { name: t.icon }), !n && /* @__PURE__ */ Z("span", {
					"aria-hidden": "true",
					className: "absolute top-0.5 right-0.5 size-2 rounded-full bg-destructive"
				})]
			}) })
		}), /* @__PURE__ */ Z(cs, {
			className: "mb-4 w-[calc(var(--widget-width)-1em)] border bg-background p-1 shadow-lg",
			children: /* @__PURE__ */ Z("div", {
				className: "relative flex items-center justify-center",
				children: [/* @__PURE__ */ Z("span", { className: "absolute -inset-y-1 w-px bg-border" }), /* @__PURE__ */ Z("div", {
					role: "group",
					"aria-label": "Opções de emoção",
					className: Y("relative grid w-full grid-cols-2 gap-x-2 gap-y-1 mobile:gap-y-0! font-semibold text-primary text-sm"),
					children: Rr.map((e) => {
						let n = zr[e], i = n === t;
						return /* @__PURE__ */ Z("div", {
							role: "presentation",
							children: /* @__PURE__ */ Z("button", {
								role: "menuitemradio",
								"aria-checked": i,
								"aria-label": `Aplicar emoção "${n.name}"`,
								type: "button",
								onClick: () => r(e),
								className: Y("w-full cursor-pointer whitespace-nowrap rounded-md px-2 py-1.5 text-center text-sm hover:bg-primary/10", i && "pointer-events-none bg-primary! text-primary-foreground! outline-1 outline-primary outline-solid"),
								children: /* @__PURE__ */ Z("div", {
									className: "flex items-center justify-start gap-1.5 *:leading-none",
									children: [/* @__PURE__ */ Z($, {
										name: n.icon,
										className: "mobile:size-4.5 size-5"
									}), /* @__PURE__ */ Z("span", {
										className: "mobile:text-xs text-sm",
										children: n.name
									})]
								})
							})
						}, e);
					})
				})]
			})
		})]
	});
}, fs = {
	idle: {
		label: "Repetir",
		icon: "repeat"
	},
	paused: {
		label: "Reproduzir",
		icon: "play"
	},
	playing: {
		label: "Pausar",
		icon: "pause"
	},
	stopped: {
		label: "Em espera",
		icon: "waiting"
	}
}, ps = () => {
	let e = fn(), { gloss: t, status: n, isPlayingWelcome: r } = V(Mn("gloss", "status", "isPlayingWelcome")), i = () => {
		let { status: e } = H.get();
		e === "idle" ? ya() : e === "paused" ? ga() : e === "playing" && xa(), W.set({ isPausedByUser: e === "playing" });
	}, a = fs[n];
	return /* @__PURE__ */ Z(us, {
		offset: 8,
		content: a.label,
		disabled: !t,
		placement: "top",
		align: "start",
		arrow: { position: "bottom-left" },
		visualOnly: !0,
		children: /* @__PURE__ */ Z(Q, {
			"aria-label": a.label,
			"data-slot": "main-action",
			disabled: !t && !r,
			onClick: i,
			variant: "ghost-gov",
			size: e ? "icon-sm" : "icon",
			children: /* @__PURE__ */ Z($, { name: a.icon })
		})
	});
}, ms = () => {
	let { count: e, max: t } = V((e) => e.countGloss), n = Ke(() => {
		let n = e + 1;
		return n / Math.max(t, n) * 100;
	}, [t, e]);
	return e === 0 || t === 0 ? null : /* @__PURE__ */ Z("div", {
		className: "absolute -top-1.75 left-0 h-1.5 w-full",
		children: /* @__PURE__ */ Z("div", {
			role: "progressbar",
			"aria-label": "Progresso da tradução",
			"aria-valuemin": 0,
			"aria-valuemax": 100,
			"aria-valuenow": n,
			"aria-valuetext": `${Math.round(n)}%`,
			className: Y("h-full bg-primary transition-[width]", n < 100 && "rounded-r-full"),
			style: { width: `${n}%` }
		})
	});
}, hs = Wt(() => import("./settings-C0kLG9C8.js").then((e) => ({ default: e.SettingsDialog }))), gs = () => {
	let e = fn(), [t, n] = F();
	return /* @__PURE__ */ Z(k, { children: [/* @__PURE__ */ Z(us, {
		className: "whitespace-nowrap",
		offset: 8,
		align: "end",
		content: "Configurações",
		placement: "top",
		arrow: { position: "bottom-right" },
		visualOnly: !0,
		children: /* @__PURE__ */ Z(Q, {
			"aria-label": "Configurações",
			"aria-expanded": !!t,
			"aria-haspopup": "dialog",
			onClick: () => n(!0),
			variant: "ghost-gov",
			size: e ? "icon-sm" : "icon",
			children: /* @__PURE__ */ Z($, { name: "settings" })
		})
	}), t !== void 0 && /* @__PURE__ */ Z(Ut, {
		fallback: /* @__PURE__ */ Z(Va, { className: "h-1/2" }),
		children: /* @__PURE__ */ Z(hs, {
			open: t,
			onOpenChange: n
		})
	})] });
}, _s = [
	2.5,
	2,
	1.5,
	1,
	.5
], vs = () => {
	let e = fn(), t = V((e) => e.speed), n = (e, t) => {
		(e.key === "Enter" || e.key === " ") && (e.preventDefault(), r(t));
	}, r = (e) => {
		e !== t && (Sa(e), Wo.trackEvent("change_speed", { speed: e }));
	};
	return /* @__PURE__ */ Z(os, {
		className: "dropdown-center dropdown-top",
		children: [/* @__PURE__ */ Z(us, {
			offset: 8,
			content: "Velocidade",
			placement: "top",
			arrow: { position: "bottom" },
			visualOnly: !0,
			children: /* @__PURE__ */ Z(ss, { children: /* @__PURE__ */ Z(Q, {
				"aria-label": `Alterar velocidade, atual ${t}x`,
				className: "min-w-9 mobile:min-w-8 max-w-16 mobile:max-w-14 px-2",
				variant: "ghost-gov",
				size: e ? "sm" : "default",
				children: /* @__PURE__ */ Z("div", {
					inert: !0,
					className: "-mt-0.5 inline-flex truncate font-bold mobile:text-xs text-sm",
					children: [/* @__PURE__ */ Z("span", {
						className: "truncate",
						children: t
					}), /* @__PURE__ */ Z("span", { children: "x" })]
				})
			}) })
		}), /* @__PURE__ */ Z(cs, {
			className: "mb-4 border bg-background drop-shadow-lg",
			children: /* @__PURE__ */ Z("div", {
				role: "group",
				"aria-label": "Opções de velocidade",
				className: Y("space-y-1 p-1 font-semibold text-primary text-sm", "focus-within:pointer-events-auto focus-within:visible"),
				children: _s.map((e) => {
					let i = e === t;
					return /* @__PURE__ */ Z("button", {
						role: "menuitemradio",
						"aria-checked": i,
						"aria-label": `Aplicar velocidade ${e}x`,
						type: "button",
						onClick: () => r(e),
						onKeyDown: (t) => n(t, e),
						className: Y("w-full cursor-pointer whitespace-nowrap rounded-md px-2 py-1 text-center mobile:text-xs text-sm hover:bg-primary/10", i && "pointer-events-none bg-primary! text-primary-foreground! outline-1 outline-primary outline-solid"),
						children: [e, "x"]
					}, e);
				})
			})
		})]
	});
}, ys = () => {
	let e = fn(), { showSubtitles: t } = V(Mn("showSubtitles", "isPlayingWelcome")), n = () => {
		wa(), Wo.trackEvent("subtitles_toggled", { status: t ? "disabled" : "enabled" });
	}, r = t ? "Desativar legendas" : "Ativar legendas";
	return /* @__PURE__ */ Z(us, {
		className: "whitespace-nowrap",
		offset: 8,
		align: "end",
		content: r,
		placement: "top",
		arrow: { position: "bottom-right" },
		visualOnly: !0,
		children: /* @__PURE__ */ Z(Q, {
			onClick: n,
			"aria-label": r,
			"aria-pressed": t,
			variant: "ghost-gov",
			size: e ? "icon-sm" : "icon",
			children: /* @__PURE__ */ Z($, { name: t ? "subtitle" : "subtitle-off" })
		})
	});
}, bs = () => {
	let e = U((e) => e.isOpen), t = no((e) => e.open);
	return /* @__PURE__ */ Z("div", {
		className: Y(!e && "-bottom-20!", "relative z-50 animate-move-up border-t bg-background px-2 py-1.5 transition-[bottom] ease-in-out", "[&_button]:z-1 [&_button]:not-hover:bg-transparent [&_button]:dark:text-secondary-foreground **:[[role=button]]:not-hover:bg-transparent **:[[role=button]]:dark:text-secondary-foreground", "-mt-13 **:data-[highlight=true]:animate-highlight-primary"),
		children: [
			/* @__PURE__ */ Z($o, { focusable: !1 }),
			/* @__PURE__ */ Z(ms, {}),
			/* @__PURE__ */ Z("div", {
				inert: t,
				className: Y("pointer-events-none grid w-full grid-cols-5 items-center gap-1 [&_button]:pointer-events-auto", "[&>div]:col-span-2 [&>div]:grid [&>div]:grid-cols-subgrid [&>div]:justify-items-center [&>div]:rounded"),
				children: [
					/* @__PURE__ */ Z("div", {
						id: "main-action-speed-options",
						children: [/* @__PURE__ */ Z(ps, {}), /* @__PURE__ */ Z(vs, {})]
					}),
					/* @__PURE__ */ Z("div", {
						id: "emotions-subtitles-options",
						children: [/* @__PURE__ */ Z(ds, {}), /* @__PURE__ */ Z(ys, {})]
					}),
					/* @__PURE__ */ Z("div", {
						id: "settings-option",
						className: "col-span-1!",
						children: /* @__PURE__ */ Z(gs, {})
					})
				]
			}),
			/* @__PURE__ */ Z(lo, { className: "z-50" })
		]
	});
}, xs = ({ className: e, ...t }) => /* @__PURE__ */ Z("div", {
	className: Y("h-4", e),
	...t
}), Ss = "@media screen and (width<=640px){body[data-vlibras-expanded=true]{overflow:hidden!important}}", Cs = () => {
	let e = fn(), { isOpen: t, isExpanded: n } = U(Mn("isOpen", "isExpanded"));
	I(() => {
		let { root: e } = Ba.get();
		e && !t && (delete e.dataset.expanded, delete document.body.dataset.vlibrasExpanded);
	}, [t]);
	let r = () => {
		Wn(Ss, "@expanded-mode.style");
		let { root: e } = Ba.get(), { isExpanded: t } = W.get();
		if (!e) return;
		let n = !t;
		W.set({ isExpanded: n }), n && Wo.trackEvent("expanded");
	}, i = n ? "Diminuir" : "Expandir";
	return /* @__PURE__ */ Z(us, {
		className: "whitespace-nowrap",
		offset: 2,
		content: i,
		placement: "bottom",
		align: "end",
		arrow: { position: "top-right" },
		visualOnly: !0,
		children: /* @__PURE__ */ Z(Q, {
			onClick: r,
			className: "z-1",
			"aria-label": i,
			size: e ? "icon-sm" : "icon",
			variant: "default",
			children: /* @__PURE__ */ Z($, { name: n ? "collapse" : "expand" })
		})
	});
}, ws = ({ label: e, onClick: t, icon: n }) => {
	let r = fn();
	return /* @__PURE__ */ Z("div", {
		role: "presentation",
		className: Y("flex w-auto animate-move-left items-center gap-1", "[&_button]:rounded-full [&_button]:border-border [&_button]:bg-background [&_button]:shadow-md [&_button]:hover:bg-muted"),
		children: [/* @__PURE__ */ Z(Q, {
			role: "menuitem",
			onClick: t,
			"aria-label": e,
			size: r ? "icon-sm" : "icon",
			variant: "outline-gov",
			children: n && /* @__PURE__ */ Z($, {
				name: n,
				className: "mobile:size-5 size-5.5"
			})
		}), /* @__PURE__ */ Z("span", {
			"aria-hidden": "true",
			className: "flex h-7 w-fit items-center justify-center whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-1 text-xs shadow-md",
			children: e
		})]
	});
}, Ts = Wt(() => import("./translator-CIIJmt0B.js").then((e) => ({ default: e.TranslatorDialog }))), Es = () => {
	let e = fn(), t = Ha((e) => e.open), n = no((e) => e.onOpenChange), [r, i] = F();
	return /* @__PURE__ */ Z(k, { children: [/* @__PURE__ */ Z(os, {
		showOverlay: !1,
		className: "dropdown-bottom",
		children: [/* @__PURE__ */ Z(ss, { children: /* @__PURE__ */ Z(Q, {
			id: "header-menu-button",
			tabindex: 0,
			"aria-label": "Menu de opções",
			size: e ? "icon-sm" : "icon",
			variant: "default",
			children: /* @__PURE__ */ Z($, { name: "menu" })
		}) }), /* @__PURE__ */ Z(cs, {
			className: "mt-4 space-y-1 [&_button]:dark:text-secondary-foreground",
			children: [
				/* @__PURE__ */ Z(ws, {
					onClick: () => i(!0),
					label: "Tradutor",
					icon: "translator"
				}),
				/* @__PURE__ */ Z(ws, {
					onClick: () => t("dictionary"),
					label: "Dicionário",
					icon: "dictionary"
				}),
				/* @__PURE__ */ Z(ws, {
					onClick: () => n(!0),
					label: "Guia Rápido",
					icon: "help"
				}),
				/* @__PURE__ */ Z(ws, {
					onClick: () => t("about"),
					label: "Sobre o VLibras",
					icon: "info"
				})
			]
		})]
	}), r !== void 0 && /* @__PURE__ */ Z(Ut, {
		fallback: /* @__PURE__ */ Z(Va, { className: "h-[80%]" }),
		children: /* @__PURE__ */ Z(Ts, {
			open: r,
			onOpenChange: i
		})
	})] });
}, Ds = () => {
	let e = fn(), t = U((e) => e.setOpen), n = no((e) => e.open);
	return /* @__PURE__ */ Z("div", {
		className: "relative bottom-auto z-50 bg-primary px-2 py-1.5",
		children: [
			/* @__PURE__ */ Z($o, {}),
			/* @__PURE__ */ Z("div", {
				inert: n,
				className: "pointer-events-none flex w-full items-center justify-between gap-1 **:data-[highlight=true]:animate-highlight-primary-foreground [&_button]:pointer-events-auto",
				children: [
					/* @__PURE__ */ Z(Es, {}),
					/* @__PURE__ */ Z("div", {
						className: "mr-2 ml-1",
						children: /* @__PURE__ */ Z("span", { className: "absolute inset-y-0 w-px bg-primary-foreground/30" })
					}),
					/* @__PURE__ */ Z("div", {
						className: "mr-2 flex items-center gap-1.5 font-semibold text-primary-foreground text-sm",
						children: [/* @__PURE__ */ Z("div", {
							className: "flex size-5.5 items-end justify-center rounded-full bg-primary-foreground text-primary",
							children: /* @__PURE__ */ Z($, {
								name: "icaro",
								className: "size-4.5"
							})
						}), "VLibras"]
					}),
					/* @__PURE__ */ Z(k, { children: [/* @__PURE__ */ Z(xs, { className: "w-full" }), /* @__PURE__ */ Z("div", {
						id: "header-actions",
						className: "flex items-center gap-1 [&_button]:not-hover:bg-transparent",
						children: [/* @__PURE__ */ Z(Cs, {}), /* @__PURE__ */ Z(Q, {
							onClick: () => {
								t(!1), xa();
							},
							"aria-label": "Fechar VLibras",
							size: e ? "icon-sm" : "icon",
							variant: "default",
							className: "z-1",
							children: /* @__PURE__ */ Z($, { name: "x" })
						})]
					})] })
				]
			}),
			/* @__PURE__ */ Z(lo, { className: "z-50" })
		]
	});
}, Os = {
	reopen: !1,
	draftValue: void 0
}, ks = on()(() => ({ ...Os })), As = {
	get: ks.getState,
	set: ks.setState
}, js = Wt(() => import("./feedback-DYeIQqlY.js").then((e) => ({ default: e.FeedbackDialog }))), Ms = () => {
	let [e, t] = F(), n = fn(), r = U((e) => e.isExpanded), i = no((e) => e.open), a = ks((e) => e.reopen);
	return I(() => void (a && t(!0)), [a]), i ? null : /* @__PURE__ */ Z(k, { children: [/* @__PURE__ */ Z(Q, {
		"aria-expanded": !!e,
		"aria-haspopup": "dialog",
		onClick: () => t(!0),
		className: "animate-move-up rounded-full bg-background! font-semibold text-primary hover:bg-muted!",
		variant: "outline",
		size: r ? "default" : n ? "xs" : "sm",
		children: [/* @__PURE__ */ Z($, { name: "like" }), "Avaliar"]
	}), e !== void 0 && /* @__PURE__ */ Z(Ut, {
		fallback: null,
		children: /* @__PURE__ */ Z(js, {
			open: e,
			onOpenChange: t
		})
	})] });
}, Ns = [
	{
		name: "icaro",
		path: "/icaro.webp",
		icon: "icaro"
	},
	{
		name: "hosana",
		path: "/hosana.webp",
		icon: "hosana"
	},
	{
		name: "guga",
		path: "/guga.webp",
		icon: "guga"
	}
], Ps = (e) => {
	let { path: t } = sn.getState();
	return `${t}/assets/images/avatars/${e}`;
}, Fs = () => {
	let e = V((e) => e.avatar), t = no((e) => e.open), n = no((e) => e.element?.selector === "#toggle-avatar-button"), r = U((e) => e.isExpanded), i = Ns.find(({ name: t }) => t === e) || Ns[0], a = (e) => {
		Ca(e), co.close(), Wo.trackEvent("avatar_selected", { avatar: e });
	};
	return /* @__PURE__ */ Z(os, {
		showOverlay: !1,
		open: t ? n : void 0,
		className: "dropdown-top dropdown-end z-1 h-9 animate-move-up [&_button]:shadow-md",
		children: [/* @__PURE__ */ Z(us, {
			className: "whitespace-nowrap",
			content: "Alterar avatar",
			placement: "top",
			align: "end",
			arrow: { position: "bottom-right" },
			disabled: t,
			visualOnly: !0,
			children: /* @__PURE__ */ Z(ss, { children: /* @__PURE__ */ Z(Q, {
				"aria-label": "Alterar avatar",
				id: "toggle-avatar-button",
				variant: "outline",
				size: "icon",
				className: Y("rounded-full bg-background text-primary hover:bg-muted! data-[highlight=true]:animate-highlight-primary", t && "pointer-events-none"),
				children: /* @__PURE__ */ Z($, {
					name: i.icon,
					className: "size-5.5"
				})
			}) })
		}), /* @__PURE__ */ Z(cs, { children: /* @__PURE__ */ Z("div", {
			role: "group",
			"aria-label": "Opções de avatar",
			className: "mb-2 space-y-2",
			children: Ns.filter(({ name: t }) => t !== e).map((e) => /* @__PURE__ */ Z("div", {
				role: "presentation",
				className: "flex animate-move-up items-center justify-end gap-1",
				children: [!(n && r) && /* @__PURE__ */ Z("span", {
					"aria-hidden": "true",
					className: "flex h-7 w-fit items-center justify-center whitespace-nowrap rounded-full border border-foreground/20 bg-background px-2.5 py-1 text-xs capitalize",
					children: e.name
				}), /* @__PURE__ */ Z(Q, {
					role: "menuitem",
					"aria-label": `Alterar avatar para ${e.name}`,
					onClick: () => a(e.name),
					variant: "outline",
					className: "rounded-full bg-background hover:bg-muted!",
					size: "icon",
					children: /* @__PURE__ */ Z("img", {
						src: Ps(e.path),
						alt: ""
					})
				})]
			}, e.name))
		}) })]
	});
}, Is = () => {
	let e = fn(), t = no((e) => e.open), { status: n, isGlossTranslated: r, ...i } = V(Mn("status", "isGlossTranslated", "isPlayingWelcome", "isWelcomeFinished")), { isExpanded: a, isTranslating: o, text: s } = U(Mn("isExpanded", "text", "isTranslating")), { action: c, content: l } = Eo(Mn("action", "content")), u = n === "playing", d = n === "paused", f = n === "idle";
	I(() => {
		if (!f) return;
		let { auto: e, action: t } = ko.get();
		e && t && (t(), Do());
	}, [f]);
	let p = () => {
		ko.get().action?.(), Do();
	}, m = () => {
		W.set({ text: void 0 }), ba();
	}, h = c && l && n === "idle", g = !!(n === "idle" && r && s), _ = i.isPlayingWelcome ? !0 : (u || d) && !t, v = i.isWelcomeFinished && (n === "idle" || t);
	return o ? null : /* @__PURE__ */ Z("div", {
		className: "absolute expanded:inset-x-4! inset-x-3 mobile:inset-x-2 bottom-15 expanded:bottom-16! mobile:bottom-13 flex animate-move-up items-end justify-end gap-1.5 [&_button]:dark:text-secondary-foreground",
		children: [/* @__PURE__ */ Z("div", {
			className: "mr-auto flex flex-wrap-reverse items-center gap-1.5",
			children: [h && /* @__PURE__ */ Z(Q, {
				onClick: p,
				variant: "outline",
				className: "animate-move-up rounded-full bg-background! font-semibold text-primary hover:bg-muted!",
				size: a ? "default" : e ? "xs" : "sm",
				children: l
			}), g && /* @__PURE__ */ Z(Ms, {})]
		}), /* @__PURE__ */ Z("div", {
			className: "ml-auto flex items-center gap-2",
			children: [_ && /* @__PURE__ */ Z(Q, {
				onClick: m,
				className: "animate-move-up rounded-full bg-background! font-semibold text-primary hover:bg-muted!",
				variant: "outline",
				size: a ? "default" : e ? "xs" : "sm",
				children: [/* @__PURE__ */ Z($, { name: "skip" }), "Pular"]
			}), v && /* @__PURE__ */ Z(Fs, {})]
		})]
	});
}, Ls = {
	onLoaded: () => {
		let e = window.VLibrasWidget?.avatar;
		e === "random" && (e = fo());
		let t = window.VLibrasWidget?.personalization, n = window.VLibrasWidget?.position?.toLowerCase() === "l" ? "left" : "right", { avatar: r, speed: i } = H.get();
		W.set({ position: n }), ha({
			baseUrl: _r.DICTIONARY_URL,
			personalizationUrl: t
		}), Sa(i);
		{
			let t = setTimeout(() => {
				Ca(e || r), _a(), clearTimeout(t);
			}, 500);
		}
	},
	onPlay: () => {
		let { screen: e, open: t } = Ua.get();
		e !== "main" && t("main"), W.set({ isPausedByUser: !1 });
	},
	onPlayStatic: () => {
		let { screen: e, open: t } = Ua.get();
		e !== "main" && t("main"), W.set({ isPausedByUser: !1 });
	},
	onWelcomeFinish: () => {
		let { showSubtitles: e } = H.get();
		wa(e);
	}
}, Rs = ({ className: e, ...t }) => {
	let n = Ha((e) => e.screen), r = Go(), { isLoaded: i, isMounted: a } = V(Mn("isLoaded", "isMounted"));
	return /* @__PURE__ */ Z("div", {
		...t,
		id: "vlibras-app-content",
		inert: n !== "main",
		ref: (e) => void (e && Ba.set({ appContent: e })),
		className: Y("flex flex-col", (!i || n !== "main") && "opacity-0", e),
		children: [/* @__PURE__ */ Z("div", {
			className: "contents",
			inert: r,
			children: [
				/* @__PURE__ */ Z(Ds, {}),
				a && /* @__PURE__ */ Z(So, {
					className: Y("mb-2 h-(--player-height) w-full", "max-h-[calc(100dvh-52px)]"),
					options: Ls
				}),
				/* @__PURE__ */ Z(Is, {}),
				/* @__PURE__ */ Z(bs, {})
			]
		}), /* @__PURE__ */ Z(Ko, {})]
	});
}, zs = () => /* @__PURE__ */ Z("div", {
	style: { opacity: `${U((e) => Number(e.opacity || 0) * 100)}%` },
	className: "sm:widget-radius absolute inset-0 -z-50 bg-[#f8f8f8] dark:bg-[#222222]"
}), Bs = () => {
	let e = V((e) => e.isLoaded);
	return Ke(() => e ? W.get().position : window.VLibrasWidget?.position?.toLowerCase() === "l" ? "left" : "right", [e]);
}, Vs = () => {
	let e = Ur();
	I(() => {
		let t = window, n = (t) => {
			let n = t.detail?.text?.trim();
			n && e.mutateAsync(n).then((e) => {
				ga(e || n);
			}).catch((e) => {
				console.error("Erro na tradução automática do Toyota Tech:", e);
			});
		};
		return t.__TOYOTA_VLIBRAS_BRIDGE_READY = !0, t.addEventListener("toyota-tech:vlibras:translate", n), () => {
			t.removeEventListener("toyota-tech:vlibras:translate", n), t.__TOYOTA_VLIBRAS_BRIDGE_READY = !1;
		};
	}, [e.mutateAsync]);
	let t = Ha((e) => e.screen), n = Bs(), { isOpen: r, isExpanded: i } = U(Mn("isOpen", "isExpanded")), a = U((e) => e.setOpen);
	return /* @__PURE__ */ Z(Qo, { children: ({ ref: e, hasMoved: o, pos: s, isDragging: c, reset: l }) => {
		let u = L(null), d = L(r);
		return I(() => void (!r && l()), [r]), I(() => {
			let e = d.current;
			d.current = r, r && !e ? requestAnimationFrame(() => u.current?.focus({ preventScroll: !0 })) : !r && e && Io();
		}, [r]), /* @__PURE__ */ Z("div", {
			id: "vlibras-app",
			inert: !r,
			onKeyDown: (e) => {
				e.key === "Escape" && (a(!1), xa());
			},
			style: { transform: o && r ? `translate3d(${s.x}px, ${s.y}px, 0)` : void 0 },
			className: Y("group/widget", oo({
				isDragging: c,
				isOpen: r,
				position: n,
				isExpanded: i,
				hasMoved: o
			}), !1),
			children: [
				/* @__PURE__ */ Z("section", {
					id: "vlibras-app-panel",
					tabIndex: -1,
					"aria-label": "Painel VLibras",
					onKeyDown: (e) => Fo(u.current, e),
					ref: (t) => {
						u.current = t, t && Ba.set({ appRoot: t }), typeof e == "function" ? e(t) : e && "current" in e && (e.current = t);
					},
					className: Y("widget-radius relative z-2147483647 h-fit expanded:w-full w-(--widget-width) overflow-hidden shadow-lg expanded:max-sm:rounded-none!", "group-has-[[data-slot=drag-handle]:focus-visible]/widget:outline-4 group-has-[[data-slot=drag-handle]:focus-visible]/widget:outline-primary", t !== "main" && "outline-2 outline-border outline-solid", !1),
					children: [
						/* @__PURE__ */ Z(Rs, {}),
						/* @__PURE__ */ Z(to, {}),
						/* @__PURE__ */ Z(zs, {}),
						/* @__PURE__ */ Z(lo, {})
					]
				}),
				/* @__PURE__ */ Z(ts, {}),
				/* @__PURE__ */ Z(ao, {})
			]
		});
	} });
}, Hs = "/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-rotate-x:initial;--tw-rotate-y:initial;--tw-rotate-z:initial;--tw-skew-x:initial;--tw-skew-y:initial;--tw-space-y-reverse:0;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-tracking:initial;--tw-outline-style:solid;--tw-blur:initial;--tw-brightness:initial;--tw-contrast:initial;--tw-grayscale:initial;--tw-hue-rotate:initial;--tw-invert:initial;--tw-opacity:initial;--tw-saturate:initial;--tw-sepia:initial;--tw-drop-shadow:initial;--tw-drop-shadow-color:initial;--tw-drop-shadow-alpha:100%;--tw-drop-shadow-size:initial;--tw-backdrop-blur:initial;--tw-backdrop-brightness:initial;--tw-backdrop-contrast:initial;--tw-backdrop-grayscale:initial;--tw-backdrop-hue-rotate:initial;--tw-backdrop-invert:initial;--tw-backdrop-opacity:initial;--tw-backdrop-saturate:initial;--tw-backdrop-sepia:initial;--tw-duration:initial;--tw-ease:initial;--tw-content:\"\";--tw-scale-x:1;--tw-scale-y:1;--tw-scale-z:1}}}@layer theme{:root,:host{--font-sans:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", \"Noto Sans\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";--font-mono:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;--color-orange-50:oklch(98% .016 73.684);--color-orange-500:oklch(70.5% .213 47.604);--color-orange-600:oklch(64.6% .222 41.116);--color-green-50:oklch(98.2% .018 155.826);--color-green-600:oklch(62.7% .194 149.214);--color-green-700:oklch(52.7% .154 150.069);--color-blue-50:oklch(97% .014 254.604);--color-blue-500:oklch(62.3% .214 259.815);--color-blue-600:oklch(54.6% .245 262.881);--color-black:#000;--color-white:#fff;--spacing:.25rem;--container-xs:20rem;--container-xl:36rem;--text-xs:.75rem;--text-xs--line-height:calc(1 / .75);--text-sm:.875rem;--text-sm--line-height:calc(1.25 / .875);--text-base:1rem;--text-base--line-height:calc(1.5 / 1);--font-weight-normal:400;--font-weight-medium:500;--font-weight-semibold:600;--font-weight-bold:700;--tracking-wide:.025em;--leading-normal:1.5;--radius-xs:.125rem;--radius-sm:.25rem;--radius-md:.375rem;--radius-lg:.5rem;--radius-xl:.75rem;--drop-shadow-sm:0 1px 2px #00000026;--drop-shadow-lg:0 4px 4px #00000026;--ease-in-out:cubic-bezier(.4, 0, .2, 1);--animate-spin:spin 1s linear infinite;--animate-pulse:pulse 2s cubic-bezier(.4, 0, .6, 1) infinite;--blur-sm:8px;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--default-font-family:var(--font-sans);--default-mono-font-family:var(--font-mono);--color-primary:var(--primary);--color-muted:var(--muted)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;tab-size:4;line-height:1.5;font-family:var(--default-font-family,-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", \"Noto Sans\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;-webkit-text-decoration:inherit;-webkit-text-decoration:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring:where(:not(iframe)){outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab, red, red)){::placeholder{color:color-mix(in oklab, currentcolor 50%, transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){appearance:button}::file-selector-button{appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}*{box-sizing:border-box;--tw-border-style:solid;border-style:solid;border-color:var(--border);outline-offset:calc(1px * -1);outline-color:var(--ring)}@supports (color:color-mix(in lab, red, red)){*{outline-color:color-mix(in oklab, var(--ring) 50%, transparent)}}:focus-visible{outline-style:var(--tw-outline-style);outline-width:2px;outline-color:var(--primary);--tw-outline-style:solid;outline-style:solid}:host{border-color:var(--border);fill:var(--foreground);color:var(--foreground)}}@layer components;@layer utilities{@layer daisyui.l1.l2.l3{.dropdown{position-area:var(--anchor-v,bottom) var(--anchor-h,span-right);display:inline-block;position:relative}.dropdown>:not(:has(~[class*=dropdown-content])):focus{--tw-outline-style:none;outline-style:none}@media (forced-colors:active){.dropdown>:not(:has(~[class*=dropdown-content])):focus{outline-offset:2px;outline:2px solid #0000}}.dropdown .dropdown-content{position:absolute}.dropdown.dropdown-close .dropdown-content,.dropdown:not(details,.dropdown-open,.dropdown-hover:hover,:focus-within) .dropdown-content,.dropdown.dropdown-hover:not(:hover) [tabindex]:first-child:focus:not(:focus-visible)~.dropdown-content{transform-origin:top;opacity:0;display:none;scale:.95}.dropdown[popover],.dropdown .dropdown-content{z-index:999}@media (prefers-reduced-motion:no-preference){.dropdown[popover],.dropdown .dropdown-content{transition-behavior:allow-discrete;transition-property:opacity,scale,display;transition-duration:.2s;transition-timing-function:cubic-bezier(.4,0,.2,1);animation:.2s dropdown}}@starting-style{.dropdown[popover],.dropdown .dropdown-content{opacity:0;scale:.95}}:is(.dropdown:not(.dropdown-close).dropdown-open,.dropdown:not(.dropdown-close):not(.dropdown-hover):focus,.dropdown:not(.dropdown-close):focus-within)>[tabindex]:first-child{pointer-events:none}:is(.dropdown:not(.dropdown-close).dropdown-open,.dropdown:not(.dropdown-close):not(.dropdown-hover):focus,.dropdown:not(.dropdown-close):focus-within) .dropdown-content,.dropdown:not(.dropdown-close).dropdown-hover:hover .dropdown-content{opacity:1;scale:1}.dropdown:is(details) summary::-webkit-details-marker{display:none}.dropdown:where([popover]){background:0 0}.dropdown[popover]{color:inherit;position:fixed}@supports not (position-area:bottom){.dropdown[popover]{margin:auto}.dropdown[popover].dropdown-close{transform-origin:top;opacity:0;display:none;scale:.95}.dropdown[popover].dropdown-open:not(:popover-open){transform-origin:top;opacity:0;display:none;scale:.95}.dropdown[popover]::backdrop{background-color:oklab(0% none none/.3)}}:is(.dropdown[popover].dropdown-close,.dropdown[popover]:not(.dropdown-open,:popover-open)){transform-origin:top;opacity:0;display:none;scale:.95}.toggle{border:var(--border) solid currentColor;color:var(--input-color);cursor:pointer;appearance:none;vertical-align:middle;webkit-user-select:none;-webkit-user-select:none;user-select:none;--radius-selector-max:calc(var(--radius-selector) + var(--radius-selector) + var(--radius-selector));border-radius:calc(var(--radius-selector) + min(var(--toggle-p), var(--radius-selector-max)) + min(var(--border), var(--radius-selector-max)));padding:var(--toggle-p);flex-shrink:0;grid-template-columns:0fr 1fr 1fr;place-content:center;display:inline-grid;position:relative;box-shadow:inset 0 1px}@supports (color:color-mix(in lab, red, red)){.toggle{box-shadow:0 1px color-mix(in oklab, currentColor calc(var(--depth) * 10%), #0000) inset}}.toggle{--input-color:var(--color-base-content);transition:color .3s,grid-template-columns .2s}@supports (color:color-mix(in lab, red, red)){.toggle{--input-color:color-mix(in oklab, var(--color-base-content) 50%, #0000)}}.toggle{--toggle-p:calc(var(--size) * .125);--size:calc(var(--size-selector,.25rem) * 6);width:calc((var(--size) * 2) - (var(--border) + var(--toggle-p)) * 2);height:var(--size)}.toggle>*{z-index:1;cursor:pointer;appearance:none;background-color:#0000;border:none;grid-column:2/span 1;grid-row-start:1;height:100%;padding:.125rem;transition:opacity .2s,rotate .4s}.toggle>:focus{--tw-outline-style:none;outline-style:none}@media (forced-colors:active){.toggle>:focus{outline-offset:2px;outline:2px solid #0000}}.toggle>:nth-child(2){color:var(--color-base-100);rotate:0deg}.toggle>:nth-child(3){color:var(--color-base-100);opacity:0;rotate:-15deg}.toggle:has(:checked)>:nth-child(2){opacity:0;rotate:15deg}.toggle:has(:checked)>:nth-child(3){opacity:1;rotate:0deg}.toggle:before{aspect-ratio:1;border-radius:var(--radius-selector);--tw-content:\"\";content:var(--tw-content);width:100%;height:100%;box-shadow:0 -1px oklch(0% 0 0 / calc(var(--depth) * .1)) inset, 0 8px 0 -4px oklch(100% 0 0 / calc(var(--depth) * .1)) inset, 0 1px currentColor;background-color:currentColor;grid-row-start:1;grid-column-start:2;transition:background-color .1s,translate .2s,inset-inline-start .2s;position:relative;inset-inline-start:0;translate:0}@supports (color:color-mix(in lab, red, red)){.toggle:before{box-shadow:0 -1px oklch(0% 0 0 / calc(var(--depth) * .1)) inset, 0 8px 0 -4px oklch(100% 0 0 / calc(var(--depth) * .1)) inset, 0 1px color-mix(in oklab, currentColor calc(var(--depth) * 10%), #0000)}}.toggle:before{background-size:auto, calc(var(--noise) * 100%);background-image:none, var(--fx-noise)}@media (forced-colors:active){.toggle:before{outline-style:var(--tw-outline-style);outline-offset:calc(1px * -1);outline-width:1px}}@media print{.toggle:before{outline-offset:-1rem;outline:.25rem solid}}.toggle:focus-visible{outline-offset:2px;outline:2px solid}.toggle:has(:focus-visible){outline-offset:2px;outline:2px solid}.toggle:checked,.toggle[aria-checked=true]{background-color:var(--color-base-100);--input-color:var(--color-base-content);grid-template-columns:1fr 1fr 0fr}.toggle:has(>input:checked){background-color:var(--color-base-100);--input-color:var(--color-base-content);grid-template-columns:1fr 1fr 0fr}:is(.toggle:checked,.toggle[aria-checked=true],.toggle:has(>input:checked)):before{background-color:currentColor}@starting-style{:is(.toggle:checked,.toggle[aria-checked=true],.toggle:has(>input:checked)):before{opacity:0}}.toggle:indeterminate{grid-template-columns:.5fr 1fr .5fr}.toggle:disabled{cursor:not-allowed;opacity:.3}.toggle:disabled:before{border:var(--border) solid currentColor;background-color:#0000}}.pointer-events-auto{pointer-events:auto}.pointer-events-none{pointer-events:none}.collapse{visibility:collapse}.invisible{visibility:hidden}.visible{visibility:visible}.sr-only{clip-path:inset(50%);white-space:nowrap;border-width:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}.absolute{position:absolute}.fixed{position:fixed}.relative{position:relative}.static{position:static}.inset-0{inset:0}.inset-0\\!{inset:0!important}.inset-2{inset:calc(var(--spacing) * 2)}.inset-x-0{inset-inline:0}.inset-x-3{inset-inline:calc(var(--spacing) * 3)}.inset-x-4{inset-inline:calc(var(--spacing) * 4)}.inset-x-6{inset-inline:calc(var(--spacing) * 6)}.-inset-y-1{inset-block:calc(var(--spacing) * -1)}.inset-y-0{inset-block:0}@layer daisyui.l1.l2{.dropdown-center{--anchor-h:center}.dropdown-center :where(.dropdown-content){inset-inline-end:50%;translate:50%}[dir=rtl] :is(.dropdown-center :where(.dropdown-content)){translate:-50%}.dropdown-center.dropdown-left{--anchor-h:left;--anchor-v:center}.dropdown-center.dropdown-left .dropdown-content{top:auto;bottom:50%;translate:0 50%}.dropdown-center.dropdown-right{--anchor-h:right;--anchor-v:center}.dropdown-center.dropdown-right .dropdown-content{top:auto;bottom:50%;translate:0 50%}.dropdown-end{--anchor-h:span-left}.dropdown-end :where(.dropdown-content){inset-inline-end:0;translate:0}[dir=rtl] :is(.dropdown-end :where(.dropdown-content)){translate:0}.dropdown-end.dropdown-left{--anchor-h:left;--anchor-v:span-top}.dropdown-end.dropdown-left .dropdown-content{top:auto;bottom:0}.dropdown-end.dropdown-right{--anchor-h:right;--anchor-v:span-top}.dropdown-end.dropdown-right .dropdown-content{top:auto;bottom:0}.dropdown-bottom{--anchor-v:bottom}.dropdown-bottom .dropdown-content{transform-origin:top;top:100%;bottom:auto}.dropdown-top{--anchor-v:top}.dropdown-top .dropdown-content{transform-origin:bottom;top:auto;bottom:100%}.toggle-sm[type=checkbox]{--size:calc(var(--size-selector,.25rem) * 5)}.toggle-sm:has([type=checkbox]){--size:calc(var(--size-selector,.25rem) * 5)}}.-top-1\\.5{top:calc(var(--spacing) * -1.5)}.-top-1\\.75{top:calc(var(--spacing) * -1.75)}.-top-2{top:calc(var(--spacing) * -2)}.-top-2\\.5{top:calc(var(--spacing) * -2.5)}.-top-3\\.5{top:calc(var(--spacing) * -3.5)}.-top-4{top:calc(var(--spacing) * -4)}.-top-100\\!{top:calc(var(--spacing) * -100)!important}.top-0{top:0}.top-0\\!{top:0!important}.top-0\\.5{top:calc(var(--spacing) * .5)}.top-1{top:var(--spacing)}.top-1\\/2{top:50%}.top-2{top:calc(var(--spacing) * 2)}.top-4{top:calc(var(--spacing) * 4)}.top-auto{top:auto}.top-auto\\!{top:auto!important}.-right-1{right:calc(var(--spacing) * -1)}.-right-2\\.5{right:calc(var(--spacing) * -2.5)}.-right-3{right:calc(var(--spacing) * -3)}.-right-6{right:calc(var(--spacing) * -6)}.-right-200{right:calc(var(--spacing) * -200)}.right-0\\!{right:0!important}.right-0\\.5{right:calc(var(--spacing) * .5)}.right-1{right:var(--spacing)}.right-2{right:calc(var(--spacing) * 2)}.right-5{right:calc(var(--spacing) * 5)}.right-auto{right:auto}.right-auto\\!{right:auto!important}.-bottom-1{bottom:calc(var(--spacing) * -1)}.-bottom-1\\.5{bottom:calc(var(--spacing) * -1.5)}.-bottom-2{bottom:calc(var(--spacing) * -2)}.-bottom-2\\.5{bottom:calc(var(--spacing) * -2.5)}.-bottom-3\\.5{bottom:calc(var(--spacing) * -3.5)}.-bottom-4{bottom:calc(var(--spacing) * -4)}.-bottom-20\\!{bottom:calc(var(--spacing) * -20)!important}.-bottom-100\\!{bottom:calc(var(--spacing) * -100)!important}.-bottom-px{bottom:-1px}.bottom-0{bottom:0}.bottom-0\\!{bottom:0!important}.bottom-0\\.5{bottom:calc(var(--spacing) * .5)}.bottom-4{bottom:calc(var(--spacing) * 4)}.bottom-6\\.5\\!{bottom:calc(var(--spacing) * 6.5)!important}.bottom-8{bottom:calc(var(--spacing) * 8)}.bottom-15{bottom:calc(var(--spacing) * 15)}.bottom-16{bottom:calc(var(--spacing) * 16)}.bottom-auto{bottom:auto}.bottom-auto\\!{bottom:auto!important}.-left-1{left:calc(var(--spacing) * -1)}.-left-2\\.5{left:calc(var(--spacing) * -2.5)}.-left-3{left:calc(var(--spacing) * -3)}.-left-4{left:calc(var(--spacing) * -4)}.-left-200{left:calc(var(--spacing) * -200)}.left-0{left:0}.left-0\\!{left:0!important}.left-1\\/2{left:50%}.left-2{left:calc(var(--spacing) * 2)}.left-5{left:calc(var(--spacing) * 5)}.left-auto{left:auto}.left-auto\\!{left:auto!important}.-z-1{z-index:calc(1 * -1)}.-z-1\\!{z-index:calc(1 * -1)!important}.-z-2{z-index:calc(2 * -1)}.-z-10{z-index:calc(10 * -1)}.-z-50{z-index:calc(50 * -1)}.z-1{z-index:1}.z-50{z-index:50}.z-100{z-index:100}.z-999{z-index:999}.z-99999{z-index:99999}.z-999999{z-index:999999}.z-9999999{z-index:9999999}.z-2147483647{z-index:2147483647}.col-span-1\\!{grid-column:span 1/span 1!important}.container{width:100%}@media (width>=20rem){.container{max-width:20rem}}@media (width>=30rem){.container{max-width:30rem}}@media (width>=40rem){.container{max-width:40rem}}@media (width>=48rem){.container{max-width:48rem}}@media (width>=64rem){.container{max-width:64rem}}@media (width>=80rem){.container{max-width:80rem}}@media (width>=96rem){.container{max-width:96rem}}.-mx-2\\.5{margin-inline:calc(var(--spacing) * -2.5)}.mx-4{margin-inline:calc(var(--spacing) * 4)}.mx-auto{margin-inline:auto}.my-4{margin-block:calc(var(--spacing) * 4)}.-mt-0\\.5{margin-top:calc(var(--spacing) * -.5)}.-mt-2{margin-top:calc(var(--spacing) * -2)}.-mt-4{margin-top:calc(var(--spacing) * -4)}.-mt-13{margin-top:calc(var(--spacing) * -13)}.mt-0\\.75{margin-top:calc(var(--spacing) * .75)}.mt-1{margin-top:var(--spacing)}.mt-3\\.5{margin-top:calc(var(--spacing) * 3.5)}.mt-4{margin-top:calc(var(--spacing) * 4)}.mt-auto{margin-top:auto}.mt-auto\\!{margin-top:auto!important}.-mr-1{margin-right:calc(var(--spacing) * -1)}.mr-2{margin-right:calc(var(--spacing) * 2)}.mr-12\\!{margin-right:calc(var(--spacing) * 12)!important}.mr-auto{margin-right:auto}.-mb-1{margin-bottom:calc(var(--spacing) * -1)}.mb-1{margin-bottom:var(--spacing)}.mb-2{margin-bottom:calc(var(--spacing) * 2)}.mb-3{margin-bottom:calc(var(--spacing) * 3)}.mb-3\\.5{margin-bottom:calc(var(--spacing) * 3.5)}.mb-4{margin-bottom:calc(var(--spacing) * 4)}.-ml-2{margin-left:calc(var(--spacing) * -2)}.ml-1{margin-left:var(--spacing)}.ml-4{margin-left:calc(var(--spacing) * 4)}.ml-auto{margin-left:auto}.line-clamp-3{-webkit-line-clamp:3;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.block{display:block}.contents{display:contents}.flex{display:flex}.grid{display:grid}.hidden{display:none}.inline{display:inline}.inline-block{display:inline-block}.inline-flex{display:inline-flex}.table{display:table}.range-slider{height:calc(var(--spacing) * 2);cursor:pointer;appearance:none;border-radius:var(--radius-lg);width:100%}.range-slider::-moz-range-thumb{height:calc(var(--spacing) * 4)}.range-slider::-moz-range-thumb{width:calc(var(--spacing) * 4)}.range-slider::-moz-range-thumb{border-radius:2147483647px}.range-slider::-moz-range-thumb{--tw-border-style:none;border-style:none}.range-slider::-moz-range-thumb{background-color:var(--primary)}.range-slider::-moz-range-thumb{--tw-shadow:0 1px 3px 0 var(--tw-shadow-color,#0000001a), 0 1px 2px -1px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.range-slider::-webkit-slider-thumb{height:calc(var(--spacing) * 4)}.range-slider::-webkit-slider-thumb{width:calc(var(--spacing) * 4)}.range-slider::-webkit-slider-thumb{appearance:none}.range-slider::-webkit-slider-thumb{border-radius:2147483647px}.range-slider::-webkit-slider-thumb{background-color:var(--primary)}.range-slider::-webkit-slider-thumb{--tw-shadow:0 1px 3px 0 var(--tw-shadow-color,#0000001a), 0 1px 2px -1px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.size-0{width:0;height:0}.size-2{width:calc(var(--spacing) * 2);height:calc(var(--spacing) * 2)}.size-3{width:calc(var(--spacing) * 3);height:calc(var(--spacing) * 3)}.size-4{width:calc(var(--spacing) * 4);height:calc(var(--spacing) * 4)}.size-4\\.5{width:calc(var(--spacing) * 4.5);height:calc(var(--spacing) * 4.5)}.size-5{width:calc(var(--spacing) * 5);height:calc(var(--spacing) * 5)}.size-5\\.5{width:calc(var(--spacing) * 5.5);height:calc(var(--spacing) * 5.5)}.size-6{width:calc(var(--spacing) * 6);height:calc(var(--spacing) * 6)}.size-7{width:calc(var(--spacing) * 7);height:calc(var(--spacing) * 7)}.size-8{width:calc(var(--spacing) * 8);height:calc(var(--spacing) * 8)}.size-9{width:calc(var(--spacing) * 9);height:calc(var(--spacing) * 9)}.size-10{width:calc(var(--spacing) * 10);height:calc(var(--spacing) * 10)}.size-12{width:calc(var(--spacing) * 12);height:calc(var(--spacing) * 12)}.size-15{width:calc(var(--spacing) * 15);height:calc(var(--spacing) * 15)}.size-20{width:calc(var(--spacing) * 20);height:calc(var(--spacing) * 20)}.size-32{width:calc(var(--spacing) * 32);height:calc(var(--spacing) * 32)}.size-full{width:100%;height:100%}.h-\\(--player-height\\){height:var(--player-height)}.h-1\\.5{height:calc(var(--spacing) * 1.5)}.h-1\\/2{height:50%}.h-2{height:calc(var(--spacing) * 2)}.h-4{height:calc(var(--spacing) * 4)}.h-6{height:calc(var(--spacing) * 6)}.h-7{height:calc(var(--spacing) * 7)}.h-8{height:calc(var(--spacing) * 8)}.h-9{height:calc(var(--spacing) * 9)}.h-10{height:calc(var(--spacing) * 10)}.h-12{height:calc(var(--spacing) * 12)}.h-32{height:calc(var(--spacing) * 32)}.h-40{height:calc(var(--spacing) * 40)}.h-\\[80\\%\\]{height:80%}.h-auto{height:auto}.h-fit{height:fit-content}.h-full{height:100%}.h-min{height:min-content}.h-screen{height:100vh}.max-h-2{max-height:calc(var(--spacing) * 2)}.max-h-30{max-height:calc(var(--spacing) * 30)}.max-h-\\[70\\%\\]{max-height:70%}.max-h-\\[calc\\(100dvh-52px\\)\\]{max-height:calc(100dvh - 52px)}.max-h-full{max-height:100%}.min-h-32{min-height:calc(var(--spacing) * 32)}.min-h-40{min-height:calc(var(--spacing) * 40)}.min-h-px{min-height:1px}.w-\\(--widget-width\\){width:var(--widget-width)}.w-4{width:calc(var(--spacing) * 4)}.w-12{width:calc(var(--spacing) * 12)}.w-20{width:calc(var(--spacing) * 20)}.w-24{width:calc(var(--spacing) * 24)}.w-40{width:calc(var(--spacing) * 40)}.w-44{width:calc(var(--spacing) * 44)}.w-\\[calc\\(var\\(--widget-width\\)-1em\\)\\]{width:calc(var(--widget-width) - 1em)}.w-auto{width:auto}.w-auto\\!{width:auto!important}.w-dvw{width:100dvw}.w-fit{width:fit-content}.w-full{width:100%}.w-px{width:1px}.w-screen{width:100vw}.max-w-15{max-width:calc(var(--spacing) * 15)}.max-w-16{max-width:calc(var(--spacing) * 16)}.max-w-40{max-width:calc(var(--spacing) * 40)}.max-w-45{max-width:calc(var(--spacing) * 45)}.max-w-50{max-width:calc(var(--spacing) * 50)}.max-w-dvw{max-width:100dvw}.max-w-xs{max-width:var(--container-xs)}.min-w-0{min-width:0}.min-w-9{min-width:calc(var(--spacing) * 9)}.min-w-px{min-width:1px}.min-w-xs{min-width:var(--container-xs)}.flex-1{flex:1}.shrink-0{flex-shrink:0}.-translate-x-1\\/2{--tw-translate-x:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.-translate-x-full{--tw-translate-x:-100%;translate:var(--tw-translate-x) var(--tw-translate-y)}.translate-x-0{--tw-translate-x:0px;translate:var(--tw-translate-x) var(--tw-translate-y)}.translate-x-1\\/2{--tw-translate-x:calc(1 / 2 * 100%);translate:var(--tw-translate-x) var(--tw-translate-y)}.translate-x-full{--tw-translate-x:100%;translate:var(--tw-translate-x) var(--tw-translate-y)}.-translate-y-1\\/2{--tw-translate-y:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.-translate-y-full{--tw-translate-y:-100%;translate:var(--tw-translate-x) var(--tw-translate-y)}.translate-y-full{--tw-translate-y:100%;translate:var(--tw-translate-x) var(--tw-translate-y)}.translate-none\\!{translate:none!important}.-rotate-90{rotate:-90deg}.rotate-45{rotate:45deg}.rotate-90{rotate:90deg}.transform{transform:var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,)}.animate-move-down{animation:.2s ease-in-out move-down}.animate-move-left{animation:.2s ease-in-out move-left}.animate-move-right{animation:.2s ease-in-out move-right}.animate-move-up{animation:.2s ease-in-out move-up}.animate-pulse{animation:var(--animate-pulse)}.animate-scale{animation:.2s ease-in-out scale}.animate-spin{animation:var(--animate-spin)}.cursor-pointer{cursor:pointer}.touch-none{touch-action:none}.resize{resize:both}.resize-none{resize:none}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.flex-wrap-reverse{flex-wrap:wrap-reverse}.place-content-center{place-content:center}.items-center{align-items:center}.items-end{align-items:flex-end}.items-start{align-items:flex-start}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}.justify-start{justify-content:flex-start}.gap-1{gap:var(--spacing)}.gap-1\\.5{gap:calc(var(--spacing) * 1.5)}.gap-2{gap:calc(var(--spacing) * 2)}.gap-3{gap:calc(var(--spacing) * 3)}.gap-4{gap:calc(var(--spacing) * 4)}.gap-5{gap:calc(var(--spacing) * 5)}:where(.space-y-1>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(var(--spacing) * var(--tw-space-y-reverse));margin-block-end:calc(var(--spacing) * calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-2>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 2) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 2) * calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-4>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing) * 4) * var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-y-reverse)))}.gap-x-2{column-gap:calc(var(--spacing) * 2)}.gap-y-1{row-gap:var(--spacing)}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.rounded{border-radius:.25rem}.rounded-full{border-radius:2147483647px}.rounded-lg{border-radius:var(--radius-lg)}.rounded-md{border-radius:var(--radius-md)}.rounded-none\\!{border-radius:0!important}.rounded-sm{border-radius:var(--radius-sm)}.rounded-xl{border-radius:var(--radius-xl)}.rounded-xs{border-radius:var(--radius-xs)}.widget-radius{border-radius:var(--radius-xl)}.rounded-r-full{border-top-right-radius:2147483647px;border-bottom-right-radius:2147483647px}.border{border-style:var(--tw-border-style);border-width:1px}.border-6{border-style:var(--tw-border-style);border-width:6px}.border-8{border-style:var(--tw-border-style);border-width:8px}.border-t{border-top-style:var(--tw-border-style);border-top-width:1px}.border-t-0{border-top-style:var(--tw-border-style);border-top-width:0}.border-r-0{border-right-style:var(--tw-border-style);border-right-width:0}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-b-0{border-bottom-style:var(--tw-border-style);border-bottom-width:0}.border-l{border-left-style:var(--tw-border-style);border-left-width:1px}.border-l-0{border-left-style:var(--tw-border-style);border-left-width:0}.border-l-2{border-left-style:var(--tw-border-style);border-left-width:2px}.border-none{--tw-border-style:none;border-style:none}.border-blue-500{border-color:var(--color-blue-500)}.border-border,.border-border\\/30{border-color:var(--border)}@supports (color:color-mix(in lab, red, red)){.border-border\\/30{border-color:color-mix(in oklab, var(--border) 30%, transparent)}}.border-border\\/40{border-color:var(--border)}@supports (color:color-mix(in lab, red, red)){.border-border\\/40{border-color:color-mix(in oklab, var(--border) 40%, transparent)}}.border-destructive{border-color:var(--destructive)}.border-foreground\\/10{border-color:var(--foreground)}@supports (color:color-mix(in lab, red, red)){.border-foreground\\/10{border-color:color-mix(in oklab, var(--foreground) 10%, transparent)}}.border-foreground\\/20{border-color:var(--foreground)}@supports (color:color-mix(in lab, red, red)){.border-foreground\\/20{border-color:color-mix(in oklab, var(--foreground) 20%, transparent)}}.border-green-700{border-color:var(--color-green-700)}.border-orange-500{border-color:var(--color-orange-500)}.border-primary,.border-primary\\/20{border-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.border-primary\\/20{border-color:color-mix(in oklab, var(--primary) 20%, transparent)}}.border-primary\\/30{border-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.border-primary\\/30{border-color:color-mix(in oklab, var(--primary) 30%, transparent)}}.border-transparent{border-color:#0000}.border-t-primary{border-top-color:var(--primary)}.border-r-primary{border-right-color:var(--primary)}.border-b-primary{border-bottom-color:var(--primary)}.border-l-primary{border-left-color:var(--primary)}.bg-\\[\\#f8f8f8\\]{background-color:#f8f8f8}.bg-accent{background-color:var(--accent)}.bg-background{background-color:var(--background)}.bg-background\\!{background-color:var(--background)!important}.bg-black\\/5{background-color:#0000000d}@supports (color:color-mix(in lab, red, red)){.bg-black\\/5{background-color:color-mix(in oklab, var(--color-black) 5%, transparent)}}.bg-black\\/20{background-color:#0003}@supports (color:color-mix(in lab, red, red)){.bg-black\\/20{background-color:color-mix(in oklab, var(--color-black) 20%, transparent)}}.bg-blue-500{background-color:var(--color-blue-500)}.bg-blue-600{background-color:var(--color-blue-600)}.bg-border{background-color:var(--border)}.bg-destructive{background-color:var(--destructive)}.bg-foreground,.bg-foreground\\/10{background-color:var(--foreground)}@supports (color:color-mix(in lab, red, red)){.bg-foreground\\/10{background-color:color-mix(in oklab, var(--foreground) 10%, transparent)}}.bg-green-600{background-color:var(--color-green-600)}.bg-green-700{background-color:var(--color-green-700)}.bg-muted{background-color:var(--muted)}.bg-orange-500{background-color:var(--color-orange-500)}.bg-orange-600{background-color:var(--color-orange-600)}.bg-popover{background-color:var(--popover)}.bg-primary{background-color:var(--primary)}.bg-primary\\!{background-color:var(--primary)!important}.bg-primary-foreground,.bg-primary-foreground\\/30{background-color:var(--primary-foreground)}@supports (color:color-mix(in lab, red, red)){.bg-primary-foreground\\/30{background-color:color-mix(in oklab, var(--primary-foreground) 30%, transparent)}}.bg-primary\\/10{background-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.bg-primary\\/10{background-color:color-mix(in oklab, var(--primary) 10%, transparent)}}.bg-primary\\/15{background-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.bg-primary\\/15{background-color:color-mix(in oklab, var(--primary) 15%, transparent)}}.bg-primary\\/20{background-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.bg-primary\\/20{background-color:color-mix(in oklab, var(--primary) 20%, transparent)}}.bg-secondary{background-color:var(--secondary)}.bg-success{background-color:var(--success)}.bg-transparent{background-color:#0000}.bg-transparent\\!{background-color:#0000!important}.bg-white{background-color:var(--color-white)}.object-contain{object-fit:contain}.object-center{object-position:center}.p-0{padding:0}.p-0\\.5{padding:calc(var(--spacing) * .5)}.p-0\\.75\\!{padding:calc(var(--spacing) * .75)!important}.p-1{padding:var(--spacing)}.p-1\\.5{padding:calc(var(--spacing) * 1.5)}.p-2{padding:calc(var(--spacing) * 2)}.p-2\\.5{padding:calc(var(--spacing) * 2.5)}.p-3{padding:calc(var(--spacing) * 3)}.p-4{padding:calc(var(--spacing) * 4)}.p-6{padding:calc(var(--spacing) * 6)}.px-1{padding-inline:var(--spacing)}.px-1\\.5{padding-inline:calc(var(--spacing) * 1.5)}.px-2{padding-inline:calc(var(--spacing) * 2)}.px-2\\.5{padding-inline:calc(var(--spacing) * 2.5)}.px-3{padding-inline:calc(var(--spacing) * 3)}.px-3\\.5{padding-inline:calc(var(--spacing) * 3.5)}.px-4{padding-inline:calc(var(--spacing) * 4)}.px-4\\.5{padding-inline:calc(var(--spacing) * 4.5)}.px-6{padding-inline:calc(var(--spacing) * 6)}.px-7{padding-inline:calc(var(--spacing) * 7)}.py-0{padding-block:0}.py-1{padding-block:var(--spacing)}.py-1\\.5{padding-block:calc(var(--spacing) * 1.5)}.py-1\\.25{padding-block:calc(var(--spacing) * 1.25)}.py-2{padding-block:calc(var(--spacing) * 2)}.py-3{padding-block:calc(var(--spacing) * 3)}.py-3\\.5{padding-block:calc(var(--spacing) * 3.5)}.py-4{padding-block:calc(var(--spacing) * 4)}.py-10{padding-block:calc(var(--spacing) * 10)}.pt-2{padding-top:calc(var(--spacing) * 2)}.pr-2{padding-right:calc(var(--spacing) * 2)}.pr-3{padding-right:calc(var(--spacing) * 3)}.pr-4{padding-right:calc(var(--spacing) * 4)}.pr-8{padding-right:calc(var(--spacing) * 8)}.pb-0{padding-bottom:0}.pb-1{padding-bottom:var(--spacing)}.pb-5{padding-bottom:calc(var(--spacing) * 5)}.pl-4{padding-left:calc(var(--spacing) * 4)}.text-center{text-align:center}.text-left{text-align:left}.text-right{text-align:right}.text-base{font-size:var(--text-base);line-height:var(--tw-leading,var(--text-base--line-height))}.text-sm{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.text-xs{font-size:var(--text-xs);line-height:var(--tw-leading,var(--text-xs--line-height))}.text-\\[0\\.7em\\]{font-size:.7em}.leading-none{--tw-leading:1;line-height:1}.leading-normal{--tw-leading:var(--leading-normal);line-height:var(--leading-normal)}.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.font-medium{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}.font-normal{--tw-font-weight:var(--font-weight-normal);font-weight:var(--font-weight-normal)}.font-semibold{--tw-font-weight:var(--font-weight-semibold);font-weight:var(--font-weight-semibold)}.tracking-wide{--tw-tracking:var(--tracking-wide);letter-spacing:var(--tracking-wide)}.break-anywhere{overflow-wrap:anywhere}.break-all{word-break:break-all}.whitespace-normal{white-space:normal}.whitespace-nowrap{white-space:nowrap}.text-background{color:var(--background)}.text-black{color:var(--color-black)}.text-blue-50{color:var(--color-blue-50)}.text-current{color:currentColor}.text-destructive{color:var(--destructive)}.text-destructive-foreground{color:var(--destructive-foreground)}.text-foreground{color:var(--foreground)}.text-green-50{color:var(--color-green-50)}.text-muted-foreground{color:var(--muted-foreground)}.text-orange-50{color:var(--color-orange-50)}.text-popover-foreground{color:var(--popover-foreground)}.text-primary{color:var(--primary)}.text-primary-foreground{color:var(--primary-foreground)}.text-primary-foreground\\!{color:var(--primary-foreground)!important}.text-secondary{color:var(--secondary)}.text-secondary-foreground{color:var(--secondary-foreground)}.text-success-foreground{color:var(--success-foreground)}.capitalize{text-transform:capitalize}.lowercase{text-transform:lowercase}.uppercase{text-transform:uppercase}.italic{font-style:italic}.underline{text-decoration-line:underline}.opacity-0{opacity:0}.opacity-15{opacity:.15}.opacity-50{opacity:.5}.shadow{--tw-shadow:0 1px 3px 0 var(--tw-shadow-color,#0000001a), 0 1px 2px -1px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.shadow-2xl{--tw-shadow:0 25px 50px -12px var(--tw-shadow-color,#00000040);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.shadow-lg{--tw-shadow:0 10px 15px -3px var(--tw-shadow-color,#0000001a), 0 4px 6px -4px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.shadow-md{--tw-shadow:0 4px 6px -1px var(--tw-shadow-color,#0000001a), 0 2px 4px -2px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.outline,.outline-1{outline-style:var(--tw-outline-style);outline-width:1px}.outline-2{outline-style:var(--tw-outline-style);outline-width:2px}.outline-border{outline-color:var(--border)}.outline-destructive{outline-color:var(--destructive)}.outline-destructive-foreground{outline-color:var(--destructive-foreground)}.outline-primary{outline-color:var(--primary)}.outline-primary-foreground{outline-color:var(--primary-foreground)}.blur{--tw-blur:blur(8px);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.brightness-85{--tw-brightness:brightness(85%);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.drop-shadow{--tw-drop-shadow-size:drop-shadow(0 1px 2px var(--tw-drop-shadow-color,#0000001a)) drop-shadow(0 1px 1px var(--tw-drop-shadow-color,#0000000f));--tw-drop-shadow:drop-shadow(0 1px 2px #0000001a) drop-shadow(0 1px 1px #0000000f);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.drop-shadow-lg{--tw-drop-shadow-size:drop-shadow(0 4px 4px var(--tw-drop-shadow-color,#00000026));--tw-drop-shadow:drop-shadow(var(--drop-shadow-lg));filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.drop-shadow-sm{--tw-drop-shadow-size:drop-shadow(0 1px 2px var(--tw-drop-shadow-color,#00000026));--tw-drop-shadow:drop-shadow(var(--drop-shadow-sm));filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.filter{filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.backdrop-blur-sm{--tw-backdrop-blur:blur(var(--blur-sm));-webkit-backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)}.transition{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,opacity,box-shadow,transform,translate,scale,rotate,filter,-webkit-backdrop-filter,backdrop-filter,display,content-visibility,overlay,pointer-events;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[bottom\\]{transition-property:bottom;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[colors\\]{transition-property:colors;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[margin\\]{transition-property:margin;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[width\\]{transition-property:width;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-all{transition-property:all;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-none\\!{transition-property:none!important}.duration-150{--tw-duration:.15s;transition-duration:.15s}.duration-200{--tw-duration:.2s;transition-duration:.2s}.duration-500{--tw-duration:.5s;transition-duration:.5s}.ease-in-out{--tw-ease:var(--ease-in-out);transition-timing-function:var(--ease-in-out)}.outline-none\\!{--tw-outline-style:none!important;outline-style:none!important}.outline-solid{--tw-outline-style:solid;outline-style:solid}.\\[--player-height\\:calc\\(100dvh-52px\\)\\]{--player-height:calc(100dvh - 52px)}.\\[wasm\\:\\\"\\+n\\[3\\]\\+\\\"\\]{wasm:\"+n[3]+\"}:is(.\\*\\:z-10>*){z-index:10}:is(.\\*\\:leading-none>*){--tw-leading:1;line-height:1}:is(.\\*\\:text-background>*){color:var(--background)}:is(.\\*\\:text-blue-50>*){color:var(--color-blue-50)}:is(.\\*\\:text-destructive-foreground>*){color:var(--destructive-foreground)}:is(.\\*\\:text-green-50>*){color:var(--color-green-50)}:is(.\\*\\:text-orange-50>*){color:var(--color-orange-50)}:is(.\\*\\:text-primary-foreground>*){color:var(--primary-foreground)}:is(.\\*\\*\\:text-foreground *){color:var(--foreground)}.not-focus\\:outline-0:not(:focus){outline-style:var(--tw-outline-style);outline-width:0}@media (hover:hover){.group-hover\\:text-foreground:is(:where(.group):hover *){color:var(--foreground)}.group-hover\\:brightness-85:is(:where(.group):hover *){--tw-brightness:brightness(85%);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}}.group-has-\\[\\[data-slot\\=drag-handle\\]\\:focus-visible\\]\\/widget\\:opacity-100:is(:where(.group\\/widget):has([data-slot=drag-handle]:focus-visible) *){opacity:1}.group-has-\\[\\[data-slot\\=drag-handle\\]\\:focus-visible\\]\\/widget\\:outline-4:is(:where(.group\\/widget):has([data-slot=drag-handle]:focus-visible) *){outline-style:var(--tw-outline-style);outline-width:4px}.group-has-\\[\\[data-slot\\=drag-handle\\]\\:focus-visible\\]\\/widget\\:outline-primary:is(:where(.group\\/widget):has([data-slot=drag-handle]:focus-visible) *){outline-color:var(--primary)}.group-data-\\[state\\=close\\]\\:-mb-100:is(:where(.group)[data-state=close] *){margin-bottom:calc(var(--spacing) * -100)}.placeholder\\:text-sm::placeholder{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.placeholder\\:text-muted-foreground::placeholder{color:var(--muted-foreground)}.placeholder\\:normal-case::placeholder{text-transform:none}.before\\:size-4:before{content:var(--tw-content);width:calc(var(--spacing) * 4);height:calc(var(--spacing) * 4)}.before\\:rounded-full:before{content:var(--tw-content);border-radius:2147483647px}.not-checked\\:before\\:bg-background:not(:checked):before{content:var(--tw-content);background-color:var(--background)}.checked\\:bg-primary:checked{background-color:var(--primary)}.checked\\:text-primary-foreground:checked{color:var(--primary-foreground)}.focus-within\\:pointer-events-auto:focus-within{pointer-events:auto}.focus-within\\:visible:focus-within{visibility:visible}@media (hover:hover){.hover\\:cursor-pointer:hover{cursor:pointer}.hover\\:bg-accent:hover{background-color:var(--accent)}.hover\\:bg-destructive\\/5:hover{background-color:var(--destructive)}@supports (color:color-mix(in lab, red, red)){.hover\\:bg-destructive\\/5:hover{background-color:color-mix(in oklab, var(--destructive) 5%, transparent)}}.hover\\:bg-foreground\\/5:hover{background-color:var(--foreground)}@supports (color:color-mix(in lab, red, red)){.hover\\:bg-foreground\\/5:hover{background-color:color-mix(in oklab, var(--foreground) 5%, transparent)}}.hover\\:bg-muted:hover{background-color:var(--muted)}.hover\\:bg-muted\\!:hover{background-color:var(--muted)!important}.hover\\:bg-primary-foreground\\/5:hover{background-color:var(--primary-foreground)}@supports (color:color-mix(in lab, red, red)){.hover\\:bg-primary-foreground\\/5:hover{background-color:color-mix(in oklab, var(--primary-foreground) 5%, transparent)}}.hover\\:bg-primary\\/5:hover{background-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.hover\\:bg-primary\\/5:hover{background-color:color-mix(in oklab, var(--primary) 5%, transparent)}}.hover\\:bg-primary\\/10:hover{background-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.hover\\:bg-primary\\/10:hover{background-color:color-mix(in oklab, var(--primary) 10%, transparent)}}.hover\\:bg-primary\\/15:hover{background-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.hover\\:bg-primary\\/15:hover{background-color:color-mix(in oklab, var(--primary) 15%, transparent)}}.hover\\:bg-primary\\/20:hover{background-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.hover\\:bg-primary\\/20:hover{background-color:color-mix(in oklab, var(--primary) 20%, transparent)}}.hover\\:text-destructive:hover{color:var(--destructive)}.hover\\:text-foreground:hover{color:var(--foreground)}.hover\\:text-primary:hover{color:var(--primary)}.hover\\:opacity-70:hover{opacity:.7}.hover\\:opacity-80:hover{opacity:.8}.hover\\:brightness-110:hover{--tw-brightness:brightness(110%);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.hover\\:brightness-115:hover{--tw-brightness:brightness(115%);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.hover\\:brightness-125:hover{--tw-brightness:brightness(125%);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.not-expanded\\:hover\\:cursor-move:not(:is(:host([data-expanded=true]) *)):hover{cursor:move}}.focus\\:bg-primary:focus{background-color:var(--primary)}.focus\\:text-destructive:focus{color:var(--destructive)}.focus\\:text-primary-foreground:focus{color:var(--primary-foreground)}.focus\\:outline-2:focus{outline-style:var(--tw-outline-style);outline-width:2px}.focus\\:outline-solid:focus{--tw-outline-style:solid;outline-style:solid}.active\\:bg-primary\\/20:active{background-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.active\\:bg-primary\\/20:active{background-color:color-mix(in oklab, var(--primary) 20%, transparent)}}:is(.has-\\[\\>\\[role\\=button\\]\\[aria-disabled\\=true\\]\\]\\:pointer-events-none:has(>[role=button][aria-disabled=true]),.has-\\[\\>button\\:disabled\\]\\:pointer-events-none:has(>button:disabled)){pointer-events:none}.data-\\[active\\=true\\]\\:bg-primary-foreground\\![data-active=true]{background-color:var(--primary-foreground)!important}.data-\\[highlight\\=true\\]\\:animate-highlight-primary[data-highlight=true]{--tw-scale-x:105%;--tw-scale-y:105%;--tw-scale-z:105%;scale:var(--tw-scale-x) var(--tw-scale-y);outline-style:var(--tw-outline-style);outline-width:2px;outline-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){.data-\\[highlight\\=true\\]\\:animate-highlight-primary[data-highlight=true]{outline-color:color-mix(in oklab, var(--primary) 50%, transparent)}}.data-\\[highlight\\=true\\]\\:animate-highlight-primary[data-highlight=true]{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration));--tw-outline-style:solid;outline-style:solid;animation:.5s ease-out infinite alternate-reverse highlight-shadow-primary}:is(.\\*\\*\\:data-\\[highlight\\=true\\]\\:animate-highlight-primary *)[data-highlight=true]{--tw-scale-x:105%;--tw-scale-y:105%;--tw-scale-z:105%;scale:var(--tw-scale-x) var(--tw-scale-y);outline-style:var(--tw-outline-style);outline-width:2px;outline-color:var(--primary)}@supports (color:color-mix(in lab, red, red)){:is(.\\*\\*\\:data-\\[highlight\\=true\\]\\:animate-highlight-primary *)[data-highlight=true]{outline-color:color-mix(in oklab, var(--primary) 50%, transparent)}}:is(.\\*\\*\\:data-\\[highlight\\=true\\]\\:animate-highlight-primary *)[data-highlight=true]{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration));--tw-outline-style:solid;outline-style:solid;animation:.5s ease-out infinite alternate-reverse highlight-shadow-primary}:is(.\\*\\*\\:data-\\[highlight\\=true\\]\\:animate-highlight-primary-foreground *)[data-highlight=true]{--tw-scale-x:105%;--tw-scale-y:105%;--tw-scale-z:105%;scale:var(--tw-scale-x) var(--tw-scale-y);outline-style:var(--tw-outline-style);outline-width:2px;outline-color:var(--primary-foreground);transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration));--tw-outline-style:solid;outline-style:solid;animation:.5s ease-out infinite alternate-reverse highlight-shadow-primary-foreground}:is(.focus-within\\:\\*\\*\\:data-\\[slot\\=tooltip-content\\]\\:hidden:focus-within *)[data-slot=tooltip-content]{display:none}@media not all and (width>=64rem){.max-lg\\:hidden{display:none}}@media not all and (width>=40rem){.max-sm\\:inset-x-0\\!{inset-inline:0!important}}@media (width>=40rem){.sm\\:size-8{width:calc(var(--spacing) * 8);height:calc(var(--spacing) * 8)}.sm\\:h-auto{height:auto}.sm\\:w-xl{width:var(--container-xl)}.sm\\:widget-radius{border-radius:var(--radius-xl)}.sm\\:\\[--player-height\\:800px\\]{--player-height:800px}@media (hover:hover){.sm\\:hover\\:cursor-move:hover{cursor:move}}}.dark\\:bg-\\[\\#222222\\]:is(:host(.dark) *){background-color:#222}.dark\\:bg-muted:is(:host(.dark) *){background-color:var(--muted)}.dark\\:text-foreground:is(:host(.dark) *){color:var(--foreground)}.dark\\:text-secondary-foreground:is(:host(.dark) *){color:var(--secondary-foreground)}.dark\\:text-white:is(:host(.dark) *){color:var(--color-white)}.dark\\:opacity-10:is(:host(.dark) *){opacity:.1}.expanded\\:inset-x-4\\!:is(:host([data-expanded=true]) *){inset-inline:calc(var(--spacing) * 4)!important}.expanded\\:bottom-16\\!:is(:host([data-expanded=true]) *){bottom:calc(var(--spacing) * 16)!important}.expanded\\:w-full:is(:host([data-expanded=true]) *){width:100%}.expanded\\:text-base\\!:is(:host([data-expanded=true]) *){font-size:var(--text-base)!important;line-height:var(--tw-leading,var(--text-base--line-height))!important}.expanded\\:text-sm:is(:host([data-expanded=true]) *){font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}@media not all and (width>=40rem){.expanded\\:max-sm\\:rounded-none\\!:is(:host([data-expanded=true]) *){border-radius:0!important}}@media (width<=640px){.mobile\\:inset-0:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){inset:0}.mobile\\:inset-x-2:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){inset-inline:calc(var(--spacing) * 2)}.mobile\\:bottom-13:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){bottom:calc(var(--spacing) * 13)}.mobile\\:-m-2:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){margin:calc(var(--spacing) * -2)}.mobile\\:mt-2:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){margin-top:calc(var(--spacing) * 2)}.mobile\\:mb-1:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){margin-bottom:var(--spacing)}.mobile\\:size-4:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){width:calc(var(--spacing) * 4);height:calc(var(--spacing) * 4)}.mobile\\:size-4\\.5:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){width:calc(var(--spacing) * 4.5);height:calc(var(--spacing) * 4.5)}.mobile\\:size-5:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){width:calc(var(--spacing) * 5);height:calc(var(--spacing) * 5)}.mobile\\:size-14:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){width:calc(var(--spacing) * 14);height:calc(var(--spacing) * 14)}.mobile\\:size-18:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){width:calc(var(--spacing) * 18);height:calc(var(--spacing) * 18)}.mobile\\:h-6:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){height:calc(var(--spacing) * 6)}.mobile\\:h-32:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){height:calc(var(--spacing) * 32)}.mobile\\:max-w-14:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){max-width:calc(var(--spacing) * 14)}.mobile\\:min-w-8:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){min-width:calc(var(--spacing) * 8)}.mobile\\:translate-none\\!:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){translate:none!important}.mobile\\:transform-none\\!:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){transform:none!important}.mobile\\:gap-y-0\\!:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){row-gap:0!important}.mobile\\:rounded-none\\!:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){border-radius:0!important}.mobile\\:border-none\\!:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){--tw-border-style:none!important;border-style:none!important}.mobile\\:px-3:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){padding-inline:calc(var(--spacing) * 3)}.mobile\\:py-2:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){padding-block:calc(var(--spacing) * 2)}.mobile\\:text-center:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){text-align:center}.mobile\\:text-sm:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}.mobile\\:text-xs:is(:host(:not([data-expanded=true]):not([data-extension=true])) *){font-size:var(--text-xs);line-height:var(--tw-leading,var(--text-xs--line-height))}}.\\[\\&_button\\]\\:pointer-events-auto button{pointer-events:auto}.\\[\\&_button\\]\\:z-1 button{z-index:1}.\\[\\&_button\\]\\:w-full button{width:100%}.\\[\\&_button\\]\\:rounded-full button{border-radius:2147483647px}.\\[\\&_button\\]\\:border-border button{border-color:var(--border)}.\\[\\&_button\\]\\:bg-background button{background-color:var(--background)}.\\[\\&_button\\]\\:bg-primary-foreground button{background-color:var(--primary-foreground)}.\\[\\&_button\\]\\:text-primary button{color:var(--primary)}.\\[\\&_button\\]\\:shadow-md button{--tw-shadow:0 4px 6px -1px var(--tw-shadow-color,#0000001a), 0 2px 4px -2px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.\\[\\&_button\\]\\:not-hover\\:bg-transparent button:not(:hover){background-color:#0000}@media not all and (hover:hover){.\\[\\&_button\\]\\:not-hover\\:bg-transparent button{background-color:#0000}}@media (hover:hover){.\\[\\&_button\\]\\:hover\\:bg-muted button:hover{background-color:var(--muted)}}.\\[\\&_button\\]\\:dark\\:text-secondary-foreground button:is(:host(.dark) *){color:var(--secondary-foreground)}.\\[\\&_span\\]\\:rounded-full span{border-radius:2147483647px}.\\[\\&_span\\]\\:bg-primary-foreground\\/30 span{background-color:var(--primary-foreground)}@supports (color:color-mix(in lab, red, red)){.\\[\\&_span\\]\\:bg-primary-foreground\\/30 span{background-color:color-mix(in oklab, var(--primary-foreground) 30%, transparent)}}.focus\\:\\[\\&_svg\\]\\:text-destructive:focus svg{color:var(--destructive)}:is(.\\*\\*\\:\\[\\[role\\=button\\]\\]\\:not-hover\\:bg-transparent *)[role=button]:not(:hover){background-color:#0000}@media not all and (hover:hover){:is(.\\*\\*\\:\\[\\[role\\=button\\]\\]\\:not-hover\\:bg-transparent *)[role=button]{background-color:#0000}}:is(.\\*\\*\\:\\[\\[role\\=button\\]\\]\\:dark\\:text-secondary-foreground *)[role=button]:is(:host(.dark) *){color:var(--secondary-foreground)}.\\[\\&\\>button\\]\\:h-10>button{height:calc(var(--spacing) * 10)}.\\[\\&\\>button\\]\\:w-full>button{width:100%}.\\[\\&\\>button\\]\\:flex-col>button{flex-direction:column}.\\[\\&\\>button\\]\\:rounded-full>button{border-radius:2147483647px}.\\[\\&\\>button\\]\\:text-muted-foreground>button{color:var(--muted-foreground)}@media (width<=640px){.mobile\\:\\[\\&\\>button\\]\\:text-sm:is(:host(:not([data-expanded=true]):not([data-extension=true])) *)>button{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}}.\\[\\&\\>div\\]\\:col-span-2>div{grid-column:span 2/span 2}.\\[\\&\\>div\\]\\:grid>div{display:grid}.\\[\\&\\>div\\]\\:grid-cols-subgrid>div{grid-template-columns:subgrid}.\\[\\&\\>div\\]\\:justify-items-center>div{justify-items:center}.\\[\\&\\>div\\]\\:rounded>div{border-radius:.25rem}.\\[\\&\\>i\\:not\\(\\[class\\*\\=\\'size-\\'\\]\\)\\]\\:size-4>i:not([class*=size-]){width:calc(var(--spacing) * 4);height:calc(var(--spacing) * 4)}.\\[\\&\\>i\\:not\\(\\[class\\*\\=\\'size-\\'\\]\\)\\]\\:size-4\\.5>i:not([class*=size-]){width:calc(var(--spacing) * 4.5);height:calc(var(--spacing) * 4.5)}.\\[\\&\\>i\\:not\\(\\[class\\*\\=\\'size-\\'\\]\\)\\]\\:size-5>i:not([class*=size-]){width:calc(var(--spacing) * 5);height:calc(var(--spacing) * 5)}.\\[\\&\\>i\\:not\\(\\[class\\*\\=\\'size-\\'\\]\\)\\]\\:size-5\\.25>i:not([class*=size-]){width:calc(var(--spacing) * 5.25);height:calc(var(--spacing) * 5.25)}.\\[\\&\\>i\\:not\\(\\[class\\*\\=\\'size-\\'\\]\\)\\]\\:size-6>i:not([class*=size-]){width:calc(var(--spacing) * 6);height:calc(var(--spacing) * 6)}.\\[\\&\\>i\\:not\\(\\[class\\*\\=\\'size-\\'\\]\\)\\]\\:size-6\\.5>i:not([class*=size-]){width:calc(var(--spacing) * 6.5);height:calc(var(--spacing) * 6.5)}.\\[\\&\\>svg\\]\\:shrink-0>svg{flex-shrink:0}}:host,[data-theme=light]{--background:oklch(100% 0 0);--foreground:oklch(30% 0 0);--primary:oklch(46.02% .169 260.07);--primary-foreground:oklch(100% 0 0);--popover:oklch(100% 0 0);--popover-foreground:oklch(14.5% 0 0);--secondary:oklch(33.15% .1141 259.88);--secondary-foreground:oklch(84.71% .0543 259.88);--muted:oklch(95% 0 0);--muted-foreground:oklch(55.6% 0 0);--accent:oklch(90% 0 0);--accent-foreground:oklch(20.5% 0 0);--destructive:oklch(63.7% .237 25.331);--destructive-foreground:oklch(98.5% 0 0);--success:oklch(54.834% .15401 147.965);--success-foreground:oklch(100% .00011 271.152);--border:oklch(91% 0 0);--input:oklch(91% 0 0);--ring:oklch(70.8% 0 0);--radius:10px;--spacing:4px;--font-sans:\"VLibrasWidget_Font\", sans-serif;--font-size:16px}:host(.dark),[data-theme=dark]{--background:oklch(17.76% 0 0);--foreground:oklch(95% 0 0);--primary:oklch(55.5% .169 260.07);--primary-foreground:oklch(100% 0 0);--popover:oklch(20% 0 0);--popover-foreground:oklch(98.5% 0 0);--secondary:oklch(33.15% .1141 259.88);--secondary-foreground:oklch(84.71% .0543 259.88);--muted:oklch(20.76% 0 0);--muted-foreground:oklch(70.8% 0 0);--accent:oklch(23.76% 0 0);--accent-foreground:oklch(98.5% 0 0);--destructive:oklch(63.7% .237 25.331);--destructive-foreground:oklch(98.5% 0 0);--border:oklch(26.9% 0 0);--input:oklch(26.9% 0 0);--ring:oklch(43.9% 0 0)}:host{--widget-width:260px;--player-height:328px}@media (width>=640px){:host{--widget-width:300px;--player-height:380px}}@keyframes scale{0%{transform:scale(0)}to{transform:scale(1)}}@keyframes move-left{0%{opacity:0;transform:translate(-20%)}to{opacity:1;transform:translate(0)}}@keyframes move-right{0%{opacity:0;transform:translate(20%)}to{opacity:1;transform:translate(0)}}@keyframes move-up{0%{opacity:0;transform:translateY(20%)}to{opacity:1;transform:translateY(0)}}@keyframes move-down{0%{opacity:0;transform:translateY(-20%)}to{opacity:1;transform:translateY(0)}}@keyframes highlight-shadow-primary{0%{box-shadow:0 0 #0000}to{box-shadow:0 0 10px 5px var(--primary)}}@keyframes highlight-shadow-primary-foreground{0%{box-shadow:0 0 #0000}to{box-shadow:0 0 15px var(--primary-foreground)}}@media (prefers-reduced-motion:reduce){:host,*{transition:none!important;animation:none!important}}:host{color:var(--foreground);font-size:var(--font-size)!important;font-family:var(--font-sans)!important;scrollbar-color:var(--foreground) transparent!important}@supports (color:color-mix(in lab, red, red)){:host{scrollbar-color:color-mix(in oklch, var(--foreground) 50%, transparent) transparent!important}}:host [data-highlight=true]{z-index:99999!important;border-radius:2147483647px!important}@keyframes dropdown{0%{opacity:0}}@property --tw-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:\"*\";inherits:false}@property --tw-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:\"*\";inherits:false}@property --tw-inset-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:\"*\";inherits:false}@property --tw-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:\"*\";inherits:false}@property --tw-inset-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:\"*\";inherits:false}@property --tw-ring-offset-width{syntax:\"<length>\";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:\"*\";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-translate-x{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-y{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-z{syntax:\"*\";inherits:false;initial-value:0}@property --tw-rotate-x{syntax:\"*\";inherits:false}@property --tw-rotate-y{syntax:\"*\";inherits:false}@property --tw-rotate-z{syntax:\"*\";inherits:false}@property --tw-skew-x{syntax:\"*\";inherits:false}@property --tw-skew-y{syntax:\"*\";inherits:false}@property --tw-space-y-reverse{syntax:\"*\";inherits:false;initial-value:0}@property --tw-border-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-leading{syntax:\"*\";inherits:false}@property --tw-font-weight{syntax:\"*\";inherits:false}@property --tw-tracking{syntax:\"*\";inherits:false}@property --tw-outline-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-blur{syntax:\"*\";inherits:false}@property --tw-brightness{syntax:\"*\";inherits:false}@property --tw-contrast{syntax:\"*\";inherits:false}@property --tw-grayscale{syntax:\"*\";inherits:false}@property --tw-hue-rotate{syntax:\"*\";inherits:false}@property --tw-invert{syntax:\"*\";inherits:false}@property --tw-opacity{syntax:\"*\";inherits:false}@property --tw-saturate{syntax:\"*\";inherits:false}@property --tw-sepia{syntax:\"*\";inherits:false}@property --tw-drop-shadow{syntax:\"*\";inherits:false}@property --tw-drop-shadow-color{syntax:\"*\";inherits:false}@property --tw-drop-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-drop-shadow-size{syntax:\"*\";inherits:false}@property --tw-backdrop-blur{syntax:\"*\";inherits:false}@property --tw-backdrop-brightness{syntax:\"*\";inherits:false}@property --tw-backdrop-contrast{syntax:\"*\";inherits:false}@property --tw-backdrop-grayscale{syntax:\"*\";inherits:false}@property --tw-backdrop-hue-rotate{syntax:\"*\";inherits:false}@property --tw-backdrop-invert{syntax:\"*\";inherits:false}@property --tw-backdrop-opacity{syntax:\"*\";inherits:false}@property --tw-backdrop-saturate{syntax:\"*\";inherits:false}@property --tw-backdrop-sepia{syntax:\"*\";inherits:false}@property --tw-duration{syntax:\"*\";inherits:false}@property --tw-ease{syntax:\"*\";inherits:false}@property --tw-content{syntax:\"*\";inherits:false;initial-value:\"\"}@property --tw-scale-x{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-y{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-z{syntax:\"*\";inherits:false;initial-value:1}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{50%{opacity:.5}}", Us = (e, t) => (t || document).querySelector(e), Ws = (e, t) => Array.from((t || document).querySelectorAll(e)), Gs = 16, Ks = (e) => e.replace(/(-?(?:\d+\.?\d*|\.\d+))rem\b/g, (e, t) => `${Number.parseFloat(t) * Gs}px`), qs = 50;
function Js(e) {
	let t = !1, n = () => {
		t || (t = !0, clearTimeout(r), e());
	}, r = setTimeout(n, qs);
	requestAnimationFrame(n);
}
function Ys(e, t) {
	if (e.querySelector("style[data-widget-styles]")) {
		t && Js(t);
		return;
	}
	let n = Ks(Hs.replace(/:root/g, ":host")), r = [], i = n.replace(/@property\s+[^{]+\{[^}]*\}/g, (e) => (r.push(e), ""));
	if (r.length > 0 && !document.head.querySelector("style[data-widget-properties]")) {
		let e = document.createElement("style");
		e.setAttribute("data-widget-properties", "true"), e.textContent = r.join("\n"), document.head.appendChild(e);
	}
	let a = document.createElement("style");
	a.setAttribute("data-widget-styles", "true"), a.textContent = i, t && Js(t), e.firstChild ? e.insertBefore(a, e.firstChild) : e.appendChild(a);
}
// src/widget/stores/use-tooltip.store.ts
var Xs = {
	event: null,
	isActive: !1,
	onClick: void 0,
	type: "button",
	element: null,
	listener: null,
	render: void 0
}, Zs = on()(() => ({ ...Xs })), Qs = {
	get: Zs.getState,
	set: Zs.setState,
	subscribe: Zs.subscribe
}, $s = 160, ec = 36, tc = 12, nc = 8, rc = 8, ic = 24, ac = ({ event: e, tooltip: t }) => {
	let n = t?.getBoundingClientRect(), r = n?.width || $s, i = n?.height || ec, a = e.clientY - tc - nc - i >= rc, o = e.clientY + tc + nc + i <= window.innerHeight - rc, s = a || !o ? "above" : "below", c = s === "above" ? e.pageY - tc - nc - i : e.pageY + tc + nc, l = window.innerWidth - r - rc, u = Math.min(Math.max(e.clientX - ic, rc), Math.max(l, rc)), d = e.clientX - ic > l, f = s === "above" ? d ? "bottom-right" : "bottom-left" : d ? "top-right" : "top-left";
	return {
		x: u + window.scrollX,
		y: c,
		arrow: f,
		placement: s
	};
}, oc = () => {
	let e = L(null), { type: t, event: n, onClick: r, isActive: i, render: a, element: o } = Zs(), [s, c] = F({
		x: 0,
		y: 0,
		arrow: "bottom-left",
		placement: "above"
	});
	return I(() => {
		let t = (t) => {
			e.current && !e.current.contains(t.target) && Qs.set({ isActive: !1 });
		}, n = (e) => {
			e.key === "Escape" && (e.stopPropagation(), Qs.set({ isActive: !1 }), o?.isConnected && o.focus({ preventScroll: !0 }));
		};
		return i ? (document.addEventListener("click", t), document.addEventListener("keydown", n), requestAnimationFrame(() => e.current?.focus({ preventScroll: !0 }))) : document.removeEventListener("click", t), () => {
			document.removeEventListener("click", t), document.removeEventListener("keydown", n);
		};
	}, [i, o]), I(() => {
		if (n && i && e.current) {
			c(ac({
				event: n,
				tooltip: e.current
			}));
			let t = e.current;
			t && (t.classList.remove("animate-scale"), t.offsetWidth, t.classList.add("animate-scale"));
		}
	}, [
		n,
		i,
		t,
		a
	]), /* @__PURE__ */ Z(Q, {
		ref: e,
		onClick: r,
		style: {
			left: s.x,
			top: s.y
		},
		className: Y("group absolute z-2147483647 h-9 animate-scale rounded-xl px-3 text-primary-foreground shadow-lg", !i && "hidden"),
		children: [
			a || /* @__PURE__ */ Z(k, { children: [/* @__PURE__ */ Z($, {
				name: t === "button" ? "touch" : "link",
				className: "size-5"
			}), /* @__PURE__ */ Z("span", {
				className: "relative bottom-0.5 whitespace-nowrap font-medium text-sm",
				children: t === "button" ? "Interagir" : "Acessar link"
			})] }),
			/* @__PURE__ */ Z("span", { className: "absolute inset-0 -z-1 rounded-xl bg-primary group-hover:brightness-85" }),
			/* @__PURE__ */ Z("span", { className: Y("absolute -z-2 size-4 -translate-x-1/2 rotate-45 rounded-sm bg-primary brightness-85", s.placement === "above" ? "-bottom-1.5" : "-top-1.5", s.arrow.endsWith("right") ? "right-2" : "left-5") })
		]
	});
}, sc = ({ children: e, root: t }) => {
	let { theme: n } = Ln();
	return I(() => {
		let e = t || document.documentElement;
		(e instanceof ShadowRoot ? e.host : e).classList.toggle("dark", n === "dark");
	}, [n, t]), e;
}, cc = () => {
	let e = L(null), t = L(null), n = U((e) => e.isOpen);
	return I(() => {
		let n = Us("#vlibras-access-wrapper")?.shadowRoot, r = n ? Us("#vlibras-access", n) : null;
		r && (e.current = r);
		let i = n ? Us("#vlibras-button", n) : null;
		i && (t.current = i);
	}, []), I(() => {
		e.current && (e.current.style.display = n ? "none" : "flex");
	}, [n]), I(() => {
		t.current?.setAttribute("aria-expanded", String(n));
	}, [n]), null;
}, lc = () => {
	let e = U((e) => e.isExpanded);
	I(() => pn.set({ isExpanded: e }), [e]);
}, uc = 3e5, dc = () => {
	let e = U((e) => e.isOpen);
	I(() => {
		if (e) {
			H.set({ isMounted: !0 });
			return;
		}
		let t = setTimeout(() => {
			H.get().reset(), H.set({ isMounted: !1 });
		}, uc);
		return () => clearTimeout(t);
	}, [e]);
}, fc = () => {
	let e = V((e) => e.status), { isTranslating: t, isExpanded: n, isOpen: r } = U(Mn("isTranslating", "isExpanded", "isOpen"));
	I(() => {
		let { root: t } = Ba.get();
		t && (t.dataset.status = e);
	}, [e]), I(() => {
		let { root: e } = Ba.get();
		e && (e.dataset.active = String(r));
	}, [r]), I(() => {
		let { root: e } = Ba.get();
		e && r && (n ? (e.dataset.expanded = "true", document.body.dataset.vlibrasExpanded = "true") : (delete e.dataset.expanded, delete document.body.dataset.vlibrasExpanded));
	}, [n, r]), I(() => {
		let e = document.documentElement;
		t ? e.dataset.vlibrasStatus = "translating" : delete e.dataset.vlibrasStatus;
	}, [t]);
}, pc = {
	light: {
		color: "black",
		outline: "black",
		shadow: "black"
	},
	dark: {
		color: "white",
		outline: "white",
		shadow: "black"
	}
}, mc = () => {
	let e = Ln((e) => e.theme), t = V((e) => e.isLoaded);
	return I(() => {
		if (!t) return;
		let n = pc[e];
		Da(n);
	}, [e, t]), I(() => {
		if (!t) return;
		let { showSubtitles: e } = H.get();
		wa(e);
	}, [t]), null;
}, hc = () => {
	let e = V((e) => e.isLoaded);
	I(() => {
		if (!e) return;
		let t = () => {
			let { appRoot: e } = Ba.get(), { isPausedByUser: t } = W.get(), { status: n } = H.get();
			if (Us("[data-slot='dialog-content']", e)) return;
			let r = document.visibilityState === "visible";
			(r || n === "playing") && (r && !t ? setTimeout(ga, 1e3) : xa());
		};
		return window.addEventListener("visibilitychange", t), () => window.removeEventListener("visibilitychange", t);
	}, [e]);
}, gc = "html body :not(.vlibras-ignore,.sr-only,.sr-only *,#vlibras-app-root,#vlibras-app-root *,#vlibras-app-wrapper,#vlibras-app-wrapper *).vlibras--hover{cursor:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAABuhJREFUeAHNWUtsVFUY/s+dtjNNSiCaFDCRzIJhJUqJDSUpdYjdQBeikJK4KuCGRKVLsCA0WFhK1ciKtiTGRGIFF+iGhgJdTAKRonHTknhDDK+NJZK003LP8XznzpnO45w793am0i+Z3Jm5j/M/vv91Ltt2Zq6XETtCEkLQGka0hkxg5KqjYP6RhEuCXMHEDOPinud4M7f7mibpfwZrG5i/LoVJU40gjTHJoRyJcSiWOdE4TssI1nYm+5e0ZJKWFWxcEL/C6cWNWnuJbRvI/mOlzfLAZYJdEQveYKa/0aUqISmUFfTSwMaJ00jmRMNFWiJesgJ5uMTZqaUoslIU0HA9Wng/Spw4tLKQjFH9XWnU4fRJESouV5oCGj1zDfN3207OJitdWHMKrYoz2vUmo1QzPkTrZWlsivvnnmeJHs0IevSM6Na0oLsP8N2+vDwjiyTrDYqNmtWBlg2MDrU76hgFN6cEXbrDlTIB6M/0xU+ZTlStwPrVjPq6ogteCijy1Ri3e4SzHpMnqlKgu9VRVtcUqRbP54guTHDlERNkhmopzVDOYnMWDRD8yLu1Ex5oShAd6XToYLs5t8gMdbk0Ozmqq4wICG9bZPqJoL3nX6iA1fjtQbQ8EfD85Gx84WThHw5jbIYiALQpffj000UBYcXHz3xOA1NSoU++9yoFaRmgRPfb5UowIXrbTs+m9W+HC+5SSCBgDxksc2x0kbdIo4BWCsoAUCwqsBbWLIMTy3vBYSSeUUh82mnm/K7NTAUfaKMF1dlEW34psYJnfdZlopJIay84DsVC9R1Ikx2pYmv8m6uB+6WrkUEu3fa9AKvdf+Jfoz1htGQIbJXrmlI0Y7H3cHQa5uvdEM+h/a3lltj3rUe//MGVpbDID3d4Pni1BxDU1cIU0JyJHhyd8X4ZxHretQDW25EqtwICeuAqV1bGIjqPa7rAI4W0WirghVIKYggDjZRqTFAgjWxVFkGGnufoqCeV9K+D0Jo2g2PFga2BtHr0J48+ltnpi6teUcq1Yffmci8Ih71Vhy8cAzixPbabOzbZ+Ys2omfYF6YU8NyWDURdcnHEy6XbIu+VQtx/6tHZD5zAOEmtNZ5LKwWwe4B8ZMO61RT4YNBnaIIXCT5yMKbcDmsri49yq6URJzACKru+v9TrG5vL75NG36IUSLxITMr+m2yolEGQhQotu0N6TBewsED8DE0IlZKhOJJA4bqvGWSQRF2jVFaBjAHbgko5HEG6o4BmN6e4ionRw3X09Yex/CfIk/o5eYWy9nMaTCugIMQ4VYFNzYsKoPruO+/RuTE/zaKYbQ3RbkNBUBL3p5rD1Y26/DfBbxAzN2gqFVbwwkZDkN3K9UOH2pnqjR5XqPkdKaesWOZlmDPfk5cYW4AY4UwXBY19GqZcDYDHCPLBseB4wHW7N9ut/tAsg1tkclkPzpmumn5CFYHc311SrZH/v5HcR3GrZP1KE53xfiHcuuI/zDTyC5N9AQgIL33UHlML6QYOlp96yvMpFsUIMWFCkPWBm9Pl9zFyJouk9XeSy7ORbVENUAfFCr3QQcn3Hw/H1KdFFrHBa/69/tzsX6/TI446WCu1G6Z5AgXY0CV5/aV/IYCCBhI0eihGXW84tCqxaElUZ3gEwsP6F3KeAK0A0EZbPihJ2BIAW+D3yhRQXjA0dxcmgr0A/m9cuyiI5r0WHl7Eb3wX5BsjtRap01cgqB8yDvky7WN325w3BS/zAjwQZSyEImf3xvJNGBTSE92jnDVBn0rFDdY3riucERyMCmT6GkdMsRC2cwRAK53T0QvB+t2tvsA6p6Norcpx30QhNICW9OvqPSL73qghFiBEJSqZgIIG6+shHVkNQQuhtVdM/dbQLUvxk1vx+muMLPj7+oD7eufn2INpK/z/z4dCJdQoO3HJV5mqsq80+b/vy4BHsOs23fQsGOq7jNFYbuZ4/ID+UUcBiGfr++fi83tKd+60F2x7Q6VQPC/gendr8H14/pDN0/N8Z+HPwCf54ybfaWoxsAgmrrAxEQaK89cChBd0qvS9WigebD+d3SMcumw6B+v2dsaMM3MUINAHrnoBLQcbyfQ1HCj7l0KibWC2Rzps2HYePO5utXeTNkBwWDwwRSPnH0/sNJ2KtBqUEOR8GfRadl1uuO/Y5KihBr/1UA+KwMJoDtEj/fq7CEFBs+WXpIBS4qx87SOc68v/cpx8zh+P9wddEvkdWeZYo5vINrTAMrR8cBlz0pWEB6qKPOUNjw3Lfb401QDqnZicScIIrlFd6shBKcLljjET6SVRSwapYHSlcT5+0d9gCI+aKFCI7WcW3hGcp6VAWyQ/kzKjJ0uC3sUkhWFEpubJRLb+56hCF+I/Ig4jzjnhUQQAAAAASUVORK5CYII=),pointer!important;text-decoration:underline!important}html body :not(.vlibras-ignore,.sr-only,.sr-only *,#vlibras-app-root,#vlibras-app-root *,#vlibras-app-wrapper,#vlibras-app-wrapper *).vlibras--hover[src],html body :not(.vlibras-ignore,.sr-only,.sr-only *,#vlibras-app-root,#vlibras-app-root *,#vlibras-app-wrapper,#vlibras-app-wrapper *).vlibras--hover img{cursor:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA0CAYAAADMk7uRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAB2BJREFUeAHNWktMVFcY/s8dYDCRygq0C4OJw6paMaXSBCxNbRNF01YNJF2BdGNf0nSjIlFi0VVTaRtdoTRpmmiKJWnowpQUgUQSjWBdFUwcWdTHphhMGAbuOT3fuZxhHuc+ZhjUL5ncO3PPved/fv9/zh2240ysjRE7QhJCUCkjKiUTGEXVUTDnSCJKgqKCiRnGxR3bsmdutq+doOcMVtMV/0sKU095gjTGBIdyJIag2FjHmiFaRbCaM/P3pSUraFXBhgTxfk6L1/PtJbaja/4/17BZHUSZYP1iwe4e61wTpRVChtC8oBcGNkScesc6in6iHPGCFUggSpydykWRl0UBjahNCx9lkycWvVyoCFHhuDTqpfqTIlBevmwKaDTHiuLjNSfnKvwG5j2ESsKMdm9lFCnDh2iDLI1rw861Z/NED2cEPXxKNDIlaHwa5+7TyyuySLI2r9zIWx2o2siotdZSx2wwPCnoyi2ulPFA51h7+JTpwooV2LCOUXtD9oKnA4p8P8jdPcJZs8kTK1KgsdpSVtchslI8ixH1jHLlERMkQ1WlM5S13JxlBwh+5N38CQ+sLSY6ssuiQ7VmbpEM9Vs6O1mqq8wSEN5tkqnHgg5cWFQJq3F7Ojue8Hh+xVx44WTyDxZjbIayAMIm/eFTT5YFhBUfPXViGpiUCn3xi+2XpBmAEo1vZCrBhGirOT1Xr79bXPAoBQQSttVgmWN9y3ELGgW0UlAGgGLZAnNhzgxYoYQXLEbiKQXEl7vMMb97C1PJh7DRgmo20ZbPJVfwrOMNplAS9doLlkWhQH0HaHJnJNUas0s1sEm6Ggxy5abjBVjt3mNnjPaE0ZIBsF3Oa6JoxkIf4GgVxQujAZ5DTdWZljh43qY/7nJlKUxy+RZPJK/2AJJ6pTAlNGeiGUdrqFMmsV7vugDWq4tkWgEJ3TXAlZUxieZxHS7wSHJY5Qp4IT0EsQhDGCnVmCDPMHKrskgy9DxH+2yppDMOQuuw6R5MTWwN0OrRqzZ9LtnpmwE7hXLdsGdLpheExV4vwAnHApzYh24376x0j1+0Ec2XHGHSAc9t20jUICdHvly5KRJeSca9Jzad3W955kmk3HitXimA3QPwkRvWryPPByN8Lo7yFMF7D4WU22FtZfE+7mpp5AmMgMqu70/3+uayzPuk0bcpBYoXiydk/01u8GMQsFCyZeukx3QBCwrkz8VRoSgZioMEkud91SCDDNRSpbJKZCywXeDH4UjSuqQwG57kKif6DhfQDx+HEh8vT+rnJBSad7+mwbQCCkIM0QpQWbasAKrvwQs2nRt0aBbFbHuAdhsKIiRxf6QsWN0oSJwJfp2YuUFTVOjjhc2GJBtZ6odaa5nqjR751PydESujWCZkiJnvSUiMLUAs4UyDvJZ9GiauBhDHSPLuQe98wLg9W9yt/q9ZhmiKyWU9OGcaNfWYfAHub0yr1uD/H2Xso7j5Wd9vRWe8X4hoQeoP5jByCpP7BBAQXvqkNqQm0g0cLD/5hCcoFsUIOWGCl/WB4anM+xhZEynSOjvJmWzkNqkGQgfFCr3QIRnvvx4OqU+VLGLdfzr3OutmZ7ymRxx1svq1G6b1BAqwoUuyO9N/QgJ5LUjQ6KEYNbxmUUnxsiVRneERCA/r9yx5AmEFIGy05b1Iwo0A2AK/k6GA8oKhuesZ9fYC4n9z+bIgOu618PAivuNckGOMSDmo01HAqx8yLvIl7WN328ybgmd4AR7IZlkIRc4eCCWaMCikV3QPl6yJ8PErbrC+cV5h9eJgVGCsfU2vKReCdo4AwkpzOnohWL+x2hFYczqKVslS7JtCCA2gC/1G9R6R+96oIRcghF8omYCCBuvrRTpYDUkLobVXTP3WxRGX4ie34vWpJ3e9dSb+nZC7AOm/Y0I0XWoxI5M3qFeCAn3VhleY2wZXVG4zbtJfPBXAJlIsHB837dzBevkWPBDifFPyqynfjqnm7FyF4Na46T1aw1a5O/deKGPFtRKgIPYM2zRgqj2CTo2dCKeEtu/7gbFjkqo4tZiutdblV3gAuQCjZIL1pgsPFFAA3OgI99d0zUklrEvpk6Xj/W/jkj2I2qQQTdWOIDKX1NirnxWq75/+vGCkxhvHi9QxuRgqgPNPhI1GDPyGxqFW3uLWsQK3H3AlPDD8j3vNeLtSFjcZfiVL1IlzfMyA5YvfcXtWIA9oQAmZE/LVqHXfdH3gbydusQmAVRl43BRiTW86ntn/YEGN6dhb4DFnUQt5IOt3ZMgJt2vj05wqy2UBq3QE9PJCvpC3l3wIH7QIszEuBXc8cXs6+6KXLbIKIS8gZIDIemcDGPE9shRGwDN5PP37YmJ8x778TJ13BU7sdaj1XHiRLmOX7pFzfTaWuq7o2Ed5QU4krv8gcu3rwrzXAQCvYvefX1Dnsm3wnCCnHMB/gnDsvmaryfKJ2ZisxCNOByrXDf1+43MLIctuQXshy33pwN3VSVT1kjsuvvIbl5MHQKXM4lVyEl8LZQtVKGXlZXFeFeT/RP8DlfZa3rLKpU0AAAAASUVORK5CYII=),pointer!important;text-decoration:none!important}@supports ((-webkit-hyphens:none)){html body :not(.vlibras-ignore,.sr-only,.sr-only *,#vlibras-app-root,#vlibras-app-root *,#vlibras-app-wrapper,#vlibras-app-wrapper *).vlibras--hover[src],html body :not(.vlibras-ignore,.sr-only,.sr-only *,#vlibras-app-root,#vlibras-app-root *,#vlibras-app-wrapper,#vlibras-app-wrapper *).vlibras--hover img{cursor:pointer!important}}@supports ((-webkit-hyphens:none)){html body :not(.vlibras-ignore,.sr-only,.sr-only *,#vlibras-app-root,#vlibras-app-root *,#vlibras-app-wrapper,#vlibras-app-wrapper *).vlibras--hover{cursor:pointer!important}}html body :not(.vlibras-ignore,.sr-only,.sr-only *,#vlibras-app-root,#vlibras-app-root *,#vlibras-app-wrapper,#vlibras-app-wrapper *).vlibras--active{text-decoration:underline!important}", _c = Array.from([document.body, ...document.body.children]), vc = Us("#vlibras-app-root"), yc = (e) => e.dataset.vlibrasGloss ? e.dataset.vlibrasGloss : Sc(e, ["IMG"]) ? e.alt : wc(e) ? e.value : Sc(e, ["SELECT"]) ? e.selectedOptions[0]?.innerText || "" : e.innerText.trim() || "", bc = (e) => {
	let t = e;
	for (; t && !_c.includes(t);) {
		if (Cc(t) || t.onclick && !Oc(t)) return t;
		t = t.parentNode;
	}
	return null;
}, xc = (e) => vc?.contains(e) || e.matches(".vlibras-links") ? !1 : kc(e) || bc(e) || wc(e) || Ec(e) || Dc(e), Sc = (e, t) => t.includes(e.tagName), Cc = (e) => Sc(e, ["A", "BUTTON"]), wc = (e) => Sc(e, "INPUT") && e.type === "submit", Tc = (e) => Sc(e, "BUTTON") || e.role === "button", Ec = (e) => Sc(e, "IMG") && e.alt && e.alt.trim(), Dc = (e) => Sc(e, "SELECT"), Oc = (e) => Sc(e, ["SVG", "PATH"]), kc = (e) => {
	let t = (e) => e.nodeType === Node.TEXT_NODE && e?.textContent?.trim();
	return Array.from(e.childNodes).some((e) => t(e));
}, Ac = (e) => {
	if (!e.parentElement) return;
	let t = Us("input", e.parentElement);
	t && ["radio", "checkbox"].includes(t.type) && (t.checked = !t.checked);
}, jc = (e, t) => {
	let n = null, r = 0;
	if (document.caretPositionFromPoint) {
		let i = document.caretPositionFromPoint(e, t);
		if (!i || !i.offsetNode) return null;
		n = i.offsetNode, r = i.offset;
	} else if (document.caretRangeFromPoint) {
		let i = document.caretRangeFromPoint(e, t);
		if (!i || !i.startContainer) return null;
		n = i.startContainer, r = i.startOffset;
	}
	if (!n || n.nodeType !== Node.TEXT_NODE) return null;
	let i = n.textContent ?? "";
	if (!i.trim()) return null;
	let a = i.slice(0, r), o = i.slice(r), s = a.match(/[\wÀ-ú’-]+$/), c = o.match(/^[\wÀ-ú’-]+/), l = `${s?.[0] ?? ""}${c?.[0] ?? ""}`;
	if (!l) return null;
	let u = r - (s?.[0]?.length ?? 0);
	return {
		word: l,
		node: n,
		offset: u
	};
}, Mc = (e) => {
	Ws(`span.${e}`)?.forEach((e) => {
		let t = e.parentNode;
		if (!t) return;
		let n = document.createTextNode(e.textContent || "");
		t.replaceChild(n, e), t.normalize();
	});
}, Nc = (e) => {
	Ws(`.${e}`)?.forEach((t) => t.classList.remove(e));
}, Pc = "__vlibrasSyntheticClick", Fc = ({ callback: e, isWordByWord: t, hoverClss: n, activeClass: r }) => {
	let i = (e) => {
		if (!n) return;
		let r = e.target;
		xc(r) && t && Sc(r, "IMG") || r.classList.add(n);
	}, a = (e) => {
		if (!t || !n) return;
		let r = e.target;
		if (!xc(r)) return;
		Mc(n);
		let { word: i, node: a, offset: o } = jc(e.clientX, e.clientY) || {};
		if (i && a && typeof o == "number") {
			let e = document.createRange();
			e.setStart(a, o), e.setEnd(a, o + i.length);
			let t = document.createElement("span");
			t.className = n, t.textContent = i, e.deleteContents(), e.insertNode(t);
		}
	}, o = (i) => {
		if (i[Pc]) return;
		let a = i.target, o = window.getSelection()?.toString().trim();
		if (Qs.set({ isActive: !1 }), r && Nc(r), r && !o && a.classList.add(r), !xc(a)) return;
		if (o && !t) return e?.({
			text: o,
			element: a
		});
		if (i.preventDefault(), i.stopPropagation(), t && n) {
			let t = Us(`.${n}`), r = t?.textContent?.trim();
			r && t && e?.({
				text: r,
				element: t
			});
		} else {
			let t = !!a.dataset.vlibrasGloss?.trim(), n = yc(a)?.trim();
			n && e?.({
				text: n,
				element: a,
				isGloss: t
			});
		}
		let s = a.tagName === "A" && a.href ? a : bc(a);
		s && c(s, i), Sc(a, "LABEL") ? Ac(a) : (Tc(a) || wc(a)) && c(a, i);
	}, s = (e) => {
		n && e.target.classList.remove(n);
	}, c = (e, t) => {
		let n = e.tagName === "A" && !!e.href;
		Qs.set({
			isActive: !0,
			event: t,
			type: n ? "link" : "button",
			element: e,
			onClick: () => {
				let t = new MouseEvent("click", {
					bubbles: !0,
					cancelable: !0
				});
				Object.defineProperty(t, Pc, { value: !0 }), e.dispatchEvent(t), Qs.set({ isActive: !1 });
			}
		});
	};
	return t ? document.body.addEventListener("mousemove", a) : (document.body.addEventListener("mouseover", i), document.body.addEventListener("mouseout", s)), document.body.addEventListener("click", o, !0), () => {
		document.body.removeEventListener("mousemove", a), document.body.removeEventListener("mouseover", i), document.body.removeEventListener("mouseout", s), document.body.removeEventListener("click", o, !0);
	};
}, Ic = () => {
	let e = V((e) => e.isLoaded), t = U((e) => e.isOpen), { mutateAsync: n } = Ur();
	I(() => {
		e && (t ? Wn(gc, "@text-capture.style") : Gn("@text-capture.style"));
	}, [t, e]), I(() => {
		if (!e) return;
		let r = Fc({
			hoverClss: "vlibras--hover",
			activeClass: "vlibras--active",
			callback: async ({ text: e, isGloss: t }) => {
				if (ba(), t) return ga(e);
				let r = await n(e);
				Do(), ga(r || e);
			}
		});
		return t || r?.(), () => r?.();
	}, [e, t]);
}, Lc = Dn({
	name: "vlibras-web-browsers",
	description: "Acessibilidade digital através da tradução para Língua Brasileira de Sinais (Libras).",
	author: {
		name: "Suíte VLibras",
		email: "vlibras@lavid.ufpb.br",
		url: "http://vlibras.gov.br/"
	},
	homepage: "http://vlibras.gov.br/",
	repository: {
		type: "git",
		url: "https://github.com/spbgovbr-vlibras/vlibras-web-browsers.git"
	},
	bugs: {
		url: "https://github.com/spbgovbr-vlibras/vlibras-web-browsers/issues",
		email: "vlibras@lavid.ufpb.br"
	},
	keywords: [
		"libras",
		"vlibras",
		"acessibilidade",
		"govbr",
		"tradução",
		"accessibility",
		"a11y"
	],
	license: "LGPL-3.0-or-later",
	private: !0,
	version: "7.12.3",
	type: "module",
	engines: {
		node: ">=22.22.1",
		pnpm: ">=9.0.0"
	},
	packageManager: "pnpm@9.15.0",
	"lint-staged": { "*.{js,jsx,ts,tsx}": ["biome check --write"] },
	scripts: {
		dev: "vite",
		"dev:homolog": "vite --mode homolog",
		"dev:prod": "vite --mode production",
		"dev:extension": "vite --mode extension",
		build: "tsc -b && vite build",
		"build:dev": "tsc -b && vite build --mode development",
		"build:homolog": "tsc -b && vite build --mode homolog",
		"build:extension": "tsc -b && vite build --mode extension && node scripts/build-extension.js both",
		"build:firefox": "tsc -b && vite build --mode extension && node scripts/build-extension.js firefox",
		"build:chrome": "tsc -b && vite build --mode extension && node scripts/build-extension.js chrome",
		preview: "vite preview",
		lint: "biome lint",
		format: "biome check . --write",
		check: "biome check .",
		release: "release-it",
		"release:sync": "node ./scripts/sync-release.js",
		test: "vitest run",
		"test:watch": "vitest",
		"test:coverage": "vitest run --coverage",
		"test:e2e": "playwright test",
		"pw:webkit": "playwright open --browser=webkit",
		"pw:chrome": "playwright open --browser=chromium",
		"badge:coverage": "node scripts/update-coverage-badge.js"
	},
	dependencies: {
		"@tailwindcss/vite": "^4.3.3",
		"class-variance-authority": "^0.7.1",
		clsx: "^2.1.1",
		daisyui: "^5.5.19",
		preact: "11.0.0-rc.1",
		"tailwind-merge": "^3.4.0",
		tailwindcss: "^4.3.3",
		zustand: "^5.0.11"
	},
	devDependencies: {
		"@biomejs/biome": "^2.3.14",
		"@commitlint/cli": "^21.2.4",
		"@commitlint/config-conventional": "^21.2.0",
		"@playwright/test": "^1.63.0",
		"@preact/preset-vite": "^2.10.6",
		"@release-it/conventional-changelog": "^12.0.2",
		"@testing-library/dom": "^10.4.1",
		"@testing-library/jest-dom": "^7.0.1",
		"@testing-library/preact": "^3.2.4",
		"@testing-library/user-event": "^14.6.7",
		"@types/node": "^26.4.0",
		"@types/node-polyglot": "^2.5.0",
		"@vitest/coverage-v8": "^5.0.0",
		husky: "^9.1.7",
		jsdom: "^30.0.1",
		"lint-staged": "^17.3.0",
		"posthog-js": "^1.438.23",
		"release-it": "^21.1.1",
		"rollup-plugin-visualizer": "^7.0.1",
		typescript: "~7.0.2",
		vite: "^8.2.4",
		"vite-plugin-compression2": "^2.5.3",
		"vite-plugin-static-copy": "^4.1.1",
		vitest: "^5.0.0"
	},
	pnpm: {
		overrides: {
			"posthog-js>fflate": "0.4.9",
			rollup: "4.62.4",
			postcss: "8.5.26",
			browserslist: "4.28.8",
			"fast-uri": "3.1.9",
			"posthog-js>dompurify": "3.4.17",
			undici: "7.30.1",
			"basic-ftp": "6.2.1",
			"source-map-js": "1.2.2"
		},
		peerDependencyRules: { allowAny: ["conventional-commits-parser"] }
	}
}, "name", "version", "description", "author", "homepage", "keywords", "repository", "license"), Rc = () => {
	let e = V((e) => e.isLoaded), { mutateAsync: t } = Ur(!1), n = async (e) => {
		ga(await t(e) || e);
	}, r = async (e) => await t(e);
	I(() => {
		if (!e) return;
		window.plugin = window.plugin || {};
		let t = () => {
			let e = {
				project: Lc,
				...En(H.get(), "send", "instance"),
				...En(W.get(), "reset", "setLoaded"),
				...En(pa, "setConfig"),
				...Ua.get()
			};
			window.vlibras = {
				...e,
				translate: r,
				translateAndPlay: n
			}, window.plugin.translate = n, window.plugin.player = {
				...e,
				changeAvatar: Ca
			};
		};
		t();
		let i = H.subscribe(t), a = W.subscribe(t);
		return () => {
			i(), a();
		};
	}, [e]);
}, zc = () => (Ic(), cc(), Rc(), hc(), lc(), mc(), fc(), dc(), null), Bc = ({ children: e, root: t }) => {
	let [n, r] = F(!1);
	return I(() => void (t && Ys(t, () => r(!0))), [t]), n ? /* @__PURE__ */ Z(sc, {
		root: t,
		children: [
			/* @__PURE__ */ Z(oc, {}),
			/* @__PURE__ */ Z(zc, {}),
			e
		]
	}) : null;
};
// src/main.tsx
pr();
var { root: Vc, shadowRoot: Hc, isRootActive: Uc } = Un();
cr(Hc);
function Wc() {
	let { setOpen: e, isLoaded: t, setLoaded: n } = U(Mn("setOpen", "isLoaded", "setLoaded")), { path: r } = cn();
	return I(() => Ba.set({
		root: Vc,
		shadowRoot: Hc
	}), [Vc, Hc]), I(() => void (Vc?.dataset.auto !== "true" && Wo.trackLoad()), [Vc]), I(() => {
		if (!r || (Yn(r, Hc), n(!0), !t)) return;
		e(Uc());
		let i = new MutationObserver(() => e(Uc()));
		return i.observe(Vc, {
			attributes: !0,
			attributeFilter: ["data-active"]
		}), () => i.disconnect();
	}, [
		r,
		e,
		t,
		n
	]), t ? /* @__PURE__ */ Z(Bc, {
		root: Hc,
		children: /* @__PURE__ */ Z(Vs, {})
	}) : null;
}
we(/* @__PURE__ */ Z(Wc, {}), Hc);
export { yn as $, Y as A, Pr as B, ka as C, va as D, ga as E, V as F, Er as G, Or as H, Ir as I, Ln as J, vr as K, jr as L, U as M, W as N, ya as O, H as P, jn as Q, Mr as R, Na as S, xa as T, Ar as U, Fr as V, Tr as W, An as X, Mn as Y, Dn as Z, Ba as _, Je as _t, us as a, rn as at, Q as b, Wo as c, Ut as ct, Oo as d, We as dt, fn as et, ro as f, Xe as ft, Ha as g, qe as gt, Ua as h, F as ht, ks as i, on as it, Ur as j, ba as k, Fo as l, ot as lt, Xa as m, Ke as mt, Ws as n, sn as nt, $o as o, xt as ot, no as p, L as pt, _r as q, As as r, cn as rt, Zo as s, Wt as st, Us as t, ln as tt, Ao as u, I as ut, za as v, k as vt, Z as w, Pa as x, $ as y, Ee as yt, Nr as z };
