# 🍱 FoodBridge — NGO Food Donation Platform

> **Connecting Food Donors with NGOs via Real-Time GPS to Fight Hunger**

A full-stack **MERN (MongoDB, Express, React, Node.js)** application that enables donors to list surplus food and NGOs to accept donations — all powered by accurate GPS location tracking.

---
## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Live GPS Map** | Real-time Leaflet map showing nearby donations with location accuracy |
| 📡 **GPS Accuracy** | Captures ±accuracy in meters, supports draggable pin, reverse geocoding |
| 🍱 **Multi-Step Donation Form** | 4-step form with food type, quantity, expiry, GPS pin |
| 🤝 **NGO Dashboard** | NGOs can browse, accept, and track donations nearby |
| 🔍 **Geo Queries** | MongoDB `$near` queries for location-based donation discovery |
| 🏆 **Leaderboard** | Gamified donor rankings by meals served |
| 🔒 **JWT Auth** | Role-based access: Donor / NGO / Admin |
| 📊 **Live Stats** | Real-time meals served, donors, NGOs counters |
| ⚡ **Urgency Levels** | Critical / High / Medium / Low with visual indicators |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v16+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

---

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd foodbridge

# Install all dependencies at once
npm run install:all
```

Or manually:
```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

---

### 2. Configure MongoDB

**Option A — Local MongoDB:**
```bash
# Make sure MongoDB is running
mongod --dbpath /data/db
```
The default `.env` connects to `mongodb://localhost:27017/foodbridge`

**Option B — MongoDB Atlas (Cloud):**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Edit `server/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/foodbridge?retryWrites=true&w=majority
```

---

### 3. Configure Environment

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodbridge
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

---

### 4. Run the App

```bash
# Run both server + client together
npm run dev

# OR separately:
npm run server   # Backend on :5000
npm run client   # Frontend on :3000
```

Open: **http://localhost:3000**

---

## 📁 Project Structure

```
foodbridge/
├── server/                     # Express + MongoDB Backend
│   ├── models/
│   │   ├── User.js             # User model (donor/ngo/admin)
│   │   └── Donation.js         # Donation with GPS coordinates
│   ├── routes/
│   │   ├── auth.js             # Register, Login, JWT
│   │   ├── donations.js        # CRUD + GPS nearby search
│   │   ├── ngos.js             # NGO listings + nearby
│   │   ├── users.js            # Leaderboard, profiles
│   │   └── stats.js            # Platform statistics
│   ├── middleware/
│   │   └── auth.js             # JWT protect + role authorize
│   ├── server.js               # Express app entry point
│   └── .env                    # Environment variables
│
└── client/                     # React Frontend
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js        # Top navigation bar
        │   └── LocationPicker.js # GPS map with Leaflet
        ├── context/
        │   └── AuthContext.js   # Global auth state
        ├── pages/
        │   ├── HomePage.js      # Landing page with stats
        │   ├── DonatePage.js    # 4-step donation form
        │   ├── DonationsPage.js # Browse + filter donations
        │   ├── MapPage.js       # Live GPS map
        │   ├── AuthPages.js     # Login + Register
        │   └── DashboardPages.js # Dashboard + Leaderboard
        ├── utils/
        │   └── api.js           # Axios API client
        ├── App.js               # Routes
        └── index.css            # Global styles
```

---

## 🗺️ GPS / Location Features

### How GPS Works in FoodBridge:

1. **Donor** uses `LocationPicker` component → clicks "Use My GPS" button
2. Browser calls `navigator.geolocation.getCurrentPosition()` with `enableHighAccuracy: true`
3. GPS coordinates `[latitude, longitude]` are captured with **accuracy in meters**
4. Coordinates are **reverse geocoded** via OpenStreetMap Nominatim API → human-readable address
5. Stored in MongoDB as `GeoJSON Point`: `{ type: "Point", coordinates: [lng, lat] }`

### Nearby Search:
```javascript
// Server: MongoDB $near query
Donation.find({
  pickupLocation: {
    $near: {
      $geometry: { type: 'Point', coordinates: [longitude, latitude] },
      $maxDistance: 10000  // 10 km radius
    }
  }
})
```

### Map Features:
- 🗺️ Interactive Leaflet map with OpenStreetMap tiles
- 📍 Draggable pin for precise location
- 🔵 Radius circle showing search area
- 🎯 Color-coded markers by urgency level
- 📊 Sidebar with nearby donations list

---

## 🔑 API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register donor/NGO |
| POST | `/api/auth/login` | Login + get JWT |
| GET  | `/api/auth/me` | Get current user |
| PUT  | `/api/auth/update-location` | Update GPS location |

### Donations
| Method | Route | Description |
|---|---|---|
| GET  | `/api/donations` | All donations (filtered) |
| GET  | `/api/donations/nearby` | GPS-based nearby search |
| POST | `/api/donations` | Create donation |
| GET  | `/api/donations/:id` | Single donation |
| PUT  | `/api/donations/:id/accept` | NGO accepts donation |
| PUT  | `/api/donations/:id/status` | Update status |
| GET  | `/api/donations/my/donations` | My donations |

### Other
| Method | Route | Description |
|---|---|---|
| GET | `/api/stats` | Platform statistics |
| GET | `/api/ngos` | All NGOs |
| GET | `/api/ngos/nearby` | Nearby NGOs |
| GET | `/api/users/leaderboard` | Donor rankings |

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6 |
| **Maps** | Leaflet + React-Leaflet |
| **Styling** | CSS-in-JS (inline styles) with CSS variables |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcryptjs |
| **GPS** | Browser Geolocation API + OpenStreetMap Nominatim |
| **HTTP** | Axios |

---

## 🌟 User Roles

| Role | Capabilities |
|---|---|
| **Donor** | List food donations with GPS, track status, earn badges |
| **NGO** | Browse nearby donations, accept, track pickups |
| **Admin** | Full platform management |

---

## 📱 Pages

1. **🏠 Home** — Hero, stats, how-it-works, food types, CTA
2. **🍱 Donate Food** — 4-step form with GPS location picker
3. **📋 Donations** — Filtered grid of all donations
4. **🗺️ Map** — Live GPS map with nearby donations
5. **📊 Dashboard** — Personal stats + my donations
6. **🏆 Leaderboard** — Top donors by meals served
7. **🤝 Register/Login** — Role-based auth

---

## 🙏 Built For

FoodBridge is built to **empower NGOs and food donors** to work together efficiently, reducing food waste and hunger simultaneously — using modern GPS technology for accurate coordination.

> *"Every meal shared changes a life"* 🍱
