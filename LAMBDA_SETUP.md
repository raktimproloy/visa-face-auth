# Lambda Function Setup Guide for IDMission Biometric Enrollment

This guide will help you set up the AWS Lambda function for IDMission biometric enrollment and integrate it with your application.

## 🚀 **Prerequisites**

1. **AWS Account** with appropriate permissions
2. **IDMission API Credentials** (username, password, client ID, client secret, API key, API secret)
3. **AWS CLI** configured with your credentials
4. **Node.js 18+** installed locally

## 📋 **Step 1: Prepare IDMission Credentials**

Create a `.env` file in the `lambda/` directory with your IDMission credentials:

```bash
cd lambda/
cat > .env << EOF
IDMISSION_USERNAME=your_username
IDMISSION_PASSWORD=your_password
IDMISSION_CLIENT_ID=your_client_id
IDMISSION_CLIENT_SECRET=your_client_secret
IDMISSION_API_KEY=your_api_key
IDMISSION_API_SECRET=your_api_secret
EOF
```

## 🔐 **Step 2: Create IAM Role for Lambda**

1. **Create the IAM role**:
```bash
aws iam create-role \
  --role-name lambda-execution-role \
  --assume-role-policy-document file://trust-policy.json
```

2. **Attach the policy**:
```bash
aws iam put-role-policy \
  --role-name lambda-execution-role \
  --policy-name lambda-execution-policy \
  --policy-document file://iam-role-policy.json
```

3. **Attach basic Lambda execution policy**:
```bash
aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

4. **Get the role ARN**:
```bash
aws iam get-role --role-name lambda-execution-role --query 'Role.Arn' --output text
```

5. **Update the deploy.sh script** with your role ARN:
```bash
# Replace YOUR_ACCOUNT_ID with your actual AWS account ID
sed -i 's/YOUR_ACCOUNT_ID/YOUR_ACTUAL_ACCOUNT_ID/g' deploy.sh
```

## 📦 **Step 3: Install Dependencies**

```bash
cd lambda/
npm install
```

## 🚀 **Step 4: Deploy Lambda Function**

1. **Set environment variables** (replace with your actual values):
```bash
export IDMISSION_USERNAME="your_username"
export IDMISSION_PASSWORD="your_password"
export IDMISSION_CLIENT_ID="your_client_id"
export IDMISSION_CLIENT_SECRET="your_client_secret"
export IDMISSION_API_KEY="your_api_key"
export IDMISSION_API_SECRET="your_api_secret"
```

2. **Make deploy script executable and run it**:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🧪 **Step 5: Test Lambda Function**

1. **Go to AWS Lambda Console**
2. **Select your function**: `idmission-biometric-enrollment`
3. **Click "Test" tab**
4. **Create a test event** with this sample data:

```json
{
  "customerId": "CUST-1234567890",
  "enrollmentId": "ENR-1234567890",
  "photoData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "metadata": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "photoUrl": "https://example.com/photo.jpg",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

5. **Click "Test"** and check the execution results

## 🔧 **Step 6: Update Your Application**

1. **Update your `.env.local`** with the Lambda function name:
```bash
NEXT_PUBLIC_IDMISSION_LAMBDA_FUNCTION=idmission-biometric-enrollment
```

2. **Test the complete flow**:
   - Register a new user
   - Take a selfie
   - Click upload
   - Check DynamoDB for user creation
   - Check Lambda logs for IDMission enrollment

## 📊 **Step 7: Monitor and Debug**

### **CloudWatch Logs**
- Go to CloudWatch > Log groups
- Find `/aws/lambda/idmission-biometric-enrollment`
- Check for any errors or issues

### **Common Issues and Solutions**

#### **1. Lambda Function Not Found**
```bash
# Check if function exists
aws lambda get-function --function-name idmission-biometric-enrollment

# If not, redeploy
./deploy.sh
```

#### **2. Permission Denied**
```bash
# Check IAM role permissions
aws iam get-role-policy --role-name lambda-execution-role --policy-name lambda-execution-policy

# Verify role is attached to function
aws lambda get-function --function-name idmission-biometric-enrollment --query 'Configuration.Role'
```

#### **3. IDMission API Errors**
- Check your credentials in the Lambda environment variables
- Verify the API endpoint URL in the code
- Check IDMission API documentation for correct request format

#### **4. DynamoDB Connection Issues**
- Verify DynamoDB table exists
- Check IAM permissions for DynamoDB access
- Ensure table name matches your configuration

## 🔄 **Step 8: Update Lambda Function**

When you make changes to the code:

```bash
cd lambda/
# Make your changes to idmission-enrollment.js
./deploy.sh
```

## 📈 **Step 9: Production Considerations**

1. **Environment Variables**: Use AWS Systems Manager Parameter Store for sensitive data
2. **VPC Configuration**: Consider placing Lambda in VPC if needed
3. **Monitoring**: Set up CloudWatch alarms for errors
4. **Logging**: Implement structured logging for better debugging
5. **Error Handling**: Add retry logic and dead letter queues
6. **Security**: Use IAM roles instead of access keys

## 🎯 **Complete Flow**

1. **User takes selfie** → Photo stored in Redux
2. **User clicks upload** → Frontend calls `/api/upload-photo`
3. **API route**:
   - Uploads photo to S3
   - Creates user in DynamoDB
   - Invokes Lambda function
4. **Lambda function**:
   - Authenticates with IDMission
   - Sends photo for biometric enrollment
   - Returns enrollment status
5. **User redirected** to success page

## 📚 **Additional Resources**

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [IDMission API Documentation](https://docs.idmission.com/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

## 🆘 **Getting Help**

If you encounter issues:

1. Check CloudWatch logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test Lambda function independently in AWS Console
4. Check IAM permissions and role assignments
5. Verify DynamoDB table exists and is accessible
