const { db } = require('../db');
const { users, trips, payments, events, reviews, tripLocations, places } = require('../db/schema');
const { eq, and, desc, asc } = require('drizzle-orm');
const { MessageMedia, Location } = require('whatsapp-web.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

        // 1. Get Active Trip
        const activeTrips = await db.select().from(trips).where(
            and(
                eq(trips.travelerId, traveler.id),
            )
        );
        const currentTrip = activeTrips.find(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

        if (!currentTrip) {
            await msg.reply('No active trip found.');
            return;
        }

        await msg.reply(`*Fetching detailed itinerary for your trip to ${currentTrip.country}...* 🗺️`);

        // 2. Get Trip Locations
        const locations = await db.select().from(tripLocations)
            .where(eq(tripLocations.tripId, currentTrip.id))
            .orderBy(asc(tripLocations.dayNumber), asc(tripLocations.visitOrder));

        if (locations.length === 0) {
            // Fallback to JSONB if no detailed locations
            if (currentTrip.dailyItinerary) {
                let reply = '*Your Itinerary (Summary)*\n';
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
                await msg.reply('No itinerary details available.');
            }
            return;
        }

        // 3. Iterate and Send Details
        let currentDay = 0;

        for (const loc of locations) {
            // New Day Header
            if (loc.dayNumber !== currentDay) {
                currentDay = loc.dayNumber;
                await client.sendMessage(msg.from, `📅 *DAY ${currentDay}*`);
                await sleep(500);
            }

            // Try to find image in 'places' table
            let imageUrl = null;
            try {
                // Simple name match for now. In production, use ID linking or fuzzy search.
                const placeMatches = await db.select().from(places).where(eq(places.name, loc.title)).limit(1);
                if (placeMatches.length > 0 && placeMatches[0].images && placeMatches[0].images.length > 0) {
                    imageUrl = placeMatches[0].images[0];
                }
            } catch (err) {
                console.error('Error fetching place image:', err);
            }

            // Construct Caption
            const caption = `📍 *${loc.title}*\n` +
                `_${loc.district}_\n\n` +
                `${loc.reasonForSelection || loc.category}\n` +
                `⏱️ Duration: ${loc.estimatedDuration || 'N/A'}`;

            // Send Image + Caption OR Text
            if (imageUrl) {
                try {
                    const media = await MessageMedia.fromUrl(imageUrl);
                    await client.sendMessage(msg.from, media, { caption: caption });
                } catch (err) {
                    console.error('Failed to send image:', err);
                    await client.sendMessage(msg.from, caption); // Fallback to text
                }
            } else {
                await client.sendMessage(msg.from, caption);
            }

            // Send Location
            if (loc.latitude && loc.longitude) {
                await client.sendMessage(msg.from, new Location(loc.latitude, loc.longitude, loc.title));
            }

            await sleep(1500); // Pause between stops for better UX
        }

        await client.sendMessage(msg.from, '✅ *End of Itinerary*');
    },
    events: async (msg, args, client) => {
        const allEvents = await db.select().from(events);

        if (allEvents.length > 0) {
            await msg.reply(`*Fetching ${allEvents.length} Upcoming Events...* 🎟️`);

            for (const event of allEvents) {
                // 1. Construct Caption
                const caption = `🎉 *${event.title}*\n` +
                    `📅 Date: ${event.date}\n` +
                    `📍 Place: ${event.place}\n` +
                    `💵 Price: ${event.price}\n` +
                    `📞 Contact: ${event.phone}\n\n` +
                    `${event.description}\n\n` +
                    `_Organized by ${event.organizer}_`;

                // 2. Send Image + Caption OR Text
                let imageSent = false;
                if (event.images && event.images.length > 0) {
                    try {
                        // Use the first image
                        const media = await MessageMedia.fromUrl(event.images[0]);
                        await client.sendMessage(msg.from, media, { caption: caption });
                        imageSent = true;
                    } catch (err) {
                        console.error('Failed to send event image:', err);
                    }
                }

                if (!imageSent) {
                    await client.sendMessage(msg.from, caption);
                }

                // 3. Send Location
                if (event.lat && event.lng) {
                    await client.sendMessage(msg.from, new Location(event.lat, event.lng, event.place));
                }

                await sleep(1500); // Pause between events
            }

            await client.sendMessage(msg.from, '✅ *End of Events List*');
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
            4. !events - Events
            5. !review - Review Guide
        `);
    }
};
