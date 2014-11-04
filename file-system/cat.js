#!/home/matt/.nvm/v0.11.14/bin/node --harmony
require('fs').createReadStream(process.argv[2]).pipe(process.stdout);
