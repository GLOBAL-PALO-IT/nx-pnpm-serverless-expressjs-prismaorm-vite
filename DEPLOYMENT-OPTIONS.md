# Deployment Options Summary

This project now supports **both SAM and Serverless Framework** deployments with the same `@vendia/serverless-express` Lambda handler.

## 🚀 Quick Commands

### SAM Deployment
```bash
# First time (guided setup)
pnpm sam:deploy:guided

# Subsequent deployments
pnpm sam:deploy

# Local testing
pnpm sam:local
```

### Serverless Framework Deployment
```bash
# Deploy to development
pnpm sls:deploy:dev

# Deploy to production  
pnpm sls:deploy:prod

# Local development with hot reload
pnpm sls:dev

# Local testing (one-time build)
pnpm sls:offline
```

## 📋 Feature Comparison

| Feature | SAM | Serverless Framework |
|---------|-----|---------------------|
| **AWS Integration** | ✅ Native AWS | ✅ Excellent |
| **Local Testing** | `sam local start-api` | `serverless offline` |
| **Multi-Cloud** | ❌ AWS only | ✅ AWS, Azure, GCP |
| **Plugin Ecosystem** | ⚠️ Limited | ✅ Rich ecosystem |
| **Configuration** | ⚠️ More verbose | ✅ Flexible |
| **Deployment Speed** | ✅ Fast | ⚠️ Slower |
| **Learning Curve** | ✅ Easier | ⚠️ Steeper |
| **Hot Reload** | ❌ No | ✅ Yes (with watch mode) |
| **IDE Support** | ✅ Good | ✅ Excellent |

## 🔧 When to Use Which?

### Choose **SAM** if:
- You're AWS-focused and don't need multi-cloud
- You prefer AWS native tooling
- You want faster deployments
- You're new to serverless
- You need tight CloudFormation integration

### Choose **Serverless Framework** if:
- You need multi-cloud deployment capabilities
- You want rich plugin ecosystem (custom domains, monitoring, etc.)
- You prefer flexible configuration options
- You need advanced deployment features (canary, blue/green)
- You want better local development experience with hot reload

## 📁 File Structure

```
nx-serverless/
├── template.yml              # SAM template
├── samconfig.toml             # SAM configuration
├── serverless.yml             # Serverless Framework config
├── SAM-DEPLOYMENT.md          # SAM deployment guide
├── SERVERLESS-DEPLOYMENT.md   # Serverless deployment guide
└── apps/backend/src/
    └── lambda.ts              # Shared Lambda handler (works with both)
```

## 🔄 Migration Between SAM and Serverless

You can easily switch between deployments since both use the same Lambda handler:

```bash
# Currently deployed with SAM? Switch to Serverless
pnpm sls:deploy:dev

# Currently deployed with Serverless? Switch to SAM  
pnpm sam:deploy
```

**Note**: Make sure to clean up the old deployment first to avoid resource conflicts.

## 🎯 Recommended Workflow

### For Development Teams
1. **Local Development**: Use `pnpm sls:dev` for hot reload
2. **Testing**: Use both `pnpm sam:local` and `pnpm sls:offline` 
3. **CI/CD**: Choose one deployment method for consistency

### For Production
1. **Simple Setup**: Use SAM for straightforward AWS deployments
2. **Complex Requirements**: Use Serverless Framework for advanced features

## 🔍 Both Support

- ✅ **Same Lambda handler** (`@vendia/serverless-express`)
- ✅ **Environment variables** (DATABASE_URL, NODE_ENV)
- ✅ **CORS configuration**
- ✅ **CloudWatch logging**
- ✅ **API Gateway integration**  
- ✅ **Multiple environments** (dev/staging/prod)
- ✅ **TypeScript support**
- ✅ **Prisma ORM integration**

Choose the tool that best fits your team's needs and existing infrastructure!