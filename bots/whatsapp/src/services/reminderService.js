const cron = require('node-cron');
const { db } = require('../db');
const { trips, users, travelers, guides } = require('../db/schema');
const { eq, and, sql } = require('drizzle-orm');

const initReminders = (client) => {
    console.log('Initializing Reminder Service...');

    // 1. Trip Start Reminder (Runs every day at 8:00 AM)
    cron.schedule('0 8 * * *', async () => {
        console.log('Running Trip Start Reminder Check...');
        try {
            // Find trips starting tomorrow
            // Note: This date logic is simplified. In production, handle timezones carefully.
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

            // We need to query trips where fromDate is roughly tomorrow
            // Since fromDate is timestamp, we'll check strictly by date string match if possible or range
            // For simplicity in this demo, we'll fetch all pending/confirmed trips and filter in JS
            const upcomingTrips = await db.select().from(trips).where(
                and(
                    sql`status IN ('CONFIRMED', 'PLANNING')`
                )
            );

            for (const trip of upcomingTrips) {
                const tripStartDate = new Date(trip.fromDate).toISOString().split('T')[0];

                if (tripStartDate === tomorrowStr) {
                    // Notify Traveler
                    const travelerRes = await db.select().from(travelers).where(eq(travelers.id, trip.travelerId));
                    if (travelerRes.length > 0) {
                        const travelerUserRes = await db.select().from(users).where(eq(users.id, travelerRes[0].userId));
                        if (travelerUserRes.length > 0) {
                            const user = travelerUserRes[0];
                            const chatId = `${user.phone.replace('+', '')}@c.us`;
                            await client.sendMessage(chatId, `🚗 *Trip Reminder*\n\nHi ${user.name}, your trip to *${trip.country}* starts tomorrow! Get ready for an adventure. 🎒`);
                        }
                    }

                    // Notify Guide (if assigned)
                    if (trip.guideId) {
                        const guideRes = await db.select().from(guides).where(eq(guides.id, trip.guideId));
                        if (guideRes.length > 0) {
                            const guideUserRes = await db.select().from(users).where(eq(users.id, guideRes[0].userId));
                            if (guideUserRes.length > 0) {
                                const guide = guideUserRes[0];
                                const chatId = `${guide.phone.replace('+', '')}@c.us`;
                                await client.sendMessage(chatId, `📅 *Assignment Reminder*\n\nHi ${guide.name}, you have a trip starting tomorrow for *${trip.country}*. Please check your itinerary.`);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error in Trip Start Reminder:', err);
        }
    });

    // 2. Daily Itinerary Reminder (Runs every day at 7:00 AM)
    cron.schedule('0 7 * * *', async () => {
        console.log('Running Daily Itinerary Check...');
        try {
            const today = new Date();
            // Check for active trips
            // In a real app, use SQL date comparison
            const activeTrips = await db.select().from(trips).where(
                sql`status = 'IN_PROGRESS'`
            );

            for (const trip of activeTrips) {
                // Calculate current day number
                const startDate = new Date(trip.fromDate);
                const diffTime = Math.abs(today - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Notify Traveler
                const travelerRes = await db.select().from(travelers).where(eq(travelers.id, trip.travelerId));
                if (travelerRes.length > 0) {
                    const travelerUserRes = await db.select().from(users).where(eq(users.id, travelerRes[0].userId));
                    if (travelerUserRes.length > 0) {
                        const user = travelerUserRes[0];
                        const chatId = `${user.phone.replace('+', '')}@c.us`;
                        await client.sendMessage(chatId, `☀️ *Good Morning ${user.name}!*\n\nIt's Day ${diffDays} of your trip. Type *!itinerary* to see your plan for today!`);
                    }
                }
            }
        } catch (err) {
            console.error('Error in Daily Itinerary Reminder:', err);
        }
    });
};

module.exports = { initReminders };
