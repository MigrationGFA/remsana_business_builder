# Starting the Remsana Development Server

## Quick Start

Since Docker requires permissions that need to be run manually, please execute these commands in your terminal:

### Step 1: Stop any existing containers
```bash
cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1
docker-compose -f docker-compose.dev.yml down
```

### Step 2: Rebuild and start the container
```bash
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Step 3: Install/update dependencies
```bash
docker-compose -f docker-compose.dev.yml exec remsana-dev npm install
```

### Step 4: Check server logs
```bash
docker-compose -f docker-compose.dev.yml logs -f remsana-dev
```

## Alternative: Use the restart script

You can also use the provided script:
```bash
cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1
./restart-server.sh
```

## Access the Application

Once the server is running, open your browser and navigate to:
- **http://localhost:5173**

## Troubleshooting

### If you see "permission denied" errors:
1. Make sure Docker Desktop is running
2. Check that Docker has the necessary permissions in System Settings

### If you see "react-router-dom" errors:
The dependencies should install automatically. If not, run:
```bash
docker-compose -f docker-compose.dev.yml exec remsana-dev npm install react-router-dom
```

### If the server won't start:
1. Check Docker Desktop is running
2. Check port 5173 is not already in use
3. View logs: `docker-compose -f docker-compose.dev.yml logs remsana-dev`

## Updated Features

The Business Registration flow has been updated to include:

1. **Payment Integration** (Step 3)
   - Paystack (Card, Bank Transfer, USSD)
   - Flutterwave (Card, Bank Transfer, USSD, Wallet)
   - Direct Bank Transfer option

2. **Updated Registration Status Flow**:
   - Payment Verified → Verification In Progress → Submitted to CAC → Approved → Certificate Ready

3. **Registration Fee**: ₦25,000 flat fee

4. **Dashboard Updates**:
   - Shows payment status and transaction details
   - Displays registration progress timeline
   - Estimated completion dates

## Test Credentials

Use the test login helper on the login page, or:
- Email: `test@remsana.com`
- Password: `Test1234!`
