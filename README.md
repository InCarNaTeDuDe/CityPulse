# DayMates & TicketSwap Full-Stack Application

DayMates is a hyper-local, instant meetup and secure ticket swap application built using React 19, Express, and TypeORM with SQLite.

## Core Features

- **Dynamic SSO Form & Google One Tap**: Pure high-contrast Light Theme login screen allowing custom profiles (no hardcoded credentials) or verified One Tap sign-in.
- **Double-Ledger Secure Wallet**: Users can top-up their balance to purchase listed tickets.
- **Secure TicketSwap Escrow**: Automated ledger check deducts ticket cost + service fee from buyer and deposits it to seller on purchase, instantly launching a secure direct swap chat room.
- **Instant DayMates Meetup Feed**: Hyper-local matching for activities (Cricket, Coffee, Movies).
- **Persistent TypeORM Storage**: Synchronized SQLite database mapping Users, Activities, Tickets, Chats, and Notifications dynamically.

---

## Technical Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide icons, Framer Motion
- **Backend**: Express.js server on port 3000 proxying SPA fallbacks
- **Database**: TypeORM v0.3+, SQLite3 database (`daymates_db.sqlite`)

---

## API Endpoints (`/api/*`)

All endpoints use dynamic synchronization. The current user is resolved via client request headers:
- `x-user-id` (The unique ID of the user)
- `x-user-name` (The profile name)
- `x-user-email` (The registration email)

### 1. Authentication & Profiles
- **`GET /api/auth/me`**: Fetches current user profile from the database, auto-seeding user credentials if not present.
- **`POST /api/wallet/topup`**: Top-up the logged-in user's escrow wallet with a custom amount.

### 2. DayMates Activities
- **`GET /api/activities`**: List all active local activities near you, resolved with an `isJoined` state.
- **`POST /api/activities`**: Host a new daymate meetup event nearby.
- **`POST /api/activities/:id/join`**: Toggle join status of an activity. Increments participants list.

### 3. TicketSwap Exchange
- **`GET /api/tickets`**: List all listed ticket listings.
- **`POST /api/tickets`**: List a new theater/venue ticket for swap. Calculates a 5% secure connect fee.
- **`POST /api/tickets/:id/buy`**: Purchase ticket. Deducts buyer balance, adds seller balance, updates status to `sold`, and opens a secure chat between the parties.

### 4. Conversations & Messaging
- **`GET /api/conversations`**: Get the list of all chat rooms for the logged-in user.
- **`POST /api/conversations/start`**: Start a new message session manually.
- **`POST /api/conversations/:id/messages`**: Send a new message inside a specific room. Triggers system alerts.

### 5. System Notifications
- **`GET /api/notifications`**: Get all read/unread alert notifications for the logged-in user.
- **`POST /api/notifications/:id/read`**: Mark a single notification as read.
- **`POST /api/notifications/read-all`**: Dismiss all pending alerts.

---

## How It Works (Data Flow)

1. **Authentication**: The user signs in via the light-only Login Page or Google One Tap, setting the local storage session state.
2. **Dynamic Seeding**: On the next API call, the Express server resolves the user header. If missing from SQLite, it creates a fresh TypeORM `User` entity.
3. **Escrow Transaction**: When a buyer clicks purchase, the backend executes an isolated transaction verifying sufficient balance, updating both wallets, setting ticket to `sold`, and seeding a secure Direct Message (DM) room with system-guided escrow guidelines.
