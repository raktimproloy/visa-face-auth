#!/bin/bash

# Lambda Function Deployment Script (CommonJS Version)
# This script packages and deploys the IDMission enrollment Lambda function

set -e

echo "🚀 Starting Lambda function deployment (CommonJS)..."

# Configuration
FUNCTION_NAME="idmission-biometric-enrollment"
RUNTIME="nodejs18.x"
HANDLER="idmission-enrollment-commonjs.handler"
ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role"
REGION="us-east-1"
TIMEOUT=30
MEMORY_SIZE=512

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

echo -e "${YELLOW}📦 Creating deployment package...${NC}"
zip -r function.zip . -x '*.zip' 'node_modules/*' '.git/*' 'deploy.sh' 'deploy-commonjs.sh' 'README.md' 'quick-start.sh' 'LAMBDA_SETUP.md' 'idmission-enrollment.js' 'package.json'

echo -e "${YELLOW}🔍 Checking if Lambda function exists...${NC}"
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION >/dev/null 2>&1; then
    echo -e "${YELLOW}📝 Updating existing Lambda function...${NC}"
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip \
        --region $REGION
    
    echo -e "${YELLOW}⚙️ Updating function configuration...${NC}"
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --timeout $TIMEOUT \
        --memory-size $MEMORY_SIZE \
        --region $REGION
else
    echo -e "${YELLOW}🆕 Creating new Lambda function...${NC}"
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://function.zip \
        --timeout $TIMEOUT \
        --memory-size $MEMORY_SIZE \
        --region $REGION
fi

echo -e "${YELLOW}🔐 Setting environment variables...${NC}"
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment Variables='{
        "IDMISSION_USERNAME":"'$IDMISSION_USERNAME'",
        "IDMISSION_PASSWORD":"'$IDMISSION_PASSWORD'",
        "IDMISSION_CLIENT_ID":"'$IDMISSION_CLIENT_ID'",
        "IDMISSION_CLIENT_SECRET":"'$IDMISSION_CLIENT_SECRET'",
        "IDMISSION_API_KEY":"'$IDMISSION_API_KEY'",
        "IDMISSION_API_SECRET":"'$IDMISSION_API_SECRET'"
    }' \
    --region $REGION

echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -f function.zip

echo -e "${GREEN}✅ Lambda function deployed successfully!${NC}"
echo -e "${GREEN}📋 Function Name: $FUNCTION_NAME${NC}"
echo -e "${GREEN}🌍 Region: $REGION${NC}"
echo -e "${GREEN}⏱️ Timeout: ${TIMEOUT}s${NC}"
echo -e "${GREEN}💾 Memory: ${MEMORY_SIZE}MB${NC}"
echo -e "${GREEN}📝 Handler: $HANDLER${NC}"

echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Test the function in AWS Console"
echo "2. Set up CloudWatch logging"
echo "3. Configure IAM permissions if needed"
echo "4. Test from your Next.js application"
