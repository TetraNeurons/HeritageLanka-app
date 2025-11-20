// schema.ts
import { pgTable, text, timestamp, integer, real, pgEnum, primaryKey, boolean, jsonb} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['TRAVELER', 'GUIDE', 'ADMIN']);
export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);
export const tripPreferenceEnum = pgEnum('trip_preference', ['RELIGIOUS', 'CASUAL', 'ADVENTURE']);
export const bookingStatusEnum = pgEnum('booking_status', ['PENDING', 'ACCEPTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID', 'RELEASED', 'CANCELLED']);
export const planningModeEnum = pgEnum('planning_mode', ['MANUAL', 'AI_GENERATED']);
export const tripStatusEnum = pgEnum('trip_status', ['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull(),
  phone: text('phone').notNull(),
  name: text('name').notNull(),
  birthYear: integer('birth_year').notNull(),
  gender: genderEnum('gender').notNull(),
  languages: text('languages').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Travelers table
export const travelers = pgTable('travelers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  country: text('country').notNull(),
  tripInProgress: boolean('trip_in_progress').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Guides table
export const guides = pgTable('guides', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  nic: text('nic').notNull().unique(),
  rating: real('rating').default(0).notNull(),
  totalReviews: integer('total_reviews').default(0).notNull(),
  tripInProgress: boolean('trip_in_progress').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Trips table (Updated)
export const trips = pgTable('trips', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  travelerId: text('traveler_id').notNull().references(() => travelers.id, { onDelete: 'cascade' }),
  fromDate: timestamp('from_date').notNull(),
  toDate: timestamp('to_date').notNull(),
  numberOfPeople: integer('number_of_people').notNull(),
  country: text('country').notNull(),
  preferences: tripPreferenceEnum('preferences').array(),
  planDescription: text('plan_description'),
  planningMode: planningModeEnum('planning_mode').notNull(),
  
  // AI generated data
  aiSummary: text('ai_summary'),
  aiRecommendations: text('ai_recommendations').array(),
  feasibilityScore: integer('feasibility_score'),
  
  // Trip logistics
  totalDistance: real('total_distance'), // in km
  estimatedCost: real('estimated_cost'),
  
  // Daily itinerary stored as JSONB
  dailyItinerary: jsonb('daily_itinerary'), // Array of daily plans
  
  // Guide details
  guideId: text('guide_id').references(() => guides.id, { onDelete: 'set null' }),
  needsGuide: boolean('needs_guide').default(false).notNull(),
  
  // Trip status
  status: tripStatusEnum('status').default('PLANNING').notNull(),
  bookingStatus: bookingStatusEnum('booking_status').default('PENDING').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Trip Locations table - FIXED: Removed the id field and composite primary key conflict
export const tripLocations = pgTable('trip_locations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  
  // Location details
  title: text('title').notNull(),
  address: text('address').notNull(),
  district: text('district').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  category: text('category').notNull(),
  rating: real('rating'),
  
  // Visit details
  dayNumber: integer('day_number').notNull(),
  visitOrder: integer('visit_order').notNull(),
  estimatedDuration: text('estimated_duration'),
  reasonForSelection: text('reason_for_selection'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Places table (existing attractions database)
export const places = pgTable('places', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  location: text('location').notNull(),
  images: text('images').array().notNull(),
  description: text('description').notNull(),
  significance: text('significance').notNull(),
  ticketPrice: real('ticket_price'),
  category: tripPreferenceEnum('category').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payments table - Updated to support both trip and event payments
export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  // Either tripId OR eventId must be set (not both, not neither)
  tripId: text('trip_id').references(() => trips.id, { onDelete: 'cascade' }),
  eventId: text('event_id').references(() => events.id, { onDelete: 'cascade' }),
  // For event payments, store the traveler who made the purchase
  travelerId: text('traveler_id').references(() => travelers.id, { onDelete: 'cascade' }),
  // For event payments, store the ticket quantity
  ticketQuantity: integer('ticket_quantity'),
  amount: real('amount').notNull(),
  status: paymentStatusEnum('status').default('PENDING').notNull(),
  stripeSessionId: text('stripe_session_id').unique(),
  paidAt: timestamp('paid_at'),
  releasedAt: timestamp('released_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  travelerId: text('traveler_id').notNull().references(() => travelers.id, { onDelete: 'cascade' }),
  guideId: text('guide_id').notNull().references(() => guides.id, { onDelete: 'cascade' }),
  tripId: text('trip_id').references(() => trips.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Events table
export const events = pgTable('events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  images: text('images').array().notNull(),
  date: text('date').notNull(),
  price: text('price').notNull(),
  place: text('place').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  phone: text('phone').notNull(),
  organizer: text('organizer').notNull(),
  description: text('description').notNull(),
  ticketCount: integer('ticket_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Guide Declinations table - Tracks which guides have declined which trips
export const guideDeclinations = pgTable('guide_declinations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  guideId: text('guide_id').notNull().references(() => guides.id, { onDelete: 'cascade' }),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  declinedAt: timestamp('declined_at').defaultNow().notNull(),
});

// API Usage Logs table - Tracks Serper API usage for monitoring
export const apiUsageLogs = pgTable('api_usage_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  query: text('query').notNull(),
  category: text('category').notNull(),
  locationName: text('location_name').notNull(),
  resultCount: integer('result_count').notNull(),
  creditsUsed: integer('credits_used').notNull(),
  success: boolean('success').default(true).notNull(),
  errorMessage: text('error_message'),
  responseTime: integer('response_time'), // in milliseconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  traveler: one(travelers, {
    fields: [users.id],
    references: [travelers.userId],
  }),
  guide: one(guides, {
    fields: [users.id],
    references: [guides.userId],
  }),
}));

export const travelersRelations = relations(travelers, ({ one, many }) => ({
  user: one(users, {
    fields: [travelers.userId],
    references: [users.id],
  }),
  trips: many(trips),
  reviews: many(reviews),
}));

export const guidesRelations = relations(guides, ({ one, many }) => ({
  user: one(users, {
    fields: [guides.userId],
    references: [users.id],
  }),
  trips: many(trips),
  reviews: many(reviews),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  traveler: one(travelers, {
    fields: [trips.travelerId],
    references: [travelers.id],
  }),
  guide: one(guides, {
    fields: [trips.guideId],
    references: [guides.id],
  }),
  tripLocations: many(tripLocations),
  payment: one(payments, {
    fields: [trips.id],
    references: [payments.tripId],
  }),
  reviews: many(reviews),
}));

export const tripLocationsRelations = relations(tripLocations, ({ one }) => ({
  trip: one(trips, {
    fields: [tripLocations.tripId],
    references: [trips.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  trip: one(trips, {
    fields: [payments.tripId],
    references: [trips.id],
  }),
  event: one(events, {
    fields: [payments.eventId],
    references: [events.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  traveler: one(travelers, {
    fields: [reviews.travelerId],
    references: [travelers.id],
  }),
  guide: one(guides, {
    fields: [reviews.guideId],
    references: [guides.id],
  }),
  trip: one(trips, {
    fields: [reviews.tripId],
    references: [trips.id],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  payments: many(payments),
}));

export const guideDeclinationsRelations = relations(guideDeclinations, ({ one }) => ({
  guide: one(guides, {
    fields: [guideDeclinations.guideId],
    references: [guides.id],
  }),
  trip: one(trips, {
    fields: [guideDeclinations.tripId],
    references: [trips.id],
  }),
}));

export const apiUsageLogsRelations = relations(apiUsageLogs, ({ one }) => ({
  user: one(users, {
    fields: [apiUsageLogs.userId],
    references: [users.id],
  }),
}));