# Tour Guide Application

A comprehensive travel planning and tour guide management system built with Next.js, featuring AI-powered itinerary generation, event ticketing, and nearby places discovery.

## Features

- **Traveler Dashboard**: Plan trips, discover places, and book events
- **Guide Management**: Accept trip requests and manage bookings
- **Admin Panel**: Manage users, events, and payments
- **AI-Powered Planning**: Generate custom travel itineraries using Gemini AI
- **Nearby Places Discovery**: Find hotels, restaurants, entertainment, and hospitals near your destinations
- **Event Ticketing**: Browse and purchase tickets for local events
- **Payment Processing**: Secure payments via Stripe integration

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Neon recommended)
- Firebase account for authentication
- Gemini API key for AI features
- Serper API key for nearby places search
- Stripe account for payment processing

## Environment Setup

1. Clone the repository and install dependencies:
```bash
pnpm install
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Configure the following environment variables in `.env`:

### Database Configuration
- `DATABASE_URL`: PostgreSQL connection string from Neon or your database provider

### Authentication
- `JWT_SECRET`: Generate a secure random string for JWT token signing

### Firebase Configuration
Create a Firebase project at https://console.firebase.google.com and get your configuration:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Gemini AI Configuration
Get your API key from https://makersuite.google.com/app/apikey:
- `GEMINI_API_KEY`: Used for AI-powered travel itinerary generation

### Serper API Configuration
The Serper API provides Google Places search results for the nearby places discovery feature.

1. Sign up for a Serper account at https://serper.dev
2. Navigate to your dashboard at https://serper.dev/dashboard
3. Copy your API key
4. Add it to your `.env` file:
   ```
   SERPER_API_KEY=your_serper_api_key_here
   ```

**Serper API Details:**
- **Purpose**: Powers the nearby places search functionality
- **Usage**: Searches for hotels, restaurants, entertainment venues, and hospitals near selected destinations
- **Pricing**: Pay-as-you-go model with free tier available
- **Rate Limits**: Varies by plan (check your dashboard)
- **Documentation**: https://serper.dev/docs

**Important Notes:**
- The API key is stored securely on the server and never exposed to clients
- All requests are proxied through the backend API route `/api/nearby-places`
- Monitor your usage in the Serper dashboard to avoid unexpected charges
- Results are limited to 3 places per category to optimize credit usage

### Stripe Configuration
Get your keys from https://dashboard.stripe.com/test/apikeys:
- `STRIPE_SECRET_KEY`: Server-side API key (starts with `sk_test_` or `sk_live_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Client-side key (starts with `pk_test_` or `pk_live_`)
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (get from webhook settings, starts with `whsec_`)
- `NEXT_PUBLIC_APP_URL`: Your application URL (e.g., `http://localhost:3000` for development)

## Database Setup

Run database migrations:
```bash
pnpm drizzle-kit push
```

## Development

Start the development server:
```bash
pnpm dev
```

The application will be available at http://localhost:3000

## User Roles

The application supports three user roles:

1. **Traveler**: Browse places, plan trips, book events, discover nearby amenities
2. **Guide**: Accept trip requests, manage bookings, view earnings
3. **Admin**: Manage users, events, trips, and view analytics

## Key Features Documentation

### Nearby Places Discovery

The nearby places feature allows travelers to discover amenities near their destinations:

- **Access Points**: Available from event dialogs and place cards
- **Categories**: Hotels, Restaurants, Entertainment, Hospitals
- **Results**: Shows 3 top results per category with ratings, contact info, and directions
- **Map Integration**: Interactive Leaflet map showing all results
- **Directions**: One-click directions via Google Maps

**API Configuration**: Requires `SERPER_API_KEY` in environment variables (see Serper API Configuration above)

### AI Travel Planning

Generate custom itineraries using Gemini AI:
- Specify destination, duration, and preferences
- Get personalized day-by-day plans
- Accept AI plans or create manual plans
- Request guide assignments for trips

**API Configuration**: Requires `GEMINI_API_KEY` in environment variables

### Event Ticketing

Browse and purchase tickets for local events:
- View event details, dates, and pricing
- Secure checkout via Stripe
- Ticket management and cancellation
- Admin event creation and management

**API Configuration**: Requires Stripe keys in environment variables

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── guider/            # Guide dashboard pages
│   ├── traveler/          # Traveler dashboard pages
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── guider/           # Guide-specific components
│   ├── traveler/         # Traveler-specific components
│   └── ui/               # Shared UI components
├── db/                    # Database configuration and schema
├── lib/                   # Utility functions and services
├── migrations/            # Database migrations
└── public/               # Static assets
```

## API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/validate` - Validate JWT token

### Traveler
- `GET /api/traveler/events` - List events
- `POST /api/traveler/events/[id]/purchase` - Purchase event ticket
- `POST /api/traveler/generate-ai-plan` - Generate AI travel plan
- `POST /api/traveler/create-manual-plan` - Create manual plan
- `POST /api/traveler/accept-plan` - Accept and create trip
- `POST /api/nearby-places` - Search nearby places (requires Serper API)

### Guide
- `GET /api/guider/available-trips` - List available trips
- `POST /api/guider/trips/[id]/accept` - Accept trip request
- `POST /api/guider/trips/[id]/decline` - Decline trip request

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/events` - List all events
- `POST /api/admin/events` - Create new event
- `GET /api/admin/payments` - View payment history

## Security

- JWT-based authentication
- Role-based access control
- API key protection (server-side only)
- Secure payment processing via Stripe
- Environment variable validation
- SQL injection prevention via Drizzle ORM

## Monitoring

Monitor API usage for external services:
- **Serper API**: Check usage at https://serper.dev/dashboard
- **Gemini AI**: Monitor quota at https://makersuite.google.com
- **Stripe**: View transactions at https://dashboard.stripe.com

## Troubleshooting

### Serper API Issues

**Error: "Invalid API key"**
- Verify your API key is correct in `.env`
- Ensure no extra spaces or quotes around the key
- Check that the key is active in your Serper dashboard

**Error: "Rate limit exceeded"**
- You've exceeded your plan's rate limit
- Wait for the rate limit to reset (usually hourly)
- Consider upgrading your Serper plan

**Error: "No results found"**
- The search query may be too specific
- Try a different category or location
- Verify the location coordinates are valid

**Error: "Service unavailable"**
- Serper API may be experiencing downtime
- Check status at https://serper.dev
- Retry after a few minutes

### General Issues

**Database connection errors**
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Run migrations: `pnpm drizzle-kit push`

**Authentication errors**
- Verify Firebase configuration
- Check `JWT_SECRET` is set
- Clear browser cookies and try again

**Payment errors**
- Verify Stripe keys are correct
- Check webhook secret is configured
- Test with Stripe test cards

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions:
- Check the troubleshooting section above
- Review API documentation for external services
- Contact the development team
