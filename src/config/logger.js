var winston = require('winston');
// var CloudWatchTransport = require('winston-aws-cloudwatch');
const logger = winston.createLogger({
  level: 'verbose',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(log => {
      return `${log.message} --- ${log.level} --- ${log.timestamp}  `;
    }),
  ),
  transports: [
    new winston.transports.Console({
      level: 'debug',
      colorize: true,
    }),
    new winston.transports.File({
      colorize: false,
      json: true,
      filename: __dirname + '/../../logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      colorize: true,
      json: true,
      filename: __dirname + '/../../logs/all.log',
      level: 'silly',
    }),
  ],
});

// const logger = winston.createLogger({
//   level: 'info',
//   //format: winston.format.json(),
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.colorize(),
//     winston.format.printf(info => {
//      return `${info.message} - ${info.level} - ${stringifyExtraMessagePropertiesForConsole(info)}`
//     }
//   ),
//   defaultMeta: { service: 'user-service' },
//   transports: [
//     //
//     // - Write all logs with level `error` and below to `error.log`
//     // - Write all logs with level `info` and below to `combined.log`
//     //

//     new winston.transports.Console(
//       {
//         level: 'silly',
//         colorize: true
//       }
//       ),
//     // new winston.transports.DailyRotateFile({
//     //         filename: '../../logs/log',
//     //         datePattern: 'yyyy-MM-dd.',
//     //         prepend: true,
//     //         level: process.env.ENV === 'development' ? 'silly' : 'debug',
//     //     }),
//   ],
// });

// Logging Levels
// {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// }

module.exports = logger;
