var winston = require('winston');

var options = {
  file: {
    level: 'error',
    filename: './log-files/' + 'error.log',
    handleExceptions: true,
    json: true,
    maxsize: 524288000, // 500MB
    maxFiles: 10,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

var currentENV = process.env.NODE_ENV ? (process.env.NODE_ENV).trim() : 'development';
console.log("Winston currentENV: ",currentENV);

var logger = new winston.Logger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions
});

if(currentENV==='production') {
  //TODO Comment this line below, if logs in prod. are needed
  logger.remove(winston.transports.Console);
} else {
  logger.remove(winston.transports.File);
}

module.exports.logger = logger;



