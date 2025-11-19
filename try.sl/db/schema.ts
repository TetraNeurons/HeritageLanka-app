import { pgTable, text, timestamp, integer, real, pgEnum, primaryKey} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['TRAVELER', 'GUIDE', 'ADMIN']);
export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);
export const tripPreferenceEnum = pgEnum('trip_preference', ['RELIGIOUS', 'CASUAL', 'ADVENTURE']);
export const bookingStatusEnum = pgEnum('booking_status', ['PENDING', 'ACCEPTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID', 'RELEASED']);

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
  languages: text('languages').array().notNull(), // All users have languages
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Travelers table
export const travelers = pgTable('travelers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  country: text('country').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Guides table
export const guides = pgTable('guides', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  nic: text('nic').notNull().unique(),
  rating: real('rating').default(0).notNull(),
  totalReviews: integer('total_reviews').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Trips table
export const trips = pgTable('trips', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  travelerId: text('traveler_id').notNull().references(() => travelers.id, { onDelete: 'cascade' }),
  fromDate: timestamp('from_date').notNull(),
  toDate: timestamp('to_date').notNull(),
  numberOfPeople: integer('number_of_people').notNull(),
  budget: real('budget').notNull(),
  country: text('country').notNull(),
  preferences: tripPreferenceEnum('preferences').array().notNull(),
  planDescription: text('plan_description'),
  totalCost: real('total_cost'),
  guideId: text('guide_id').references(() => guides.id, { onDelete: 'set null' }),
  status: bookingStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Places table
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

// Trip Places junction table
export const tripPlaces = pgTable('trip_places', {
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  placeId: text('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
  day: integer('day').notNull(),
  order: integer('order').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.tripId, table.placeId] })
}));

// Payments table
export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tripId: text('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }).unique(),
  amount: real('amount').notNull(),
  status: paymentStatusEnum('status').default('PENDING').notNull(),
  paidAt: timestamp('paid_at'),
  releasedAt: timestamp('released_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  travelerId: text('traveler_id').notNull().references(() => travelers.id, { onDelete: 'cascade' }),
  guideId: text('guide_id').notNull().references(() => guides.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations - FIXED
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

// Events table
export const events = pgTable('events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  images: text('images').array().notNull(), // Array of Firebase Storage URLs
  date: text('date').notNull(), // e.g., "Aug 14–24, 2025"
  price: text('price').notNull(), // e.g., "Free" or "$35 – $120"
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

export const eventsRelations = relations(events, ({ many }) => ({}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  traveler: one(travelers, {
    fields: [trips.travelerId],
    references: [travelers.id],
  }),
  guide: one(guides, {
    fields: [trips.guideId],
    references: [guides.id],
  }),
  tripPlaces: many(tripPlaces),
  payment: one(payments, {
    fields: [trips.id],
    references: [payments.tripId],
  }),
}));

export const placesRelations = relations(places, ({ many }) => ({
  tripPlaces: many(tripPlaces),
}));

export const tripPlacesRelations = relations(tripPlaces, ({ one }) => ({
  trip: one(trips, {
    fields: [tripPlaces.tripId],
    references: [trips.id],
  }),
  place: one(places, {
    fields: [tripPlaces.placeId],
    references: [places.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  trip: one(trips, {
    fields: [payments.tripId],
    references: [trips.id],
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
}));