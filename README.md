# Heritage Lanka

The all-in-one Uber-like app for Sri Lanka travelling - connecting travelers with local guides, events, and experiences.

## Features

- **AI-Powered Trip Planning**: Generate personalized travel itineraries using AI
- **Manual Trip Planning**: Create custom trips with selected destinations
- **Guide Booking System**: Match travelers with local guides based on shared languages
- **Event Ticketing**: Purchase tickets for local events and attractions
- **Payment Integration**: Secure payments via Stripe
- **Multi-Role System**: Separate dashboards for Travelers, Guides, and Admins

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based sessions
- **Payments**: Stripe
- **Storage**: Firebase Storage
- **UI**: Radix UI, Tailwind CSS
- **Maps**: Leaflet, React Leaflet

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Firebase project
- Google Gemini API key

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Serper 
SERPER_API_KEY=your_serper_api_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── traveler/          # Traveler dashboard pages
│   ├── guider/            # Guide dashboard pages
│   └── auth/              # Authentication pages
├── components/            # React components
├── db/                    # Database schema and config
├── lib/                   # Utility functions and helpers
├── migrations/            # Database migrations
└── public/                # Static assets
```

## TODO

- [ ] Firebase Storage setup 
- [ ] Configure Stripe webhook endpoint
- [ ] Setup website hosting and deployment
- [ ] Devlop WhatsApp bot 
- [ ] Devlop MCP Server
- [ ] host both Whatsapp bot and MCP Server
- [ ] Test entire application end-to-end
- [ ] Test and fix UI/UX issues
