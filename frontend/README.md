# Frontend — Digital Investment Platform

## Phase 1: Landing Page (ربات ترید)

صفحه فرود معرفی ربات معامله‌گر — استاتیک، بدون وابستگی به بک‌اند.

### Structure

```
frontend/
├── index.html      # Landing page (RTL / فارسی)
├── css/style.css   # Design tokens + styles (dark fintech theme)
├── js/main.js      # Interactions (chart, counters, menu, reveal)
└── assets/         # Reserved for images/logos
```

### Run locally

```bash
cd frontend
python3 -m http.server 8080
# open http://localhost:8080
```

### Design notes

- RTL، فونت Vazirmatn (CDN)
- رنگ‌ها بر اساس `docs/04_UI_UX/DESIGN_SYSTEM.md`:
  - Primary: سبز رشد `#22c55e`
  - Status: positive/negative/neutral
- Sections: Hero → Stats → Features → How it works → Pricing → FAQ → CTA → Footer
- No frameworks; vanilla HTML/CSS/JS for Phase 1.

### Next phases (roadmap)

1. Contact/waitlist form → backend API (`POST /api/v1/waitlist`, see ARCH-005)
2. Auth pages (login/register) per UIUX-002 User Flow
3. User Dashboard per UIUX-003 Dashboard Architecture
