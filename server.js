const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/invoiceDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

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

// 🔹 Log Payment
app.post('/api/payment', async (req, res) => {
    const { invoiceId, amount, method, clientId } = req.body;
    const payment = new Payment({ invoiceId, amount, method });

    let invoice = await Invoice.findOne({ invoiceId });

    if (!invoice) {
        invoice = new Invoice({ invoiceId, clientId, payments: [payment] });
    } else {
        invoice.payments.push(payment);
    }

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.status = totalPaid >= 1000 ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Unpaid'); // Example logic
    await invoice.save();

    res.json({ message: 'Payment logged successfully', invoice });
});

// 🔹 Generate Receipt
app.get('/api/receipt/:invoiceId', async (req, res) => {
    const invoice = await Invoice.findOne({ invoiceId: req.params.invoiceId });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    res.json({
        invoiceId: invoice.invoiceId,
        status: invoice.status,
        payments: invoice.payments
    });
});

// 🔹 Get Invoice Status
app.get('/api/status/:invoiceId', async (req, res) => {
    const invoice = await Invoice.findOne({ invoiceId: req.params.invoiceId });
    if (!invoice) return res.status(404).json({ status: 'Unpaid' });

    res.json({ status: invoice.status });
});

// 🔹 Get Payment History
app.get('/api/history/:invoiceId', async (req, res) => {
    const invoice = await Invoice.findOne({ invoiceId: req.params.invoiceId });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    res.json(invoice.payments);
});

// 🔹 Summary Report
app.post('/api/summary', async (req, res) => {
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
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
