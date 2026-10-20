(function () {
  "use strict";
  const D = window.LESSON;
  const LETTERS = "ABC";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const icon = (name, size = 24, cls = "") =>
    `<svg class="ico ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${D.icons[name]}</svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let uid = 0; const nid = (p) => `${p}-${++uid}`;


  /* ---------- Visuals (dual coding: same scene on every screen) ---------- */
  const screenSVG = (name, cls) => window.TVScreens.v2(name, cls);
  function layersHTML(name) {
    const v = D.visuals[name]; if (!v) return "";
    return `<div class="layers">
      <p class="layers__eye">${icon("chevUp", 14)} Toward your eyes</p>
      <ol class="layers__list" aria-label="How ${esc(name)} makes light, front to back">
        ${v.layers.map(([n, d, src]) => `<li class="layer${src ? " layer--src" : ""}"><span class="layer__n">${src ? icon("sun", 16) : ""}${esc(n)}</span>${d ? `<span class="layer__d">${esc(d)}</span>` : ""}${src ? `<span class="sr-only"> (light source)</span>` : ""}</li>`).join("")}
      </ol>
    </div>`;
  }
  function glanceHTML(name) {
    const v = D.visuals[name]; if (!v) return "";
    return `<div class="glance"><p class="glance__k">At a glance <span>vs. the other three</span></p>
      <dl>${v.glance.map(([k, n]) => `<div class="glance__row"><dt>${esc(k)}</dt><dd><span class="meter" aria-hidden="true">${[1,2,3,4,5].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span><span class="glance__n">${n}/5</span><span class="sr-only">${n} out of 5</span></dd></div>`).join("")}</dl></div>`;
  }

  /* ---------- Accordion ---------- */
  function buildAccordion() {
    const root = $("#accordion");
    root.innerHTML = D.specs.map(([title, body], i) => {
      const b = nid("acc"), p = nid("accp");
      return `<div class="acc">
        <h3 class="acc__h"><button class="acc__btn" id="${b}" aria-expanded="false" aria-controls="${p}" type="button">
          <span>${i + 1}.&nbsp; ${esc(title)}</span><span class="acc__icon">${icon("plus", 20, "i-plus")}${icon("minus", 20, "i-minus")}</span>
        </button></h3>
        <div class="acc__panel" id="${p}" role="region" aria-labelledby="${b}" hidden><p>${esc(body)}</p></div>
      </div>`;
    }).join("");
    $$(".acc__btn", root).forEach((btn) => btn.addEventListener("click", () => toggle(btn)));
    toggle($(".acc__btn", root), true);
    function toggle(btn, force) {
      const open = force !== undefined ? force : btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      btn.closest(".acc").classList.toggle("is-open", open);
      document.getElementById(btn.getAttribute("aria-controls")).hidden = !open;
    }
  }

  /* ---------- Reveal cards ---------- */
  function buildReveal(rootSel, items, compact) {
    const root = $(rootSel);
    root.innerHTML = items.map((it) => {
      const p = nid("rev");
      return `<div class="reveal ${compact ? "reveal--compact" : ""}">
        <div class="reveal__face">
          ${it.screen && D.visuals[it.name] ? `<figure class="reveal__screen">${screenSVG(it.name)}<figcaption>${esc(window.TVScreens.short(it.name))}</figcaption></figure>` : `<div class="reveal__icon">${icon(it.icon, compact ? 30 : 34)}</div>`}
          <h3 class="reveal__title">${esc(it.name)}</h3>
          <p class="reveal__sub">${esc(it.sub)}</p>
          <button class="reveal__btn" type="button" aria-expanded="false" aria-controls="${p}" aria-label="Reveal: ${esc(it.name)}">${icon("plus", 20, "i-plus")}${icon("minus", 20, "i-minus")}</button>
        </div>
        <div class="reveal__detail" id="${p}" hidden><p>${esc(it.detail)}</p></div>
      </div>`;
    }).join("");
    $$(".reveal__btn", root).forEach((btn) => btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      btn.closest(".reveal").classList.toggle("is-open", open);
      document.getElementById(btn.getAttribute("aria-controls")).hidden = !open;
    }));
  }

  /* ---------- Tabs (WAI-ARIA, arrow-key navigation) ---------- */
  function buildTabs(rootSel, items, renderPanel, label) {
    const root = $(rootSel);
    const ids = items.map(() => [nid("tab"), nid("panel")]);
    root.innerHTML = `<div class="tabs__list" role="tablist" aria-label="${esc(label)}">
      ${items.map((it, i) => `<button class="tabs__tab" role="tab" type="button" id="${ids[i][0]}" aria-controls="${ids[i][1]}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(it.tabLabel || it.name)}</button>`).join("")}
    </div>
    ${items.map((it, i) => `<div class="tabs__panel" role="tabpanel" id="${ids[i][1]}" aria-labelledby="${ids[i][0]}" tabindex="0" ${i ? "hidden" : ""}>${renderPanel(it, i)}</div>`).join("")}`;
    const tabs = $$(".tabs__tab", root);
    const select = (i, focus) => {
      tabs.forEach((t, k) => {
        const on = k === i;
        t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      t.addEventListener("keydown", (e) => {
        const n = tabs.length; let k = null;
        if (e.key === "ArrowRight") k = (i + 1) % n;
        if (e.key === "ArrowLeft") k = (i - 1 + n) % n;
        if (e.key === "Home") k = 0;
        if (e.key === "End") k = n - 1;
        if (k !== null) { e.preventDefault(); select(k, true); }
      });
    });
    root._reset = () => select(0);
  }

  const techPanel = (t) => `
    <div class="profile">
      <div class="profile__id">
        <figure class="profile__screen">${screenSVG(t.name, "screen--lg")}<figcaption>${esc(window.TVScreens.caption(t.name))}</figcaption></figure>
        <h3 class="profile__name">${esc(t.name)}</h3>
        <p class="muted">${esc(t.tag)}</p>
        <div class="best"><span class="best__k">Best for</span><span class="best__v">${esc(t.best)}</span></div>
        ${glanceHTML(t.name)}
      </div>
      <dl class="profile__rows">
        <div><dt>How it works</dt><dd>${esc(t.how)}${layersHTML(t.name)}</dd></div>
        <div><dt>Key features</dt><dd>${esc(t.features)}</dd></div>
        <div><dt>Viewing experience</dt><dd>${esc(t.experience)}</dd></div>
      </dl>
    </div>
    <div class="situations">
      <div class="callout callout--blue"><p class="callout__k">In the bedroom</p><p>${esc(t.bedroom)}</p></div>
      <div class="situations__side">
        <div class="callout callout--plain"><p class="callout__k callout__k--green">✓ Also great for</p><p>${esc(t.also)}</p></div>
        <div class="callout callout--red"><p class="callout__k callout__k--red">! Watch out</p><p>${esc(t.watch)}</p></div>
      </div>
    </div>`;

  const SALE_STEPS = ["Welcome", "Demo", "Close"];
  const salePanel = (s, i) => `
    <ol class="journey" aria-label="Sale progress: step ${i + 1} of 3">
      ${SALE_STEPS.map((st, k) => `<li class="${k < i ? "is-done" : k === i ? "is-current" : ""}"${k === i ? ' aria-current="step"' : ""}><span class="journey__dot">${k < i ? icon("check", 14) : k + 1}</span>${st}</li>`).join("")}
    </ol>
    <div class="sale">
      <figure class="sale__art">
        <img src="${esc(s.img)}" alt="${esc(s.alt)}" loading="lazy" width="768" height="445">
        <div class="sale__ring" aria-hidden="true">${icon(s.icon, 72)}</div>
      </figure>
      <div>
        <p class="eyebrow">${esc(s.name)} the sale</p>
        <h3 class="sale__title">${esc(s.title)}</h3>
        <ol class="steps">${s.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
      </div>
    </div>`;

  /* ---------- Quiz blocks ---------- */
  const results = { precheck: {}, scenarios: {}, final: null };

  function quizBlock(cfg) {
    // cfg: { mode: 'precheck'|'scenario'|'final', eyebrow, badge, persona, q, options, correct, right, wrong, retake }
    const el = document.createElement("form");
    el.className = `quiz quiz--${cfg.mode}${cfg.embedded ? " quiz--embedded" : ""}`;
    el.noValidate = true;
    const name = nid("q");
    const legendId = nid("lg");
    el.innerHTML = `
      <div class="quiz__top"><p class="eyebrow">${esc(cfg.eyebrow)}</p>${cfg.badge ? `<span class="pill">${esc(cfg.badge)}</span>` : ""}</div>
      ${cfg.persona ? personaHTML(cfg.persona) : ""}
      <fieldset class="quiz__fs">
        <legend id="${legendId}" class="quiz__q" tabindex="-1">${esc(cfg.q)}</legend>
        <div class="quiz__opts">
          ${cfg.options.map((o, i) => `
            <label class="opt" data-i="${i}">
              <input type="radio" name="${name}" value="${i}">
              <span class="opt__radio" aria-hidden="true"></span>
              <span class="opt__text">${LETTERS[i]}.&nbsp; ${esc(o)}</span>
              <span class="opt__status"></span>
            </label>`).join("")}
        </div>
      </fieldset>
      <div class="quiz__actions">
        <button type="submit" class="btn btn--primary" disabled>Submit</button>
        <span class="quiz__hint">${cfg.mode === "precheck" ? "Pick your best guess — it's okay not to know yet" : cfg.mode === "scenario" ? "Select a recommendation to enable Submit" : "Select an answer to enable Submit"}</span>
      </div>
      <div class="fb" role="status" aria-live="polite" hidden></div>`;

    const submit = $("button[type=submit]", el);
    const fb = $(".fb", el);
    let attempts = 0;

    el.addEventListener("change", () => { submit.disabled = !$("input:checked", el); });
    el.addEventListener("submit", (e) => {
      e.preventDefault();
      const picked = $("input:checked", el); if (!picked) return;
      const i = Number(picked.value); attempts++;
      const ok = i === cfg.correct;
      $$("input", el).forEach((r) => (r.disabled = true));
      $$(".opt", el).forEach((lab) => {
        const k = Number(lab.dataset.i);
        lab.classList.add("is-locked");
        if (k === cfg.correct && (ok || cfg.mode === "precheck")) { lab.classList.add("is-correct"); $(".opt__status", lab).textContent = "✓ Correct"; }
        else if (k === i && !ok) { lab.classList.add("is-wrong"); $(".opt__status", lab).textContent = "✕ Not quite"; }
        else lab.classList.add("is-dim");
      });
      $(".quiz__actions", el).hidden = true;
      fb.hidden = false;
      fb.className = `fb ${ok ? "fb--ok" : cfg.mode === "precheck" ? "fb--info" : "fb--bad"}`;
      const wrongText = typeof cfg.wrong === "string" ? cfg.wrong : cfg.wrong[i];
      const head = ok
        ? (cfg.mode === "precheck" ? "Correct — you already know this one" : "Correct")
        : (cfg.mode === "precheck" ? `Not quite — the answer is ${cfg.answerName}` : "Incorrect");
      fb.innerHTML = `
        ${cfg.mode !== "precheck" ? `<p class="fb__k">Your decision results</p>` : ""}
        <p class="fb__head"><span class="fb__icon">${icon(ok ? "check" : "x", 20)}</span>${esc(head)}</p>
        <p>${esc(ok ? cfg.right : wrongText)}</p>
        ${cfg.mode === "precheck" && !ok ? `<p class="fb__next">No problem — you'll learn this in the sections ahead.</p>` : ""}
        ${cfg.onContinue
          ? `<button type="button" class="btn btn--primary btn--continue">${esc(cfg.continueLabel || "Continue")}</button>`
          : ok
            ? `<p class="fb__next">${esc(cfg.nextHint || "Keep going ↓")}</p>`
            : `<button type="button" class="btn btn--retake">${icon("refresh", 18)} Take again</button>`}`;
      if (cfg.onResult) cfg.onResult(ok, attempts);
      const cont = $(".btn--continue", fb);
      if (cont) cont.addEventListener("click", cfg.onContinue);
      const retake = $(".btn--retake", fb);
      if (retake) retake.addEventListener("click", () => { reset(false); $("input", el).focus(); });
      fb.focus({ preventScroll: true });
    });

    function reset(full) {
      $$("input", el).forEach((r) => { r.disabled = false; r.checked = false; });
      $$(".opt", el).forEach((lab) => { lab.className = "opt"; $(".opt__status", lab).textContent = ""; });
      $(".quiz__actions", el).hidden = false; submit.disabled = true;
      fb.hidden = true; fb.innerHTML = "";
      if (full) attempts = 0;
    }
    el._reset = () => reset(true);
    fb.tabIndex = -1;
    return el;
  }

  function personaHTML(p) {
    return `
      <div class="scene" data-fallback-initial="${esc(p.initial)}">
        <img src="${esc(p.img)}" alt="${esc(p.alt)}" loading="lazy" width="1376" height="768">
      </div>
      <div class="persona">
        <div class="avatar" aria-hidden="true">${esc(p.initial)}</div>
        <div><p class="persona__name">${esc(p.persona)}</p><p class="muted">${esc(p.desc)}</p></div>
      </div>
      <blockquote class="quote">“${esc(p.quote)}”</blockquote>`;
  }

  function buildQuizzes() {
    buildPrecheck();

    const sc = $('[data-quiz-group="scenarios"]');
    D.scenarios.forEach((s, i) => sc.appendChild(quizBlock({
      mode: "scenario", eyebrow: `Scenario ${i + 1} of 5 · Focus: ${s.focus}`, persona: s,
      q: "What do you recommend?", options: s.options, correct: s.correct, right: s.right, wrong: s.wrong,
      nextHint: i === 4 ? "All 5 scenarios complete — scroll to continue ↓" : "Scroll down for the next customer ↓",
      onResult: (ok, attempts) => { if (ok && !(i in results.scenarios)) results.scenarios[i] = attempts === 1; updateSummary(); }
    })));

    const fin = $('[data-quiz-group="final"]');
    const f = D.final;
    fin.appendChild(quizBlock({
      mode: "final", eyebrow: "Scenario check · Jordan", q: f.q, options: f.options, correct: f.correct, right: f.right, wrong: f.wrong,
      nextHint: "Lesson complete — scroll down ↓",
      onResult: (ok, attempts) => { if (ok) { results.final = attempts; updateSummary(); } }
    }));

    // Image fallback: keep the layout on-brand if an image file is missing
    $$(".scene img, .sale__art img").forEach((img) => {
      const fail = () => img.parentElement.classList.add("is-fallback");
      if (img.complete && img.naturalWidth === 0) fail();
      img.addEventListener("error", fail);
    });
  }


  /* ---------- Pre-check: one question at a time, then a results screen (mirrors a Rise quiz) ---------- */
  const CAPTIONS = [
    [4, "Strong start — you already know the floor", "You could explain all four technologies today. Use this lesson to sharpen how you match each one to a customer's room."],
    [3, "Solid foundation — you know most of the floor", "You're close. Pay extra attention to the one you missed as you go through the sections ahead."],
    [2, "Good start — you know some of the basics", "You've got half of it already. The floor preview and deep dive will fill in the rest."],
    [0, "Starting fresh — that's exactly what this lesson is for", "No prior knowledge needed. We'll walk through each TV step by step, then you'll practice with real customers."]
  ];
  function buildPrecheck() {
    const root = $('[data-quiz-group="precheck"]');
    const Q = D.precheck, N = Q.length;
    root.className = "stepper";
    root.innerHTML = `
      <div class="stepper__head">
        <p class="stepper__count" aria-live="polite"></p>
        <span class="pill">Not graded</span>
      </div>
      <div class="stepper__bar" aria-hidden="true">${Q.map(() => "<span></span>").join("")}</div>
      <div class="stepper__body"></div>`;
    const body = $(".stepper__body", root), count = $(".stepper__count", root), segs = $$(".stepper__bar span", root);
    let answers = [];
    const bringIntoView = () => { if (root.getBoundingClientRect().top < 0) root.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); };

    function show(i, focus) {
      body.innerHTML = "";
      segs.forEach((sg, k) => { sg.className = k < i ? "is-done" : k === i ? "is-current" : ""; });
      if (i >= N) return showResults(focus);
      const q = Q[i];
      count.textContent = `Question ${i + 1} of ${N}`;
      body.appendChild(quizBlock({
        mode: "precheck", embedded: true, eyebrow: q.tech, q: q.q, options: q.options, correct: q.correct,
        right: q.right, wrong: q.wrong, answerName: q.tech,
        continueLabel: i === N - 1 ? "See my results →" : "Continue →",
        onResult: (ok) => { answers[i] = ok; },
        onContinue: () => { show(i + 1, true); bringIntoView(); }
      }));
      if (focus) $(".quiz__q", body).focus({ preventScroll: true });
    }

    function showResults(focus) {
      const right = answers.filter(Boolean).length;
      const [, title, caption] = CAPTIONS.find(([min]) => right >= min);
      results.precheck = Object.assign({}, answers); updateSummary();
      count.textContent = "Results";
      segs.forEach((sg) => (sg.className = "is-done"));
      body.innerHTML = `
        <div class="results" tabindex="-1">
          <div class="results__ring" style="--p:${(right / N) * 100}" aria-hidden="true"><span>${right}/${N}</span></div>
          <p class="eyebrow">Pre-check complete</p>
          <h3 class="results__title">You got ${right} out of ${N} right</h3>
          <p class="results__cap"><strong>${esc(title)}.</strong> ${esc(caption)}</p>
          <ul class="results__list">${Q.map((q, k) => `<li class="${answers[k] ? "is-ok" : "is-miss"}">${icon(answers[k] ? "check" : "x", 16)}<span>${esc(q.tech)}</span><span class="sr-only">${answers[k] ? "correct" : "missed"}</span></li>`).join("")}</ul>
          <p class="muted results__note">This was ungraded. Keep scrolling to start the lesson ↓</p>
          <button type="button" class="btn btn--retake">${icon("refresh", 18)} Take the pre-check again</button>
        </div>`;
      $(".btn--retake", body).addEventListener("click", () => { answers = []; show(0, true); });
      if (focus) $(".results", body).focus({ preventScroll: true });
    }
    root._reset = () => { answers = []; show(0, false); };
    show(0, false);
  }

  function updateSummary() {
    const pre = Object.values(results.precheck);
    $("#sumPre").textContent = pre.length ? `${pre.filter(Boolean).length} / 4 correct` : "—";
    const sc = Object.values(results.scenarios);
    $("#sumScen").textContent = sc.length ? `${sc.filter(Boolean).length} / 5` + (sc.length < 5 ? ` (${sc.length} of 5 done)` : "") : "—";
    $("#sumFinal").textContent = results.final ? (results.final === 1 ? "✓ First try" : `✓ After ${results.final} tries`) : "—";
  }

  /* ---------- Progress tracker ---------- */
  function buildTracker() {
    const sections = $$("[data-section]");
    const list = $("#trackerList");
    const viewed = new Set();
    list.innerHTML = sections.map((s, i) => `<li><button type="button" class="tracker__dot" data-target="${s.id}" aria-label="Go to ${esc(s.dataset.label)}"><span class="tracker__tip">${esc(s.dataset.label)}</span></button></li>`).join("");
    $$(".tracker__dot", list).forEach((b) => b.addEventListener("click", () => scrollToId(b.dataset.target)));
    const pct = $("#trackerPct");
    const render = () => {
      $$(".tracker__dot", list).forEach((b) => b.classList.toggle("is-viewed", viewed.has(b.dataset.target)));
      pct.textContent = Math.round((viewed.size / sections.length) * 100) + "%";
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          viewed.add(e.target.id);
          $$(".tracker__dot", list).forEach((b) => b.classList.toggle("is-current", b.dataset.target === e.target.id));
        }
      });
      render();
    }, { rootMargin: "-40% 0px -50% 0px" });
    sections.forEach((s) => io.observe(s));
    const fill = $("#topbarFill");
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      fill.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return { reset() { viewed.clear(); render(); } };
  }

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function scrollToId(id) {
    const el = document.getElementById(id);
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    const h = $("h1, h2", el); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }

  /* ---------- Init ---------- */
  buildAccordion();
  buildReveal("#previewGrid", D.preview.map((p) => ({ ...p, screen: true })), true);
  buildTabs("#techTabs", D.techs, techPanel, "Display technologies");
  buildReveal("#guideGrid", D.guide, false);
  buildTabs("#saleTabs", D.sale.map((s, i) => ({ ...s, tabLabel: `${i + 1}. ${s.name}` })), salePanel, "Moments of the sale");
  buildQuizzes();
  const tracker = buildTracker();

  $("#startBtn").addEventListener("click", () => scrollToId("s1"));
  $("#restartBtn").addEventListener("click", () => {
    $$(".quiz").forEach((q) => q._reset());
    $('[data-quiz-group="precheck"]')._reset();
    results.precheck = {}; results.scenarios = {}; results.final = null; updateSummary();
    $$(".reveal.is-open .reveal__btn").forEach((b) => b.click());
    $$(".acc__btn").forEach((b, i) => { if ((b.getAttribute("aria-expanded") === "true") !== (i === 0)) b.click(); });
    $$(".tabs").forEach((t) => t._reset && t._reset());
    tracker.reset();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    $("#startBtn").focus({ preventScroll: true });
  });
})();
