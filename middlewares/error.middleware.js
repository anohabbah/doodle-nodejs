const {createLogger, transports, format} = require('winston');

let logger;
if (process.env !== 'production') {
    logger = createLogger({
        transports: [new transports.Console({format: format['prettyPrint']()})]
    });
} else {
    logger = createLogger({
        transports: [
            new transports.File({filename: 'error.log', level: 'error'}),
            new transports.File({filename: 'combined.log'})
        ]
    });
}

module.exports = (err, req, res, next) => {
    logger.error(err.message, [err]);
    res.sendStatus(err.statusCode);
};
