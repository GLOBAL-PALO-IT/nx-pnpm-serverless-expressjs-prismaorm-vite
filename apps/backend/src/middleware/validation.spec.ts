import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  validate,
  validateBody,
  validateParams,
  validateQuery,
  validateMultiple,
} from './validation';

describe('validation middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const testSchema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    describe('body validation', () => {
      it('should validate body and call next on success', () => {
        mockRequest.body = {
          email: 'test@example.com',
          age: 25,
        };

        const middleware = validate(testSchema, 'body');
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.body).toEqual({
          email: 'test@example.com',
          age: 25,
        });
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should return 400 with validation errors on failure', () => {
        mockRequest.body = {
          email: 'invalid-email',
          age: 15,
        };

        const middleware = validate(testSchema, 'body');
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Validation failed',
            details: expect.any(Array),
          })
        );
        expect(nextFunction).not.toHaveBeenCalled();
      });

      it('should format validation errors correctly', () => {
        mockRequest.body = {
          email: 'invalid',
          age: 10,
        };

        const middleware = validate(testSchema, 'body');
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Validation failed',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: expect.any(String),
              message: expect.any(String),
            }),
          ]),
        });
      });
    });

    describe('params validation', () => {
      const paramSchema = z.object({
        id: z.string().uuid(),
      });

      it('should validate params and call next on success', () => {
        mockRequest.params = {
          id: '123e4567-e89b-12d3-a456-426614174000',
        };

        const middleware = validate(paramSchema, 'params');
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should return 400 when params validation fails', () => {
        mockRequest.params = {
          id: 'not-a-uuid',
        };

        const middleware = validate(paramSchema, 'params');
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });

    describe('query validation', () => {
      const querySchema = z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
      });

      it('should validate query and call next on success', () => {
        mockRequest.query = {
          page: '1',
          limit: '10',
        };

        const middleware = validate(querySchema, 'query');
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should return 400 when query validation fails', () => {
        const strictQuerySchema = z.object({
          required: z.string(),
        });

        mockRequest.query = {};

        const middleware = validate(strictQuerySchema, 'query');
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });

    it('should handle unexpected errors', () => {
      const errorSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        }),
      } as unknown as z.ZodSchema;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRequest.body = { test: 'data' };

      const middleware = validate(errorSchema, 'body');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal server error during validation',
      });
      expect(nextFunction).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should use default target when invalid target is provided', () => {
      mockRequest.body = {
        email: 'test@example.com',
        age: 25,
      };

      // Use any to bypass TypeScript checking for this edge case test
      const middleware = validate(testSchema, 'invalid' as any);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('validateBody', () => {
    it('should create a body validation middleware', () => {
      const schema = z.object({ name: z.string() });
      mockRequest.body = { name: 'Test' };

      const middleware = validateBody(schema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('validateParams', () => {
    it('should create a params validation middleware', () => {
      const schema = z.object({ id: z.string() });
      mockRequest.params = { id: 'test-id' };

      const middleware = validateParams(schema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    it('should create a query validation middleware', () => {
      const schema = z.object({ search: z.string().optional() });
      mockRequest.query = { search: 'test' };

      const middleware = validateQuery(schema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('validateMultiple', () => {
    const bodySchema = z.object({ name: z.string() });
    const paramsSchema = z.object({ id: z.string().uuid() });
    const querySchema = z.object({ page: z.string().optional() });

    it('should validate all targets and call next on success', () => {
      mockRequest.body = { name: 'Test' };
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.query = { page: '1' };

      const middleware = validateMultiple({
        body: bodySchema,
        params: paramsSchema,
        query: querySchema,
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should collect errors from all targets', () => {
      mockRequest.body = { name: 123 }; // Invalid
      mockRequest.params = { id: 'not-a-uuid' }; // Invalid
      mockRequest.query = {};

      const middleware = validateMultiple({
        body: bodySchema,
        params: paramsSchema,
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringContaining('body.'),
          }),
          expect.objectContaining({
            field: expect.stringContaining('params.'),
          }),
        ]),
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should validate only body when only body schema is provided', () => {
      mockRequest.body = { name: 'Test' };

      const middleware = validateMultiple({
        body: bodySchema,
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should validate only params when only params schema is provided', () => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      const middleware = validateMultiple({
        params: paramsSchema,
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should validate only query when only query schema is provided', () => {
      mockRequest.query = { page: '1' };

      const middleware = validateMultiple({
        query: querySchema,
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should call next when non-Zod errors are thrown', () => {
      const errorSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        }),
      } as unknown as z.ZodSchema;

      mockRequest.body = { test: 'data' };

      const middleware = validateMultiple({
        body: errorSchema,
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Non-ZodError exceptions are ignored and middleware continues
      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should not call next when there are validation errors', () => {
      mockRequest.body = { name: 123 };
      mockRequest.params = { id: 'invalid' };

      const middleware = validateMultiple({
        body: bodySchema,
        params: paramsSchema,
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should handle non-Zod errors in params validation', () => {
      const errorSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Non-Zod error');
        }),
      } as unknown as z.ZodSchema;

      mockRequest.params = { id: 'test' };

      const middleware = validateMultiple({
        params: errorSchema,
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Non-ZodError exceptions are ignored and middleware continues
      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle non-Zod errors in query validation', () => {
      const errorSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Non-Zod error');
        }),
      } as unknown as z.ZodSchema;

      mockRequest.query = { search: 'test' };

      const middleware = validateMultiple({
        query: errorSchema,
      });

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Non-ZodError exceptions are ignored and middleware continues
      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
