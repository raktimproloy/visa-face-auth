#!/bin/bash

# Quick Start Script for IDMission Lambda Function
# This script automates the entire setup process

set -e

echo "🚀 IDMission Lambda Function Quick Start"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
FUNCTION_NAME="idmission-biometric-enrollment"
ROLE_NAME="lambda-execution-role"
REGION="us-east-1"

echo -e "${BLUE}📋 Step 1: Checking prerequisites...${NC}"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

echo -e "${BLUE}📋 Step 2: Getting AWS Account ID...${NC}"
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
echo -e "${GREEN}✅ AWS Account ID: $ACCOUNT_ID${NC}"

echo -e "${BLUE}📋 Step 3: Installing dependencies...${NC}"
npm install --production
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo -e "${BLUE}📋 Step 4: Creating IAM role...${NC}"

# Check if role already exists
if aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠️ Role $ROLE_NAME already exists, skipping creation${NC}"
else
    # Create the role
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file://trust-policy.json
    
    echo -e "${GREEN}✅ IAM role created${NC}"
fi

# Attach policies
echo -e "${BLUE}📋 Step 5: Attaching policies to IAM role...${NC}"

# Attach custom policy
aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name lambda-execution-policy \
    --policy-document file://iam-role-policy.json

# Attach basic Lambda execution policy
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

echo -e "${GREEN}✅ Policies attached${NC}"

echo -e "${BLUE}📋 Step 6: Updating deployment script...${NC}"
# Update the deploy.sh script with actual account ID
sed -i "s/YOUR_ACCOUNT_ID/$ACCOUNT_ID/g" deploy.sh
echo -e "${GREEN}✅ Deployment script updated${NC}"

echo -e "${BLUE}📋 Step 7: Setting up environment variables...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ .env file not found. Please create it with your IDMission credentials:${NC}"
    echo ""
    echo "IDMISSION_USERNAME=your_username"
    echo "IDMISSION_PASSWORD=your_password"
    echo "IDMISSION_CLIENT_ID=your_client_id"
    echo "IDMISSION_CLIENT_SECRET=your_client_secret"
    echo "IDMISSION_API_KEY=your_api_key"
    echo "IDMISSION_API_SECRET=your_api_secret"
    echo ""
    echo -e "${YELLOW}After creating .env file, run: ./deploy.sh${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Environment variables file found${NC}"

echo -e "${BLUE}📋 Step 8: Deploying Lambda function...${NC}"

# Source the .env file and export variables
set -a
source .env
set +a

# Make deploy script executable and run it
chmod +x deploy.sh
./deploy.sh

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Test the Lambda function in AWS Console"
echo "2. Update your Next.js app's .env.local with:"
echo "   NEXT_PUBLIC_IDMISSION_LAMBDA_FUNCTION=$FUNCTION_NAME"
echo "3. Test the complete flow from your application"
echo ""
echo -e "${BLUE}🔍 To monitor:${NC}"
echo "- Check CloudWatch logs: /aws/lambda/$FUNCTION_NAME"
echo "- Test function in AWS Lambda Console"
echo "- Verify DynamoDB table exists and is accessible"
