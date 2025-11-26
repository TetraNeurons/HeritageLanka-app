const general = require('./general');
const group = require('./group');
const media = require('./media');
const misc = require('./misc');

module.exports = {
    ...general,
    ...group,
    ...media,
    ...misc
};
