import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import serverless from 'serverless-http';
import { app } from './app';

// Wrap the Express app for serverless
const serverlessApp = serverless(app);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context
) => {
  // Enable connection reuse for better performance
  context.callbackWaitsForEmptyEventLoop = false;
  
  return await serverlessApp(event, context) as APIGatewayProxyResult;
};
