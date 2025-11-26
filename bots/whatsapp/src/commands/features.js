const { db } = require('../db');
const { users, trips, payments, events, reviews, tripLocations, places, guides } = require('../db/schema');
const { eq, and, desc, asc } = require('drizzle-orm');
const { MessageMedia, Location } = require('whatsapp-web.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    profile: async (msg, args, client, commands, user, traveler, guide) => {
        let roleDetails = '';
        if (user.role === 'GUIDE' && guide) {
            roleDetails = `
            NIC: ${guide.nic}
            Rating: ${guide.rating} ⭐ (${guide.totalReviews} reviews)
            Status: ${guide.tripInProgress ? 'On Trip' : 'Available'}
            `;
        } else if (user.role === 'TRAVELER' && traveler) {
            roleDetails = `
            Country: ${traveler.country}
            Status: ${traveler.tripInProgress ? 'On Trip' : 'Not Traveling'}
            `;
        }

        await msg.reply(`
            *YOUR PROFILE*
            Name: ${user.name}
            Email: ${user.email || 'N/A'}
            Role: ${user.role}
            Phone: ${user.phone}
            ${roleDetails}
            Joined: ${user.createdAt ? new Date(user.createdAt).toDateString() : 'N/A'}
        `);
    },
    trips: async (msg, args, client, commands, user, traveler, guide) => {
        if (user.role === 'TRAVELER') {
            if (!traveler) {
                await msg.reply('Traveler profile not found.');
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
        } else if (user.role === 'GUIDE') {
            if (!guide) {
                await msg.reply('Guide profile not found.');
                return;
            }
            // For guides, show assigned trips
            const assignedTrips = await db.select().from(trips).where(
                and(
                    eq(trips.guideId, guide.id),
                )
            );

            const activeOrUpcoming = assignedTrips.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

            if (activeOrUpcoming.length > 0) {
                let reply = '*Your Assigned Trips*\n';
                activeOrUpcoming.forEach((t, i) => {
                    reply += `\n${i + 1}. *${t.country}* (${t.status})\n   📅 ${new Date(t.fromDate).toDateString()} - ${new Date(t.toDate).toDateString()}\n   👥 ${t.numberOfPeople} People\n`;
                });
                await msg.reply(reply);
            } else {
                await msg.reply('You have no active or upcoming trip assignments.');
            }
        }
    },
    assignments: async (msg, args, client, commands, user, traveler, guide) => {
        // Alias for trips for guides
        if (user.role === 'GUIDE') {
            await commands.trips(msg, args, client, commands, user, traveler, guide);
        } else {
            await msg.reply('This command is only for Guides.');
        }
    },
    itinerary: async (msg, args, client, commands, user, traveler, guide) => {
        let currentTrip;

        if (user.role === 'TRAVELER' && traveler) {
            const activeTrips = await db.select().from(trips).where(eq(trips.travelerId, traveler.id));
            currentTrip = activeTrips.find(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
        } else if (user.role === 'GUIDE' && guide) {
            // For guides, show itinerary of the currently active trip (if any)
            const assignedTrips = await db.select().from(trips).where(eq(trips.guideId, guide.id));
            currentTrip = assignedTrips.find(t => t.status === 'IN_PROGRESS' || t.status === 'CONFIRMED'); // Prioritize in-progress
        }

        if (!currentTrip) {
            await msg.reply('No active trip found to show itinerary.');
            return;
        }

        await msg.reply(`*Fetching detailed itinerary for trip to ${currentTrip.country}...* 🗺️`);

        // Get Trip Locations
        const locations = await db.select().from(tripLocations)
            .where(eq(tripLocations.tripId, currentTrip.id))
            .orderBy(asc(tripLocations.dayNumber), asc(tripLocations.visitOrder));

        if (locations.length === 0) {
            // Fallback to JSONB
            if (currentTrip.dailyItinerary) {
                let reply = '*Itinerary Summary*\n';
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

        // Iterate and Send Details
        let currentDay = 0;

        for (const loc of locations) {
            if (loc.dayNumber !== currentDay) {
                currentDay = loc.dayNumber;
                await client.sendMessage(msg.from, `📅 *DAY ${currentDay}*`);
                await sleep(500);
            }

            let imageUrl = null;
            try {
                const placeMatches = await db.select().from(places).where(eq(places.name, loc.title)).limit(1);
                if (placeMatches.length > 0 && placeMatches[0].images && placeMatches[0].images.length > 0) {
                    imageUrl = placeMatches[0].images[0];
                }
            } catch (err) {
                console.error('Error fetching place image:', err);
            }

            const caption = `📍 *${loc.title}*\n` +
                `_${loc.district}_\n\n` +
                `${loc.reasonForSelection || loc.category}\n` +
                `⏱️ Duration: ${loc.estimatedDuration || 'N/A'}`;

            if (imageUrl) {
                try {
                    const media = await MessageMedia.fromUrl(imageUrl);
                    await client.sendMessage(msg.from, media, { caption: caption });
                } catch (err) {
                    console.error('Failed to send image:', err);
                    await client.sendMessage(msg.from, caption);
                }
            } else {
                await client.sendMessage(msg.from, caption);
            }

            if (loc.latitude && loc.longitude) {
                await client.sendMessage(msg.from, new Location(loc.latitude, loc.longitude, loc.title));
            }

            await sleep(1500);
        }

        await client.sendMessage(msg.from, '✅ *End of Itinerary*');
    },
    events: async (msg, args, client) => {
        const allEvents = await db.select().from(events);

        if (allEvents.length > 0) {
            await msg.reply(`*Fetching ${allEvents.length} Upcoming Events...* 🎟️`);

            for (const event of allEvents) {
                const caption = `🎉 *${event.title}*\n` +
                    `📅 Date: ${event.date}\n` +
                    `📍 Place: ${event.place}\n` +
                    `💵 Price: ${event.price}\n` +
                    `📞 Contact: ${event.phone}\n\n` +
                    `${event.description}\n\n` +
                    `_Organized by ${event.organizer}_`;

                let imageSent = false;
                if (event.images && event.images.length > 0) {
                    try {
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

                if (event.lat && event.lng) {
                    await client.sendMessage(msg.from, new Location(event.lat, event.lng, event.place));
                }

                await sleep(1500);
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
        let menuText = '*MAIN MENU*\n';

        if (user.role === 'TRAVELER') {
            menuText += `
            1. !profile - My Profile
            2. !trips - My Trips
            3. !itinerary - My Itinerary
            4. !events - Events
            5. !review - Review Guide
            `;
        } else if (user.role === 'GUIDE') {
            menuText += `
            1. !profile - My Profile
            2. !assignments - My Assignments
            3. !itinerary - Active Trip Itinerary
            4. !events - Events
            `;
        } else {
            // Admin or other
            menuText += `
            1. !profile - My Profile
            2. !events - Events
            `;
        }

        await msg.reply(menuText);
    }
};
