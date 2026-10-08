/* =========================================================
   Dastyar Trade — Landing Page Interactions
   - Mobile menu toggle
   - Animated hero chart (canvas, no dependencies)
   - Count-up statistics when scrolled into view
   - Reveal-on-scroll animations
   - Fake form handler (until backend is ready)
   ========================================================= */

const toFa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

/* ---------- 1. Mobile menu ---------- */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );
}

/* ---------- 2. Hero mini chart ---------- */
(function drawHeroChart() {
  const canvas = document.getElementById("heroChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = 140 * (window.devicePixelRatio || 1);
  }
  resize();

  // Generate a random-walk upward series
  const points = [];
  let v = 40;
  for (let i = 0; i < 60; i++) {
    v += Math.random() * 9 - 3.6 + i * 0.18; // slight upward drift
    points.push(v);
  }
  const max = Math.max(...points), min = Math.min(...points);

  function render(progress) {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const n = Math.floor(points.length * progress);
    if (n < 2) return;

    const x = (i) => (i / (points.length - 1)) * W;
    const y = (p) => H - 8 - ((p - min) / (max - min)) * (H - 20);

    // gradient fill under line
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(34,197,94,0.35)");
    grad.addColorStop(1, "rgba(34,197,94,0)");

    ctx.beginPath();
    ctx.moveTo(x(0), y(points[0]));
    for (let i = 1; i < n; i++) ctx.lineTo(x(i), y(points[i]));
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2.4 * (window.devicePixelRatio || 1);
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.lineTo(x(n - 1), H);
    ctx.lineTo(x(0), H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // last point dot
    ctx.beginPath();
    ctx.arc(x(n - 1), y(points[n - 1]), 4 * (window.devicePixelRatio || 1), 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();
  }

  let start = null;
  function animate(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / 1600, 1);
    render(p);
    if (p < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
  window.addEventListener("resize", () => { resize(); render(1); });
})();

/* ---------- 3. Count-up stats ---------- */
(function countUp() {
  const els = document.querySelectorAll(".stat-number[data-count]");
  const suffixFor = (el) => (el.textContent.includes("٪") ? "٪" : "+");

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      const target = parseInt(el.dataset.count, 10);
      const suffix = suffixFor(el);
      const dur = 1400;
      const t0 = performance.now();
      function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased).toLocaleString("en-US");
        el.textContent = (suffix === "٪" ? "" : suffix) + toFa(val) + (suffix === "٪" ? "٪" : "");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });

  els.forEach((el) => io.observe(el));
})();

/* ---------- 4. Reveal on scroll ---------- */
(function reveal() {
  const targets = document.querySelectorAll(
    ".feature-card, .step-card, .price-card, .faq-item, .section-head, .stat-item"
  );
  targets.forEach((t) => t.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach((t) => io.observe(t));
})();

/* ---------- 5. CTA form → real backend (POST /api/v1/waitlist) ---------- */
const ctaForm = document.getElementById("ctaForm");
if (ctaForm) {
  ctaForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const input = ctaForm.querySelector("input");
    const email = input.value.trim();
    if (!email) return;

    const btn = ctaForm.querySelector("button");
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "در حال ثبت…";

    try {
      await Api.joinWaitlist(email, "landing");
      alert(`✅ درخواست شما ثبت شد: ${email}\nبه‌زودی از طریق ایمیل در ارتباط خواهیم بود.`);
      ctaForm.reset();
    } catch (err) {
      // Backend offline → keep working in demo mode (localStorage)
      const saved = JSON.parse(localStorage.getItem("dt_waitlist") || "[]");
      if (!saved.includes(email)) saved.push(email);
      localStorage.setItem("dt_waitlist", JSON.stringify(saved));
      alert(`⚠️ سرور در دسترس نبود؛ درخواست شما به‌صورت محلی ذخیره شد.\n(${err.message})`);
      ctaForm.reset();
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}
