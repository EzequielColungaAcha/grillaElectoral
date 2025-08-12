import winston, { format, transports } from "winston";

const logFormat = format.printf((info) => `${info.timestamp}: ${info.message}`);

export const logger = winston.createLogger({
  format: format.combine(
    format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    // Format the metadata object
    format.metadata({ fillExcept: ["message", "timestamp", "level"] })
  ),
  transports: [
    // new transports.Console({
    //   format: format.combine(logFormat),
    // }),
    new transports.File({
      filename: "./server/grillaLogs.log",
      format: format.combine(format.json()),
    }),
  ],
  exitOnError: false,
});
