import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

@Injectable()
export class StructuredLogger implements LoggerService {
  constructor(private readonly serviceName: string) {}

  log(message: any, ...optionalParams: any[]) {
    this.writeLog('log', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.writeLog('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.writeLog('warn', message, optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.writeLog('debug', message, optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.writeLog('verbose', message, optionalParams);
  }

  private writeLog(level: LogLevel, message: any, optionalParams: any[]) {
    const context = optionalParams.length > 0 ? optionalParams[0] : undefined;

    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      context,
      message,
    };

    // Output the structured log as a JSON string
    process.stdout.write(JSON.stringify(logObject) + '\n');
  }
}