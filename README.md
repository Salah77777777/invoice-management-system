# Invoice Management System

A full-stack web application for managing invoices and payments.

## Features

- Log payments for invoices
- Check invoice status (Paid, Partial, Unpaid)
- View payment history
- Generate summary reports
- Filter payments by date range
- MongoDB integration
- RESTful API

## Tech Stack

- **Frontend:**
  - React.js
  - Material-UI
  - Axios
  - React Hooks

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - Cors
  - Dotenv

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd invoice-frontend
   npm install
   ```

3. Create a `.env` file in the root directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. Start the development servers:
   ```bash
   # Start backend (from root directory)
   npm start

   # Start frontend (from invoice-frontend directory)
   cd invoice-frontend
   npm start
   ```

## API Endpoints

- `POST /api/payment` - Log a new payment
- `GET /api/status/:invoiceId` - Get invoice status
- `GET /api/history/:invoiceId` - Get payment history
- `POST /api/summary` - Get summary report
- `GET /api/health` - Check API health

## Deployment

The application is deployed on Vercel:
- Frontend: [Invoice Frontend](https://invoice-frontend-2zk03eaab-salahs-projects-58bd1b59.vercel.app)
- Backend: [API Endpoint](https://erp-assignment-afrmq3jq6-salahs-projects-58bd1b59.vercel.app/api)