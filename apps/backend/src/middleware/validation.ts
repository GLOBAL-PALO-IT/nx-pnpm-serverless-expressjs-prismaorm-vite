import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Types for validation targets
type ValidationTarget = 'body' | 'params' | 'query';

// Interface for validation errors
interface ValidationErrorResponse {
  error: string;
  details: Array<{
    field: string;
    message: string;
  }>;
}

// Helper function to format Zod errors
const formatZodError = (error: ZodError): ValidationErrorResponse => {
  return {
    error: 'Validation failed',
    details: error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
};

// Generic validation middleware factory
export const validate = (
  schema: z.ZodSchema<any>,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate;
      
      switch (target) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        default:
          dataToValidate = req.body;
      }

      const validatedData = schema.parse(dataToValidate);
      
      // Attach validated data to request object
      switch (target) {
        case 'body':
          req.body = validatedData;
          break;
        case 'params':
          req.params = validatedData;
          break;
        case 'query':
          req.query = validatedData;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }
      
      // Handle unexpected errors
      console.error('Validation middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error during validation' 
      });
    }
  };
};

// Convenience functions for common validation patterns
export const validateBody = (schema: z.ZodSchema<any>) => validate(schema, 'body');
export const validateParams = (schema: z.ZodSchema<any>) => validate(schema, 'params');
export const validateQuery = (schema: z.ZodSchema<any>) => validate(schema, 'query');

// Multiple validation middleware (for validating multiple targets at once)
export const validateMultiple = (validations: {
  body?: z.ZodSchema<any>;
  params?: z.ZodSchema<any>;
  query?: z.ZodSchema<any>;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: ValidationErrorResponse['details'] = [];

      // Validate body if schema provided
      if (validations.body) {
        try {
          req.body = validations.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodError(error).details.map(detail => ({
              ...detail,
              field: `body.${detail.field}`
            })));
          }
        }
      }

      // Validate params if schema provided
      if (validations.params) {
        try {
          req.params = validations.params.parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodError(error).details.map(detail => ({
              ...detail,
              field: `params.${detail.field}`
            })));
          }
        }
      }

      // Validate query if schema provided
      if (validations.query) {
        try {
          req.query = validations.query.parse(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodError(error).details.map(detail => ({
              ...detail,
              field: `query.${detail.field}`
            })));
          }
        }
      }

      // If there are validation errors, return them
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }

      next();
    } catch (error) {
      console.error('Multiple validation middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error during validation' 
      });
    }
  };
};
