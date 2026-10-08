/* =========================================================
   Dastyar Trade — Signup Wizard Logic (demo, localStorage)
   Steps: 1) Account  2) Email OTP  3) Exchange API keys
   On success → saves user to localStorage → redirects to dashboard.html
   ========================================================= */

const LS_KEY = "dt_user";

let currentStep = 1;
const TOTAL_STEPS = 3;

const form = document.getElementById("signupForm");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const finishBtn = document.getElementById("finishBtn");

/* ---------- step navigation ---------- */
function showStep(n) {
  currentStep = n;
  document.querySelectorAll(".form-step").forEach((s) => {
    s.hidden = Number(s.dataset.step) !== n;
  });
  document.querySelectorAll(".step").forEach((s) => {
    const sn = Number(s.dataset.step);
    s.classList.toggle("active", sn === n);
    s.classList.toggle("done", sn < n);
  });
  backBtn.hidden = n === 1;
  nextBtn.hidden = n === TOTAL_STEPS;
  finishBtn.hidden = n !== TOTAL_STEPS;

  if (n === 2) {
    document.getElementById("sentToEmail").textContent =
      document.getElementById("email").value.trim();
    startResendTimer();
  }
}

nextBtn.addEventListener("click", () => {
  if (validateStep(currentStep)) showStep(currentStep + 1);
});
backBtn.addEventListener("click", () => showStep(currentStep - 1));

/* ---------- error helpers ---------- */
function setError(name, msg) {
  const el = document.querySelector(`[data-error-for="${name}"]`);
  if (el) el.textContent = msg || "";
  const input = document.getElementById(name);
  if (input && input.type !== "checkbox") input.classList.toggle("invalid", !!msg);
}

/* ---------- validators per step ---------- */
function validateStep(step) {
  let ok = true;

  if (step === 1) {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const pass = document.getElementById("password").value;
    const pass2 = document.getElementById("password2").value;
    const terms = document.getElementById("terms").checked;

    if (fullName.length < 3) { setError("fullName", "نام کامل را وارد کنید."); ok = false; } else setError("fullName");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError("email", "ایمیل معتبر نیست."); ok = false; } else setError("email");

    if (!/^09\d{9}$/.test(phone.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)))) {
      setError("phone", "شماره موبایل باید با ۰۹ شروع شود (۱۱ رقم)."); ok = false;
    } else setError("phone");

    if (pass.length < 8 || !/[a-zA-Z]/.test(pass) || !/\d/.test(pass)) {
      setError("password", "حداقل ۸ کاراکتر شامل حرف و عدد."); ok = false;
    } else setError("password");

    if (pass2 !== pass || !pass2) { setError("password2", "تکرار رمز عبور مطابقت ندارد."); ok = false; } else setError("password2");

    if (!terms) { setError("terms", "پذیرش قوانین الزامی است."); ok = false; } else setError("terms");
  }

  if (step === 2) {
    const digits = [...document.querySelectorAll("#otpBox input")].map((i) => i.value.trim()).join("");
    if (digits.length !== 6) { setError("otp", "کد ۶ رقمی را کامل وارد کنید."); ok = false; }
    else { setError("otp"); /* demo: any code accepted */ }
  }

  if (step === 3) {
    const key = document.getElementById("apiKey").value.trim();
    const secret = document.getElementById("apiSecret").value.trim();
    const noWithdraw = document.getElementById("noWithdraw").checked;

    // optional in demo mode, but if one is filled both must be
    if ((key || secret) && !(key && secret)) {
      setError("apiKey", "هر دو فیلد Key و Secret لازم است (یا هر دو خالی بمانند).");
      ok = false;
    } else setError("apiKey");

    if (!noWithdraw) { setError("noWithdraw", "تأیید نبود مجوز برداشت الزامی است."); ok = false; } else setError("noWithdraw");
  }

  return ok;
}

/* ---------- password strength meter ---------- */
document.getElementById("password").addEventListener("input", (e) => {
  const v = e.target.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^a-zA-Z0-9]/.test(v)) score++;
  const bar = document.getElementById("strengthBar");
  const pct = [0, 25, 50, 75, 100][score];
  bar.style.width = pct + "%";
  bar.style.background = ["#ef4444", "#ef4444", "#f59e0b", "#38bdf8", "#22c55e"][score];
});

/* ---------- OTP inputs behavior ---------- */
const otpInputs = [...document.querySelectorAll("#otpBox input")];
otpInputs.forEach((inp, idx) => {
  inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/\D/g, "").slice(0, 1);
    if (inp.value && idx < otpInputs.length - 1) otpInputs[idx + 1].focus();
  });
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !inp.value && idx > 0) otpInputs[idx - 1].focus();
  });
  inp.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    [...text].forEach((ch, i) => otpInputs[i] && (otpInputs[i].value = ch));
    if (text.length) otpInputs[Math.min(text.length, 5)].focus();
  });
});

/* ---------- resend timer ---------- */
let timerId = null;
function startResendTimer() {
  const btn = document.getElementById("resendBtn");
  const span = document.getElementById("resendTimer");
  let t = 30;
  btn.disabled = true;
  clearInterval(timerId);
  timerId = setInterval(() => {
    t--;
    span.textContent = String(t).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
    if (t <= 0) {
      clearInterval(timerId);
      btn.disabled = false;
      btn.textContent = "ارسال مجدد کد";
    }
  }, 1000);
}
document.getElementById("resendBtn").addEventListener("click", () => {
  document.getElementById("resendBtn").innerHTML = 'ارسال مجدد (<span id="resendTimer">۳۰</span> ثانیه)';
  startResendTimer();
});

/* ---------- final submit ---------- */
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  if (!validateStep(3)) return;

  const user = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    exchange: document.querySelector('input[name="exchange"]:checked').value,
    hasApiKey: !!document.getElementById("apiKey").value.trim(),
    verifiedAt: new Date().toISOString(),
  };
  // ⚠️ DEMO ONLY — هرگز رمز عبور یا کلید API را در localStorage ذخیره نکنید!
  localStorage.setItem(LS_KEY, JSON.stringify(user));

  showStep(TOTAL_STEPS); // mark all done visually
  setTimeout(() => (window.location.href = "dashboard.html"), 600);
});

showStep(1);
