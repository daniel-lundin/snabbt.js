const pjson = require('./package.json');
const moment = require('moment');
const version = pjson.version
const now = moment().format('YYYY-MM-DD');

console.log(`/* snabbt.js Version: ${version} Build date: ${now} (c) 2015 Daniel Lundin @license MIT */`);
