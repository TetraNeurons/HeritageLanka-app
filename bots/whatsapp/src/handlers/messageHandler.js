const config = require('../config');
const { db } = require('../db');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm');

// Import all commands
const commands = require('../commands');

module.exports = {
    init: (client) => {
        client.on('message', async msg => {
            if (!msg.body.startsWith(config.prefix)) return;

            const args = msg.body.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // Database Authentication
            const senderPhone = `+${msg.from.replace('@c.us', '')}`; // Extract number
            let user;
            let traveler;

            try {
                const result = await db.select().from(users).where(eq(users.phone, senderPhone)).limit(1);
                if (result.length > 0) {
                    user = result[0];
                    // Also fetch traveler info if available
                    const { travelers } = require('../db/schema');
                    const travelerResult = await db.select().from(travelers).where(eq(travelers.userId, user.id)).limit(1);
                    if (travelerResult.length > 0) {
                        traveler = travelerResult[0];
                    }
                }
            } catch (err) {
                console.error('Database error:', err);
                await msg.reply('Service temporarily unavailable.');
                return;
            }

            if (!user) {
                await msg.reply('❌ You are not registered.\nPlease sign up in the app first.');
                return;
            }

            // Only allow specific commands for now + help
            const allowedCommands = ['profile', 'trips', 'itinerary', 'events', 'review', 'menu'];

            if (allowedCommands.includes(commandName) && commands[commandName]) {
                try {
                    // Pass traveler info as well
                    await commands[commandName](msg, args, client, commands, user, traveler);
                } catch (error) {
                    console.error(`Error executing command ${commandName}:`, error);
                    await msg.reply('An error occurred while executing the command.');
                }
            } else if (commands[commandName]) {
                // Command exists but not in allowed list (temporarily disabled)
                // await msg.reply('This feature is temporarily disabled.');
            }
        });
    }
};
