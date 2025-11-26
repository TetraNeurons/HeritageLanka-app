const { db } = require('../db');
const { users, trips, payments, events, reviews } = require('../db/schema');
const { eq, and, desc } = require('drizzle-orm');

module.exports = {
    profile: async (msg, args, client, commands, user, traveler) => {
        await msg.reply(`
            *YOUR PROFILE*
            Name: ${user.name}
            Email: ${user.email || 'N/A'}
            Gender: ${user.gender || 'N/A'}
            Languages: ${user.languages ? user.languages.join(", ") : 'N/A'}
            Role: ${user.role}
            Joined: ${user.createdAt ? new Date(user.createdAt).toDateString() : 'N/A'}
        `);
    },
    trips: async (msg, args, client, commands, user, traveler) => {
        if (!traveler) {
            await msg.reply('You are not registered as a traveler.');
            return;
        }
        const activeTrips = await db.select().from(trips).where(
            and(
                eq(trips.travelerId, traveler.id),
            )
        );

        const currentTrip = activeTrips.find(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

        if (currentTrip) {
            await msg.reply(`
                *Your Active Trip*
                From: ${currentTrip.fromDate ? new Date(currentTrip.fromDate).toDateString() : 'N/A'}
                To: ${currentTrip.toDate ? new Date(currentTrip.toDate).toDateString() : 'N/A'}
                Status: ${currentTrip.status}
                Country: ${currentTrip.country}
            `);
        } else {
            await msg.reply('You have no active trips at the moment.');
        }
    },
    itinerary: async (msg, args, client, commands, user, traveler) => {
        if (!traveler) {
            await msg.reply('You are not registered as a traveler.');
            return;
        }
        const activeTrips = await db.select().from(trips).where(
            and(
                eq(trips.travelerId, traveler.id),
            )
        );
        const currentTrip = activeTrips.find(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

        if (currentTrip && currentTrip.dailyItinerary) {
            let reply = '*Your Itinerary*\n';
            const itinerary = currentTrip.dailyItinerary;
            if (Array.isArray(itinerary)) {
                itinerary.forEach((day, index) => {
                    reply += `\n*Day ${index + 1}*\n`;
                    reply += `- ${day.activity || day.title || 'No activity details'}\n`;
                });
            } else {
                reply += JSON.stringify(itinerary, null, 2);
            }
            await msg.reply(reply);
        } else {
            await msg.reply('No active trip itinerary found.');
        }
    },
    payments: async (msg, args, client, commands, user, traveler) => {
        if (!traveler) {
            await msg.reply('You are not registered as a traveler.');
            return;
        }
        const userPayments = await db.select().from(payments)
            .where(eq(payments.travelerId, traveler.id))
            .orderBy(desc(payments.createdAt));

        if (userPayments.length > 0) {
            let reply = '*Your Payments*\n';
            userPayments.forEach((p, i) => {
                reply += `${i + 1}. ${p.amount} (${p.status}) - ${new Date(p.createdAt).toDateString()}\n`;
            });
            await msg.reply(reply);
        } else {
            await msg.reply('No payment history found.');
        }
    },
    events: async (msg) => {
        // Events table uses 'date' as text in the new schema
        const allEvents = await db.select().from(events);

        if (allEvents.length > 0) {
            let reply = '*Upcoming Events*\n';
            allEvents.forEach((e, i) => {
                reply += `${i + 1}. ${e.title} - ${e.date} @ ${e.place}\n`;
            });
            await msg.reply(reply);
        } else {
            await msg.reply('No upcoming events.');
        }
    },
    review: async (msg, args, client, commands, user) => {
        await msg.reply('To leave a review, please visit our app or website. (Feature coming soon to bot)');
    },
    menu: async (msg, args, client, commands, user) => {
        await msg.reply(`
            *MAIN MENU*
            1. !profile - My Profile
            2. !trips - My Trips
            3. !itinerary - My Itinerary
            4. !payments - Payments
            5. !events - Events
            6. !review - Review Guide
            7. !help - Support
        `);
    }
};
