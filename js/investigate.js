window.funnelytics = {
  cookie: "_fs",
  origin: "https://track-v2.funnelytics.io",
  project: null,
  session: null,
  step: null,
  stepping: !1,
  steps: [],
  getSession: function () {
    var e = funnelytics.url.params.toObject(window.location.search.substr(1)),
      n = funnelytics.cookies.get(funnelytics.cookie);
    if (e[funnelytics.cookie]) {
      var t = e[funnelytics.cookie];
      return funnelytics.cookies.set(funnelytics.cookie, t), t
    }
    return n
  },
  client: {
    isBot: function () {
      return new RegExp(/funnelyticsbot|googlebot|facebookexternalhit|Facebot|bot|crawler|spider|robot|crawling/i).test(navigator.userAgent)
    }
  },
  projects: {
    _settings: {}, _loaded: !1, getSettings: function (e) {
      if (funnelytics.projects._loaded) {
        var n = funnelytics.projects._settings;
        if (Promise && !e) return new Promise(function (e, t) {
          return e(n)
        });
        e && "function" == typeof e && e(null, n)
      } else {
        var t = new XMLHttpRequest;
        t.open("GET", funnelytics.origin + "/settings/" + funnelytics.project), t.addEventListener("load", function () {
          var n = JSON.parse(t.responseText);
          if (t.status >= 200 && t.status < 300) {
            if (funnelytics.projects._settings = n, funnelytics.projects._loaded = !0, Promise && !e) return new Promise(function (e, n) {
              return e(funnelytics.projects._settings)
            });
            if (!e || "function" != typeof e) return;
            e(null, funnelytics.projects._settings)
          } else {
            if (Promise && !e) return new Promise(function (e, t) {
              return t(n)
            });
            e && "function" == typeof e && e(n)
          }
        }), t.send()
      }
    }, getWhitelistedDomains: function (e) {
      funnelytics.projects.getSettings(function (n, t) {
        if (e && "function" == typeof e) if (n) e(n); else {
          for (var s, i = [], o = 0; o < t.domains.length; o++) s = t.domains[o].domain, i.push(s.slice(0, s.length - 1));
          e(null, i)
        }
      })
    }, _inputListeners: {}, addDOMEvents: function () {
      var e = document.readyState;
      "complete" === e || "loaded" === e || "interactive" === e ? (funnelytics.projects.addCrossDomainParameters(), funnelytics.projects.startMonitoringInputs()) : document.addEventListener("DOMContentLoaded", function () {
        funnelytics.projects.addCrossDomainParameters(), funnelytics.projects.startMonitoringInputs()
      })
    }, _inpuChangeFunction: function (e) {
      if (!/.+@.+\..+/.test(e.target.value)) return;
      const n = funnelytics.projects._inputListeners[e.target];
      n && clearTimeout(n), funnelytics.projects._inputListeners[e.target] = setTimeout(function () {
        var n = new XMLHttpRequest;
        n.open("POST", funnelytics.origin + "/set-attributes"), n.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), n.send("d=" + encodeURIComponent(JSON.stringify({
          session: funnelytics.session,
          project: funnelytics.project,
          attributes: {email: e.target.value}
        }))), funnelytics.projects._inputListeners[e.target] = null
      }, 1e3)
    }, _inputChecker: null, startMonitoringInputs: function () {
      funnelytics.projects.addInputListeners(), funnelytics.projects._inputChecker = window.setInterval(funnelytics.projects.addInputListeners, 1e3)
    }, stopMonitoringForInputs: function () {
      window.clearInterval(funnelytics.projects._inputChecker)
    }, addInputListeners: function () {
      for (var e, n = document.getElementsByTagName("input"), t = 0; t < n.length; t++) e = n[t], null !== funnelytics.projects._inputListeners[e] && e.addEventListener("input", funnelytics.projects._inpuChangeFunction)
    }, addCrossDomainParameters: function () {
      funnelytics.projects.getWhitelistedDomains(function (e, n) {
        for (var t, s = 0; s < (t = document.getElementsByTagName("a")).length; s++) if (t[s].href && window.location.hostname != t[s].hostname && (-1 != n.indexOf(t[s].hostname) || -1 != n.indexOf("www." + t[s].hostname)) && funnelytics.session && funnelytics.url.isURL(t[s].href)) {
          var i = funnelytics.url.params.fromURL(t[s].href, funnelytics.url.params.toArray),
            o = funnelytics.projects.getRevisedParameters(i);
          o = funnelytics.url.params.toString(o), funnelytics.url.params.regex.test(t[s].href) ? t[s].href = t[s].href.replace(/\?{1}.*/, o) : t[s].href = t[s].href + o
        }
      })
    }, getRevisedParameters(e) {
      for (var n = !1, t = 0; t < e.length; t++) e[t].key === funnelytics.cookie && (n = !0, funnelytics.session && (e[t].value = funnelytics.session));
      return !n && funnelytics.session && e.push({
        key: funnelytics.cookie,
        value: funnelytics.session,
        hasEquals: !0
      }), e
    }
  },
  cookies: {
    getDomain: function () {
      var e = window.location.hostname.split(".");
      return e.length > 2 && (e = e.slice(e.length - 2)), e
    }, all: function () {
      for (var e, n = {}, t = 0; t < (cookies = document.cookie.split("; ")).length; t++) n[(e = cookies[t].split("="))[0]] = e[1];
      return n
    }, get: function (e) {
      return funnelytics.cookies.all()[e]
    }, set: function (e, n) {
      for (var t, s = window.location.hostname.split("."), i = e + "=" + n + "; path=/; ", o = null == n ? "; expires=Thu, 01 Jan 1970 00:00:00 UTC;" : "; expires=Thu, 01 Jan 2038 00:00:00 UTC;", r = s.length - 1; r > -1 && (t = s.slice(r).join("."), document.cookie = i + "domain=" + t + o, !funnelytics.cookies.get(e)); r--) ;
    }, remove: function (e) {
      funnelytics.cookies.set(e)
    }
  },
  url: {
    regex: new RegExp(/.*:\/\/.*\..*/), isURL: function (e) {
      return funnelytics.url.regex.test(e)
    }, parse: function (e) {
      var n = document.createElement("a");
      return n.href = e, n
    }, params: {
      regex: new RegExp(/.*:\/\/.*\..*\?/), fromURL: function (e, n) {
        var t = n || funnelytics.url.params.toObject, s = e.split(funnelytics.url.params.regex);
        return t(s = 2 == s.length ? s[1] : null)
      }, toObject: function (e) {
        var n = {};
        if (e) for (var t, s, i = 0; i < (t = e.split("&")).length; i++) n[(s = t[i].split("="))[0]] = s[1];
        return n
      }, toArray: function (e) {
        var n = [];
        if (e) for (var t, s, i = e.split("&"), o = 0; o < i.length; o++) s = i[o].indexOf("=") > -1, t = i[o].split("="), n.push({
          key: t[0],
          value: t[1],
          hasEquals: s
        });
        return n
      }, toString: function (e) {
        var n, t = "";
        e.length > 0 && (t += "?");
        for (var s = 0; s < e.length; s++) t += (n = e[s]).key, n.hasEquals && (t += "="), n.value && (t += n.value), s !== e.length - 1 && (t += "&");
        return t
      }
    }
  },
  events: {
    trigger: function (e, n, t, s) {
      var i;
      if (s || (s = {}), funnelytics.client.isBot()) {
        if (i = {message: "No human, no service."}, "function" == typeof t) return void t(i);
        if (!s.promise) return Promise ? new Promise(function (e, n) {
          return n(i)
        }) : void 0;
        s.promise.reject(i)
      }
      if ("string" != typeof e) {
        if (i = {message: "First argument must be an event name."}, "function" == typeof t) return void t(i);
        if (!s.promise) return Promise ? new Promise(function (e, n) {
          return n(i)
        }) : void 0;
        s.promise.reject(i)
      }
      if (!funnelytics.step) {
        var o, r;
        if (!t && Promise) o = {
          instance: new Promise(function (e, n) {
            r = {resolve: e, reject: n}
          }), resolve: r.resolve, reject: r.reject
        };
        return o ? o.instance : void 0
      }
      if (void 0 !== navigator.sendBeacon && "function" != typeof t && !s.promise) {
        var u = new Blob(["d=" + JSON.stringify({
          project: funnelytics.project,
          session: funnelytics.session,
          step: funnelytics.step,
          name: e,
          attributes: n
        })], {type: "application/x-www-form-urlencoded"});
        navigator.sendBeacon(funnelytics.origin + "/events/trigger", u)
      } else {
        var c = new XMLHttpRequest;
        c.open("POST", funnelytics.origin + "/events/trigger"), c.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), c.addEventListener("load", function () {
          if (i = JSON.parse(c.responseText), c.status >= 200 && c.status < 300) {
            if ("function" == typeof t) t(null, i); else if (s.promise) s.promise.resolve(i); else if (Promise) return new Promise(function (e, n) {
              return e(i)
            })
          } else if ("function" == typeof t) t(i); else if (s.promise) s.promise.reject(i); else if (Promise) return new Promise(function (e, n) {
            return n(i)
          })
        }), c.send("d=" + encodeURIComponent(JSON.stringify({
          project: funnelytics.project,
          session: funnelytics.session,
          step: funnelytics.step,
          name: e,
          attributes: n
        })))
      }
    }
  },
  attributes: {
    set: function (e, n) {
      var t, s;
      if ("object" != typeof e) return t = {message: "First argument must be an object containing user details."}, "function" == typeof n ? void n(t) : Promise ? new Promise(function (e, n) {
        return n(t)
      }) : void 0;
      if (!(s = funnelytics.cookies.get(funnelytics.cookie))) return t = {message: "No Funnelytics session exists for this user."}, "function" == typeof n ? void n(t) : Promise ? new Promise(function (e, n) {
        return n(t)
      }) : void 0;
      var i = new XMLHttpRequest;
      i.open("POST", funnelytics.origin + "/trackers/set"), i.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), i.addEventListener("load", function () {
        if (t = JSON.parse(i.responseText), i.status >= 200 && i.status < 300) {
          if ("function" == typeof n) n(null, t); else if (Promise) return new Promise(function (e, n) {
            return e(t)
          })
        } else if ("function" == typeof n) n(t); else if (Promise) return new Promise(function (e, n) {
          return n(t)
        })
      }), i.send("d=" + encodeURIComponent(JSON.stringify({project: funnelytics.project, session: s, info: e})))
    }
  },
  functions: {
    initialize: function () {
      if (!funnelytics.client.isBot()) {
        var e = new XMLHttpRequest;
        e.open("POST", funnelytics.origin + "/sessions"), e.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), e.addEventListener("load", function () {
          if (e.status >= 200 && e.status < 300) {
            var n = JSON.parse(e.responseText);
            funnelytics.session = n.session, funnelytics.cookies.set(funnelytics.cookie, funnelytics.session), funnelytics.functions.step(), funnelytics.projects.addDOMEvents()
          } else 500 == e.status && funnelytics.cookies.remove(funnelytics.cookie)
        });
        var n = {
          project: funnelytics.project,
          page: window.location.href,
          device: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? "mobile" : "desktop"
        };
        !0 === funnelytics.isSPA && (n.skipStepCreation = !0), e.send("d=" + encodeURIComponent(JSON.stringify(n)))
      }
    }, step: function () {
      if (!funnelytics.client.isBot()) if (funnelytics.session) {
        var e = document.referrer;
        funnelytics.isSPA && funnelytics.steps.length > 0 && (e = funnelytics.steps[funnelytics.steps.length - 1]), funnelytics.steps.push(window.location.href);
        var n = new XMLHttpRequest;
        n.open("POST", funnelytics.origin + "/steps"), n.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), n.addEventListener("load", function () {
          n.status >= 200 && n.status < 300 && (funnelytics.step = JSON.parse(n.responseText).step)
        }), n.send("d=" + encodeURIComponent(JSON.stringify({
          project: funnelytics.project,
          session: funnelytics.session,
          page: window.location.href,
          referrer: e
        })))
      } else funnelytics.functions.initialize()
    }
  },
  init: function (e, n) {
    funnelytics.isSPA = n || !1, funnelytics.project = e, funnelytics.session = funnelytics.getSession(), !0 !== funnelytics.isSPA && (funnelytics.session ? (funnelytics.functions.step(), funnelytics.projects.addDOMEvents()) : funnelytics.project && funnelytics.functions.initialize()), !0 === window.funnelytics_queued && funnelytics.functions.step()
  }
};
