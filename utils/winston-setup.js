module.exports = function (fs, logDir, path, level) {
    //setup winston
    const {
        createLogger,
        format,
        transports
    } = require('winston');

    //make log file
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    const filename = path.join(logDir, 'results.log');

    const logger = createLogger({
        level: level,
        format: format.combine(
            format.colorize(),
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
        // You can also comment out the line above and uncomment the line below for JSON format
        // format: format.json(),
        transports: [
            new transports.Console({
                level: level,
                format: format.combine(
                    format.colorize(),
                    format.printf(
                        info => `${info.timestamp} ${info.level}: ${info.message}`
                    )
                )
            }),
            new transports.File({
                filename
            })
        ]
    });
    return logger;
};