# Serverless Framework Deployment Guide

This project supports both **AWS SAM** and **Serverless Framework** deployments. Choose the one that fits your workflow better.

## Why Serverless Framework?

- **Rich plugin ecosystem** (serverless-offline, serverless-esbuild, etc.)
- **Multi-cloud support** (AWS, Azure, GCP)
- **Advanced deployment features** (canary deployments, rollbacks)
- **Built-in environment management**
- **Extensive community and documentation**

## Prerequisites

1. **Serverless Framework CLI**
   ```bash
   # Install globally
   npm install -g serverless
   
   # Or use npx (no global install needed)
   npx serverless --version
   ```

2. **AWS CLI** configured
   ```bash
   aws configure
   ```

3. **Environment Variables**
   Create `.env` file in project root:
   ```bash
   DATABASE_URL=postgresql://username:password@host:5432/dbname
   ```

## Quick Start

### 1. Local Development with Serverless Offline

#### Option A: One-time build and run
```bash
# Build the application first
pnpm build:backend

# Start local development server
pnpm sls:offline

# Your API will be available at: http://localhost:3000
```

#### Option B: Development with auto-rebuild (Recommended)
```bash
# Start development mode with file watching
pnpm sls:dev

# This will:
# 1. Watch for file changes in apps/backend/src/**
# 2. Automatically rebuild when files change
# 3. Restart serverless offline with the new build
```

The local server includes:
- **CORS enabled** for frontend development
- **Request/response logging**
- **Lambda runtime simulation**
- **Environment variable support**

### 2. Deploy to AWS

#### Development Environment
```bash
pnpm sls:deploy:dev
# or
pnpm sls:deploy --stage dev
```

#### Production Environment
```bash
pnpm sls:deploy:prod
# or  
pnpm sls:deploy --stage prod
```

#### Custom Stage/Region
```bash
serverless deploy --stage staging --region eu-west-1
```

## Configuration

### Environment-Specific Settings

The `serverless.yml` includes environment-specific configurations:

```yaml
# Development
dev:
  memorySize: 512MB
  timeout: 30s
  minify: false (faster builds)

# Production  
prod:
  memorySize: 1024MB
  timeout: 60s
  minify: true (smaller bundle)
```

### Environment Variables

Set environment variables for different stages:

```bash
# Development
export DATABASE_URL="postgresql://dev-user:pass@dev-host:5432/dev-db"

# Production  
export DATABASE_URL="postgresql://prod-user:pass@prod-host:5432/prod-db"
```

Or use AWS Systems Manager Parameter Store:
```yaml
environment:
  DATABASE_URL: ${ssm:/nx-serverless/${self:provider.stage}/database-url}
```

## Local Development Features

### 1. Serverless Offline Features
```bash
# Start with custom port
serverless offline --port 4000

# Start with specific stage
serverless offline --stage dev

# Enable debug logging
serverless offline --verbose
```

### 2. Real-time Testing
```bash
# Test endpoints while offline is running
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/api/users
```

### 3. Hot Reload
The configuration watches for file changes in `apps/backend/src/**/*.ts` and automatically rebuilds.

## Advanced Configuration

### Custom Domain Setup
Add to `serverless.yml`:
```yaml
plugins:
  - serverless-domain-manager

custom:
  customDomain:
    domainName: api.yourdomain.com
    stage: ${self:provider.stage}
    certificateName: '*.yourdomain.com'
    createRoute53Record: true
```

### VPC Configuration (for RDS)
```yaml
provider:
  vpc:
    securityGroupIds:
      - sg-12345678
    subnetIds:
      - subnet-12345678
      - subnet-87654321
```

### Environment Variables from AWS Secrets
```yaml
provider:
  environment:
    DATABASE_URL: ${ssm:/aws/reference/secretsmanager/nx-serverless/${self:provider.stage}/database~true}
```

### Custom Resources (DynamoDB, S3, etc.)
```yaml
resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-${self:provider.stage}-users
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
```

## Monitoring and Debugging

### View Logs
```bash
# Tail function logs
serverless logs -f api -t

# View logs for specific time period
serverless logs -f api --startTime 5m

# Follow logs in real-time during deployment
serverless logs -f api -t --stage prod
```

### Function Metrics
```bash
# Get function info
serverless info

# Get function metrics
serverless metrics
```

### Debugging Failed Deployments
```bash
# Deploy with verbose output
serverless deploy --verbose

# Deploy individual function
serverless deploy function -f api

# Check CloudFormation stack
aws cloudformation describe-stack-events --stack-name nx-serverless-backend-dev
```

## Comparison: Serverless vs SAM

| Feature | Serverless Framework | AWS SAM |
|---------|---------------------|---------|
| **Local Testing** | serverless-offline plugin | sam local start-api |
| **Build System** | serverless-esbuild | Built-in esbuild |
| **Multi-Cloud** | ✅ AWS, Azure, GCP | ❌ AWS only |
| **Plugin Ecosystem** | ✅ Rich ecosystem | ⚠️ Limited |
| **Deployment Speed** | ⚠️ Slower (more features) | ✅ Faster |
| **Configuration** | ✅ Very flexible | ⚠️ More structured |
| **AWS Integration** | ✅ Good | ✅ Native |
| **Learning Curve** | ⚠️ Steeper | ✅ Easier |

## Migration Between SAM and Serverless

Both use the same Lambda handler (`@vendia/serverless-express`), so you can switch between them easily:

```bash
# Deploy with Serverless Framework
pnpm sls:deploy

# Later, deploy the same code with SAM
pnpm sam:deploy
```

## Cleanup

Remove the deployed stack:
```bash
# Remove specific stage
pnpm sls:remove --stage dev

# Remove with confirmation
serverless remove --stage prod
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clean and rebuild
   rm -rf dist/ .serverless/
   pnpm build:backend
   pnpm sls:deploy
   ```

2. **Permission Errors**
   - Check AWS credentials: `aws sts get-caller-identity`
   - Verify IAM permissions for CloudFormation, Lambda, API Gateway

3. **Timeout Issues**
   - Increase timeout in `serverless.yml`
   - Check database connection settings
   - Monitor CloudWatch logs

4. **CORS Issues**
   - Verify CORS configuration in `serverless.yml`
   - Check preflight OPTIONS requests
   - Test with different origins

### Debug Commands
```bash
# Validate serverless.yml
serverless print

# Check what will be deployed
serverless package

# Test function locally
echo '{}' | serverless invoke local -f api

# Invoke deployed function
serverless invoke -f api --data '{}'
```