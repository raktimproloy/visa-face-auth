# IDMission Live-Check Integration

Real-time biometric verification using IDMission's live-check API.

## Setup

Add to `.env.local`:
```bash
IDMISSION_USERNAME=your_username
IDMISSION_PASSWORD=your_password
IDMISSION_CLIENT_ID=your_client_id
IDMISSION_CLIENT_SECRET=your_client_secret
```

## Usage

The system automatically:
1. Authenticates with IDMission
2. Performs real-time verification when photos are taken
3. Returns verification results immediately

## API Endpoint

`POST /api/idmission-live-check`

Sends selfie images for real-time verification and returns results instantly.
