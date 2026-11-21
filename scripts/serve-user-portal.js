const path = require('path');

const portalDir = path.resolve(__dirname, '../web/user_portal');
process.chdir(portalDir);
process.argv = [process.argv[0], path.resolve(__dirname, '../node_modules/next/dist/bin/next'), 'dev', '-p', '3000'];

require('../node_modules/next/dist/bin/next');

