const config = require('../config');

// Import command modules
// Import all commands
const commands = require('../commands');

module.exports = {
    init: (client) => {
        client.on('message', async msg => {
            if (!msg.body.startsWith(config.prefix)) return;

            const args = msg.body.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            if (commands[commandName]) {
                try {
                    await commands[commandName](msg, args, client, commands);
                } catch (error) {
                    console.error(`Error executing command ${commandName}:`, error);
                    await msg.reply('An error occurred while executing the command.');
                }
            }
        });
    }
};
