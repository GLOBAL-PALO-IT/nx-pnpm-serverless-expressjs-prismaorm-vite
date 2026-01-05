# AWS Lambda Deployment with @vendia/serverless-express

This backend has been migrated from the Serverless Framework to use `@vendia/serverless-express` for direct AWS Lambda deployment.

## Key Changes

1. **Replaced `serverless-http` with `@vendia/serverless-express`**: Better performance and more direct Lambda integration
2. **Removed Serverless Framework**: No longer using `serverless.yml` or related plugins
3. **Updated build configuration**: Now builds directly for Lambda deployment
4. **New deployment workflow**: Uses AWS CLI directly instead of Serverless Framework

## Development

### Local Development

```bash
# Run the backend locally (Express server)
pnpm dev:backend

# Build the backend
pnpm build:backend
```

### Building for Lambda

```bash
# Build and package for Lambda deployment
pnpm package:backend

# This creates: dist/apps/backend-lambda.zip
```

## AWS Deployment

### Prerequisites

- AWS CLI configured with appropriate credentials
- Lambda function already created in AWS

### Deploy

```bash
# Package and deploy to AWS Lambda
pnpm deploy:backend

# Or manually:
aws lambda update-function-code \
  --function-name your-lambda-function-name \
  --zip-file fileb://dist/apps/backend-lambda.zip
```

### Lambda Configuration

- **Runtime**: Node.js 20.x
- **Handler**: lambda.handler
- **Architecture**: x86_64 or arm64

## API Gateway Integration

The Lambda function is compatible with:

- API Gateway REST API
- API Gateway HTTP API (v2.0)
- Application Load Balancer

Example API Gateway configuration:

```yaml
# CloudFormation/SAM template example
Resources:
  MyApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: nx-serverless-api

  ProxyResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref MyApi
      ParentId: !GetAtt MyApi.RootResourceId
      PathPart: '{proxy+}'

  ProxyMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref MyApi
      ResourceId: !Ref ProxyResource
      HttpMethod: ANY
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${LambdaFunction.Arn}/invocations'
```

## Performance Benefits

`@vendia/serverless-express` provides:

- Better cold start performance
- More efficient request/response handling
- Lower memory usage
- Better compatibility with AWS Lambda runtime
