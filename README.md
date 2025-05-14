# Invoice Management System

A full-stack web application for managing invoices and payments. Built with React, Node.js, Express, and MongoDB.

## Features

- Create and log payments
- Check invoice status
- View payment history
- Generate summary reports
- Real-time status updates
- Modern Material-UI interface

## Tech Stack

### Frontend
- React
- Material-UI
- Axios
- React Hooks

### Backend
- Node.js
- Express
- MongoDB
- Mongoose

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd invoice-management-system
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd invoice-frontend
npm install
```

4. Create a .env file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/invoiceDB
PORT=5000
```

5. Start the backend server:
```bash
npm start
```

6. Start the frontend application:
```bash
cd invoice-frontend
npm start
```

The application will be running at `http://localhost:3000`

## API Endpoints

- `POST /api/payment` - Log a new payment
- `GET /api/status/:invoiceId` - Get invoice status
- `GET /api/history/:invoiceId` - Get payment history
- `POST /api/summary` - Get summary report

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
