# SAM Deployment Guide

This project now includes AWS SAM (Serverless Application Model) templates for easy deployment to AWS.

## Prerequisites

1. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```

2. **SAM CLI** installed
   ```bash
   # macOS
   brew install aws-sam-cli
   
   # Linux
   pip install aws-sam-cli
   
   # Windows
   # Download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html
   ```

3. **Docker** installed (for SAM local testing)

## Quick Start

### 1. First Time Deployment (Guided)
```bash
# Build the application
pnpm build:backend

# Deploy with guided setup
pnpm sam:deploy:guided
```

The guided deployment will ask for:
- **Stack name**: e.g., `nx-serverless-backend-dev`
- **AWS Region**: e.g., `us-east-1`
- **Environment**: `dev`, `staging`, or `prod`
- **DatabaseUrl**: Your Prisma database connection string
- **Confirm changes before deploy**: `Y`
- **Allow SAM CLI IAM role creation**: `Y`
- **Save parameters to samconfig.toml**: `Y`

### 2. Subsequent Deployments
```bash
# Build and deploy
pnpm sam:deploy
```

## Configuration

### Environment Variables
Update `samconfig.toml` with your specific values:

```toml
[default.deploy.parameters]
parameter_overrides = [
    "Environment=dev",
    "DatabaseUrl=postgresql://username:password@host:5432/dbname"
]
```

### Multiple Environments
Deploy to different environments:

```bash
# Development
sam deploy --config-env dev

# Staging  
sam deploy --config-env staging

# Production
sam deploy --config-env prod
```

## Local Testing

### 1. Start Local API Gateway
```bash
# Build first
pnpm build:backend

# Start local API Gateway
sam local start-api

# Your API will be available at: http://localhost:3000
```

### 2. Test Individual Lambda Function
```bash
# Invoke function directly
sam local invoke BackendFunction --event events/test-event.json
```

Create a test event file `events/test-event.json`:
```json
{
  "httpMethod": "GET",
  "path": "/health",
  "headers": {
    "Content-Type": "application/json"
  },
  "queryStringParameters": null,
  "body": null,
  "isBase64Encoded": false
}
```

## Stack Outputs

After deployment, SAM will output:
- **API Gateway URL**: Your REST API endpoint
- **Lambda Function ARN**: For direct Lambda invocations
- **IAM Role ARN**: For debugging permissions

## Monitoring and Logs

### View CloudWatch Logs
```bash
# API Gateway logs
sam logs -n BackendFunction --stack-name nx-serverless-backend-dev --tail

# Follow logs in real-time
sam logs -n BackendFunction --stack-name nx-serverless-backend-dev --tail --follow
```

### CloudWatch Dashboards
The template creates log groups for:
- Lambda function: `/aws/lambda/nx-serverless-backend-{environment}`
- API Gateway: `/aws/apigateway/nx-serverless-api-{environment}`

## Cleanup

To delete the stack and all resources:
```bash
sam delete --stack-name nx-serverless-backend-dev
```

## Advanced Configuration

### Custom Domain
Add to `template.yml`:
```yaml
  CustomDomain:
    Type: AWS::ApiGateway::DomainName
    Properties:
      DomainName: api.yourdomain.com
      CertificateArn: arn:aws:acm:us-east-1:123456789:certificate/abc123
```

### VPC Configuration (for RDS access)
```yaml
  BackendFunction:
    Type: AWS::Serverless::Function
    Properties:
      VpcConfig:
        SecurityGroupIds:
          - sg-12345678
        SubnetIds:
          - subnet-12345678
          - subnet-87654321
```

### Environment-Specific Parameters
```yaml
  Mappings:
    EnvironmentMap:
      dev:
        MemorySize: 512
        Timeout: 30
      prod:
        MemorySize: 1024
        Timeout: 60
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Ensure `dist/apps/backend/` exists after running `pnpm build:backend`
2. **Permission Errors**: Check IAM policies in the template
3. **Database Connection**: Verify `DATABASE_URL` parameter is correct
4. **Cold Starts**: Consider provisioned concurrency for production

### Debug Commands
```bash
# Validate template
sam validate

# Check what will be deployed
sam deploy --no-execute-changeset

# View stack events
aws cloudformation describe-stack-events --stack-name nx-serverless-backend-dev
```