# Air-Quality-Management-System

A full-stack IoT and AI-powered air quality monitoring system that provides real-time environmental monitoring, pollution forecasting, and location-based health insights. The platform collects live sensor data, integrates external weather and air quality APIs, and uses machine learning techniques to predict future air quality trends.

<p align="center">
  <a href="https://haseeb35.github.io/Air-Quality-Management-System-/">
    <img src="https://img.shields.io/badge/▶%20Live%20Preview-haseeb35.github.io-2ea44f?style=for-the-badge" alt="Live preview">
  </a>
</p>

## Try It Live

Open the live preview and click **Demo Login** — no typing needed. It signs in instantly with the shared demo account:

| Field | Value |
|-------|-------|
| Email | `demo@airsense.com` |
| Password | `Demo@2026` |
| Role | Admin (full dashboard) |

You can also type these credentials into the Sign In form, or create your own account via **Sign Up**. Note: Google sign-in only works if the deployment domain is added under Firebase → Authentication → Settings → Authorized domains.

## Features

- Real-time air quality monitoring from IoT sensors
- Pollution forecasting using machine learning
- Location-based health insights with maps
- Admin and user dashboards
- User management, profiles, and password change
- Sensor data history and predictions
- Firebase authentication, Firestore, and Realtime Database

## Tech Stack

- **Frontend:** React 19, Vite 7, Bootstrap, Chart.js, Recharts
- **Backend/Services:** Firebase (Auth, Firestore, Realtime Database)
- **Maps:** @react-google-maps/api
- **Reporting:** jsPDF, xlsx
- **Device Code:** Arduino (see `Adruino latest Code.zip`)
- **Data Pipeline:** Python (see `Python Code.zip`)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

### Firebase Setup

1. Create a Firebase project and enable Authentication, Firestore, and Realtime Database.
2. Copy your config into `src/firebase.js` (replace the placeholder keys).
3. Set up your credentials in `.env` if needed (see `.env.example`).

## Project Structure

```
src/
├── App.jsx                 # Main app and routing
├── main.jsx                # Entry point
├── firebase.js             # Firebase configuration
├── SignIn.jsx / SignUp.jsx # Authentication screens
├── AdminDashboard.jsx      # Admin panel
├── UserDashboard.jsx       # User panel
└── components/
    ├── SensorData.jsx      # Live sensor readings
    ├── Predictions.jsx     # ML pollution forecasts
    ├── MapScreen.jsx       # Location-based insights
    ├── HistoryScreen.jsx   # Historical data
    └── ...                 # Navigation, sidebar, user management
```

## Repository Contents

- `Source-Code.zip.zip` — complete source code archive
- `Adruino latest Code.zip` — IoT device firmware (Arduino)
- `Python Code.zip` — Python data collection/prediction scripts
- PDFs — project document, poster, and user manual

## License

MIT
