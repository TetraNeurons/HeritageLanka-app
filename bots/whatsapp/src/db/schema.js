const { pgTable, serial, text, varchar, timestamp, date, jsonb, integer, boolean, real, pgEnum } = require('drizzle-orm/pg-core');

// Enums
const userRoleEnum = pgEnum('user_role', ['TRAVELER', 'GUIDE', 'ADMIN']);
const genderEnum = pgEnum('gender', ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);
const tripPreferenceEnum = pgEnum('trip_preference', ['RELIGIOUS', 'CASUAL', 'ADVENTURE']);
const bookingStatusEnum = pgEnum('booking_status', ['PENDING', 'ACCEPTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID', 'RELEASED', 'CANCELLED']);
const planningModeEnum = pgEnum('planning_mode', ['MANUAL', 'AI_GENERATED']);
const tripStatusEnum = pgEnum('trip_status', ['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
const adStatusEnum = pgEnum('ad_status', ['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED']);
const workflowTypeEnum = pgEnum('workflow_type', ['GENERATE_AI_PLAN', 'CREATE_MANUAL_PLAN']);
const reviewerTypeEnum = pgEnum('reviewer_type', ['TRAVELER', 'GUIDE']);

// Users table
const users = pgTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: userRoleEnum('role').notNull(),
    phone: text('phone').notNull().unique(),
    name: text('name').notNull(),
    birthYear: integer('birth_year').notNull(),
    gender: genderEnum('gender').notNull(),
    languages: text('languages').array().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Travelers table
const travelers = pgTable('travelers', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    country: text('country').notNull(),
    rating: real('rating').default(0).notNull(),
    totalReviews: integer('total_reviews').default(0).notNull(),
    tripInProgress: boolean('trip_in_progress').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Guides table
const guides = pgTable('guides', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    nic: text('nic').notNull().unique(),
    rating: real('rating').default(0).notNull(),
    totalReviews: integer('total_reviews').default(0).notNull(),
    tripInProgress: boolean('trip_in_progress').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Trips table
const trips = pgTable('trips', {
    id: text('id').primaryKey(),
    travelerId: text('traveler_id').notNull().references(() => travelers.id),
    fromDate: timestamp('from_date').notNull(),
    toDate: timestamp('to_date').notNull(),
    numberOfPeople: integer('number_of_people').notNull(),
    country: text('country').notNull(),
    preferences: tripPreferenceEnum('preferences').array(),
    planDescription: text('plan_description'),
    planningMode: planningModeEnum('planning_mode').notNull(),
    aiSummary: text('ai_summary'),
    aiRecommendations: text('ai_recommendations').array(),
    feasibilityScore: integer('feasibility_score'),
    totalDistance: real('total_distance'),
    estimatedCost: real('estimated_cost'),
    dailyItinerary: jsonb('daily_itinerary'),
    guideId: text('guide_id').references(() => guides.id),
    needsGuide: boolean('needs_guide').default(false).notNull(),
    status: tripStatusEnum('status').default('PLANNING').notNull(),
    bookingStatus: bookingStatusEnum('booking_status').default('PENDING').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Events table
const events = pgTable('events', {
    id: text('id').primaryKey(),
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

// Payments table
const payments = pgTable('payments', {
    id: text('id').primaryKey(),
    tripId: text('trip_id').references(() => trips.id),
    eventId: text('event_id').references(() => events.id),
    travelerId: text('traveler_id').references(() => travelers.id),
    ticketQuantity: integer('ticket_quantity'),
    amount: real('amount').notNull(),
    status: paymentStatusEnum('status').default('PENDING').notNull(),
    stripeSessionId: text('stripe_session_id').unique(),
    paidAt: timestamp('paid_at'),
    releasedAt: timestamp('released_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reviews table
const reviews = pgTable('reviews', {
    id: text('id').primaryKey(),
    reviewerId: text('reviewer_id').notNull().references(() => users.id),
    revieweeId: text('reviewee_id').notNull().references(() => users.id),
    tripId: text('trip_id').references(() => trips.id),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    reviewerType: reviewerTypeEnum('reviewer_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Trip Locations table
const tripLocations = pgTable('trip_locations', {
    id: text('id').primaryKey(),
    tripId: text('trip_id').notNull().references(() => trips.id),
    title: text('title').notNull(),
    address: text('address').notNull(),
    district: text('district').notNull(),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    category: text('category').notNull(),
    rating: real('rating'),
    dayNumber: integer('day_number').notNull(),
    visitOrder: integer('visit_order').notNull(),
    estimatedDuration: text('estimated_duration'),
    reasonForSelection: text('reason_for_selection'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Places table
const places = pgTable('places', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    location: text('location').notNull(),
    images: text('images').array().notNull(),
    description: text('description').notNull(),
    significance: text('significance').notNull(),
    ticketPrice: real('ticket_price'),
    category: tripPreferenceEnum('category').array().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

module.exports = {
    users,
    travelers,
    guides,
    trips,
    events,
    payments,
    reviews,
    tripLocations,
    places,
    userRoleEnum,
    genderEnum,
    tripPreferenceEnum,
    bookingStatusEnum,
    paymentStatusEnum,
    planningModeEnum,
    tripStatusEnum,
    adStatusEnum,
    workflowTypeEnum,
    reviewerTypeEnum
};
