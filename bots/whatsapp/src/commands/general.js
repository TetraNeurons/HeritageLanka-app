const client = require('../client');

module.exports = {
    ping: async (msg) => {
        await msg.reply('pong');
    },
    info: async (msg) => {
        const info = client.info;
        await client.sendMessage(msg.from, `
            *Connection info*
            User name: ${info.pushname}
            My number: ${info.wid.user}
            Platform: ${info.platform}
        `);
    },
    echo: async (msg, args) => {
        const text = args.join(' ');
        await msg.reply(text);
    },
    help: async (msg, args, client, commands) => {
        let str = '*Available Commands:*\n\n';
        for (const cmd in commands) {
            str += `*!${cmd}*\n`;
        }
        await msg.reply(str);
    },
    owner: async (msg) => {
        await msg.reply('Bot Owner: *Antigravity*'); // You can customize this
    }
};
