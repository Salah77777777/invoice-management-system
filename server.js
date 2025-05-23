require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://erp-assignment-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(bodyParser.json());

// Connect to MongoDB Atlas with enhanced error handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        return true;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        return false;
    }
};

// Initialize DB connection
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Models
const paymentSchema = new mongoose.Schema({
    invoiceId: String,
    amount: Number,
    method: String,
    date: { type: Date, default: Date.now }
});

const invoiceSchema = new mongoose.Schema({
    invoiceId: { type: String, unique: true },
    clientId: String,
    status: { type: String, default: 'Unpaid' },
    payments: [paymentSchema]
});

const Payment = mongoose.model('Payment', paymentSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);

// API Routes with enhanced error handling

// 🔹 Log Payment
app.post('/api/payment', async (req, res) => {
    try {
        const { invoiceId, amount, method, clientId } = req.body;
        console.log('Received payment request:', { invoiceId, amount, method, clientId });

        if (!invoiceId || !amount || !method || !clientId) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['invoiceId', 'amount', 'method', 'clientId']
            });
        }

        const payment = new Payment({ invoiceId, amount, method });
        let invoice = await Invoice.findOne({ invoiceId });

        if (!invoice) {
            invoice = new Invoice({ invoiceId, clientId, payments: [payment] });
        } else {
            invoice.payments.push(payment);
        }

        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        invoice.status = totalPaid >= 1000 ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Unpaid');

        await invoice.save();
        console.log('Payment logged successfully:', invoice);

        res.json({
            success: true,
            message: 'Payment logged successfully',
            invoice
        });
    } catch (error) {
        console.error('Error logging payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging payment',
            error: error.message
        });
    }
});

app.get('/api/status/:invoiceId', async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ invoiceId: req.params.invoiceId });
        if (!invoice) return res.status(404).json({ status: 'Unpaid' });

        res.json({ status: invoice.status });
    } catch (error) {
        res.status(500).json({
            message: 'Error checking status',
            error: error.message
        });
    }
});

app.get('/api/history/:invoiceId', async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ invoiceId: req.params.invoiceId });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        res.json(invoice.payments);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching history',
            error: error.message
        });
    }
});

app.post('/api/summary', async (req, res) => {
    try {
        const { status, clientId, fromDate, toDate } = req.body;
        const query = {};

        if (status) query.status = status;
        if (clientId) query.clientId = clientId;

        const invoices = await Invoice.find(query);
        let filtered = invoices;

        if (fromDate || toDate) {
            const from = fromDate ? new Date(fromDate) : new Date(0);
            const to = toDate ? new Date(toDate) : new Date();
            filtered = invoices.filter(inv =>
                inv.payments.some(p => new Date(p.date) >= from && new Date(p.date) <= to)
            );
        }

        res.json(filtered);
    } catch (error) {
        res.status(500).json({
            message: 'Error generating summary',
            error: error.message
        });
    }
});

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
