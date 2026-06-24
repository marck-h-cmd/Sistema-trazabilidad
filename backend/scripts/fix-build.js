const fs = require('fs');
const path = require('path');

const eventEmitterPath = path.join(__dirname, '../dist/events/eventEmitter.js');
let content = fs.readFileSync(eventEmitterPath, 'utf8');
content = content.replace('require("../events")', 'require("events")');
fs.writeFileSync(eventEmitterPath, content);
console.log('Fixed eventEmitter.js');
