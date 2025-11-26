const general = require('./general');
const group = require('./group');
const media = require('./media');
const misc = require('./misc');
const chat = require('./chat');
const interaction = require('./interaction');
const features = require('./features');

module.exports = {
    // ...general,
    // ...group,
    // ...media,
    // ...misc,
    // ...chat,
    ...interaction,
    ...features
};
