# Job Hiring Point — Mobile App

React Native (Expo) app that uses the **same backend** as the Next.js web app in `../web`.

## Features

- Login / Register (Job Seeker & Recruiter)
- Browse & search jobs
- Job details & apply (seekers)
- My applications (seekers)
- Recruiter dashboard & job list
- Profile & sign out

## Setup

1. **Start the web backend** (from `../web`):

```bash
cd ../web
npm run dev
```

2. **Configure API URL** — copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Device | `EXPO_PUBLIC_API_URL` |
|--------|------------------------|
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Physical phone | `http://YOUR_LAN_IP:3000` |

3. **Install & run**:

```bash
npm install --legacy-peer-deps
npx expo start
```

Scan QR with Expo Go, or press `i` / `a` for simulator.

## Backend changes for mobile

The web API now supports:

- `Authorization: Bearer <token>` header (in addition to cookies)
- `token` field in login/register JSON response

## Demo accounts

Same as web — e.g. `seeker@demo.jobhiringpoint.com` / `Demo@12345`
