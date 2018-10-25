const { ApplicationFactory } = require('../../lib');
const SimpleService = require('./simple-service');

const start = async () => {
  try {
    const service = ApplicationFactory.create(SimpleService);
    await service.run();
  } catch (err) {
    throw err;
  }
};

start()
  .then(() => {
    console.log(`\uD83D\uDE80  node-\u03BC service started [pid: ${process.pid}]... bring me some \uD83C\uDF7A \uD83C\uDF7A \uD83C\uDF7A`);
  }).catch((err) => {
  console.error(`\uD83D\uDD25  service crashed at startup: ${err}`, err);
  process.exit(1);
});

