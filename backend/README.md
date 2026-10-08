# Dastyar Trade — Backend (FastAPI)

بک‌اند رسمی سایت ربات ترید: احراز هویت (JWT)، ثبت‌نام، ورود و لیست انتظار.

## اجرا (محلی)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # ویندوز: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- مستندات تعاملی API: http://127.0.0.1:8000/docs
- سلامت سرویس: `GET /health`

## تست

```bash
python -m pytest tests/ -q
```

## نقاط پایانی (پیشوند `/api/v1`)

| Method | Path          | توضیح                                   |
|--------|---------------|------------------------------------------|
| POST   | /auth/signup  | ثبت‌نام — رمز bcrypt، خروجی JWT          |
| POST   | /auth/login   | ورود — خروجی JWT + اطلاعات کاربر         |
| GET    | /auth/me      | پروفایل کاربر (نیازمند Bearer token)      |
| POST   | /auth/logout  | خروج (stateless؛ کلاینت توکن را حذف می‌کند) |
| POST   | /waitlist     | ثبت ایمیل در لیست انتظار لندینگ           |

## متغیرهای محیطی (`.env`)

```
SECRET_KEY=یک-رشته-تصادفی-بلند
DATABASE_URL=sqlite:///./dastyar.db
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## اتصال فرانت‌اند

فرانت‌اند به `http://127.0.0.1:8000` وصل می‌شود. برای آدرس دیگر، در Console مرورگر:

```js
localStorage.setItem("API_BASE_URL", "https://api.example.com");
```

## ساختار

```
backend/
├── app/
│   ├── main.py            # FastAPI app + CORS + lifespan(init db)
│   ├── db.py              # SQLite layer (users, waitlist)
│   ├── core/
│   │   ├── config.py      # Settings از env (12-factor)
│   │   └── security.py    # bcrypt hash + JWT encode/decode
│   ├── schemas/auth.py    # Pydantic models
│   └── api/v1/
│       ├── auth.py        # signup/login/me/logout
│       └── waitlist.py    # waitlist
└── tests/test_api.py      # تست سرتاسری flow
```

## فاز بعدی

- اتصال صرافی (ccxt) + وب‌سوکت قیمت‌ها
- ذخیره معاملات واقعی و KPIهای سرور-سمت
- Deploy: Render / Railway / VPS + Docker
