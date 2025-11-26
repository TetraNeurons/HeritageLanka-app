const { Client } = require('whatsapp-web.js');
const config = require('./config');
const { initReminders } = require('./services/reminderService');

const client = new Client({
    authStrategy: config.authStrategy,
    puppeteer: config.puppeteer
});

client.on('ready', () => {
    console.log('Client is ready!');
    initReminders(client);
});

module.exports = client;
