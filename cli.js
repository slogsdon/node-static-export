const pushstate = require('pushstate-server');
const {log, start, tryClose} = require('./index');
const optimist = require('optimist');

const options = optimist
  .usage('Export SPA as static HTML.\nUsage: $0')
  .describe({
    'help': 'Show this help',
    'path': 'Path to SPA with respect to CWD',
    'quiet': 'Suppress output during export',
    'server-index': 'SPA\'s HTML entry file',
    'server-port': 'Port pushstate-server should use when running',
  })
  .default({
    'help': false,
    'path': './build',
    'quiet': false,
    'server-index': 'index.html',
    'server-port': 9999,
  })
  .argv;

if (options.help) {
  optimist.showHelp();
  process.exit();
}

let server = pushstate.start({
  directory: options['path'],
  port: options['server-port'],
}, (err, address) => {
  if (err) {
    tryClose(server);
    return;
  }

  log();
  log(`[Export] Listening on http://${address.address}:${address.port}...`)
  log();

  start(server, address, options).catch(console.error.bind(console));
});
