const noop = (): void => undefined;

function log(message: string, context?: Record<string, unknown>): void {
  if (context) {
    console.log(message, context);
  } else {
    console.log(message);
  }
}

export const logger = {
  fatal: log,
  error: log,
  warn: log,
  info: log,
  debug: log,
  trace: noop,
  level: 'debug',
  child: () => logger,
  flush: noop,
  bind: () => logger,
};
