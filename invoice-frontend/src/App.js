import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Grid, Paper, Box,
  TextField, Button, Card, CardContent, List, ListItem, ListItemText,
  Snackbar, Alert
} from '@mui/material';
import { Payment, Receipt, History, AssessmentOutlined } from '@mui/icons-material';
import axios from 'axios';
import './App.css';

function App() {
  const [invoiceId, setInvoiceId] = useState('');
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const baseURL = process.env.REACT_APP_API_URL;

  const handleSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const logPayment = async () => {
    if (!invoiceId || !clientId || !amount || !method) {
      handleSnackbar('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${baseURL}/payment`, {
        invoiceId,
        clientId,
        amount: Number(amount),
        method
      });

      if (res.data.success) {
        handleSnackbar('Payment logged successfully', 'success');
        // Clear form
        setInvoiceId('');
        setClientId('');
        setAmount('');
        setMethod('');
        // Refresh summary
        getSummary();
      } else {
        handleSnackbar(res.data.message || 'Error logging payment', 'error');
      }
    } catch (error) {
      console.error('Payment error:', error);
      handleSnackbar(
        error.response?.data?.message ||
        error.message ||
        'Error logging payment. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!invoiceId) {
      handleSnackbar('Please enter an Invoice ID', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${baseURL}/status/${invoiceId}`);
      setStatus(res.data.status);
    } catch (error) {
      handleSnackbar(error.response?.data?.message || 'Error checking status', 'error');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const getHistory = async () => {
    if (!invoiceId) {
      handleSnackbar('Please enter an Invoice ID', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${baseURL}/history/${invoiceId}`);
      setHistory(res.data);
      if (res.data.length === 0) {
        handleSnackbar('No payment history found', 'info');
      }
    } catch (error) {
      handleSnackbar(error.response?.data?.message || 'Error fetching history', 'error');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${baseURL}/summary`, {});
      setSummary(res.data);
    } catch (error) {
      handleSnackbar(error.response?.data?.message || 'Error fetching summary', 'error');
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  // Load summary on component mount
  useEffect(() => {
    getSummary();
  }, []);

  return (
    <>
      <AppBar position="static" sx={{ mb: 4, background: '#1a237e' }}>
        <Toolbar>
          <Typography variant="h6">Invoice Management System</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Payment Form */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment /> Log Payment
              </Typography>
              <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
                <TextField
                  fullWidth
                  label="Invoice ID"
                  variant="outlined"
                  value={invoiceId}
                  onChange={e => setInvoiceId(e.target.value)}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Client ID"
                  variant="outlined"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Amount"
                  variant="outlined"
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Payment Method"
                  variant="outlined"
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  disabled={loading}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={logPayment}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Processing...' : 'Log Payment'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt /> Invoice Status
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={checkStatus}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Checking...' : 'Check Status'}
              </Button>
              {status && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h5" component="div" color={
                      status === 'Paid' ? 'success.main' :
                        status === 'Partial' ? 'warning.main' :
                          'error.main'
                    }>
                      Status: {status}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History /> Payment History
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={getHistory}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Loading...' : 'Get History'}
              </Button>
              <List>
                {history.map((h, idx) => (
                  <ListItem key={idx} divider>
                    <ListItemText
                      primary={`${h.method} - $${h.amount.toLocaleString()}`}
                      secondary={new Date(h.date).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentOutlined /> Summary Report
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={getSummary}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Loading...' : 'Refresh Summary'}
              </Button>
              <Grid container spacing={2}>
                {summary.map((s, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">
                          Invoice ID: {s.invoiceId}
                        </Typography>
                        <Typography color="textSecondary">
                          Client ID: {s.clientId}
                        </Typography>
                        <Typography color={
                          s.status === 'Paid' ? 'success.main' :
                            s.status === 'Partial' ? 'warning.main' :
                              'error.main'
                        }>
                          Status: {s.status}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
