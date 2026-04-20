# ⚡ ServeNow — Smart Service Booking System

A full-stack platform where users can book services (electrician, plumber, tutor, etc.) and service providers can manage their offerings and bookings.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Python 3.10+ / Flask |
| Database | MongoDB Atlas |
| Auth | JWT (PyJWT) + bcrypt |

---

## 📂 Project Structure

```
smart-service-booking/
├── frontend/
│   ├── index.html          # Homepage with hero, categories, featured services
│   ├── login.html          # Login page
│   ├── register.html       # Registration (user or provider)
│   ├── services.html       # Service listing with search & filter
│   ├── booking.html        # Standalone booking page
│   ├── dashboard.html      # User dashboard (bookings, reviews)
│   ├── provider.html       # Provider dashboard (manage services & bookings)
│   ├── admin.html          # Admin panel (users, services, bookings, stats)
│   ├── css/style.css       # Complete stylesheet
│   └── js/
│       ├── api.js          # Fetch wrapper + helpers
│       ├── auth.js         # Login/register logic
│       ├── services.js     # Service listing & detail modal
│       ├── booking.js      # Booking form submission
│       ├── dashboard.js    # User dashboard
│       └── provider.js     # Provider dashboard
│
├── backend/
│   ├── app.py              # Flask app entry point
│   ├── config.py           # Config from .env
│   ├── routes/
│   │   ├── auth_routes.py      # POST /api/register, /api/login, /api/me
│   │   ├── service_routes.py   # CRUD /api/services
│   │   ├── booking_routes.py   # /api/book, /api/user/bookings, etc.
│   │   ├── review_routes.py    # /api/review, /api/reviews/<id>
│   │   └── admin_routes.py     # /api/admin/*
│   ├── models/
│   │   ├── user_model.py
│   │   ├── service_model.py
│   │   ├── booking_model.py
│   │   └── review_model.py
│   └── utils/
│       ├── db.py           # MongoDB connection
│       ├── auth.py         # JWT encode/decode, decorators
│       └── helpers.py      # Serialization, validation
│
├── run.py                  # Start server
├── .env                    # Environment variables
├── requirements.txt
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone / Download the project

```bash
cd smart-service-booking
```

### 2. Create a virtual environment

```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free cluster.
2. Create a database user (username + password).
3. Whitelist your IP (or use `0.0.0.0/0` for development).
4. Click **Connect → Connect your application** and copy the connection string.

### 5. Set up your `.env` file

Edit `.env` in the project root:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart_booking?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_secret
FLASK_DEBUG=True
PORT=5000
```

Replace `<username>`, `<password>`, and the cluster hostname with your own values.

### 6. Create the Admin user

There is no admin registration via the UI (by design). Create one directly in MongoDB Atlas:

1. Open Atlas → Collections → `users`
2. Insert a document:

```json
{
  "name": "Admin",
  "email": "admin@servenow.com",
  "password": "<bcrypt hash of your password>",
  "role": "admin",
  "phone": "",
  "createdAt": { "$date": "2025-01-01T00:00:00Z" }
}
```

To generate a bcrypt hash quickly:
```python
import bcrypt
print(bcrypt.hashpw(b"your_password", bcrypt.gensalt()).decode())
```

### 7. Run the server

```bash
python run.py
```

Open your browser at **http://localhost:5000**

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | No | Register user or provider |
| POST | `/api/login` | No | Login and get JWT |
| GET | `/api/me` | JWT | Get current user |

### Services
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/services` | No | List services (supports `?category=` & `?search=`) |
| GET | `/api/services/categories` | No | List all categories |
| GET | `/api/services/<id>` | No | Get service detail |
| POST | `/api/services` | Provider | Create service |
| PUT | `/api/services/<id>` | Provider | Update service |
| DELETE | `/api/services/<id>` | Provider | Delete service |
| GET | `/api/provider/services` | Provider | My services |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/book` | User | Create booking |
| GET | `/api/user/bookings` | User | My bookings |
| GET | `/api/provider/bookings` | Provider | Incoming bookings |
| PUT | `/api/book/<id>/status` | User/Provider | Update status |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/review` | User | Submit review |
| GET | `/api/reviews/<serviceId>` | No | Get reviews for service |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/users` | Admin | All users |
| DELETE | `/api/admin/users/<id>` | Admin | Delete user |
| GET | `/api/admin/services` | Admin | All services |
| DELETE | `/api/admin/services/<id>` | Admin | Delete service |
| GET | `/api/admin/bookings` | Admin | All bookings |

---

## 🎭 User Roles

| Role | Access |
|------|--------|
| **user** | Browse & book services, view own bookings, leave reviews |
| **provider** | Add/edit/delete own services, accept/reject/complete bookings |
| **admin** | Full platform management via admin panel |

---

## 🔐 Security

- Passwords hashed with **bcrypt** (salt rounds: auto)
- Routes protected with **JWT Bearer tokens** (7-day expiry)
- Role-based access control on all protected endpoints
- Input validation on all API routes
- CORS enabled for development

---

## 🚀 Production Notes

- Set `FLASK_DEBUG=False` in `.env`
- Use a strong random `JWT_SECRET` (32+ chars)
- Enable MongoDB Atlas IP whitelist
- Consider adding rate limiting (`flask-limiter`)
- Serve with **gunicorn**: `gunicorn -w 4 run:app`
