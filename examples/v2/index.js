/*var apm = require('elastic-apm-node').start({
  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: 'NODE-MU-SIMPLE-SERVICE',

  // Use if APM Server requires a token
  secretToken: '',

  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: ''
});
*/

const build = require('../../lib');
const SimpleService = require('./simple-service');
const { Controller } = require('../../lib').ioc;

const start = async () => {;
  try {
    const service = build(SimpleService);
    await service.run();
  } catch (err) {
    throw err;
  }
};

start()
  .then(() => {
    console.log(`\uD83D\uDE80  node-\u03BC service started [pid: ${process.pid}]... bring me some \uD83C\uDF7A \uD83C\uDF7A \uD83C\uDF7A`);
  }).catch((err) => {
  console.error(`\uD83D\uDD25  service crashed at startup: ${err}`);
  process.exit(1);
});

