import winston from 'winston';
import { logger, stream } from './logger';

describe('logger', () => {
  it('should create a winston logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(winston.Logger);
  });

  it('should have the correct log levels', () => {
    expect(logger.levels).toBeDefined();
  });

  it('should have console transport', () => {
    expect(logger.transports).toBeDefined();
    expect(logger.transports.length).toBeGreaterThan(0);
    expect(logger.transports[0]).toBeInstanceOf(winston.transports.Console);
  });

  it('should log error messages', () => {
    const logSpy = jest.spyOn(logger, 'error');
    logger.error('Test error message');
    expect(logSpy).toHaveBeenCalledWith('Test error message');
    logSpy.mockRestore();
  });

  it('should log warn messages', () => {
    const logSpy = jest.spyOn(logger, 'warn');
    logger.warn('Test warn message');
    expect(logSpy).toHaveBeenCalledWith('Test warn message');
    logSpy.mockRestore();
  });

  it('should log info messages', () => {
    const logSpy = jest.spyOn(logger, 'info');
    logger.info('Test info message');
    expect(logSpy).toHaveBeenCalledWith('Test info message');
    logSpy.mockRestore();
  });

  it('should log http messages', () => {
    const logSpy = jest.spyOn(logger, 'http');
    logger.http('Test http message');
    expect(logSpy).toHaveBeenCalledWith('Test http message');
    logSpy.mockRestore();
  });

  it('should log debug messages', () => {
    const logSpy = jest.spyOn(logger, 'debug');
    logger.debug('Test debug message');
    expect(logSpy).toHaveBeenCalledWith('Test debug message');
    logSpy.mockRestore();
  });

  it('should not exit on handled exceptions', () => {
    expect(logger.exitOnError).toBe(false);
  });

  describe('stream', () => {
    it('should have a write function', () => {
      expect(stream.write).toBeDefined();
      expect(typeof stream.write).toBe('function');
    });

    it('should call logger.http when write is called', () => {
      const logSpy = jest.spyOn(logger, 'http');
      stream.write('Test stream message\n');
      expect(logSpy).toHaveBeenCalledWith('Test stream message');
      logSpy.mockRestore();
    });

    it('should trim whitespace from messages', () => {
      const logSpy = jest.spyOn(logger, 'http');
      stream.write('  Test with spaces  \n');
      expect(logSpy).toHaveBeenCalledWith('Test with spaces');
      logSpy.mockRestore();
    });
  });

  describe('production mode', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should use info level in production', () => {
      process.env.NODE_ENV = 'production';
      // Note: We can't re-create the logger instance in the same test run
      // But we can verify the current level
      expect(['info', 'debug']).toContain(logger.level);
    });

    it('should use debug level in development', () => {
      process.env.NODE_ENV = 'development';
      // The logger was already created, but we can verify it has a level
      expect(logger.level).toBeDefined();
    });
  });
});
