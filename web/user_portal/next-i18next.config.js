const path = require('path');

module.exports = {
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },
    localePath: path.resolve(__dirname, 'public/locales'),
};
