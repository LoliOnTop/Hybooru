import 'source-map-support/register';
import http from 'http';
import chalk from 'chalk';

import app from './server/app';
import configs from "./server/helpers/configs";

if(typeof configs.isTTY === "boolean") {
  chalk.level = configs.isTTY ? (chalk.level || 1) : 0;
}

let port = configs.port || 3000;
if(process.env.PORT) port = parseInt(process.env.PORT) || port;

let host = configs.host || "0.0.0.0";
if(process.env.HOST) host = process.env.HOST;

const server = http.createServer(app);
const origApp = app;
let currentApp = app;
server.listen({ port, host });

console.log(`\n${chalk.bold("HyBooru")} started on port ${chalk.yellow.bold("" + port)}`);
console.log(`Environment: ${chalk.yellow.bold("" + process.env.NODE_ENV)}.`);
console.log(chalk.dim.white(`Press Ctrl-C to terminate.\n`));

if(module.hot) {
  module.hot.accept('./server/app', () => {
    let newApp = app;
    if(origApp === newApp) newApp = require("./server/app").default;
    server.removeListener('request', currentApp);
    server.on('request', newApp);
    currentApp = newApp;
  });
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
