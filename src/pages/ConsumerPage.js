import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button } from '@mui/material';
// ...existing code...
import { ethers } from 'ethers';
import { getContract } from '../metamask/contractInstance';

export default function ConsumerPage() {
  const [historyResult, setHistoryResult] = useState(null);

  const handleCheckHistory = async () => {
    if (!window.ethereum) {
      setHistoryResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);
      const filterTransfer = contract.filters.OwnershipTransferred(Number(productId));
      const filterAccepted = contract.filters.ProductAccepted(Number(productId));
      const filterReceived = contract.filters.ProductReceived(Number(productId));
      const filterAvailable = contract.filters.AvailabilityUpdated(Number(productId));
      const filterCounterfeit = contract.filters.CounterfeitReported(Number(productId));

      const logsTransfer = await contract.queryFilter(filterTransfer);
      const logsAccepted = await contract.queryFilter(filterAccepted);
      const logsReceived = await contract.queryFilter(filterReceived);
      const logsAvailable = await contract.queryFilter(filterAvailable);
      const logsCounterfeit = await contract.queryFilter(filterCounterfeit);

      const history = [];
      logsTransfer.forEach(log => {
        history.push({
          type: 'OwnershipTransferred',
          from: log.args.from,
          to: log.args.to,
          tx: log.transactionHash,
          block: log.blockNumber
        });
      });
      logsAccepted.forEach(log => {
        history.push({
          type: 'ProductAccepted',
          distributor: log.args.distributor,
          tx: log.transactionHash,
          block: log.blockNumber
        });
      });
      logsReceived.forEach(log => {
        history.push({
          type: 'ProductReceived',
          retailer: log.args.retailer,
          tx: log.transactionHash,
          block: log.blockNumber
        });
      });
      logsAvailable.forEach(log => {
        history.push({
          type: 'AvailabilityUpdated',
          available: log.args.available,
          tx: log.transactionHash,
          block: log.blockNumber
        });
      });
      logsCounterfeit.forEach(log => {
        history.push({
          type: 'CounterfeitReported',
          consumer: log.args.consumer,
          tx: log.transactionHash,
          block: log.blockNumber
        });
      });

      history.sort((a, b) => a.block - b.block);
      setHistoryResult(JSON.stringify(history, null, 2));
    } catch (err) {
      setHistoryResult(err.message);
      console.error(err);
    }
    setLoading(false);
  };
  const [productId, setProductId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGetProduct = async () => {
    if (!window.ethereum) {
      setResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);
      const data = await contract.getProduct(Number(productId));
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  };

  const handleReportCounterfeit = async () => {
    if (!window.ethereum) {
      setResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.reportCounterfeit(Number(productId));
      await tx.wait();
      setResult('Counterfeit reported! Tx: ' + tx.hash);
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4, background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)', minHeight: '100vh' }}>
      <Typography variant="h3" align="center" sx={{ color: '#0d47a1', fontWeight: 700, mb: 4, textShadow: '0 2px 8px #fff' }}>
        Consumer Dashboard
      </Typography>

      <Card sx={{ boxShadow: 6, background: '#fff', borderRadius: 3, maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>Consumer Actions</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Product ID" value={productId} onChange={e => setProductId(e.target.value)} variant="outlined" size="small" fullWidth />
            <Button variant="contained" color="primary" onClick={handleGetProduct} disabled={loading} sx={{ minWidth: 120 }}>Verify Product</Button>
            <Button variant="outlined" color="error" onClick={handleReportCounterfeit} disabled={loading} sx={{ minWidth: 120 }}>Report Counterfeit</Button>
            <Button variant="outlined" color="secondary" onClick={handleCheckHistory} disabled={loading} sx={{ minWidth: 120 }}>History</Button>
          </Box>
          {result && <Typography sx={{ mt: 2, color: '#388e3c', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{result}</Typography>}
          {historyResult && <Typography sx={{ mt: 2, color: '#1976d2', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{historyResult}</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
}
