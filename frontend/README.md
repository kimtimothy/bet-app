# Friendly Betting App – Frontend

This folder contains a **React Native** front‑end (built with the Expo
framework and TypeScript) for the social betting application.  Users
authenticate using **Supabase Auth**; the app communicates with the
Python/FastAPI backend only for bet management.  The interface is
deliberately kept simple to focus on a smooth user experience and
performance.  Styling is implemented with **Tailwind CSS** via the
NativeWind library.

## Getting started

1. Install Node.js (16 or higher) and the Expo CLI:
   ```bash
   npm install -g expo-cli
   ```
2. Navigate to the `frontend` directory and install dependencies.  The
   project uses Expo SDK 53 (React Native 0.79) and React 19【491085796636092†L12-L14】,
   so some older versions of React Native packages have been updated:
   ```bash
   cd bet_app/frontend
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   Use the QR code printed in the terminal to open the app on your
   device via the Expo Go app, or run it on an emulator using the
   on‑screen options.

4. Replace the placeholders in `src/services/supabase.ts` with your
   Supabase project URL and anon key.

5. Ensure the backend API is running (see `backend/README.md`) and
   update the `BASE_URL` constant in `src/services/api.ts` if
   necessary.

## Project structure

- **App.tsx** – Root component that sets up navigation.
  *Note:* This skeleton keeps all screen components under
  `src/screens` and service modules under `src/services`.  There
  is no separate `navigation` directory; navigation is configured
  directly in `App.tsx`.

* **src/screens** – Individual screens such as Login, Register,
  BetList, and CreateBet.
* **src/services/api.ts** – Axios instance used for making API
  requests to the FastAPI backend.
* **src/services/supabase.ts** – Initialization of the Supabase client
  used for user authentication.

## Notes on UX and performance

This skeleton emphasizes clear navigation and minimal state to keep
performance high.  Network requests are executed asynchronously and
results are memoized where appropriate.  To improve responsiveness,
screens display loading indicators during network operations and
errors are surfaced gracefully.
