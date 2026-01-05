// These types are available for future use if needed
// import type {
//   APIGatewayProxyEvent,
//   APIGatewayProxyResult,
//   Context,
// } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { app } from './app';

// Create and export the serverless express handler
export const handler = serverlessExpress({
  app,
});
