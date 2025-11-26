# Heritage Lanka

The all-in-one platform for Sri Lanka travel - connecting travelers with local guides, events, and experiences.

<img src="./screenshot/ss.png" width=600>

## Features

### For Travelers
- **AI-Powered Trip Planning**: Generate personalized travel itineraries using Google Gemini AI with feasibility scoring
- **Manual Trip Planning**: Create custom trips with selected destinations and attractions
- **Guide Booking System**: Match with local guides based on shared languages and availability
- **Event Ticketing System**: Browse and purchase tickets for local events and attractions with Stripe integration
- **Nearby Places Discovery**: Find attractions, restaurants, and points of interest using Serper API
- **Trip Tracking**: Real-time trip progress tracking with OTP verification and geolocation
- **Mutual Review System**: Rate and review guides after completed trips (guides can also review travelers)
- **Advertisement Display**: View curated advertisements from local businesses on dashboard
- **Payment Integration**: Secure payments via Stripe for trips and event tickets with webhook handling

### For Guides
- **Job Management**: Accept or decline trip requests from travelers
- **Trip Tracking**: Monitor ongoing trips with location verification
- **Mutual Review System**: Rate and review travelers after completed trips
- **Availability Management**: Control trip availability to prevent double bookings

### For Admins
- **User Management**: Manage travelers, guides, and admin accounts with role-based access
- **Event Management**: Create, update, and manage events with Firebase image uploads
- **Advertisement System**: Review and approve advertisement submissions for traveler dashboard display (revenue generation)
- **Payment Monitoring**: Track all payments and transactions for trips and events
- **AI Workflow Monitoring**: Real-time monitoring of Gemini AI usage, token consumption, and costs
- **API Rate Limiting**: Monitor and control Serper API usage with rate limiting and analytics
- **Trip Oversight**: View and manage all trips in the system with status tracking

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: JWT-based sessions with bcrypt password hashing
- **Payments**: Stripe (Checkout Sessions & Webhooks)
- **Storage**: Firebase Admin SDK (Server-side)
- **AI**: Google Gemini API for trip planning
- **Search**: Serper API for nearby places discovery
- **UI**: Radix UI Components, Tailwind CSS 4, Lucide Icons
- **Maps**: Leaflet, React Leaflet with routing support
- **Charts**: Recharts for analytics dashboards

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- PostgreSQL database (Neon recommended)
- Stripe account
- Firebase project with Admin SDK
- Google Gemini API key
- Serper API key

### Environment Variables

Create a `.env` file in the root directory:

```env
# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=your_postgresql_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Firebase Admin SDK
# Get these from Firebase Console > Project Settings > Service Accounts > Generate New Private Key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket

# Serper API (for nearby places search)
SERPER_API_KEY=your_serper_api_key

# Google Gemini AI (for trip planning)
GEMINI_API_KEY=your_gemini_api_key
```

### Installation

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm drizzle-kit push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                        # Next.js app directory
│   ├── api/                   # API routes
│   │   ├── admin/            # Admin API endpoints
│   │   ├── auth/             # Authentication endpoints
│   │   ├── guider/           # Guide API endpoints
│   │   ├── traveler/         # Traveler API endpoints
│   │   ├── public/           # Public API endpoints
│   │   ├── reviews/          # Review endpoints
│   │   └── webhooks/         # Stripe webhooks
│   ├── admin/                # Admin dashboard pages
│   │   ├── advertisements/   # Ad management
│   │   ├── ai-analytics/     # AI usage analytics
│   │   ├── dashboard/        # Admin overview
│   │   ├── events/           # Event management
│   │   ├── payments/         # Payment tracking
│   │   ├── trips/            # Trip management
│   │   └── users/            # User management
│   ├── traveler/             # Traveler dashboard pages
│   │   ├── dashboard/        # Traveler overview
│   │   ├── events/           # Event browsing
│   │   ├── history/          # Trip history
│   │   ├── nearby/           # Nearby places
│   │   ├── payment/          # Payment pages
│   │   ├── places/           # Attraction browsing
│   │   ├── plan/             # Trip planning
│   │   ├── plans/            # Trip management
│   │   ├── reviews/          # Review management
│   │   └── trip-tracker/     # Active trip tracking
│   ├── guider/               # Guide dashboard pages
│   │   ├── dashboard/        # Guide overview
│   │   ├── jobs/             # Available jobs
│   │   ├── reviews/          # Review management
│   │   └── trip-tracker/     # Active trip tracking
│   ├── auth/                 # Authentication pages
│   │   ├── signin/           # Sign in page
│   │   └── signup/           # Sign up page
│   ├── public/               # Public pages
│   │   └── check-ad/         # Advertisement preview
│   └── ...                   # Root pages and configs
├── components/               # React components
│   ├── accessibility/        # Accessibility components
│   ├── admin/                # Admin-specific components
│   ├── guider/               # Guide-specific components
│   ├── traveler/             # Traveler-specific components
│   ├── reviews/              # Review components
│   ├── ui/                   # Reusable UI components (Radix)
│   └── ...                   # Shared components
├── db/                       # Database configuration
│   ├── drizzle.ts           # Drizzle client setup
│   └── schema.ts            # Database schema definitions
├── lib/                      # Utility functions and helpers
│   ├── advertisements.ts     # Ad management utilities
│   ├── ai-logger.ts         # AI usage logging
│   ├── auth.ts              # Authentication utilities
│   ├── auth_service.ts      # Auth service layer
│   ├── firebase-admin.ts    # Firebase Admin SDK setup
│   ├── jwt.ts               # JWT token utilities
│   ├── payment-utils.ts     # Payment helpers
│   ├── rate-limiter.ts      # API rate limiting
│   ├── rating-calculator.ts # Rating calculation
│   ├── review-service.ts    # Review management
│   ├── storage-utils.ts     # Firebase storage utilities
│   ├── stripe.ts            # Stripe integration
│   ├── types.ts             # TypeScript type definitions
│   └── utils.ts             # General utilities
├── hooks/                    # Custom React hooks
├── migrations/               # Database migrations
├── public/                   # Static assets
│   ├── images/              # Image assets
│   ├── videos/              # Video assets
│   └── sl_tourist_data.json # Sri Lanka tourist data
└── ...                       # Config files
```

